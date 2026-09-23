import { DailyLog, NutritionPlan } from '../types/nutrition';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../types/settings';
import { DEFAULT_NUTRITION_PLAN } from '../data/defaultPlan';
import { runLegacyDataMigration } from './legacyMigration';

const DB_BASE_URL = 'https://db.dunhas.com/api';

interface SyncItem {
  collection: string;
  id: string;
  data: unknown;
  timestamp: number;
}

class JsonDbService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private userId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushSyncQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  setUserId(uid: string | null) {
    this.userId = uid;
  }

  getUserId(): string | null {
    return this.userId;
  }

  private getCollection(name: string): string {
    return this.userId ? `user_${this.userId}_${name}` : name;
  }

  getCacheKey(key: string): string {
    return this.userId ? `eh_${this.userId}_${key}` : `eh_${key}`;
  }

  private getDbApiKey(): string {
    const key = this.getCacheKey('settings');
    const cached = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.remoteDbApiKey) return parsed.remoteDbApiKey;
      } catch {
        // ignore
      }
    }
    return import.meta.env.VITE_DB_API_KEY || '';
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // --- SETTINGS ---
  getUserSettings(): UserSettings {
    const key = this.getCacheKey('settings');
    const cached = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const settings: UserSettings = cached ? JSON.parse(cached) : { ...DEFAULT_USER_SETTINGS };

    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!settings.geminiApiKey && envKey) {
      settings.geminiApiKey = envKey;
    }
    return settings;
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    const key = this.getCacheKey('settings');
    localStorage.setItem(key, JSON.stringify(settings));
    await this.upsertDocument(this.getCollection('user_settings'), 'preferences', settings);
  }

  // --- NUTRITION PLAN ---
  async getNutritionPlan(): Promise<NutritionPlan> {
    const key = this.getCacheKey('active_plan');
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore corrupt
      }
    }

    try {
      const remote = await this.getDocument<NutritionPlan>(this.getCollection('food_plan'), 'active_plan');
      if (remote) {
        localStorage.setItem(key, JSON.stringify(remote));
        return remote;
      }
    } catch {
      // offline fallback
    }

    localStorage.setItem(key, JSON.stringify(DEFAULT_NUTRITION_PLAN));
    return DEFAULT_NUTRITION_PLAN;
  }

  async saveNutritionPlan(plan: NutritionPlan): Promise<void> {
    const key = this.getCacheKey('active_plan');
    localStorage.setItem(key, JSON.stringify(plan));
    await this.upsertDocument(this.getCollection('food_plan'), 'active_plan', plan);
  }

  // --- DAILY LOGS ---
  async getDailyLog(date: string): Promise<DailyLog | null> {
    const key = this.getCacheKey(`log_${date}`);
    const cached = localStorage.getItem(key);
    const localLog: DailyLog | null = cached ? JSON.parse(cached) : null;

    try {
      const remote = await this.getDocument<DailyLog>(this.getCollection('eating_logs'), date);
      if (remote && (!localLog || new Date(remote.updatedAt) > new Date(localLog.updatedAt))) {
        localStorage.setItem(key, JSON.stringify(remote));
        return remote;
      }
    } catch {
      // offline fallback
    }

    return localLog;
  }

  async saveDailyLog(log: DailyLog): Promise<void> {
    const key = this.getCacheKey(`log_${log.date}`);
    localStorage.setItem(key, JSON.stringify(log));
    await this.upsertDocument(this.getCollection('eating_logs'), log.date, log);
  }

  async getRecentLogs(limit = 14): Promise<DailyLog[]> {
    const logsMap = new Map<string, DailyLog>();
    const prefix = this.getCacheKey('log_');

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          if (item?.date) logsMap.set(item.date, item);
        } catch {
          // ignore corrupt
        }
      }
    }

    const apiKey = this.getDbApiKey();
    if (apiKey) {
      try {
        const collection = this.getCollection('eating_logs');
        const res = await fetch(`${DB_BASE_URL}/${collection}?limit=${limit}&offset=0`, {
          headers: { 'x-api-key': apiKey },
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.results)) {
            for (const item of json.results) {
              if (item.data?.date) {
                const existing = logsMap.get(item.data.date);
                if (!existing || new Date(item.data.updatedAt) > new Date(existing.updatedAt)) {
                  logsMap.set(item.data.date, item.data);
                  localStorage.setItem(this.getCacheKey(`log_${item.data.date}`), JSON.stringify(item.data));
                }
              }
            }
          }
        }
      } catch {
        // offline fallback
      }
    }

    return Array.from(logsMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // --- AUTO MIGRATION OF LEGACY UNAUTHENTICATED DATA ---
  async autoMigrateLegacyData(uid: string): Promise<void> {
    await runLegacyDataMigration(this, uid);
  }

  // --- LOW LEVEL HTTP + QUEUE ---
  async getDocument<T>(collection: string, id: string): Promise<T | null> {
    const apiKey = this.getDbApiKey();
    if (!apiKey) return null;
    try {
      const response = await fetch(`${DB_BASE_URL}/${collection}/${id}`, {
        headers: { 'x-api-key': apiKey },
      });
      if (!response.ok) return null;
      const json = await response.json();
      return json?.data ?? null;
    } catch {
      return null;
    }
  }

  async upsertDocument(collection: string, id: string, data: unknown): Promise<void> {
    const apiKey = this.getDbApiKey();
    if (!apiKey) {
      // Local-only mode, no remote configured
      return;
    }
    try {
      const response = await fetch(`${DB_BASE_URL}/${collection}/${id}`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch {
      this.enqueueSync({ collection, id, data, timestamp: Date.now() });
    }
  }

  async listDocuments<T>(collection: string, limit = 50): Promise<T[]> {
    const apiKey = this.getDbApiKey();
    if (!apiKey) return [];
    try {
      const res = await fetch(`${DB_BASE_URL}/${collection}?limit=${limit}`, {
        headers: { 'x-api-key': apiKey },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.results) ? json.results.map((r: { data: T }) => r.data) : [];
    } catch {
      return [];
    }
  }

  private enqueueSync(item: SyncItem) {
    const syncKey = this.getCacheKey('pending_syncs');
    const queue: SyncItem[] = JSON.parse(localStorage.getItem(syncKey) || '[]');
    const existingIdx = queue.findIndex(q => q.collection === item.collection && q.id === item.id);
    if (existingIdx >= 0) {
      queue[existingIdx] = item;
    } else {
      queue.push(item);
    }
    localStorage.setItem(syncKey, JSON.stringify(queue));
  }

  private async flushSyncQueue() {
    const syncKey = this.getCacheKey('pending_syncs');
    const queueStr = localStorage.getItem(syncKey);
    if (!queueStr) return;
    const queue: SyncItem[] = JSON.parse(queueStr);
    if (queue.length === 0) return;

    const apiKey = this.getDbApiKey();
    if (!apiKey) return;

    const failedTimestamps = new Set<number>();
    for (const item of queue) {
      try {
        const response = await fetch(`${DB_BASE_URL}/${item.collection}/${item.id}`, {
          method: 'POST',
          headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        if (!response.ok) failedTimestamps.add(item.timestamp);
      } catch {
        failedTimestamps.add(item.timestamp);
      }
    }

    const currentQueue: SyncItem[] = JSON.parse(localStorage.getItem(syncKey) || '[]');
    const remaining = currentQueue.filter(
      item => failedTimestamps.has(item.timestamp) || !queue.some(q => q.timestamp === item.timestamp)
    );
    localStorage.setItem(syncKey, JSON.stringify(remaining));
  }
}

export const jsonDbService = new JsonDbService();
