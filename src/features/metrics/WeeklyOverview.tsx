import { BarChart3, Flame, Shield, Droplet } from 'lucide-react';
import { DailyLog } from '../../shared/types/nutrition';
import { Card } from '../../shared/components/Card';

interface WeeklyOverviewProps {
  logs: DailyLog[];
  targetCalories: number;
}

export const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ logs, targetCalories }) => {
  // Take last 7 days sorted chronologically for chart
  const recent7 = [...logs].slice(0, 7).reverse();

  if (recent7.length === 0) {
    return (
      <Card className="text-center p-8 text-neutral-500 text-xs">
        Sem dados históricos suficientes para gerar gráficos.
      </Card>
    );
  }

  const avgCalories = Math.round(
    recent7.reduce((sum, l) => sum + l.dayTotals.calories, 0) / recent7.length
  );
  const avgProtein = Math.round(
    recent7.reduce((sum, l) => sum + l.dayTotals.protein, 0) / recent7.length
  );
  const avgWater = Math.round(
    recent7.reduce((sum, l) => sum + l.habits.waterMl, 0) / recent7.length
  );

  const maxCalInWeek = Math.max(...recent7.map((l) => l.dayTotals.calories), targetCalories, 100);

  return (
    <div className="space-y-4">
      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5" /> Média Calorias
          </div>
          <div className="text-lg font-bold text-neutral-100 font-mono">
            {avgCalories} <span className="text-xs text-neutral-500 font-normal">kcal/dia</span>
          </div>
        </Card>

        <Card className="p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Média Proteína
          </div>
          <div className="text-lg font-bold text-neutral-100 font-mono">
            {avgProtein} <span className="text-xs text-neutral-500 font-normal">g/dia</span>
          </div>
        </Card>

        <Card className="p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
            <Droplet className="w-3.5 h-3.5" /> Média Água
          </div>
          <div className="text-lg font-bold text-neutral-100 font-mono">
            {avgWater} <span className="text-xs text-neutral-500 font-normal">ml/dia</span>
          </div>
        </Card>
      </div>

      {/* 7-Day Calorie Bar Chart */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Tendência de Calorias (Últimos 7 Dias)
            </h4>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">Meta: {targetCalories} kcal</span>
        </div>

        <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
          {recent7.map((log) => {
            const heightPercent = Math.min(100, Math.round((log.dayTotals.calories / maxCalInWeek) * 100));
            const isOverTarget = log.dayTotals.calories > targetCalories;
            const dateLabel = log.date.slice(5); // MM-DD

            return (
              <div key={log.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[9px] font-mono text-neutral-400 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {log.dayTotals.calories}
                </span>
                <div className="w-full max-w-[36px] bg-neutral-950 h-28 rounded-lg flex items-end p-1 border border-neutral-800">
                  <div
                    className={`w-full rounded-md transition-all duration-500 ${
                      isOverTarget ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-neutral-500">{dateLabel}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
