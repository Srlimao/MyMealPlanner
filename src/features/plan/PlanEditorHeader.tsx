import React from 'react';
import {
  Save,
  RotateCcw,
  Check,
  Sparkles,
  Code,
  SlidersHorizontal,
} from 'lucide-react';
import { getTranslation } from '../../shared/i18n';

interface PlanEditorHeaderProps {
  mode: 'visual' | 'markdown';
  onToggleMode: (mode: 'visual' | 'markdown') => void;
  onOpenAiModal: () => void;
  onResetToDefault: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaved: boolean;
  restoreLabel: string;
  backLabel: string;
  saveLabel: string;
  savedLabel: string;
  lang?: string;
}

export const PlanEditorHeader: React.FC<PlanEditorHeaderProps> = ({
  mode,
  onToggleMode,
  onOpenAiModal,
  onResetToDefault,
  onCancel,
  onSave,
  isSaved,
  restoreLabel,
  backLabel,
  saveLabel,
  savedLabel,
  lang = 'pt',
}) => {
  const t = getTranslation(lang);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800/80">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-100">
            {t.plan.planEditor}
          </h3>
          <p className="text-[11px] text-neutral-400">
            {mode === 'visual' ? t.plan.visualModeSubtitle : t.plan.markdownModeSubtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Mode Switcher */}
        <div className="bg-neutral-950 p-1 rounded-xl border border-neutral-800 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleMode('visual')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'visual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.plan.visual}
          </button>
          <button
            type="button"
            onClick={() => onToggleMode('markdown')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'markdown'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>{t.plan.markdown}</span>
          </button>
        </div>

        {/* AI Import button */}
        <button
          type="button"
          onClick={onOpenAiModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer"
          title={t.plan.aiImportTitle}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden xs:inline">{t.plan.aiImport}</span>
        </button>

        {/* Reset button */}
        <button
          type="button"
          onClick={onResetToDefault}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs transition-colors cursor-pointer"
          title={restoreLabel}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Back button */}
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs transition-colors cursor-pointer"
        >
          {backLabel}
        </button>

        {/* Save button */}
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
        >
          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaved ? savedLabel : saveLabel}</span>
        </button>
      </div>
    </div>
  );
};
