import pt from './locales/pt.json';
import ptBr from './locales/pt-br.json';
import en from './locales/en.json';
import es from './locales/es.json';
import { MealType } from '../types/nutrition';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, LanguageInfo, getLanguageInfo } from './languages';

export type TranslationSchema = typeof pt;

const RAW_TRANSLATIONS: Record<string, unknown> = {
  pt,
  'pt-br': ptBr,
  en,
  es,
};

function deepFallback<T>(target: unknown, base: T): T {
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return (target ?? base) as T;
  }
  const result = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(target as Record<string, unknown>)) {
    const targetVal = (target as Record<string, unknown>)[key];
    const baseVal = (base as Record<string, unknown>)[key];
    if (baseVal && typeof baseVal === 'object' && !Array.isArray(baseVal)) {
      result[key] = deepFallback(targetVal, baseVal);
    } else {
      result[key] = targetVal ?? baseVal;
    }
  }
  return result as T;
}

const resolvedCache = new Map<string, TranslationSchema>();

export function getTranslation(lang: string = DEFAULT_LANGUAGE): TranslationSchema {
  const normalized = lang.toLowerCase();
  if (resolvedCache.has(normalized)) {
    return resolvedCache.get(normalized)!;
  }

  const raw = RAW_TRANSLATIONS[normalized] || RAW_TRANSLATIONS[DEFAULT_LANGUAGE];
  const merged = deepFallback<TranslationSchema>(raw, pt);
  resolvedCache.set(normalized, merged);
  return merged;
}

export function getMealNames(lang: string = DEFAULT_LANGUAGE): Record<MealType, string> {
  const t = getTranslation(lang);
  return t.meals as Record<MealType, string>;
}

export function getMealName(type: MealType, lang: string = DEFAULT_LANGUAGE): string {
  const names = getMealNames(lang);
  return names[type] || type;
}

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageInfo };
export type { LanguageInfo };
