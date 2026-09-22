import React, { useState } from 'react';
import { Save, RotateCcw, Check, FileText } from 'lucide-react';
import { NutritionPlan } from '../../shared/types/nutrition';
import { DEFAULT_PLAN_MARKDOWN } from '../../shared/data/defaultPlan';

interface PlanEditorProps {
  plan: NutritionPlan;
  onSave: (updatedMarkdown: string) => void;
  onCancel: () => void;
}

export const PlanEditor: React.FC<PlanEditorProps> = ({ plan, onSave, onCancel }) => {
  const [content, setContent] = useState(plan.markdownContent);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave(content);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleResetToDefault = () => {
    if (confirm('Tem a certeza que deseja restaurar o plano inicial da nutricionista?')) {
      setContent(DEFAULT_PLAN_MARKDOWN);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-neutral-100">Editor do Plano Alimentar (Markdown)</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar Padrão
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl text-neutral-400 hover:text-neutral-200 text-xs transition-colors"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Guardado!' : 'Guardar Plano'}</span>
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={22}
        className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-2xl p-4 font-mono text-xs text-neutral-200 leading-relaxed focus:outline-none"
        placeholder="Escreva ou cole o markdown do plano alimentar aqui..."
      />
    </div>
  );
};
