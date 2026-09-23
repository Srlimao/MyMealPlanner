import { AdminUserSummary, FinancialSummary } from './types';
import { UserTier, TIER_CONFIGS, UserUsageRecord } from '../subscription/types';
import { User } from '../auth/authService';

const DEFAULT_ADMIN_EMAILS = [
  'admin@dunhas.com',
  'test@example.com', // for E2E tests
];

class AdminService {
  isAdmin(email?: string | null): boolean {
    if (!email) return false;
    const lower = email.toLowerCase().trim();

    // Check dev override
    if (typeof window !== 'undefined' && localStorage.getItem('eh_admin_mode') === 'true') {
      return true;
    }

    // Check environment variable (VITE_ADMIN_EMAILS)
    const envAdmins = import.meta.env.VITE_ADMIN_EMAILS;
    if (envAdmins) {
      const list = envAdmins.split(',').map((e: string) => e.trim().toLowerCase());
      if (list.includes(lower)) return true;
    }

    return DEFAULT_ADMIN_EMAILS.includes(lower);
  }

  async recordUserPresence(user: User, currentTier: UserTier = 'free'): Promise<void> {
    if (typeof window === 'undefined' || !user?.uid) return;

    const users = this.getLocalUsers();
    const nowIso = new Date().toISOString();
    const existingIdx = users.findIndex((u) => u.uid === user.uid);

    // Get live usage from local cache
    let liveChats = 0;
    let livePhotos = 0;
    try {
      const usageKey = `eh_${user.uid}_usage`;
      const usageRaw = localStorage.getItem(usageKey);
      if (usageRaw) {
        const parsed: UserUsageRecord = JSON.parse(usageRaw);
        liveChats = parsed.chatCountToday || 0;
        livePhotos = parsed.photoCountToday || 0;
      }
    } catch {
      // ignore
    }

    if (existingIdx >= 0) {
      users[existingIdx] = {
        ...users[existingIdx],
        email: user.email || users[existingIdx].email,
        displayName: user.displayName || users[existingIdx].displayName,
        photoURL: user.photoURL || users[existingIdx].photoURL,
        tier: currentTier,
        chatsToday: liveChats,
        photosToday: livePhotos,
        lastActive: nowIso,
      };
    } else {
      users.push({
        uid: user.uid,
        email: user.email || 'sem-email@usuario.com',
        displayName: user.displayName || user.email?.split('@')[0] || 'Novo Usuário',
        photoURL: user.photoURL || undefined,
        tier: currentTier,
        chatsToday: liveChats,
        photosToday: livePhotos,
        createdAt: nowIso,
        lastActive: nowIso,
      });
    }

    this.saveLocalUsers(users);
  }

  async fetchAllUsers(): Promise<AdminUserSummary[]> {
    const users = this.getLocalUsers();
    if (users.length === 0) {
      // Seed with default initial data for demo/testing
      const seeded = this.getSeededUsers();
      this.saveLocalUsers(seeded);
      return seeded;
    }
    return users;
  }

  async overrideUserTier(uid: string, newTier: UserTier): Promise<void> {
    const users = this.getLocalUsers();
    const idx = users.findIndex((u) => u.uid === uid);
    if (idx >= 0) {
      users[idx].tier = newTier;
      users[idx].lastActive = new Date().toISOString();
      this.saveLocalUsers(users);
    }

    // Also update target user's local key directly
    if (typeof window !== 'undefined') {
      localStorage.setItem(`eh_${uid}_tier`, newTier);
    }
  }

  async resetUserDailyQuotas(uid: string): Promise<void> {
    const users = this.getLocalUsers();
    const idx = users.findIndex((u) => u.uid === uid);
    if (idx >= 0) {
      users[idx].chatsToday = 0;
      users[idx].photosToday = 0;
      users[idx].lastActive = new Date().toISOString();
      this.saveLocalUsers(users);
    }

    if (typeof window !== 'undefined') {
      const todayStr = new Date().toISOString().split('T')[0];
      const resetUsage: UserUsageRecord = {
        date: todayStr,
        month: todayStr.slice(0, 7),
        chatCountToday: 0,
        photoCountToday: 0,
        nextMealCountToday: 0,
        planImportThisMonth: 0,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`eh_${uid}_usage`, JSON.stringify(resetUsage));
    }
  }

  calculateFinancialMetrics(users: AdminUserSummary[]): FinancialSummary {
    const totalUsers = users.length;
    let freeUsers = 0;
    let starterUsers = 0;
    let proUsers = 0;

    users.forEach((u) => {
      if (u.tier === 'starter') starterUsers++;
      else if (u.tier === 'pro') proUsers++;
      else freeUsers++;
    });

    const grossRevenueMonthly =
      starterUsers * TIER_CONFIGS.starter.priceMonthly +
      proUsers * TIER_CONFIGS.pro.priceMonthly;

    // AI token costs:
    // Free: ~$0.10/mo, Starter: ~$0.24/mo, Pro: ~$0.95/mo
    const estimatedAiCostMonthly =
      freeUsers * 0.1 + starterUsers * 0.24 + proUsers * 0.95;

    // Stripe fees:
    // Starter ($1.99): $0.36 fee
    // Pro ($4.99): $0.44 fee
    const estimatedStripeFeesMonthly = starterUsers * 0.36 + proUsers * 0.44;

    const totalCosts = estimatedAiCostMonthly + estimatedStripeFeesMonthly;
    const netProfitMonthly = grossRevenueMonthly - totalCosts;
    const netMarginPercentage =
      grossRevenueMonthly > 0
        ? Math.max(0, Math.round((netProfitMonthly / grossRevenueMonthly) * 100))
        : 0;

    return {
      totalUsers,
      freeUsers,
      starterUsers,
      proUsers,
      grossRevenueMonthly,
      estimatedAiCostMonthly,
      estimatedStripeFeesMonthly,
      netProfitMonthly,
      netMarginPercentage,
    };
  }

  private getLocalUsers(): AdminUserSummary[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem('eh_system_users');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveLocalUsers(users: AdminUserSummary[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('eh_system_users', JSON.stringify(users));
  }

  private getSeededUsers(): AdminUserSummary[] {
    const now = new Date().toISOString();
    return [
      {
        uid: 'user_admin_01',
        email: 'admin@dunhas.com',
        displayName: 'Admin Dunhas',
        tier: 'pro',
        chatsToday: 8,
        photosToday: 3,
        createdAt: '2026-09-01T10:00:00.000Z',
        lastActive: now,
        notes: 'Administrador do Sistema',
      },
      {
        uid: 'user_demo_02',
        email: 'maria.demo@eatinghelper.internal',
        displayName: 'Dra. Maria Demo',
        tier: 'starter',
        chatsToday: 18,
        photosToday: 6,
        createdAt: '2026-09-10T14:30:00.000Z',
        lastActive: now,
        notes: 'Conta de Demonstração',
      },
      {
        uid: 'user_demo_03',
        email: 'pedro.demo@eatinghelper.internal',
        displayName: 'Pedro Demo',
        tier: 'free',
        chatsToday: 5,
        photosToday: 2,
        createdAt: '2026-09-18T09:15:00.000Z',
        lastActive: now,
      },
    ];
  }
}

export const adminService = new AdminService();
