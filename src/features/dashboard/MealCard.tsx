import React from 'react';
import { Trash2, CheckCircle2, Clock } from 'lucide-react';
import { MealEntry } from '../../shared/types/nutrition';
import { AppLanguage } from '../../shared/types/settings';
import { Card } from '../../shared/components/Card';
import { getTranslation, getMealName } from '../../shared/i18n';

interface MealCardProps {
  meal: MealEntry;
  onDelete: (id: string) => void;
  lang: AppLanguage;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onDelete, lang }) => {
  const t = getTranslation(lang);
  const timeFormatted = new Date(meal.loggedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="p-4 space-y-3 hover:border-neutral-700/80 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              {getMealName(meal.mealType, lang)}
            </span>
            <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeFormatted}
            </span>
            {meal.adheresToPlateRule && (
              <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" /> {t.dashboard.balancedPlate}
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-neutral-100 mt-1">{meal.name}</h4>
        </div>

        <button
          onClick={() => onDelete(meal.id)}
          className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800/80 rounded-lg transition-colors"
          title={t.dashboard.deleteMeal}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Items list */}
      <div className="flex flex-wrap gap-1.5">
        {meal.items.map((item, idx) => (
          <span
            key={idx}
            className="text-[11px] bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-300 flex items-center gap-1.5"
          >
            <span>{item.name}</span>
            <span className="text-[10px] text-neutral-500 font-mono">({item.portion})</span>
          </span>
        ))}
      </div>

      {/* Macros Footer */}
      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
        <span className="font-bold text-emerald-400">
          {meal.totals.calories} <span className="text-[10px] font-normal text-neutral-500">kcal</span>
        </span>
        <div className="flex items-center gap-2.5 text-[11px] text-neutral-400">
          <span>{t.macros.proteinShort}: <strong className="text-neutral-200">{meal.totals.protein}g</strong></span>
          <span>{t.macros.carbsShort}: <strong className="text-neutral-200">{meal.totals.carbs}g</strong></span>
          <span>{t.macros.fatShort}: <strong className="text-neutral-200">{meal.totals.fat}g</strong></span>
        </div>
      </div>
    </Card>
  );
};
