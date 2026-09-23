import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { NutritionPlanMeal } from '../../shared/types/nutrition';
import { PlanMealCard } from './PlanMealCard';

interface PlanMealsEditorProps {
  meals: NutritionPlanMeal[];
  onChangeMeals: (meals: NutritionPlanMeal[]) => void;
  lang?: string;
}

export const PlanMealsEditor: React.FC<PlanMealsEditorProps> = ({
  meals,
  onChangeMeals,
  lang = 'pt',
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const handleAddMeal = () => {
    const newMeal: NutritionPlanMeal = {
      mealType: 'snack',
      label: lang === 'en' ? 'New Meal' : 'Nova Refeição',
      recommendedTime: '16:00',
      options: [
        {
          optionNumber: 1,
          items: [lang === 'en' ? 'Food item' : 'Alimento / porção'],
        },
      ],
      rulesNotes: [],
    };
    const updated = [...meals, newMeal];
    onChangeMeals(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleRemoveMeal = (index: number) => {
    if (confirm(lang === 'en' ? 'Delete this meal from the plan?' : 'Eliminar esta refeição do plano?')) {
      const updated = meals.filter((_, i) => i !== index);
      onChangeMeals(updated);
      if (expandedIndex === index) setExpandedIndex(null);
    }
  };

  const handleUpdateMeal = (index: number, updatedMeal: NutritionPlanMeal) => {
    const updated = [...meals];
    updated[index] = updatedMeal;
    onChangeMeals(updated);
  };

  return (
    <div className="space-y-3.5 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-400">
          {meals.length} {lang === 'en' ? 'Meals scheduled' : 'Refeições planeadas'}
        </span>
        <button
          type="button"
          onClick={handleAddMeal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Add Meal' : 'Adicionar Refeição'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {meals.map((meal, mealIdx) => (
          <PlanMealCard
            key={mealIdx}
            meal={meal}
            isExpanded={expandedIndex === mealIdx}
            onToggleExpand={() => toggleExpand(mealIdx)}
            onUpdateMeal={(updatedMeal) => handleUpdateMeal(mealIdx, updatedMeal)}
            onRemoveMeal={() => handleRemoveMeal(mealIdx)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
};
