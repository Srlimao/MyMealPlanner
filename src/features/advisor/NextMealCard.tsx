import React, { useState } from 'react';
import { Sparkles, Utensils, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { DailyLog, NutritionPlan, MealType } from '../../shared/types/nutrition';
import { UserSettings } from '../../shared/types/settings';
import { TRANSLATIONS } from '../../shared/i18n/translations';
import {
  determineCurrentMealType,
  buildAdvisorSystemPrompt,
  buildNextMealSuggestionPrompt,
} from './advisorPrompt';
import { geminiService } from '../../shared/services/geminiService';

interface NextMealCardProps {
  todayLog: DailyLog | null;
  nutritionPlan: NutritionPlan;
  settings: UserSettings;
  onQuickLogSuggestion: (suggestionText: string, mealType: MealType) => void;
}

export const NextMealCard: React.FC<NextMealCardProps> = ({
  todayLog,
  nutritionPlan,
  settings,
  onQuickLogSuggestion,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [modelUsedBadge, setModelUsedBadge] = useState<string | null>(null);

  const t = TRANSLATIONS[settings.language];
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const currentMealInfo = determineCurrentMealType(currentHour);

  const handleAskSuggestion = async () => {
    setLoading(true);
    setSuggestion(null);

    try {
      const prompt = buildNextMealSuggestionPrompt(
        currentMealInfo.type,
        todayLog,
        nutritionPlan
      );
      const systemPrompt = buildAdvisorSystemPrompt(nutritionPlan, settings.language);

      const response = await geminiService.generateContent(
        prompt,
        undefined,
        settings.activeModel,
        systemPrompt
      );

      setSuggestion(response.data);
      setModelUsedBadge(response.modelUsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao obter sugestão';
      setSuggestion(`⚠️ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-emerald-950/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">
              {settings.language === 'pt' ? 'Próxima Refeição Sugerida' : 'Next Suggested Meal'}
            </span>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              {settings.language === 'pt' ? currentMealInfo.labelPt : currentMealInfo.labelEn}
              <span className="text-xs font-normal text-neutral-500 font-mono">
                ({now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={handleAskSuggestion}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>A pensar...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.whatToEatNow}</span>
            </>
          )}
        </button>
      </div>

      {/* Suggestion Content Output */}
      {suggestion && (
        <div className="mt-3.5 space-y-3 animate-fade-in">
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed whitespace-pre-line font-sans">
            {suggestion}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {modelUsedBadge && (
              <span className="text-[10px] text-neutral-500 font-mono">
                Gerado por: {modelUsedBadge}
              </span>
            )}
            <button
              onClick={() => onQuickLogSuggestion(suggestion, currentMealInfo.type)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-auto"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.logThisMeal}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};
