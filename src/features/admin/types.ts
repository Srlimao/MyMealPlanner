import { UserTier } from '../subscription/types';

export interface AdminUserSummary {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  tier: UserTier;
  chatsToday: number;
  photosToday: number;
  lastActive: string;
  createdAt: string;
  notes?: string;
}

export interface FinancialSummary {
  totalUsers: number;
  freeUsers: number;
  starterUsers: number;
  proUsers: number;
  grossRevenueMonthly: number;
  estimatedAiCostMonthly: number;
  estimatedStripeFeesMonthly: number;
  netProfitMonthly: number;
  netMarginPercentage: number;
}

export type AdminTierFilter = 'all' | UserTier;
