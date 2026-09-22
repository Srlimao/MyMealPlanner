import { DailyLog, NutritionPlan } from '../types/nutrition';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../types/settings';
import { DEFAULT_NUTRITION_PLAN } from '../data/defaultPlan';

const DB_BASE_URL = 'https://db.dunhas.com/api';
const DB_API_KEY = '1b4a19fdc1eda3f481543b0f25b01ab428e0f6467ad7c9c1';

const CACHE_KEYS = {
  SETTINGS: 'eh_settings',
  ACTIVE_PLAN: 'eh_active_plan',
  LOG_PREFIX: 'eh_log_',
  PENDING_SYNCS: 'eh_pending_syncs',
};

interface SyncItem {
  collection: string;
  id: string;
  data: unknown;
  timestamp: number;
}

class JsonDbService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

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

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // --- SETTINGS ---
  getUserSettings(): UserSettings {
    const cached = localStorage.getItem(CACHE_KEYS.SETTINGS);
    let settings: UserSettings = cached ? JSON.parse(cached) : { ...DEFAULT_USER_SETTINGS };

    // Inject Vite environment variable if user hasn't set one manually
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!settings.geminiApiKey && envKey) {
      settings.geminiApiKey = envKey;
    }
    return settings;
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(settings));
    await this.upsertDocument('user_settings', 'preferences', settings);
  }

  // --- NUTRITION PLAN ---
  async getNutritionPlan(): Promise<NutritionPlan> {
    const cached = localStorage.getItem(CACHE_KEYS.ACTIVE_PLAN);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Error parsing cached nutrition plan', e);
      }
    }

    try {
      const remote = await this.getDocument<NutritionPlan>('food_plan', 'active_plan');
      if (remote) {
        localStorage.setItem(CACHE_KEYS.ACTIVE_PLAN, JSON.stringify(remote));
        return remote;
      }
    } catch {
      // Offline or remote not seeded yet
    }

    // Default seed
    localStorage.setItem(CACHE_KEYS.ACTIVE_PLAN, JSON.stringify(DEFAULT_NUTRITION_PLAN));
    return DEFAULT_NUTRITION_PLAN;
  }

  async saveNutritionPlan(plan: NutritionPlan): Promise<void> {
    localStorage.setItem(CACHE_KEYS.ACTIVE_PLAN, JSON.stringify(plan));
    await this.upsertDocument('food_plan', 'active_plan', plan);
  }

  // --- DAILY LOGS ---
  async getDailyLog(date: string): Promise<DailyLog | null> {
    const cached = localStorage.getItem(`${CACHE_KEYS.LOG_PREFIX}${date}`);
    let localLog: DailyLog | null = cached ? JSON.parse(cached) : null;

    try {
      const remote = await this.getDocument<DailyLog>('eating_logs', date);
      if (remote) {
        // Prefer newer if both exist
        if (!localLog || new Date(remote.updatedAt) > new Date(localLog.updatedAt)) {
          localStorage.setItem(`${CACHE_KEYS.LOG_PREFIX}${date}`, JSON.stringify(remote));
          return remote;
        }
      }
    } catch {
      // Remote fetch failed, fallback to local
    }

    return localLog;
  }

  async saveDailyLog(log: DailyLog): Promise<void> {
    localStorage.setItem(`${CACHE_KEYS.LOG_PREFIX}${log.date}`, JSON.stringify(log));
    await this.upsertDocument('eating_logs', log.date, log);
  }

  async getRecentLogs(limit = 14): Promise<DailyLog[]> {
    const logsMap = new Map<string, DailyLog>();

    // 1. Gather all logs stored locally
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEYS.LOG_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          if (item?.date) logsMap.set(item.date, item);
        } catch {
          // Ignore corrupted entries
        }
      }
    }

    // 2. Fetch remote list and merge
    try {
      const response = await fetch(`${DB_BASE_URL}/eating_logs?limit=${limit}&offset=0`, {
        headers: { 'x-api-key': DB_API_KEY },
      });
      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json?.results)) {
          for (const item of json.results) {
            if (item.data?.date) {
              const existing = logsMap.get(item.data.date);
              if (!existing || new Date(item.data.updatedAt) > new Date(existing.updatedAt)) {
                logsMap.set(item.data.date, item.data);
                localStorage.setItem(
                  `${CACHE_KEYS.LOG_PREFIX}${item.data.date}`,
                  JSON.stringify(item.data)
                );
              }
            }
          }
        }
      }
    } catch {
      // Offline, use local data only
    }

    return Array.from(logsMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // --- LOW LEVEL HTTP + QUEUE ---
  private async getDocument<T>(collection: string, id: string): Promise<T | null> {
    const response = await fetch(`${DB_BASE_URL}/${collection}/${id}`, {
      headers: { 'x-api-key': DB_API_KEY },
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json?.data ?? null;
  }

  private async upsertDocument(collection: string, id: string, data: unknown): Promise<void> {
    try {
      const response = await fetch(`${DB_BASE_URL}/${collection}/${id}`, {
        method: 'POST',
        headers: {
          'x-api-key': DB_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }
    } catch {
      // Queue for background retry
      this.enqueueSync({ collection, id, data, timestamp: Date.now() });
    }
  }

  private enqueueSync(item: SyncItem) {
    const queue: SyncItem[] = JSON.parse(
      localStorage.getItem(CACHE_KEYS.PENDING_SYNCS) || '[]'
    );
    queue.push(item);
    localStorage.setItem(CACHE_KEYS.PENDING_SYNCS, JSON.stringify(queue));
  }

  private async flushSyncQueue() {
    const queueStr = localStorage.getItem(CACHE_KEYS.PENDING_SYNCS);
    if (!queueStr) return;
    const queue: SyncItem[] = JSON.parse(queueStr);
    if (queue.length === 0) return;

    const remaining: SyncItem[] = [];
    for (const item of queue) {
      try {
        const response = await fetch(`${DB_BASE_URL}/${item.collection}/${item.id}`, {
          method: 'POST',
          headers: {
            'x-api-key': DB_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.data),
        });
        if (!response.ok) remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }
    localStorage.setItem(CACHE_KEYS.PENDING_SYNCS, JSON.stringify(remaining));
  }
}

export const jsonDbService = new JsonDbService();
