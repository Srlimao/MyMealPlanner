import { GeminiModelId } from '../../shared/types/settings';

export type UserTier = 'free' | 'starter' | 'pro';

export interface TierDefinition {
  id: UserTier;
  name: string;
  badge: string;
  priceMonthly: number;
  chatLimitDaily: number;
  photoLimitDaily: number;
  nextMealLimitDaily: number;
  planImportMonthly: number;
  defaultModel: GeminiModelId;
  highlights: string[];
}

export const TIER_CONFIGS: Record<UserTier, TierDefinition> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    badge: 'Free',
    priceMonthly: 0,
    chatLimitDaily: 10,
    photoLimitDaily: 3,
    nextMealLimitDaily: 3,
    planImportMonthly: 0,
    defaultModel: 'gemini-2.5-flash-lite',
    highlights: [
      '10 conversas com IA por dia',
      '3 fotos de refeições por dia',
      'Até 3 sugestões de refeição/dia',
      'Registo de texto ilimitado',
      'Modelo Gemini Flash-Lite',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    badge: 'Starter',
    priceMonthly: 1.99,
    chatLimitDaily: 30,
    photoLimitDaily: 10,
    nextMealLimitDaily: Infinity,
    planImportMonthly: 1,
    defaultModel: 'gemini-3.1-flash-lite',
    highlights: [
      '30 conversas com IA por dia',
      '10 fotos de refeições por dia',
      'Sugestões de refeição ilimitadas',
      '1 importação de plano IA / mês',
      'Modelo Gemini 3.1 Flash-Lite',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    badge: 'Pro Elite',
    priceMonthly: 4.99,
    chatLimitDaily: Infinity,
    photoLimitDaily: Infinity,
    nextMealLimitDaily: Infinity,
    planImportMonthly: Infinity,
    defaultModel: 'gemini-3.8-flash',
    highlights: [
      'Conversas com IA ilimitadas',
      'Fotos de refeições ilimitadas',
      'Importações de plano ilimitadas',
      'Raciocínio avançado (Thinking)',
      'Modelo Gemini 3.8 Flash',
    ],
  },
};

export interface UserUsageRecord {
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  chatCountToday: number;
  photoCountToday: number;
  nextMealCountToday: number;
  planImportThisMonth: number;
  updatedAt: string;
}

export type TrackedAction = 'chat' | 'photo' | 'next_meal' | 'plan_import';

export interface ActionCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  reason?: string;
}
