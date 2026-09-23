import React, { useState } from 'react';
import { BookOpen, Edit3, Apple, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { NutritionPlan } from '../../shared/types/nutrition';
import { Card } from '../../shared/components/Card';
import { EquivalenciesTable } from './EquivalenciesTable';
import { getTranslation } from '../../shared/i18n';

const PlanEditor = React.lazy(() =>
  import('./PlanEditor').then((m) => ({ default: m.PlanEditor }))
);

interface PlanViewerProps {
  plan: NutritionPlan;
  onUpdatePlan: (updatedPlan: NutritionPlan) => void;
  lang?: string;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({ plan, onUpdatePlan, lang = 'pt' }) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'equivalencies'>('view');
  const t = getTranslation(lang);

  const handleSavePlan = (updatedPlan: NutritionPlan) => {
    onUpdatePlan(updatedPlan);
    setMode('view');
  };

  if (mode === 'edit') {
    return (
      <React.Suspense fallback={<div className="p-8 text-center text-neutral-500 text-xs">A carregar editor...</div>}>
        <PlanEditor
          plan={plan}
          onSave={handleSavePlan}
          onCancel={() => setMode('view')}
          lang={lang}
        />
      </React.Suspense>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-20">
      {/* Subnav & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100">{plan.title}</h2>
            <p className="text-[11px] text-neutral-400 font-mono">Nutricionista Nélia Filipe • 14/01/2026</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode(mode === 'equivalencies' ? 'view' : 'equivalencies')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              mode === 'equivalencies'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>{t.plan.fruitEquivalencies}</span>
          </button>

          <button
            onClick={() => setMode('edit')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.plan.editPlan || t.plan.editMarkdown}</span>
          </button>
        </div>
      </div>

      {mode === 'equivalencies' ? (
        <EquivalenciesTable plan={plan} lang={lang} />
      ) : (
        <>
          {/* Commitments Banner */}
          <Card className="border-emerald-500/20 bg-emerald-950/10 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t.plan.commitmentsTitle}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
              {plan.commitments.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Meals Structured Accordion Cards */}
          <div className="space-y-3">
            {plan.meals.map((meal) => (
              <Card key={meal.mealType} className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-100">{meal.label}</h3>
                    <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {meal.recommendedTime}
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {meal.options.map((opt) => (
                    <div
                      key={opt.optionNumber}
                      className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80 space-y-1.5"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {t.plan.option} {opt.optionNumber}
                      </span>
                      <ul className="space-y-1 text-xs text-neutral-300">
                        {opt.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <span className="text-neutral-500">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {meal.rulesNotes && (
                  <div className="text-[11px] text-neutral-500 pt-1 space-y-0.5">
                    {meal.rulesNotes.map((r, i) => (
                      <p key={i}>ℹ️ {r}</p>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
