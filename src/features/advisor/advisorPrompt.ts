import { DailyLog, NutritionPlan, MealType } from '../../shared/types/nutrition';
import { AppLanguage } from '../../shared/types/settings';

export function determineCurrentMealType(hour: number): {
  type: MealType;
  labelPt: string;
  labelEn: string;
} {
  if (hour >= 6 && hour < 11.5) {
    return { type: 'pequeno_almoco', labelPt: 'Pequeno Almoço', labelEn: 'Breakfast' };
  } else if (hour >= 11.5 && hour < 15) {
    return { type: 'almoco', labelPt: 'Almoço', labelEn: 'Lunch' };
  } else if (hour >= 15 && hour < 18.5) {
    return { type: 'lanche', labelPt: 'Lanche', labelEn: 'Afternoon Snack' };
  } else if (hour >= 18.5 && hour < 22) {
    return { type: 'jantar', labelPt: 'Jantar', labelEn: 'Dinner' };
  } else {
    return { type: 'ceia', labelPt: 'Ceia SOS', labelEn: 'Late Snack SOS' };
  }
}

export function buildAdvisorSystemPrompt(
  plan: NutritionPlan,
  lang: AppLanguage
): string {
  return `Você é o Eating Helper AI, um assistente nutricional pessoal dedicado a ajudar o Willian a seguir rigorosamente o seu Plano Alimentar prescrito pela nutricionista Nélia Filipe.

Abaixo está o Plano Alimentar oficial e regras:
${plan.markdownContent}

COMPROMISSOS ATIVOS:
${plan.commitments.map((c) => `- ${c}`).join('\n')}

REGRAS ESSENCIAIS:
- Se o Willian já comeu pão ao pequeno almoço, no lanche NÃO deve escolher a Opção 3 de pão.
- 1/2 do prato deve ser hortícolas/legumes, 1/4 hidratos e 1/4 proteína nas refeições principais.
- 2L de água por dia.
- Máximo 1 lata de refrigerante/cola 0 por dia.
- Use a lista de equivalências de fruta para qualquer substituição de fruta.
- Mantenha respostas curtas, práticas, encorajadoras e diretas ao ponto.
- Responda no idioma: ${lang === 'pt' ? 'Português de Portugal (PT-PT)' : 'Inglês'}.`;
}

export function buildNextMealSuggestionPrompt(
  mealType: MealType,
  todayLog: DailyLog | null,
  plan: NutritionPlan
): string {
  const targetMeal = plan.meals.find((m) => m.mealType === mealType);
  const optionsSummary = targetMeal
    ? targetMeal.options.map((o) => `Opção ${o.optionNumber}: ${o.items.join(', ')}`).join('\n')
    : 'Consulte o plano geral.';
  const loggedMealsSummary = todayLog?.meals.length
    ? todayLog.meals.map((m) => `${m.name} (${m.mealType}) com ${m.totals.calories} kcal`).join(', ')
    : 'Nenhuma refeição registada até ao momento.';

  return `Com base no plano alimentar, recomende a melhor opção para a próxima refeição: "${mealType}".
Opções disponíveis no plano para esta refeição:
${optionsSummary}

Refeições já consumidas hoje pelo Willian: ${loggedMealsSummary}.

Responda em formato conciso:
1. Qual opção exata do plano recomenda e porquê (tendo em conta o que já foi comido).
2. Lista exata dos alimentos e quantidades.
3. Estimativa aproximada de calorias e macros (Proteína, Hidratos, Gorduras).
4. Uma dica prática ou lembrete de água/regra.`;
}
