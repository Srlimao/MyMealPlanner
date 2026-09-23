import React from 'react';
import { Sparkles, Settings, Globe, Bot, Download } from 'lucide-react';
import { UserSettings, AVAILABLE_MODELS, GeminiModelId } from '../types/settings';
import { TRANSLATIONS } from '../i18n/translations';
import { SUPPORTED_LANGUAGES, getLanguageInfo } from '../i18n';
import { UserProfileDropdown } from '../../features/auth/UserProfileDropdown';

interface HeaderProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onOpenSettings: () => void;
  onOpenAdvisorChat: () => void;
  isOnline: boolean;
  canInstall?: boolean;
  onInstallApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenAdvisorChat,
  isOnline,
  canInstall,
  onInstallApp,
}) => {
  const t = TRANSLATIONS[settings.language];
  const currentLang = getLanguageInfo(settings.language);

  const handleModelChange = (modelId: GeminiModelId) => {
    onUpdateSettings({ ...settings, activeModel: modelId });
  };

  const handleCycleLang = () => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex((l) => l.code === settings.language);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    onUpdateSettings({
      ...settings,
      language: SUPPORTED_LANGUAGES[nextIndex].code,
    });
  };

  const nextLang = SUPPORTED_LANGUAGES[
    (SUPPORTED_LANGUAGES.findIndex((l) => l.code === settings.language) + 1) %
      SUPPORTED_LANGUAGES.length
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-950" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-neutral-100 tracking-tight leading-none truncate">
              {t.appTitle}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-[10px] text-neutral-400 tracking-wide uppercase font-medium">
                {isOnline ? 'db.dunhas.com' : 'offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Model Selector, Ask AI, Language & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Model Selector (Desktop & Tablet) */}
          <div className="relative hidden md:block">
            <select
              value={settings.activeModel}
              onChange={(e) => handleModelChange(e.target.value as GeminiModelId)}
              className="appearance-none bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* PWA Install Button */}
          {canInstall && (
            <button
              onClick={onInstallApp}
              className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-2 py-1.5 rounded-lg transition-all active:scale-95"
              title={t.pwa.modalTitle}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{t.common.install}</span>
            </button>
          )}

          {/* Ask AI Assistant Button */}
          <button
            onClick={onOpenAdvisorChat}
            className="flex items-center gap-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
            title={t.nav.askAi}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{t.nav.askAi}</span>
          </button>

          {/* Multi-Language Switcher */}
          <button
            onClick={handleCycleLang}
            className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            title={`Switch to ${nextLang.name} (${nextLang.flag})`}
          >
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs mr-0.5">{currentLang.flag}</span>
            <span className="font-semibold text-[11px] uppercase">{settings.language}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-colors"
            title={t.settings.title}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile & Account Dropdown */}
          <UserProfileDropdown
            lang={settings.language}
            hasGeminiKey={Boolean(settings.geminiApiKey)}
            onOpenSettings={onOpenSettings}
          />
        </div>
      </div>
    </header>
  );
};
