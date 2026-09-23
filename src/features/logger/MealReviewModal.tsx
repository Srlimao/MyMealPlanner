import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Scale } from 'lucide-react';
import { MealEntry, FoodItem, MealType } from '../../shared/types/nutrition';
import { AppLanguage } from '../../shared/types/settings';
import { getTranslation, getMealNames } from '../../shared/i18n';

interface MealReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMeal: Partial<MealEntry>;
  onConfirm: (meal: MealEntry) => void;
  lang: AppLanguage;
}

export const MealReviewModal: React.FC<MealReviewModalProps> = ({
  isOpen,
  onClose,
  initialMeal,
  onConfirm,
  lang,
}) => {
  const t = getTranslation(lang);
  const mealNames = getMealNames(lang);

  const [mealType, setMealType] = useState<MealType>(initialMeal.mealType || 'almoco');
  const [mealName, setMealName] = useState<string>(initialMeal.name || 'Refeição');
  const [items, setItems] = useState<FoodItem[]>(
    initialMeal.items?.map((it) => ({ ...it, id: it.id || `it_${Math.random()}` })) || []
  );
  const [adheresToPlateRule, setAdheresToPlateRule] = useState<boolean>(
    initialMeal.adheresToPlateRule ?? true
  );

  if (!isOpen) return null;

  const totalCalories = items.reduce((sum, it) => sum + (Number(it.calories) || 0), 0);
  const totalProtein = items.reduce((sum, it) => sum + (Number(it.protein) || 0), 0);
  const totalCarbs = items.reduce((sum, it) => sum + (Number(it.carbs) || 0), 0);
  const totalFat = items.reduce((sum, it) => sum + (Number(it.fat) || 0), 0);

  const handleUpdateItem = (index: number, field: keyof FoodItem, val: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it_${Date.now()}`,
        name: t.logger.newItem,
        portion: '100g',
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 2,
      },
    ]);
  };

  const handleSave = () => {
    const finalMeal: MealEntry = {
      id: initialMeal.id || `meal_${Date.now()}`,
      mealType,
      name: mealName.trim() || 'Refeição',
      loggedAt: initialMeal.loggedAt || new Date().toISOString(),
      items,
      totals: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
      },
      adheresToPlateRule,
      notes: initialMeal.notes,
    };
    onConfirm(finalMeal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 shrink-0 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-neutral-100">{t.logger.reviewNutrientsTitle}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Meal Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase">{t.logger.mealNameLabel}</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-100 mt-1 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 uppercase">{t.logger.mealTypeLabel}</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 mt-1 focus:border-emerald-500 focus:outline-none"
              >
                {Object.entries(mealNames).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items breakdown list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">{t.logger.identifiedFoods}</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {t.logger.addItem}
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 flex flex-wrap sm:flex-nowrap items-center gap-2"
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                    className="flex-1 min-w-[120px] bg-transparent border-0 text-xs font-medium text-neutral-200 focus:outline-none"
                    placeholder={t.logger.foodNamePlaceholder}
                  />
                  <input
                    type="text"
                    value={item.portion}
                    onChange={(e) => handleUpdateItem(idx, 'portion', e.target.value)}
                    className="w-16 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-1 text-[11px] text-neutral-300 text-center"
                    placeholder={t.logger.portionPlaceholder}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-neutral-500">kcal:</span>
                    <input
                      type="number"
                      value={item.calories}
                      onChange={(e) => handleUpdateItem(idx, 'calories', Number(e.target.value))}
                      className="w-14 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-1 text-[11px] text-emerald-400 font-mono text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Plate Balance Adherence */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={adheresToPlateRule}
              onChange={(e) => setAdheresToPlateRule(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
            <div className="text-[11px] leading-tight">
              <span className="font-semibold text-neutral-200 block">
                {t.logger.plateRuleCheck}
              </span>
              <span className="text-neutral-500 text-[10px]">
                {t.logger.plateRuleHint}
              </span>
            </div>
          </label>

          {/* Aggregated Totals Banner */}
          <div className="grid grid-cols-4 gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-center">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase">{t.macros.calories}</span>
              <span className="block text-sm font-bold text-emerald-400 font-mono">
                {Math.round(totalCalories)} <span className="text-[9px] font-normal">kcal</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase">{t.macros.protein}</span>
              <span className="block text-sm font-bold text-neutral-200 font-mono">
                {Math.round(totalProtein)}g
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase">{t.macros.carbs}</span>
              <span className="block text-sm font-bold text-neutral-200 font-mono">
                {Math.round(totalCarbs)}g
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase">{t.macros.fat}</span>
              <span className="block text-sm font-bold text-neutral-200 font-mono">
                {Math.round(totalFat)}g
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-800 bg-neutral-950/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t.logger.confirmAndSave}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
