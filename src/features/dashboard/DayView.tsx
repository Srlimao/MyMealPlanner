import { ChevronLeft, ChevronRight, Plus, UtensilsCrossed, Calendar } from 'lucide-react';
import { DailyLog, NutritionPlan, MealType } from '../../shared/types/nutrition';
import { UserSettings } from '../../shared/types/settings';
import { TRANSLATIONS } from '../../shared/i18n/translations';
import { MacroProgressBars } from './MacroProgressBars';
import { HabitTrackers } from './HabitTrackers';
import { MealCard } from './MealCard';
import { NextMealCard } from '../advisor/NextMealCard';

interface DayViewProps {
  currentDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  dailyLog: DailyLog;
  onUpdateDailyLog: (newLog: DailyLog) => void;
  nutritionPlan: NutritionPlan;
  settings: UserSettings;
  onOpenQuickLog: () => void;
  onQuickLogSuggestion: (suggestionText: string, mealType: MealType) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  onSelectDate,
  dailyLog,
  onUpdateDailyLog,
  nutritionPlan,
  settings,
  onOpenQuickLog,
  onQuickLogSuggestion,
}) => {
  const t = TRANSLATIONS[settings.language];

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleDeleteMeal = (mealId: string) => {
    const updatedMeals = dailyLog.meals.filter((m) => m.id !== mealId);
    const updatedTotals = updatedMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.totals.calories,
        protein: acc.protein + m.totals.protein,
        carbs: acc.carbs + m.totals.carbs,
        fat: acc.fat + m.totals.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    onUpdateDailyLog({
      ...dailyLog,
      meals: updatedMeals,
      dayTotals: updatedTotals,
      updatedAt: new Date().toISOString(),
    });
  };

  const plateAdherence = dailyLog.meals.reduce(
    (acc, m) => {
      if (m.mealType === 'almoco' || m.mealType === 'jantar') {
        acc.totalMainMeals += 1;
        if (m.adheresToPlateRule) acc.adhered += 1;
      }
      return acc;
    },
    { adhered: 0, totalMainMeals: 0 }
  );

  const isToday = new Date().toISOString().split('T')[0] === currentDate;

  return (
    <div className="space-y-4 sm:space-y-5 pb-20">
      {/* Date Navigation & Primary Action */}
      <div className="flex items-center justify-between gap-2 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-2 sm:p-2.5 backdrop-blur-sm">
        <button
          onClick={handlePrevDay}
          className="p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-100 rounded-xl hover:bg-neutral-800 transition-colors"
          title="Dia Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs sm:text-sm font-bold text-neutral-100 font-mono">
            {isToday ? (settings.language === 'pt' ? 'Hoje, ' : 'Today, ') : ''}
            {currentDate}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleNextDay}
            className="p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-100 rounded-xl hover:bg-neutral-800 transition-colors"
            title="Dia Seguinte"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all active:scale-95 ml-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">{t.quickLog}</span>
          </button>
        </div>
      </div>

      {/* AI Next Meal Suggestion Card */}
      {isToday && (
        <NextMealCard
          todayLog={dailyLog}
          nutritionPlan={nutritionPlan}
          settings={settings}
          onQuickLogSuggestion={onQuickLogSuggestion}
        />
      )}

      {/* Macronutrient Progress Bars */}
      <MacroProgressBars totals={dailyLog.dayTotals} targets={settings.targets} />

      {/* Nutritionist Daily Habit Trackers */}
      <HabitTrackers
        habits={dailyLog.habits}
        onUpdateHabits={(newHabits) =>
          onUpdateDailyLog({
            ...dailyLog,
            habits: newHabits,
            updatedAt: new Date().toISOString(),
          })
        }
        plateAdherenceCount={plateAdherence}
      />

      {/* Meals Log Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Refeições Registadas ({dailyLog.meals.length})
          </h3>
        </div>

        {dailyLog.meals.length === 0 ? (
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mx-auto text-neutral-600">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300">{t.noMealsToday}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Tire uma foto ou descreva o que comeu para o Gemini calcular calorias e nutrientes.
              </p>
            </div>
            <button
              onClick={onOpenQuickLog}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Registar Primeira Refeição</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dailyLog.meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onDelete={handleDeleteMeal}
                lang={settings.language}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
