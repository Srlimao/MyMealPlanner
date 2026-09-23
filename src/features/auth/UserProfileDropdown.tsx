import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Key, ExternalLink } from 'lucide-react';
import { useAuth } from './AuthContext';
import { TRANSLATIONS } from '../../shared/i18n/translations';
import { AppLanguage } from '../../shared/types/settings';

interface UserProfileDropdownProps {
  lang: AppLanguage;
  hasGeminiKey: boolean;
  onOpenSettings: () => void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  lang,
  hasGeminiKey,
  onOpenSettings,
}) => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
  const initial = (user.displayName || user.email || 'U')[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer group"
        title={user.email || 'Conta'}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Avatar'}
            className="w-6 h-6 rounded-lg object-cover border border-neutral-700"
          />
        ) : (
          <div className="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center">
            {initial}
          </div>
        )}
        <span className="hidden sm:inline text-xs text-neutral-300 font-medium max-w-[110px] truncate">
          {user.displayName || user.email?.split('@')[0]}
        </span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur-md p-3.5 z-50 animate-fade-in space-y-3">
          {/* User Info Header */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-9 h-9 rounded-xl object-cover border border-neutral-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-100 truncate">
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                {isGoogle ? t.auth.providerGoogle : t.auth.providerEmail}
              </span>
            </div>
          </div>

          {/* Gemini Key Status */}
          <div className="bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5 text-[11px]">
                <Key className="w-3 h-3 text-emerald-400" />
                Gemini API Key
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  hasGeminiKey
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                }`}
              >
                {hasGeminiKey ? t.auth.apiKeyConfigured : t.auth.apiKeyMissing}
              </span>
            </div>
            {!hasGeminiKey && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 font-medium"
              >
                <span>{t.auth.configureInSettings}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={async () => {
              setIsOpen(false);
              await signOut();
            }}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 border border-rose-900/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.auth.signOut}</span>
          </button>
        </div>
      )}
    </div>
  );
};
