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
    defaultModel: 'gemini-3.5-flash-lite',
    highlights: [
      '10 conversas com IA por dia',
      '3 fotos de refeições por dia',
      'Até 3 sugestões de refeição/dia',
      'Registo de texto completo',
      'Recomendações e análise inteligente',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    badge: 'Starter',
    priceMonthly: 1.99,
    chatLimitDaily: 30,
    photoLimitDaily: 10,
    nextMealLimitDaily: 20,
    planImportMonthly: 1,
    defaultModel: 'gemini-3.5-flash-lite',
    highlights: [
      '30 conversas com IA por dia',
      '10 fotos de refeições por dia',
      '20 sugestões de refeição por dia',
      '1 importação de plano IA / mês',
      'Assistente nutricional dedicado',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    badge: 'Pro Elite',
    priceMonthly: 4.99,
    chatLimitDaily: 100,
    photoLimitDaily: 30,
    nextMealLimitDaily: 30,
    planImportMonthly: 10,
    defaultModel: 'gemini-3.5-flash-lite',
    highlights: [
      'Highest AI Quota: 100 conversas/dia (10x mais que o Free)',
      'Highest Visual Scan: 30 fotos de pratos por dia',
      '30 sugestões diárias baseadas no horário e metas',
      '10 importações mensais de planos e consultas',
      'Velocidade prioritária e análise detalhada de macronutrientes',
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
