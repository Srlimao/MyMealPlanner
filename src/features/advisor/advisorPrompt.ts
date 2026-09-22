import { DailyLog, NutritionPlan, MealType, DailyTargets } from '../../shared/types/nutrition';
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

export function formatDailyConsumptionContext(
  todayLog: DailyLog | null,
  targets?: DailyTargets
): string {
  if (!todayLog || !todayLog.meals || todayLog.meals.length === 0) {
    const water = todayLog?.habits?.waterMl ?? 0;
    const sodas = todayLog?.habits?.sodaCount ?? 0;
    return `ALIMENTOS E BEBIDAS CONSUMIDOS HOJE PELO WILLIAN:
Nenhuma refeição ou alimento foi registado ainda hoje (início do dia).
- Água consumida: ${water} ml / ${targets?.waterMl ?? 2000} ml
- Refrigerantes/Colas consumidos: ${sodas} / máx ${targets?.maxSoda ?? 1}`;
  }

  const mealsList = todayLog.meals
    .map((meal, index) => {
      const time = meal.loggedAt
        ? new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
      const itemsList =
        meal.items && meal.items.length > 0
          ? meal.items
              .map(
                (it) =>
                  `    • ${it.name} (${it.portion}) - ${it.calories} kcal [P: ${it.protein}g, C: ${it.carbs}g, G: ${it.fat}g]`
              )
              .join('\n')
          : '    • Alimentos detalhados não especificados';

      const plateRuleText =
        meal.adheresToPlateRule !== undefined
          ? ` | Regra do prato (1/2 hortícolas): ${meal.adheresToPlateRule ? 'Respeitada' : 'Não respeitada'}`
          : '';
      const notesText = meal.notes ? `\n    Nota: "${meal.notes}"` : '';

      return `${index + 1}. [${meal.name}] (${meal.mealType}${time ? `, ${time}` : ''}): ${meal.totals.calories} kcal (P: ${meal.totals.protein}g, C: ${meal.totals.carbs}g, G: ${meal.totals.fat}g)${plateRuleText}
  Itens consumidos:
${itemsList}${notesText}`;
    })
    .join('\n\n');

  const totals = todayLog.dayTotals;
  const habits = todayLog.habits;

  return `ALIMENTOS E BEBIDAS CONSUMIDOS HOJE PELO WILLIAN:
${mealsList}

TOTAIS ACUMULADOS HOJE vs METAS:
- Calorias: ${totals.calories} / ${targets?.calories ?? 2000} kcal
- Proteína: ${totals.protein}g / ${targets?.protein ?? 150}g
- Hidratos de Carbono: ${totals.carbs}g / ${targets?.carbs ?? 180}g
- Gordura: ${totals.fat}g / ${targets?.fat ?? 55}g
- Água: ${habits.waterMl} ml / ${targets?.waterMl ?? 2000} ml
- Refrigerantes/Colas: ${habits.sodaCount} / máx ${targets?.maxSoda ?? 1}`;
}

export function buildAdvisorSystemPrompt(
  plan: NutritionPlan,
  lang: AppLanguage
): string {
  return `Você é o Eating Helper AI, o assistente nutricional pessoal dedicado a ajudar o Willian a seguir rigorosamente o Plano Alimentar prescrito pela nutricionista Nélia Filipe.

Abaixo está o Plano Alimentar oficial e regras:
${plan.markdownContent}

COMPROMISSOS ATIVOS:
${plan.commitments.map((c) => `- ${c}`).join('\n')}

REGRAS ESSENCIAIS:
- Se o Willian já comeu pão ao pequeno-almoço, no lanche NÃO deve escolher a Opção de pão (Opção 3).
- 1/2 do prato deve ser hortícolas/legumes (salada/legumes cozidos/sopa de legumes sem batata nem leguminosas), 1/4 hidratos e 1/4 proteína nas refeições principais.
- Meta de 2L de água por dia.
- Máximo 1 lata de refrigerante/cola 0 por dia.
- Substituições de fruta devem seguir rigorosamente a lista de equivalências de fruta.
- Use sempre formatação Markdown elegante e limpa (títulos h3/h4, listas com marcadores, negritos, sem blocos maciços).
- Mantenha respostas curtas, práticas, encorajadoras e diretas ao ponto.
- Responda no idioma: ${lang === 'pt' ? 'Português de Portugal (PT-PT)' : 'Inglês'}.`;
}

export function buildNextMealSuggestionPrompt(
  mealType: MealType,
  todayLog: DailyLog | null,
  plan: NutritionPlan,
  targets?: DailyTargets
): string {
  const targetMeal = plan.meals.find((m) => m.mealType === mealType);
  const optionsSummary = targetMeal
    ? targetMeal.options
        .map(
          (o) =>
            `Opção ${o.optionNumber}${o.title ? ` (${o.title})` : ''}:\n${o.items.map((it) => `  - ${it}`).join('\n')}`
        )
        .join('\n\n')
    : 'Consulte o plano geral.';

  const dailyContext = formatDailyConsumptionContext(todayLog, targets);

  return `Você deve recomendar a próxima refeição para o Willian: "${mealType}".

${dailyContext}

OPÇÕES DO PLANO NUTRICIONAL PARA ESTA REFEIÇÃO ("${mealType}"):
${optionsSummary}

INSTRUÇÕES CRÍTICAS DE DECISÃO:
1. Analise cuidadosamente TUDO o que o Willian já consumiu hoje (veja a lista detalhada acima).
2. REGRA DO PÃO: Se o Willian já consumiu pão ao pequeno-almoço hoje, no lanche da tarde NÃO pode escolher a opção de pão (Opção 3).
3. REGRA DO PRATO: Para Almoço ou Jantar, reforce a proporção de 1/2 legumes/hortícolas, 1/4 proteína magra e 1/4 hidratos complexos.
4. BALANÇO DE MACROS: Tenha em conta as calorias e proteínas que ainda faltam atingir para a meta diária.
5. HIDRATAÇÃO E REFRIGERANTES: Se a água estiver abaixo do ritmo esperado ou se já atingiu o limite de 1 refrigerante, faça o alerta apropriado.

FORMATO DE RESPOSTA OBRIGATÓRIO (em Markdown limpo, sem texto corrido indistinto):
### 🎯 Opção Recomendada: [Nome da Opção e Número]
Uma breve explicação (1-2 frases) justificando por que esta é a melhor opção tendo em conta o que já foi comido hoje.

#### 🍽️ Alimentos & Porções
- Lista com os alimentos e quantidades exatas prescritos no plano.

#### 📊 Estimativa Nutricional
- **Calorias**: ~X kcal | **Proteína**: ~Yg | **Hidratos**: ~Zg | **Gorduras**: ~Wg

#### 💡 Dica Prática
Uma dica direta (lembrete de água, equivalência de fruta aplicável se houver fruta, ou regra do prato).`;
}
