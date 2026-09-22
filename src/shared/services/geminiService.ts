import { GeminiModelId, AVAILABLE_MODELS } from '../types/settings';
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

class GeminiService {
  /**
   * Generates content from Gemini with automatic fallback on HTTP 429 (Quota/Rate Limit)
   */
  async generateContent(
    prompt: string,
    image?: { base64: string; mimeType: string },
    preferredModel?: GeminiModelId,
    systemInstruction?: string
  ): Promise<GeminiResponse<string>> {
    const settings = jsonDbService.getUserSettings();
    const apiKey = settings.geminiApiKey;

    if (!apiKey) {
      throw new Error(
        'Nenhuma chave API Gemini configurada. Por favor, adicione a sua chave nas Configurações.'
      );
    }

    const startModel = preferredModel || settings.activeModel || 'gemini-2.5-flash';
    const fallbackList = this.getFallbackChain(startModel);

    let lastError: Error | null = null;
    let fallbackTriggered = false;

    for (let i = 0; i < fallbackList.length; i++) {
      const currentModel = fallbackList[i];
      if (i > 0) fallbackTriggered = true;

      try {
        const result = await this.callModel(
          currentModel,
          apiKey,
          prompt,
          image,
          systemInstruction
        );
        return {
          data: result,
          modelUsed: currentModel,
          fallbackTriggered,
        };
      } catch (err: unknown) {
        lastError = err as Error;
        const errMsg = lastError.message || '';
        const isQuotaOrRateLimit =
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota') ||
          errMsg.includes('rate limit');

        // Only fallback if quota/rate limit is hit and user enabled auto-fallback
        if (isQuotaOrRateLimit && settings.autoFallbackOnRateLimit && i < fallbackList.length - 1) {
          console.warn(`[Gemini] Model ${currentModel} exhausted, failing over to ${fallbackList[i + 1]}`);
          continue;
        }

        // If not a quota issue or no further fallback, throw
        throw lastError;
      }
    }

    throw lastError || new Error('Falha ao comunicar com a API do Gemini.');
  }

  private async callModel(
    model: GeminiModelId,
    apiKey: string,
    prompt: string,
    image?: { base64: string; mimeType: string },
    systemInstruction?: string
  ): Promise<string> {
    const endpoint = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

    const parts: unknown[] = [];
    if (image) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.base64,
        },
      });
    }
    parts.push({ text: prompt });

    const requestBody: Record<string, unknown> = {
      contents: [{ role: 'user', parts }],
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
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
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return candidateText;
  }

  private getFallbackChain(startModel: GeminiModelId): GeminiModelId[] {
    const allModelIds: GeminiModelId[] = AVAILABLE_MODELS.map((m) => m.id);
    const startIdx = allModelIds.indexOf(startModel);
    if (startIdx === -1) return allModelIds;
    // Return startModel first, followed by others in hierarchy
    return [startModel, ...allModelIds.filter((m) => m !== startModel)];
  }
}

export const geminiService = new GeminiService();
