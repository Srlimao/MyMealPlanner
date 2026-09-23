import React from 'react';
import { Flame, Shield, Wheat, Droplet } from 'lucide-react';
import { MealTotals, DailyTargets } from '../../shared/types/nutrition';
import { Card } from '../../shared/components/Card';
import { getTranslation } from '../../shared/i18n';

interface MacroProgressBarsProps {
  totals: MealTotals;
  targets: DailyTargets;
  lang?: string;
}

export const MacroProgressBars: React.FC<MacroProgressBarsProps> = ({ totals, targets, lang = 'pt' }) => {
  const t = getTranslation(lang);
  const isOverCal = totals.calories > targets.calories;
  const rawCalPercent = Math.round((totals.calories / targets.calories) * 100) || 0;
  const calPercent = Math.min(100, rawCalPercent);
  const proPercent = Math.min(100, Math.round((totals.protein / targets.protein) * 100)) || 0;
  const carbPercent = Math.min(100, Math.round((totals.carbs / targets.carbs) * 100)) || 0;
  const fatPercent = Math.min(100, Math.round((totals.fat / targets.fat) * 100)) || 0;

  return (
    <Card className="space-y-4">
      {/* Calories Overview Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border ${isOverCal ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              {t.macros.dailyCalories}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl sm:text-2xl font-bold font-mono ${isOverCal ? 'text-amber-300' : 'text-neutral-100'}`}>
                {totals.calories}
              </span>
              <span className="text-xs text-neutral-500 font-mono">/ {targets.calories} kcal</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-xs font-bold font-mono ${isOverCal ? 'text-amber-400' : 'text-emerald-400'}`}>
            {rawCalPercent}%
          </span>
          <span className="text-[10px] block">
            {isOverCal ? (
              <span className="text-amber-400/90 font-medium">+{totals.calories - targets.calories} kcal {t.macros.overTarget}</span>
            ) : (
              <span className="text-neutral-500">{targets.calories - totals.calories} kcal {t.macros.remaining}</span>
            )}
          </span>
        </div>
      </div>

      {/* Main Calories Bar */}
      <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverCal
              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
              : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300'
          }`}
          style={{ width: `${calPercent}%` }}
        />
      </div>

      {/* 3 Macro Meters (Protein, Carbs, Fat) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-1">
        {/* Protein */}
        <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-sky-400" /> {t.macros.proteinShort}
            </span>
            <span className="font-mono font-semibold text-neutral-200">{totals.protein}g</span>
          </div>
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${proPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-neutral-500 font-mono block text-right">
            {t.macros.target}: {targets.protein}g
          </span>
        </div>

        {/* Carbs */}
        <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Wheat className="w-3 h-3 text-amber-400" /> {t.macros.carbsShort}
            </span>
            <span className="font-mono font-semibold text-neutral-200">{totals.carbs}g</span>
          </div>
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${carbPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-neutral-500 font-mono block text-right">
            {t.macros.target}: {targets.carbs}g
          </span>
        </div>

        {/* Fat */}
        <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Droplet className="w-3 h-3 text-rose-400" /> {t.macros.fatShort}
            </span>
            <span className="font-mono font-semibold text-neutral-200">{totals.fat}g</span>
          </div>
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-neutral-500 font-mono block text-right">
            {t.macros.target}: {targets.fat}g
          </span>
        </div>
      </div>
    </Card>
  );
};
