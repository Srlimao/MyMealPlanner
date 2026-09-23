import React from 'react';
import {
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Utensils,
  PlusCircle,
  X,
} from 'lucide-react';
import { NutritionPlanMeal, MealType, NutritionPlanMealOption } from '../../shared/types/nutrition';
import { Card } from '../../shared/components/Card';
import { PlanOptionCard } from './PlanOptionCard';

interface PlanMealCardProps {
  meal: NutritionPlanMeal;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateMeal: (updatedMeal: NutritionPlanMeal) => void;
  onRemoveMeal: () => void;
  lang?: string;
}

const MEAL_TYPES: { id: MealType; labelPt: string; labelEn: string }[] = [
  { id: 'pequeno_almoco', labelPt: 'Pequeno Almoço', labelEn: 'Breakfast' },
  { id: 'almoco', labelPt: 'Almoço', labelEn: 'Lunch' },
  { id: 'lanche', labelPt: 'Lanche', labelEn: 'Afternoon Snack' },
  { id: 'jantar', labelPt: 'Jantar', labelEn: 'Dinner' },
  { id: 'ceia', labelPt: 'Ceia SOS', labelEn: 'Late Snack SOS' },
  { id: 'snack', labelPt: 'Snack / Outro', labelEn: 'Snack / Other' },
];

export const PlanMealCard: React.FC<PlanMealCardProps> = ({
  meal,
  isExpanded,
  onToggleExpand,
  onUpdateMeal,
  onRemoveMeal,
  lang = 'pt',
}) => {
  const handleAddOption = () => {
    const newOption: NutritionPlanMealOption = {
      optionNumber: meal.options.length + 1,
      items: [''],
    };
    onUpdateMeal({
      ...meal,
      options: [...meal.options, newOption],
    });
  };

  const handleRemoveOption = (optionIndex: number) => {
    const updatedOptions = meal.options
      .filter((_, i) => i !== optionIndex)
      .map((opt, i) => ({ ...opt, optionNumber: i + 1 }));
    onUpdateMeal({
      ...meal,
      options: updatedOptions,
    });
  };

  const handleUpdateOptionTitle = (optionIndex: number, title: string) => {
    const updatedOptions = [...meal.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      title: title || undefined,
    };
    onUpdateMeal({ ...meal, options: updatedOptions });
  };

  const handleAddItem = (optionIndex: number) => {
    const updatedOptions = [...meal.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      items: [...updatedOptions[optionIndex].items, ''],
    };
    onUpdateMeal({ ...meal, options: updatedOptions });
  };

  const handleUpdateItem = (optionIndex: number, itemIndex: number, value: string) => {
    const updatedOptions = [...meal.options];
    const updatedItems = [...updatedOptions[optionIndex].items];
    updatedItems[itemIndex] = value;
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], items: updatedItems };
    onUpdateMeal({ ...meal, options: updatedOptions });
  };

  const handleRemoveItem = (optionIndex: number, itemIndex: number) => {
    const updatedOptions = [...meal.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      items: updatedOptions[optionIndex].items.filter((_, i) => i !== itemIndex),
    };
    onUpdateMeal({ ...meal, options: updatedOptions });
  };

  return (
    <Card className="space-y-3 border-neutral-800/90">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <div
          onClick={onToggleExpand}
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
        >
          <div className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400 shrink-0">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-neutral-200 truncate">{meal.label}</h4>
            <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-500" /> {meal.recommendedTime} •{' '}
              {meal.options.length} {meal.options.length === 1 ? 'opção' : 'opções'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onRemoveMeal}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title={lang === 'en' ? 'Remove meal' : 'Remover refeição'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="pt-3 border-t border-neutral-800/80 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-[11px] text-neutral-400 font-medium">
                {lang === 'en' ? 'Meal Name' : 'Nome da Refeição'}
              </label>
              <input
                type="text"
                value={meal.label}
                onChange={(e) => onUpdateMeal({ ...meal, label: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400 font-medium">
                {lang === 'en' ? 'Type' : 'Categoria'}
              </label>
              <select
                value={meal.mealType}
                onChange={(e) => onUpdateMeal({ ...meal, mealType: e.target.value as MealType })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                {MEAL_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {lang === 'en' ? type.labelEn : type.labelPt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span>{lang === 'en' ? 'Time' : 'Horário'}</span>
              </label>
              <input
                type="time"
                value={meal.recommendedTime}
                onChange={(e) => onUpdateMeal({ ...meal, recommendedTime: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes / Rules for this meal */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-400 font-medium flex items-center justify-between">
              <span>{lang === 'en' ? 'Meal Notes / Rules' : 'Notas & Regras desta refeição'}</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateMeal({
                    ...meal,
                    rulesNotes: [...(meal.rulesNotes || []), ''],
                  })
                }
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-normal cursor-pointer"
              >
                + {lang === 'en' ? 'Add note' : 'Adicionar nota'}
              </button>
            </label>
            {meal.rulesNotes && meal.rulesNotes.length > 0 && (
              <div className="space-y-1.5">
                {meal.rulesNotes.map((note, nIdx) => (
                  <div key={nIdx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => {
                        const newNotes = [...(meal.rulesNotes || [])];
                        newNotes[nIdx] = e.target.value;
                        onUpdateMeal({ ...meal, rulesNotes: newNotes });
                      }}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
                      placeholder="Ex: Sopa de legumes sem batata, Pós Treino: Caseína"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newNotes = (meal.rulesNotes || []).filter((_, i) => i !== nIdx);
                        onUpdateMeal({ ...meal, rulesNotes: newNotes });
                      }}
                      className="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                {lang === 'en' ? 'Meal Options' : 'Opções da Refeição'}
              </span>
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Add Option' : 'Nova Opção'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {meal.options.map((opt, optIdx) => (
                <PlanOptionCard
                  key={optIdx}
                  option={opt}
                  totalOptions={meal.options.length}
                  onUpdateTitle={(title) => handleUpdateOptionTitle(optIdx, title)}
                  onRemoveOption={() => handleRemoveOption(optIdx)}
                  onAddItem={() => handleAddItem(optIdx)}
                  onUpdateItem={(itemIdx, val) => handleUpdateItem(optIdx, itemIdx, val)}
                  onRemoveItem={(itemIdx) => handleRemoveItem(optIdx, itemIdx)}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
