import React, { useState } from 'react';
import { X, Key, Cpu, Check, Eye, EyeOff, Smartphone, Download, Globe } from 'lucide-react';
import { UserSettings, AVAILABLE_MODELS } from '../types/settings';
import { TRANSLATIONS } from '../i18n/translations';
import { SUPPORTED_LANGUAGES } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  canInstall?: boolean;
  isStandalone?: boolean;
  onInstallApp?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  canInstall,
  isStandalone,
  onInstallApp,
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;
  const t = TRANSLATIONS[formData.language];

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-neutral-100">{t.settings.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Language Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              {t.settings.language}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = formData.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setFormData({ ...formData, language: lang.code })}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-sm'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              {t.settings.geminiKey}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={formData.geminiApiKey}
                onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value.trim() })}
                placeholder="AIzaSy..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">{t.settings.geminiKeyHint}</p>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">{t.settings.activeModel}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = formData.activeModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, activeModel: model.id })}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500/80 bg-emerald-950/20 text-neutral-100'
                        : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-neutral-200">{model.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/80 text-emerald-400">
                        {model.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-1 leading-tight">
                      {model.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto Fallback Toggle */}
          <div className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-medium text-neutral-200">
                {t.settings.autoFallback}
              </span>
              <p className="text-[11px] text-neutral-500">
                {t.settings.autoFallbackDesc}
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.autoFallbackOnRateLimit}
              onChange={(e) =>
                setFormData({ ...formData, autoFallbackOnRateLimit: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0"
            />
          </div>

          {/* Daily Nutrition Targets */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-neutral-300">{t.settings.dailyTargets}</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-neutral-400">{t.settings.caloriesKcal}</label>
                <input
                  type="number"
                  value={formData.targets.calories}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targets: { ...formData.targets, calories: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400">{t.settings.proteinG}</label>
                <input
                  type="number"
                  value={formData.targets.protein}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targets: { ...formData.targets, protein: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400">{t.settings.carbsG}</label>
                <input
                  type="number"
                  value={formData.targets.carbs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targets: { ...formData.targets, carbs: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400">{t.settings.fatG}</label>
                <input
                  type="number"
                  value={formData.targets.fat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targets: { ...formData.targets, fat: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Mobile & PWA Installation */}
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  {t.settings.pwaTitle}
                </span>
                <p className="text-[11px] text-neutral-500">
                  {isStandalone
                    ? t.settings.pwaInstalledDesc
                    : t.settings.pwaNotInstalledDesc}
                </p>
              </div>

              {isStandalone ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold self-start sm:self-auto shrink-0">
                  <Check className="w-3.5 h-3.5" /> {t.settings.pwaInstalled}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onInstallApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all active:scale-95 self-start sm:self-auto shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{canInstall ? t.settings.installApp : t.settings.howToInstall}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-800 shrink-0 bg-neutral-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all"
          >
            {isSaved ? <Check className="w-4 h-4" /> : null}
            <span>{isSaved ? t.plan.saved : t.settings.saveChanges}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
