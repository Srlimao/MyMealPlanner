import React from 'react';
import { Droplet, Plus, Minus, CheckCircle, AlertTriangle, PieChart } from 'lucide-react';
import { DailyHabits } from '../../shared/types/nutrition';
import { Card } from '../../shared/components/Card';
import { getTranslation } from '../../shared/i18n';

interface HabitTrackersProps {
  habits: DailyHabits;
  onUpdateHabits: (newHabits: DailyHabits) => void;
  plateAdherenceCount: { adhered: number; totalMainMeals: number };
  lang?: string;
}

export const HabitTrackers: React.FC<HabitTrackersProps> = ({
  habits,
  onUpdateHabits,
  plateAdherenceCount,
  lang = 'pt',
}) => {
  const t = getTranslation(lang);
  const waterTarget = 2000;
  const waterPercent = Math.min(100, Math.round((habits.waterMl / waterTarget) * 100));

  const addWater = (ml: number) => {
    onUpdateHabits({ ...habits, waterMl: Math.max(0, habits.waterMl + ml) });
  };

  const updateSoda = (delta: number) => {
    onUpdateHabits({ ...habits, sodaCount: Math.max(0, habits.sodaCount + delta) });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. Water Tracker (2L Target) */}
      <Card className="p-3.5 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase">{t.habits.water}</span>
              <div className="text-sm font-bold text-neutral-100 font-mono">
                {habits.waterMl} <span className="text-xs text-neutral-500 font-normal">/ 2000 ml</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-sky-400">{waterPercent}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-300"
            style={{ width: `${waterPercent}%` }}
          />
        </div>

        {/* Quick Buttons */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onClick={() => addWater(250)}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-neutral-200 transition-colors"
          >
            <Plus className="w-3 h-3 text-sky-400" /> {t.habits.addWater250}
          </button>
          <button
            onClick={() => addWater(500)}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-neutral-200 transition-colors"
          >
            <Plus className="w-3 h-3 text-sky-400" /> {t.habits.addWater500}
          </button>
          <button
            onClick={() => addWater(-250)}
            disabled={habits.waterMl <= 0}
            className="px-2 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 disabled:opacity-30"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      </Card>

      {/* 2. Soda Limit Tracker (Max 1/day) */}
      <Card className="p-3.5 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                habits.sodaCount > 1 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              {habits.sodaCount > 1 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase">{t.habits.soda}</span>
              <div className="text-sm font-bold text-neutral-100 font-mono">
                {habits.sodaCount} <span className="text-xs text-neutral-500 font-normal">{t.habits.sodaMax1}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-neutral-400">
          {habits.sodaCount <= 1 ? t.habits.sodaOk : t.habits.sodaExceeded}
        </p>

        {/* Increment / Decrement */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onClick={() => updateSoda(1)}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-neutral-200 transition-colors"
          >
            <Plus className="w-3 h-3 text-emerald-400" /> {t.habits.addSoda}
          </button>
          <button
            onClick={() => updateSoda(-1)}
            disabled={habits.sodaCount <= 0}
            className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 disabled:opacity-30"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      </Card>

      {/* 3. Plate Rule Adherence */}
      <Card className="p-3.5 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-neutral-400 uppercase">{t.habits.plateRule}</span>
              <div className="text-sm font-bold text-neutral-100 font-mono">
                {plateAdherenceCount.adhered} <span className="text-xs text-neutral-500 font-normal">/ {plateAdherenceCount.totalMainMeals} {t.habits.mainMeals}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-neutral-400 leading-tight">
          {t.habits.plateSubtitle}
        </p>
      </Card>
    </div>
  );
};
