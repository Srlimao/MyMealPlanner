import React, { useState } from 'react';
import { Apple, Search } from 'lucide-react';
import { NutritionPlan } from '../../shared/types/nutrition';
import { Card } from '../../shared/components/Card';
import { getTranslation } from '../../shared/i18n';

interface EquivalenciesTableProps {
  plan: NutritionPlan;
  lang?: string;
}

export const EquivalenciesTable: React.FC<EquivalenciesTableProps> = ({ plan, lang = 'pt' }) => {
  const t = getTranslation(lang);
  const [search, setSearch] = useState('');

  const filtered = plan.fruitEquivalencies.filter(
    (f) =>
      f.fruit.toLowerCase().includes(search.toLowerCase()) ||
      f.portion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Apple className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-100">{t.plan.fruitEquivalencies}</h4>
            <p className="text-[11px] text-neutral-400">{t.plan.fruitEquivalenciesSubtitle}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.plan.filterFruit}
            className="w-full sm:w-44 bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/80 flex items-center justify-between gap-2 text-xs"
          >
            <span className="font-semibold text-neutral-200">{item.fruit}</span>
            <span className="text-emerald-400 font-mono text-[11px]">{item.portion}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
