import { DailyTargets } from './nutrition';

export type GeminiModelId =
  | 'gemini-3.8-flash'
  | 'gemini-3.5-flash-lite'
  | 'gemini-3.1-flash-lite'
  | 'gemini-2.5-flash'
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'gemma-4-26b-a4b-it'
  | 'gemini-1.5-flash';

export interface ModelOption {
  id: GeminiModelId;
  name: string;
  badge: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    badge: '500 RPD • Recomendado',
    description: 'Ultra rápido com raciocínio nativo e cota generosa de 500 req/dia.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    badge: '500 RPD • Eficiente',
    description: 'Alta eficiência e rendimento com cota de 500 req/dia.',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Top Frontier • 20 RPD Free',
    description: 'Raciocínio avançado (Thinking). Cota de 20 req/dia no plano gratuito.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Fast & Smart • 20 RPD Free',
    description: 'Raciocínio multimodal com cota de 20 req/dia no plano gratuito.',
  },
  {
    id: 'gemma-4-26b-a4b-it',
    name: 'Gemma 4 26B',
    badge: 'Reserva • 14.400 RPD',
    description: 'Modelo aberto MoE de alta capacidade com 14.400 requisições diárias.',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    badge: 'Standard Tier',
    description: 'Alta precisão multimodal para chaves Standard com faturação.',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    badge: 'Standard Tier',
    description: 'Consumo rápido de tokens e baixa latência em Standard.',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    badge: 'Legado Estável',
    description: 'Modelo de fallback comprovado para processamento multimodal.',
  },
];

export type AppLanguage = 'pt' | 'pt-br' | 'en' | 'es' | string;

export interface UserSettings {
  geminiApiKey: string;
  activeModel: GeminiModelId;
  autoFallbackOnRateLimit: boolean;
  language: AppLanguage;
  targets: DailyTargets;
  remoteDbUrl: string;
  remoteDbApiKey: string;
}

export const DEFAULT_TARGETS: DailyTargets = {
  calories: 2000,
  protein: 150,
  carbs: 180,
  fat: 55,
  waterMl: 2000,
  maxSoda: 1,
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  geminiApiKey: '',
  activeModel: 'gemini-3.5-flash-lite',
  autoFallbackOnRateLimit: true,
  language: 'pt',
  targets: DEFAULT_TARGETS,
  remoteDbUrl: 'https://db.dunhas.com/api',
  remoteDbApiKey: '',
};
