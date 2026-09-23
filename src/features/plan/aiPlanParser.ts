import { geminiService } from '../../shared/services/geminiService';
import { NutritionPlan, MealType } from '../../shared/types/nutrition';
import { generatePlanMarkdown } from './planParser';

export async function parsePlanWithAI(
  rawText: string,
  basePlan?: NutritionPlan
): Promise<NutritionPlan> {
  const systemInstruction = `Você é um nutricionista especialista e assistente de IA.
Sua tarefa é analisar anotações de consultas nutricionais, prescrições ou planos alimentares e convertê-los em uma estrutura JSON estrita e padronizada.
Responda EXCLUSIVAMENTE com o objeto JSON válido, sem cercaduras de código markdown e sem texto adicional.`;

  const prompt = `Analise o texto nutricional a seguir e estruture-o estritamente no seguinte formato JSON:
{
  "title": string,
  "date": "YYYY-MM-DD",
  "meals": [
    {
      "mealType": "pequeno_almoco" | "almoco" | "lanche" | "jantar" | "ceia" | "snack",
      "label": string,
      "recommendedTime": "HH:MM",
      "options": [
        {
          "optionNumber": number,
          "title"?: string,
          "items": string[]
        }
      ],
      "rulesNotes"?: string[]
    }
  ],
  "commitments": string[],
  "rules": string[],
  "fruitEquivalencies": [
    { "fruit": string, "portion": string }
  ]
}

TEXTO NUTRICIONAL:
"""
${rawText}
"""`;

  const response = await geminiService.generateContent(prompt, undefined, undefined, systemInstruction);
  let cleaned = response.data.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/, '').trim();
  }

  const parsed = JSON.parse(cleaned);

  const validMealTypes: MealType[] = ['pequeno_almoco', 'almoco', 'lanche', 'jantar', 'ceia', 'snack'];

  const normalizedMeals = Array.isArray(parsed.meals)
    ? parsed.meals.map((m: any, idx: number) => ({
        mealType: validMealTypes.includes(m.mealType) ? m.mealType : ('snack' as MealType),
        label: m.label || `Refeição ${idx + 1}`,
        recommendedTime: m.recommendedTime || '12:00',
        options: Array.isArray(m.options)
          ? m.options.map((opt: any, oIdx: number) => ({
              optionNumber: opt.optionNumber || oIdx + 1,
              title: opt.title || undefined,
              items: Array.isArray(opt.items) ? opt.items : [],
            }))
          : [],
        rulesNotes: Array.isArray(m.rulesNotes) ? m.rulesNotes : undefined,
      }))
    : basePlan?.meals || [];

  const newPlan: NutritionPlan = {
    id: basePlan?.id || 'current_plan',
    title: parsed.title || basePlan?.title || 'Plano Alimentar Willian Backhaus',
    date: parsed.date || basePlan?.date || new Date().toISOString().split('T')[0],
    markdownContent: '',
    meals: normalizedMeals,
    commitments: Array.isArray(parsed.commitments) ? parsed.commitments : basePlan?.commitments || [],
    rules: Array.isArray(parsed.rules) ? parsed.rules : basePlan?.rules || [],
    fruitEquivalencies: Array.isArray(parsed.fruitEquivalencies)
      ? parsed.fruitEquivalencies
      : basePlan?.fruitEquivalencies || [],
    updatedAt: new Date().toISOString(),
  };

  newPlan.markdownContent = generatePlanMarkdown(newPlan);
  return newPlan;
}
