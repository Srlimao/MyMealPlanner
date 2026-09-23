import React from 'react';
import { Calendar, ChevronRight, Droplet, Flame, Utensils } from 'lucide-react';
import { DailyLog } from '../../shared/types/nutrition';
import { Card } from '../../shared/components/Card';
import { getTranslation } from '../../shared/i18n';

interface HistoryListProps {
  logs: DailyLog[];
  onSelectDate: (date: string) => void;
  lang?: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({ logs, onSelectDate, lang = 'pt' }) => {
  const t = getTranslation(lang);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
        {t.metrics.dailyLogsHistory} ({logs.length})
      </h3>

      {logs.length === 0 ? (
        <Card className="text-center p-8 text-neutral-500 text-xs">
          {t.metrics.noLogsFound}
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card
              key={log.date}
              onClick={() => onSelectDate(log.date)}
              className="p-3.5 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-100 font-mono">
                    {log.date}
                  </h4>
                  <div className="flex items-center gap-2.5 text-[11px] text-neutral-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-neutral-500" /> {log.meals.length} {t.metrics.mealsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-sky-400" /> {log.habits.waterMl}ml
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 flex items-center gap-1 justify-end">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {log.dayTotals.calories} kcal
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono block">
                    {t.macros.proteinShort}:{log.dayTotals.protein}g {t.macros.carbsShort}:{log.dayTotals.carbs}g {t.macros.fatShort}:{log.dayTotals.fat}g
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
