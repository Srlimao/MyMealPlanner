import {
  UserTier,
  TIER_CONFIGS,
  UserUsageRecord,
  TrackedAction,
  ActionCheckResult,
} from './types';
import { GeminiModelId } from '../../shared/types/settings';
import { jsonDbService } from '../../shared/services/jsonDbService';
import { getLocalDateString } from '../../shared/utils/dateUtils';

class SubscriptionService {
  private getTodayStr(): string {
    return getLocalDateString();
  }

  private getCurrentMonthStr(): string {
    return this.getTodayStr().slice(0, 7);
  }

  private getCacheKey(key: string): string {
    const uid = jsonDbService.getUserId();
    return uid ? `eh_${uid}_${key}` : `eh_${key}`;
  }

  getUserTier(): UserTier {
    if (typeof window === 'undefined') return 'free';
    const key = this.getCacheKey('tier');
    const stored = localStorage.getItem(key);
    if (stored === 'starter' || stored === 'pro') return stored;
    return 'free';
  }

  async syncUserTierRemote(uidOverride?: string): Promise<UserTier> {
    const uid = uidOverride || jsonDbService.getUserId();
    if (!uid || uid.startsWith('e2e_')) return this.getUserTier();

    try {
      const remote = await jsonDbService.getDocument<{ tier?: UserTier }>('eating_users', uid);
      if (remote?.tier && (remote.tier === 'free' || remote.tier === 'starter' || remote.tier === 'pro')) {
        const local = this.getUserTier();
        if (local !== remote.tier) {
          const key = this.getCacheKey('tier');
          localStorage.setItem(key, remote.tier);

          // Update active model
          const settings = jsonDbService.getUserSettings();
          const targetModel = TIER_CONFIGS[remote.tier].defaultModel;
          if (settings.activeModel !== targetModel) {
            jsonDbService.saveUserSettings({
              ...settings,
              activeModel: targetModel,
            });
          }
        }
        return remote.tier;
      }
    } catch {
      // Offline fallback
    }
    return this.getUserTier();
  }

  setUserTier(tier: UserTier): void {
    if (typeof window === 'undefined') return;
    const key = this.getCacheKey('tier');
    localStorage.setItem(key, tier);

    // Sync active model in settings with tier's designated model
    const settings = jsonDbService.getUserSettings();
    const targetModel = TIER_CONFIGS[tier].defaultModel;
    if (settings.activeModel !== targetModel) {
      jsonDbService.saveUserSettings({
        ...settings,
        activeModel: targetModel,
      });
    }

    // Remote persistence to eating_users collection on db.dunhas.com
    const uid = jsonDbService.getUserId();
    if (uid && !uid.startsWith('e2e_')) {
      jsonDbService.getDocument<Record<string, unknown>>('eating_users', uid).then((existing) => {
        jsonDbService.upsertDocument('eating_users', uid, {
          ...(existing || {}),
          uid,
          tier,
          updatedAt: new Date().toISOString(),
        });
      });
    }
  }

  getUsage(): UserUsageRecord {
    const today = this.getTodayStr();
    const currentMonth = this.getCurrentMonthStr();
    const key = this.getCacheKey('usage');

    let record: UserUsageRecord = {
      date: today,
      month: currentMonth,
      chatCountToday: 0,
      photoCountToday: 0,
      nextMealCountToday: 0,
      planImportThisMonth: 0,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          record = JSON.parse(stored);
        } catch {
          // ignore corrupted JSON
        }
      }
    }

    let modified = false;

    // Reset daily counters if day changed
    if (record.date !== today) {
      record.date = today;
      record.chatCountToday = 0;
      record.photoCountToday = 0;
      record.nextMealCountToday = 0;
      modified = true;
    }

    // Reset monthly counters if month changed
    if (record.month !== currentMonth) {
      record.month = currentMonth;
      record.planImportThisMonth = 0;
      modified = true;
    }

    if (modified && typeof window !== 'undefined') {
      record.updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(record));
    }

    return record;
  }

  canPerformAction(action: TrackedAction): ActionCheckResult {
    const tier = this.getUserTier();
    const config = TIER_CONFIGS[tier];
    const usage = this.getUsage();

    switch (action) {
      case 'chat': {
        const limit = config.chatLimitDaily;
        const current = usage.chatCountToday;
        const remaining = Math.max(0, limit - current);
        return {
          allowed: current < limit,
          remaining: limit === Infinity ? Infinity : remaining,
          limit,
          reason: current >= limit ? `Limite diário de ${limit} conversas atingido.` : undefined,
        };
      }
      case 'photo': {
        const limit = config.photoLimitDaily;
        const current = usage.photoCountToday;
        const remaining = Math.max(0, limit - current);
        return {
          allowed: current < limit,
          remaining: limit === Infinity ? Infinity : remaining,
          limit,
          reason: current >= limit ? `Limite diário de ${limit} fotos atingido.` : undefined,
        };
      }
      case 'next_meal': {
        const limit = config.nextMealLimitDaily;
        const current = usage.nextMealCountToday;
        const remaining = Math.max(0, limit - current);
        return {
          allowed: current < limit,
          remaining: limit === Infinity ? Infinity : remaining,
          limit,
          reason: current >= limit ? `Limite diário de sugestões atingido.` : undefined,
        };
      }
      case 'plan_import': {
        const limit = config.planImportMonthly;
        const current = usage.planImportThisMonth;
        const remaining = Math.max(0, limit - current);
        return {
          allowed: current < limit,
          remaining: limit === Infinity ? Infinity : remaining,
          limit,
          reason: current >= limit ? `Importação de plano com IA requer plano Starter ou Pro.` : undefined,
        };
      }
    }
  }

  recordAction(action: TrackedAction): void {
    const usage = this.getUsage();
    switch (action) {
      case 'chat':
        usage.chatCountToday += 1;
        break;
      case 'photo':
        usage.photoCountToday += 1;
        break;
      case 'next_meal':
        usage.nextMealCountToday += 1;
        break;
      case 'plan_import':
        usage.planImportThisMonth += 1;
        break;
    }
    usage.updatedAt = new Date().toISOString();
    if (typeof window !== 'undefined') {
      const key = this.getCacheKey('usage');
      localStorage.setItem(key, JSON.stringify(usage));
    }
  }

  getModelForAction(_action: TrackedAction, preferredModel?: GeminiModelId): GeminiModelId {
    const tier = this.getUserTier();
    // Pro users can choose any model or default to Gemini 3.8 Flash
    if (tier === 'pro') {
      return preferredModel || TIER_CONFIGS.pro.defaultModel;
    }
    // Free and Starter tiers are gated to their respective cost-optimized models
    return TIER_CONFIGS[tier].defaultModel;
  }
}

export const subscriptionService = new SubscriptionService();
