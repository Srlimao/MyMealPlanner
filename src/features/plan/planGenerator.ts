import { NutritionPlan } from '../../shared/types/nutrition';

export function generatePlanMarkdown(plan: NutritionPlan): string {
  const parts: string[] = [];

  // Header
  parts.push(`## ${plan.title.toUpperCase()}`);
  parts.push('');
  if (plan.date) {
    const dateParts = plan.date.split('-');
    const formattedDate =
      dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : plan.date;
    parts.push(formattedDate);
    parts.push('');
  }

  // Meals
  for (const meal of plan.meals) {
    const timeFormatted = meal.recommendedTime.replace(':', 'H').replace(/H00$/, 'H');
    parts.push(`## ${meal.label.toUpperCase()} (${timeFormatted})`);
    parts.push('');

    // Pre-option notes/rules if any
    if (meal.rulesNotes && meal.rulesNotes.length > 0) {
      for (const note of meal.rulesNotes) {
        if (!note.startsWith('Pós') && !note.startsWith('Pos')) {
          parts.push(note.startsWith('##') ? note : `## ${note}`);
        }
      }
    }

    // Meal Options
    const hasMultipleOptions = meal.options.length > 1;
    for (const opt of meal.options) {
      if (hasMultipleOptions || opt.title) {
        const titleSuffix = opt.title ? ` (${opt.title})` : '';
        parts.push(`## OPÇÃO ${opt.optionNumber})${titleSuffix}`);
      }

      for (const item of opt.items) {
        parts.push(`- ${item}`);
      }
      parts.push('');
    }

    // Post-option notes (e.g., Pós Treino: Caseína)
    if (meal.rulesNotes && meal.rulesNotes.length > 0) {
      for (const note of meal.rulesNotes) {
        if (note.startsWith('Pós') || note.startsWith('Pos')) {
          parts.push(note.replace(/^##\s*/, ''));
          parts.push('');
        }
      }
    }
  }

  // Commitments
  if (plan.commitments && plan.commitments.length > 0) {
    parts.push('## COMPROMISSOS ATÉ À PRÓXIMA CONSULTA:');
    for (const c of plan.commitments) {
      parts.push(`- ${c}`);
    }
    parts.push('');
  }

  // General Rules
  if (plan.rules && plan.rules.length > 0) {
    parts.push('## REGRAS GERAIS:');
    for (const r of plan.rules) {
      parts.push(`- ${r}`);
    }
    parts.push('');
  }

  // Fruit Equivalencies
  if (plan.fruitEquivalencies && plan.fruitEquivalencies.length > 0) {
    parts.push('## LISTA DE EQUIVALÊNCIAS DE FRUTA:');
    for (const fe of plan.fruitEquivalencies) {
      if (fe.portion) {
        parts.push(`- ${fe.fruit}: ${fe.portion}`);
      } else {
        parts.push(`- ${fe.fruit}`);
      }
    }
    parts.push('');
  }

  return parts.join('\n');
}
