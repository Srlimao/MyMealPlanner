import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle } from 'lucide-react';
import { parsePlanWithAI } from './aiPlanParser';
import { NutritionPlan } from '../../shared/types/nutrition';
import { getTranslation } from '../../shared/i18n';
import { useSubscription } from '../subscription/SubscriptionContext';

interface PlanAiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsedPlan: NutritionPlan) => void;
  currentPlan: NutritionPlan;
  lang?: string;
}

export const PlanAiImportModal: React.FC<PlanAiImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentPlan,
  lang = 'pt',
}) => {
  const { canPerformAction, recordAction, openTierModal } = useSubscription();
  const t = getTranslation(lang);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planCheck = canPerformAction('plan_import');

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!planCheck.allowed) {
      openTierModal();
      return;
    }

    if (!inputText.trim()) {
      setError(t.plan.aiImportPasteNotes);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const parsed = await parsePlanWithAI(inputText, currentPlan);
      recordAction('plan_import');
      onImport(parsed);
      onClose();
    } catch (err: any) {
      console.error('AI plan parsing error:', err);
      setError(err?.message || t.plan.aiImportPasteNotes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                {t.plan.aiImportModalTitle}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {t.plan.aiImportModalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!planCheck.allowed && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 text-xs">
            <span className="text-amber-300 text-[11px]">
              {t.plan.aiImportRequiresTier}
            </span>
            <button
              type="button"
              onClick={openTierModal}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors cursor-pointer shrink-0"
            >
              {t.plan.upgrade}
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">
            {t.plan.consultationNotes}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            rows={8}
            placeholder={t.plan.aiImportPlaceholder}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs transition-colors cursor-pointer"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t.plan.aiImportAnalyzing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.plan.aiImportBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
