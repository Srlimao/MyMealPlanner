import { LogOut, ShieldCheck, Sparkles, Zap, Crown } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useSubscription } from '../../features/subscription/SubscriptionContext';
import { TIER_CONFIGS } from '../../features/subscription/types';
import { TRANSLATIONS } from '../i18n/translations';
import { AppLanguage } from '../types/settings';

interface AccountSettingsCardProps {
  lang: AppLanguage;
  onLoggedOut?: () => void;
}

export const AccountSettingsCard: React.FC<AccountSettingsCardProps> = ({ lang, onLoggedOut }) => {
  const { user, signOut } = useAuth();
  const { tier, openTierModal } = useSubscription();
  const t = TRANSLATIONS[lang];

  if (!user) return null;

  const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
  const initial = (user.displayName || user.email || 'U')[0].toUpperCase();
  const tierConfig = TIER_CONFIGS[tier];

  const handleSignOut = async () => {
    await signOut();
    onLoggedOut?.();
  };

  return (
    <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-10 h-10 rounded-xl object-cover border border-neutral-700 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center shrink-0">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-100 truncate">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 shrink-0">
                {isGoogle ? t.auth.providerGoogle : t.auth.providerEmail}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/50 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.auth.signOut}</span>
        </button>
      </div>

      {/* Subscription Tier Info */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs">
        <div className="flex items-center gap-2">
          {tier === 'pro' ? (
            <Crown className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : tier === 'starter' ? (
            <Zap className="w-4 h-4 text-sky-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-neutral-400 shrink-0" />
          )}
          <div>
            <span className="font-semibold text-neutral-200">Plano {tierConfig.name}</span>
            <p className="text-[10px] text-neutral-400">
              {tier === 'free'
                ? '10 chats/dia • 3 fotos/dia'
                : tier === 'starter'
                ? '30 chats/dia • 10 fotos/dia'
                : 'Ilimitado • Gemini 3.8 Flash'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openTierModal}
          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
        >
          Alterar Plano
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{t.auth.personalApiKeyNotice}</span>
      </div>
    </div>
  );
};
