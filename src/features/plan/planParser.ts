import {
  NutritionPlan,
  NutritionPlanMeal,
  NutritionPlanMealOption,
  MealType,
} from '../../shared/types/nutrition';
import { generatePlanMarkdown } from './planGenerator';

export { generatePlanMarkdown };

function normalizeTime(raw: string): string {
  const match = raw.match(/(\d{1,2})[hH:]?(\d{2})?/);
  if (!match) return '12:00';
  const hours = match[1].padStart(2, '0');
  const minutes = match[2] || '00';
  return `${hours}:${minutes}`;
}

function detectMealType(label: string): MealType {
  const l = label.toLowerCase();
  if (l.includes('pequeno') || l.includes('breakfast')) return 'pequeno_almoco';
  if (l.includes('almoço') || l.includes('almoco') || l.includes('lunch')) return 'almoco';
  if (l.includes('lanche') || l.includes('pré-treino') || l.includes('pre treino')) return 'lanche';
  if (l.includes('jantar') || l.includes('dinner')) return 'jantar';
  if (l.includes('ceia') || l.includes('supper')) return 'ceia';
  return 'snack';
}

function parseMealHeading(line: string): { label: string; time: string; mealType: MealType } | null {
  if (!line.startsWith('##')) return null;

  const clean = line.replace(/^##\s*/, '').trim();

  if (
    /^PLANO\s+ALIMENTAR/i.test(clean) ||
    /^COMPROMISSOS/i.test(clean) ||
    /^LISTA\s+DE\s+EQUIVAL/i.test(clean) ||
    /^EQUIVAL[ÊE]NCIAS/i.test(clean) ||
    /^REGRAS/i.test(clean) ||
    /^OP[ÇC][ÃA]O/i.test(clean)
  ) {
    return null;
  }

  const timeMatch = clean.match(/\((\d{1,2}[hH:]\d{0,2})\)/);
  const time = timeMatch ? normalizeTime(timeMatch[1]) : '';

  const l = clean.toLowerCase();
  const hasMealKeyword =
    l.includes('pequeno almoço') ||
    l.includes('pequeno-almoço') ||
    l.includes('pequeno almoco') ||
    l.includes('almoço') ||
    l.includes('almoco') ||
    l.includes('lanche') ||
    l.includes('jantar') ||
    l.includes('ceia') ||
    l.includes('breakfast') ||
    l.includes('lunch') ||
    l.includes('dinner') ||
    l.includes('snack');

  if (!hasMealKeyword && !timeMatch) {
    return null;
  }

  let label = clean.replace(/\(\d{1,2}[hH:]\d{0,2}\)/, '').replace(/:$/, '').trim();
  label = label.replace(/\s+/g, ' ');

  const mealType = detectMealType(clean);
  const defaultTimes: Record<MealType, string> = {
    pequeno_almoco: '09:30',
    almoco: '13:00',
    lanche: '17:00',
    jantar: '20:30',
    ceia: '22:30',
    snack: '16:00',
  };
  const finalTime = time || defaultTimes[mealType] || '12:00';

  return { label, time: finalTime, mealType };
}

export function parsePlanMarkdown(
  markdown: string,
  basePlan?: NutritionPlan
): NutritionPlan {
  const lines = markdown.split('\n');

  let title = basePlan?.title || 'Plano Alimentar Willian Backhaus';
  let date = basePlan?.date || new Date().toISOString().split('T')[0];
  const meals: NutritionPlanMeal[] = [];
  const commitments: string[] = [];
  const rules: string[] = basePlan?.rules ? [...basePlan.rules] : [];
  const fruitEquivalencies: Array<{ fruit: string; portion: string }> = [];

  let currentSection: 'header' | 'meal' | 'commitments' | 'fruits' | 'rules' = 'header';
  let currentMeal: NutritionPlanMeal | null = null;
  let currentOption: NutritionPlanMealOption | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    if (/^##\s+PLANO\s+ALIMENTAR/i.test(line)) {
      currentSection = 'header';
      title = line.replace(/^##\s+/i, '').trim();
      continue;
    }

    if (/^##\s+COMPROMISSOS/i.test(line)) {
      if (currentMeal) {
        if (currentOption && currentOption.items.length > 0) currentMeal.options.push(currentOption);
        meals.push(currentMeal);
        currentMeal = null;
        currentOption = null;
      }
      currentSection = 'commitments';
      continue;
    }

    if (/^##\s+LISTA\s+DE\s+EQUIVAL[ÊE]NCIAS/i.test(line) || /^##\s+EQUIVAL[ÊE]NCIAS/i.test(line)) {
      if (currentMeal) {
        if (currentOption && currentOption.items.length > 0) currentMeal.options.push(currentOption);
        meals.push(currentMeal);
        currentMeal = null;
        currentOption = null;
      }
      currentSection = 'fruits';
      continue;
    }

    if (/^##\s+REGRAS/i.test(line)) {
      if (currentMeal) {
        if (currentOption && currentOption.items.length > 0) currentMeal.options.push(currentOption);
        meals.push(currentMeal);
        currentMeal = null;
        currentOption = null;
      }
      currentSection = 'rules';
      continue;
    }

    if (currentSection === 'header') {
      const dateMatch = line.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
      if (dateMatch) {
        date = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
        continue;
      }
    }

    const mealInfo = parseMealHeading(line);
    if (mealInfo) {
      if (currentMeal) {
        if (currentOption && currentOption.items.length > 0) currentMeal.options.push(currentOption);
        meals.push(currentMeal);
        currentMeal = null;
        currentOption = null;
      }

      currentSection = 'meal';
      currentMeal = {
        mealType: mealInfo.mealType,
        label: mealInfo.label,
        recommendedTime: mealInfo.time,
        options: [],
        rulesNotes: [],
      };
      continue;
    }

    if (currentSection === 'commitments') {
      if (line.startsWith('-') || line.startsWith('*')) {
        commitments.push(line.replace(/^[-*]\s*/, '').trim());
      }
      continue;
    }

    if (currentSection === 'fruits') {
      if (line.startsWith('-') || line.startsWith('*')) {
        const fruitText = line.replace(/^[-*]\s*/, '').trim();
        const colonIndex = fruitText.indexOf(':');
        if (colonIndex !== -1) {
          fruitEquivalencies.push({
            fruit: fruitText.substring(0, colonIndex).trim(),
            portion: fruitText.substring(colonIndex + 1).trim(),
          });
        } else {
          fruitEquivalencies.push({
            fruit: fruitText,
            portion: '',
          });
        }
      }
      continue;
    }

    if (currentSection === 'rules') {
      if (line.startsWith('-') || line.startsWith('*')) {
        rules.push(line.replace(/^[-*]\s*/, '').trim());
      }
      continue;
    }

    if (currentSection === 'meal' && currentMeal) {
      const optMatch = line.match(/^(?:##\s*)?OP[ÇC][ÃA]O\s*(\d+)[\):.]?\s*(.*)$/i);
      if (optMatch) {
        if (currentOption && currentOption.items.length > 0) {
          currentMeal.options.push(currentOption);
        }
        const optNum = parseInt(optMatch[1], 10);
        const optTitle = optMatch[2]?.trim().replace(/^\(|\)$/g, '').trim();

        currentOption = {
          optionNumber: optNum,
          title: optTitle || undefined,
          items: [],
        };

        if (optMatch[2] && !optMatch[2].startsWith('(')) {
          const directItem = optMatch[2].trim();
          if (directItem) {
            currentOption.items.push(directItem);
          }
        }
        continue;
      }

      if (line.startsWith('-') || line.startsWith('*')) {
        const itemText = line.replace(/^[-*]\s*/, '').trim();
        if (!currentOption) {
          currentOption = {
            optionNumber: currentMeal.options.length + 1,
            items: [],
          };
        }
        currentOption.items.push(itemText);
        continue;
      }

      const noteClean = line.replace(/^##\s*/, '').trim();
      if (!currentMeal.rulesNotes) currentMeal.rulesNotes = [];
      currentMeal.rulesNotes.push(noteClean);
    }
  }

  if (currentMeal) {
    if (currentOption && currentOption.items.length > 0) {
      currentMeal.options.push(currentOption);
    }
    meals.push(currentMeal);
  }

  return {
    id: basePlan?.id || 'current_plan',
    title,
    date,
    markdownContent: markdown,
    meals: meals.length > 0 ? meals : (basePlan?.meals || []),
    commitments: commitments.length > 0 ? commitments : (basePlan?.commitments || []),
    rules: rules.length > 0 ? rules : (basePlan?.rules || []),
    fruitEquivalencies:
      fruitEquivalencies.length > 0 ? fruitEquivalencies : (basePlan?.fruitEquivalencies || []),
    updatedAt: new Date().toISOString(),
  };
}
