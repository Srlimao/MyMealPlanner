export interface LanguageInfo {
  code: string;
  name: string;
  englishName: string;
  flag: string;
  promptInstruction: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'pt',
    name: 'Português (PT)',
    englishName: 'Portuguese (Portugal)',
    flag: '🇵🇹',
    promptInstruction: 'Português de Portugal (PT-PT)',
  },
  {
    code: 'pt-br',
    name: 'Português (BR)',
    englishName: 'Portuguese (Brazil)',
    flag: '🇧🇷',
    promptInstruction: 'Português do Brasil (PT-BR)',
  },
  {
    code: 'en',
    name: 'English',
    englishName: 'English',
    flag: '🇬🇧',
    promptInstruction: 'English',
  },
  {
    code: 'es',
    name: 'Español',
    englishName: 'Spanish',
    flag: '🇪🇸',
    promptInstruction: 'Español',
  },
];

export const DEFAULT_LANGUAGE = 'pt';

export function getLanguageInfo(code: string): LanguageInfo {
  return (
    SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ||
    SUPPORTED_LANGUAGES[0]
  );
}

export function isLanguageSupported(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}
