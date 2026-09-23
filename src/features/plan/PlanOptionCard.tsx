import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { NutritionPlanMealOption } from '../../shared/types/nutrition';

interface PlanOptionCardProps {
  option: NutritionPlanMealOption;
  totalOptions: number;
  onUpdateTitle: (title: string) => void;
  onRemoveOption: () => void;
  onAddItem: () => void;
  onUpdateItem: (itemIndex: number, text: string) => void;
  onRemoveItem: (itemIndex: number) => void;
  lang?: string;
}

export const PlanOptionCard: React.FC<PlanOptionCardProps> = ({
  option,
  totalOptions,
  onUpdateTitle,
  onRemoveOption,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  lang = 'pt',
}) => {
  return (
    <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[11px] font-bold text-neutral-300 font-mono shrink-0">
            #{option.optionNumber}
          </span>
          <input
            type="text"
            value={option.title || ''}
            onChange={(e) => onUpdateTitle(e.target.value)}
            placeholder={
              lang === 'en'
                ? 'Subtitle / description (optional)'
                : 'Subtítulo / descrição (ex: juntar numa tigela)'
            }
            className="flex-1 bg-neutral-900/50 border border-neutral-800/60 rounded-lg px-2 py-0.5 text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
        {totalOptions > 1 && (
          <button
            type="button"
            onClick={onRemoveOption}
            className="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer"
            title={lang === 'en' ? 'Remove option' : 'Remover opção'}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Food Items */}
      <div className="space-y-1.5 pl-2 border-l border-neutral-800">
        {option.items.map((item, itemIdx) => (
          <div key={itemIdx} className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-xs">•</span>
            <input
              type="text"
              value={item}
              onChange={(e) => onUpdateItem(itemIdx, e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Food and portion (e.g., 1 banana, 4 tbsp Greek yogurt)'
                  : 'Alimento e porção (ex: 1 banana, 4 colheres sopa iogurte)'
              }
              className="flex-1 bg-neutral-900 border border-neutral-800/80 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => onRemoveItem(itemIdx)}
              className="p-1 text-neutral-600 hover:text-rose-400 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddItem}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>{lang === 'en' ? 'Add food item' : 'Adicionar alimento'}</span>
        </button>
      </div>
    </div>
  );
};
