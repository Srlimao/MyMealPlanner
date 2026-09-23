import React from 'react';
import { X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';
import { AppLanguage } from '../types/settings';
import { TRANSLATIONS } from '../i18n/translations';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  language?: AppLanguage;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  language = 'pt',
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                {t.pwa.modalTitle}
              </h3>
              <p className="text-[10px] text-emerald-400">Eating Helper PWA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-neutral-300">
          <p className="leading-relaxed">
            {t.pwa.modalDesc}
          </p>

          {isIOS ? (
            <div className="space-y-3 bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800">
              <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                {t.pwa.iosTitle}
              </span>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 shrink-0">
                  <Share className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <span className="leading-tight">
                  {t.pwa.iosStep1}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 shrink-0">
                  <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="leading-tight">
                  {t.pwa.iosStep2}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="leading-tight">
                  {t.pwa.iosStep3}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
              <span className="text-[11px] font-semibold text-emerald-400 block">
                {t.pwa.androidTitle}
              </span>
              <p className="text-[11px] text-neutral-400">
                {t.pwa.androidDesc}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
          >
            {t.pwa.understood}
          </button>
        </div>
      </div>
    </div>
  );
};
