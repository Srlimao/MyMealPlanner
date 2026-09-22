import React, { useState, useRef } from 'react';
import { X, Camera, Type, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { MealEntry, MealType } from '../../shared/types/nutrition';
import { UserSettings } from '../../shared/types/settings';
import { MEAL_NAMES } from '../../shared/i18n/translations';
import { processMealImage } from './PhotoProcessor';
import { buildMealExtractionPrompt } from './parserPrompt';
import { geminiService } from '../../shared/services/geminiService';
import { determineCurrentMealType } from '../advisor/advisorPrompt';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsedSuccess: (partialMeal: Partial<MealEntry>) => void;
  settings: UserSettings;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onParsedSuccess,
  settings,
}) => {
  const [tab, setTab] = useState<'photo' | 'text'>('photo');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
  const initialMealType = determineCurrentMealType(currentHour).type;
  const [mealType, setMealType] = useState<MealType>(initialMealType);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (tab === 'photo' && !selectedFile) {
      setError('Por favor, tire uma fotografia ou selecione uma imagem.');
      return;
    }
    if (tab === 'text' && !textInput.trim()) {
      setError('Por favor, descreva o que comeu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imagePayload: { base64: string; mimeType: string } | undefined;
      if (tab === 'photo' && selectedFile) {
        imagePayload = await processMealImage(selectedFile);
      }

      const prompt = buildMealExtractionPrompt(
        tab === 'text' ? textInput : 'Analise os alimentos e quantidades nesta fotografia.',
        mealType
      );

      const response = await geminiService.generateContent(
        prompt,
        imagePayload,
        settings.activeModel
      );

      // Clean markdown code blocks if any
      let cleanedJson = response.data.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
      }

      const parsedData = JSON.parse(cleanedJson);
      onParsedSuccess(parsedData);
      onClose();
    } catch (err: unknown) {
      console.error('Gemini extraction error', err);
      setError(
        err instanceof Error ? err.message : 'Falha ao analisar a refeição. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-neutral-100">Registar Refeição</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers: Photo vs Text */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-950 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setTab('photo')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-all ${
              tab === 'photo'
                ? 'bg-neutral-900 text-emerald-400 shadow-sm border border-neutral-800'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto da Refeição</span>
          </button>
          <button
            onClick={() => setTab('text')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-all ${
              tab === 'text'
                ? 'bg-neutral-900 text-emerald-400 shadow-sm border border-neutral-800'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Descrever em Texto</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Meal Type selection */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase">
              Tipo de Refeição
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 mt-1 focus:border-emerald-500 focus:outline-none"
            >
              {Object.entries(MEAL_NAMES[settings.language]).map(([type, label]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Tab Content */}
          {tab === 'photo' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-neutral-800 max-h-56 bg-black flex items-center justify-center">
                  <img src={previewUrl} alt="Meal preview" className="max-h-56 object-contain w-full" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-neutral-900/90 hover:bg-neutral-900 text-xs text-neutral-200 px-2.5 py-1 rounded-lg border border-neutral-700"
                  >
                    Trocar Foto
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-neutral-800 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center gap-2 bg-neutral-950/50 hover:bg-neutral-950 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 group-hover:text-emerald-400 transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-neutral-300">
                    Clique para tirar foto ou escolher ficheiro
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    O Gemini identificará os alimentos e quantidades
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Text Tab Content */}
          {tab === 'text' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase">
                O que comeu?
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ex: 140g peito de frango com 4 colheres de sopa de arroz branco e salada de alface e tomate."
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-800 bg-neutral-950/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md shadow-emerald-950/50 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>A analisar nutrientes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analisar com Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
