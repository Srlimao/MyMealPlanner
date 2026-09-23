import React from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { TRANSLATIONS } from '../i18n/translations';
import { AppLanguage } from '../types/settings';

interface AccountSettingsCardProps {
  lang: AppLanguage;
  onLoggedOut?: () => void;
}

export const AccountSettingsCard: React.FC<AccountSettingsCardProps> = ({ lang, onLoggedOut }) => {
  const { user, signOut } = useAuth();
  const t = TRANSLATIONS[lang];

  if (!user) return null;

  const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
  const initial = (user.displayName || user.email || 'U')[0].toUpperCase();

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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/50 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.auth.signOut}</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{t.auth.personalApiKeyNotice}</span>
      </div>
    </div>
  );
};
