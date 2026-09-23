import { DailyTargets } from './nutrition';

export type GeminiModelId =
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
    badge: 'Ultra Fast',
    description: 'Next-gen high-efficiency, lowest latency multimodal model.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    badge: 'Efficient',
    description: 'High-throughput, cost-effective multimodal model.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Fast & Smart',
    description: 'Flagship multimodal model with deep reasoning.',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    badge: 'Reliable',
    description: 'High throughput, high accuracy multimodal analysis.',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    badge: 'Lightweight',
    description: 'Fast token consumption and low latency.',
  },
  {
    id: 'gemma-4-26b-a4b-it',
    name: 'Gemma 4 26B',
    badge: 'Open MoE',
    description: 'DeepMind open-weights multimodal Mixture-of-Experts model.',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    badge: 'Stable Legacy',
    description: 'Proven fallback model for image & text processing.',
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
  activeModel: 'gemini-2.5-flash',
  autoFallbackOnRateLimit: true,
  language: 'pt',
  targets: DEFAULT_TARGETS,
  remoteDbUrl: 'https://db.dunhas.com/api',
  remoteDbApiKey: '1b4a19fdc1eda3f481543b0f25b01ab428e0f6467ad7c9c1',
};
