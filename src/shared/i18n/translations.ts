import { MealType } from '../types/nutrition';
import { getTranslation, getMealNames, TranslationSchema } from './index';

export const TRANSLATIONS: Record<string, TranslationSchema> = new Proxy(
  {} as Record<string, TranslationSchema>,
  {
    get: (_target, prop: string) => {
      return getTranslation(prop);
    },
  }
);

export const MEAL_NAMES: Record<string, Record<MealType, string>> = new Proxy(
  {} as Record<string, Record<MealType, string>>,
  {
    get: (_target, prop: string) => {
      return getMealNames(prop);
    },
  }
);

export type { TranslationSchema };
