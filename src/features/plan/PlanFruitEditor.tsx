import React from 'react';
import { Apple, Plus, Trash2 } from 'lucide-react';
import { Card } from '../../shared/components/Card';

interface PlanFruitEditorProps {
  fruitEquivalencies: Array<{ fruit: string; portion: string }>;
  onChangeFruitEquivalencies: (items: Array<{ fruit: string; portion: string }>) => void;
  lang?: string;
}

export const PlanFruitEditor: React.FC<PlanFruitEditorProps> = ({
  fruitEquivalencies,
  onChangeFruitEquivalencies,
  lang = 'pt',
}) => {

  const handleAdd = () => {
    onChangeFruitEquivalencies([
      ...fruitEquivalencies,
      { fruit: '', portion: '' },
    ]);
  };

  const handleUpdate = (index: number, field: 'fruit' | 'portion', val: string) => {
    const updated = [...fruitEquivalencies];
    updated[index] = { ...updated[index], [field]: val };
    onChangeFruitEquivalencies(updated);
  };

  const handleRemove = (index: number) => {
    onChangeFruitEquivalencies(fruitEquivalencies.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Apple className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-neutral-100">
              {lang === 'en' ? 'Fruit Equivalencies List' : 'Lista de Equivalências de Fruta'}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Add Fruit' : 'Adicionar Fruta'}</span>
          </button>
        </div>

        <p className="text-xs text-neutral-400">
          {lang === 'en'
            ? 'Each entry represents the equivalent of 1 piece of fruit prescribed by your nutritionist.'
            : 'Cada entrada representa a porção equivalente a 1 peça de fruta prescrita pela nutricionista.'}
        </p>

        <div className="space-y-2 pt-1">
          {fruitEquivalencies.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80"
            >
              <div className="w-full sm:w-1/3">
                <input
                  type="text"
                  value={item.fruit}
                  onChange={(e) => handleUpdate(idx, 'fruit', e.target.value)}
                  placeholder={lang === 'en' ? 'Fruit name (e.g. Banana 80g)' : 'Fruta (ex: Banana (80g))'}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={item.portion}
                  onChange={(e) => handleUpdate(idx, 'portion', e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Portion size (e.g. 1 small unit or 1/2 Ecuador banana)'
                      : 'Porção (ex: 1 unidade pequena ou 1/2 banana equador)'
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                  title={lang === 'en' ? 'Delete' : 'Eliminar'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {fruitEquivalencies.length === 0 && (
            <p className="text-xs text-neutral-500 italic py-2 text-center">
              {lang === 'en' ? 'No fruit equivalencies configured.' : 'Nenhuma equivalência de fruta configurada.'}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
