import { GeminiModelId } from '../types/settings';
import { jsonDbService } from './jsonDbService';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiResponse<T = string> {
  data: T;
  modelUsed: GeminiModelId;
  fallbackTriggered: boolean;
  error?: string;
}

export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string; // base64 without prefix
  };
}

export interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export interface GenerateContentOptions {
  prompt: string;
  image?: { base64: string; mimeType: string };
  history?: ChatHistoryItem[];
  preferredModel?: GeminiModelId;
  systemInstruction?: string;
  responseMimeType?: 'application/json' | 'text/plain';
}

class GeminiService {
  /**
   * Generates content from Gemini with automatic fallback on HTTP 429 (Quota), 503 (Overloaded) or 404
   */
  async generateContent(
    promptOrOptions: string | GenerateContentOptions,
    image?: { base64: string; mimeType: string },
    preferredModel?: GeminiModelId,
    systemInstruction?: string,
    responseMimeType?: 'application/json' | 'text/plain'
  ): Promise<GeminiResponse<string>> {
    const opts: GenerateContentOptions =
      typeof promptOrOptions === 'string'
        ? {
            prompt: promptOrOptions,
            image,
            preferredModel,
            systemInstruction,
            responseMimeType,
          }
        : promptOrOptions;

    const settings = jsonDbService.getUserSettings();
    const apiKey = settings.geminiApiKey;

    if (!apiKey) {
      throw new Error(
        'Nenhuma chave API Gemini configurada. Por favor, adicione a sua chave nas Configurações.'
      );
    }

    const startModel = opts.preferredModel || settings.activeModel || 'gemini-3.5-flash-lite';
    const fallbackList = this.getFallbackChain(startModel);

    let lastError: Error | null = null;
    let fallbackTriggered = false;

    for (let i = 0; i < fallbackList.length; i++) {
      const currentModel = fallbackList[i];
      if (i > 0) fallbackTriggered = true;

      try {
        const result = await this.callModel(currentModel, apiKey, opts);
        return {
          data: result,
          modelUsed: currentModel,
          fallbackTriggered,
        };
      } catch (err: unknown) {
        lastError = err as Error;
        const errMsg = lastError.message || '';
        const shouldFallback =
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota') ||
          errMsg.includes('rate limit') ||
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('404') ||
          errMsg.includes('NOT_FOUND');

        // Only fallback if quota/error is hit and user enabled auto-fallback (or model was 404/503)
        if (shouldFallback && settings.autoFallbackOnRateLimit && i < fallbackList.length - 1) {
          console.warn(`[Gemini] Model ${currentModel} failed (${errMsg.substring(0, 80)}), failing over to ${fallbackList[i + 1]}`);
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('Falha ao comunicar com a API do Gemini.');
  }

  private async callModel(
    model: GeminiModelId,
    apiKey: string,
    opts: GenerateContentOptions
  ): Promise<string> {
    const endpoint = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

    const contents = this.buildContents(opts.prompt, opts.image, opts.history);

    const requestBody: Record<string, unknown> = {
      contents,
    };

    if (opts.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: opts.systemInstruction }],
      };
    }

    if (opts.responseMimeType) {
      requestBody.generationConfig = {
        responseMimeType: opts.responseMimeType,
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) parsedMsg = parsed.error.message;
      } catch {
        // use raw
      }
      throw new Error(parsedMsg);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return candidateText;
  }

  private buildContents(
    prompt: string,
    image?: { base64: string; mimeType: string },
    history?: ChatHistoryItem[]
  ): unknown[] {
    const contents: Array<{ role: 'user' | 'model'; parts: unknown[] }> = [];

    if (history && history.length > 0) {
      for (const h of history) {
        if (!h.text?.trim()) continue;
        const last = contents[contents.length - 1];
        if (last && last.role === h.role) {
          last.parts.push({ text: h.text });
        } else {
          contents.push({
            role: h.role,
            parts: [{ text: h.text }],
          });
        }
      }
    }

    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    const finalParts: unknown[] = [];
    if (image) {
      finalParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.base64,
        },
      });
    }
    if (prompt) {
      finalParts.push({ text: prompt });
    }

    const lastMsg = contents[contents.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      lastMsg.parts.push(...finalParts);
    } else {
      contents.push({ role: 'user', parts: finalParts });
    }

    return contents;
  }

  private getFallbackChain(startModel: GeminiModelId): GeminiModelId[] {
    // Prioritized high-budget fallback chain:
    // 500 RPD -> 500 RPD -> 14,400 RPD
    const priorityFallbacks: GeminiModelId[] = [
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemma-4-26b-a4b-it',
    ];

    const chain: GeminiModelId[] = [startModel];
    for (const fb of priorityFallbacks) {
      if (!chain.includes(fb)) {
        chain.push(fb);
      }
    }
    return chain;
  }
}

export const geminiService = new GeminiService();
