import React, { useState } from 'react';
import { Utensils, ShieldCheck, Apple, Settings2 } from 'lucide-react';
import { NutritionPlan } from '../../shared/types/nutrition';
import { DEFAULT_NUTRITION_PLAN, DEFAULT_PLAN_MARKDOWN } from '../../shared/data/defaultPlan';
import { getTranslation } from '../../shared/i18n';
import { generatePlanMarkdown, parsePlanMarkdown } from './planParser';
import { PlanMealsEditor } from './PlanMealsEditor';
import { PlanCommitmentsEditor } from './PlanCommitmentsEditor';
import { PlanFruitEditor } from './PlanFruitEditor';
import { PlanGeneralEditor } from './PlanGeneralEditor';
import { PlanAiImportModal } from './PlanAiImportModal';
import { PlanEditorHeader } from './PlanEditorHeader';

type EditorSectionTab = 'refeicoes' | 'compromissos' | 'frutas' | 'geral';

interface PlanEditorProps {
  plan: NutritionPlan;
  onSave: (updatedPlan: NutritionPlan) => void;
  onCancel: () => void;
  lang?: string;
}

export const PlanEditor: React.FC<PlanEditorProps> = ({ plan, onSave, onCancel, lang = 'pt' }) => {
  const t = getTranslation(lang);
  const [mode, setMode] = useState<'visual' | 'markdown'>('visual');
  const [activeTab, setActiveTab] = useState<EditorSectionTab>('refeicoes');
  const [localPlan, setLocalPlan] = useState<NutritionPlan>(() => ({
    ...plan,
    markdownContent: plan.markdownContent || generatePlanMarkdown(plan),
  }));
  const [markdownContent, setMarkdownContent] = useState<string>(() =>
    plan.markdownContent || generatePlanMarkdown(plan)
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleToggleMode = (newMode: 'visual' | 'markdown') => {
    if (newMode === mode) return;

    if (newMode === 'markdown') {
      const generatedMd = generatePlanMarkdown(localPlan);
      setMarkdownContent(generatedMd);
      setLocalPlan((prev) => ({ ...prev, markdownContent: generatedMd }));
    } else {
      const parsed = parsePlanMarkdown(markdownContent, localPlan);
      setLocalPlan(parsed);
    }
    setMode(newMode);
  };

  const handleSave = () => {
    let finalPlan: NutritionPlan;
    if (mode === 'markdown') {
      finalPlan = parsePlanMarkdown(markdownContent, localPlan);
      finalPlan.markdownContent = markdownContent;
    } else {
      const finalMd = generatePlanMarkdown(localPlan);
      finalPlan = {
        ...localPlan,
        markdownContent: finalMd,
        updatedAt: new Date().toISOString(),
      };
    }

    onSave(finalPlan);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleResetToDefault = () => {
    if (confirm(t.plan.confirmRestore)) {
      setLocalPlan({ ...DEFAULT_NUTRITION_PLAN, markdownContent: DEFAULT_PLAN_MARKDOWN });
      setMarkdownContent(DEFAULT_PLAN_MARKDOWN);
    }
  };

  const handleAiImport = (parsed: NutritionPlan) => {
    setLocalPlan(parsed);
    setMarkdownContent(parsed.markdownContent);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <PlanEditorHeader
        mode={mode}
        onToggleMode={handleToggleMode}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onResetToDefault={handleResetToDefault}
        onCancel={onCancel}
        onSave={handleSave}
        isSaved={isSaved}
        restoreLabel={t.plan.restoreDefault}
        backLabel={t.common.back}
        saveLabel={t.plan.savePlanBtn}
        savedLabel={t.plan.saved}
        lang={lang}
      />

      {/* Visual Mode Section Navigation Pills */}
      {mode === 'visual' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('refeicoes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'refeicoes'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-neutral-900/60 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Meals & Options' : 'Refeições'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
              {localPlan.meals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compromissos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'compromissos'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-neutral-900/60 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Commitments & Rules' : 'Compromissos & Regras'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
              {localPlan.commitments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('frutas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'frutas'
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                : 'bg-neutral-900/60 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Fruit Equivalencies' : 'Equivalências de Fruta'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
              {localPlan.fruitEquivalencies.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'geral'
                ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                : 'bg-neutral-900/60 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'General' : 'Geral'}</span>
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      {mode === 'visual' ? (
        <div>
          {activeTab === 'refeicoes' && (
            <PlanMealsEditor
              meals={localPlan.meals}
              onChangeMeals={(meals) => setLocalPlan({ ...localPlan, meals })}
              lang={lang}
            />
          )}

          {activeTab === 'compromissos' && (
            <PlanCommitmentsEditor
              commitments={localPlan.commitments}
              rules={localPlan.rules}
              onChangeCommitments={(commitments) => setLocalPlan({ ...localPlan, commitments })}
              onChangeRules={(rules) => setLocalPlan({ ...localPlan, rules })}
              lang={lang}
            />
          )}

          {activeTab === 'frutas' && (
            <PlanFruitEditor
              fruitEquivalencies={localPlan.fruitEquivalencies}
              onChangeFruitEquivalencies={(fruitEquivalencies) =>
                setLocalPlan({ ...localPlan, fruitEquivalencies })
              }
              lang={lang}
            />
          )}

          {activeTab === 'geral' && (
            <PlanGeneralEditor
              title={localPlan.title}
              date={localPlan.date}
              onUpdateTitle={(title) => setLocalPlan({ ...localPlan, title })}
              onUpdateDate={(date) => setLocalPlan({ ...localPlan, date })}
              lang={lang}
            />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            rows={22}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-2xl p-4 font-mono text-xs text-neutral-200 leading-relaxed focus:outline-none"
            placeholder={t.plan.markdownPlaceholder}
          />
        </div>
      )}

      {/* AI Import Modal */}
      <PlanAiImportModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onImport={handleAiImport}
        currentPlan={localPlan}
        lang={lang}
      />
    </div>
  );
};
