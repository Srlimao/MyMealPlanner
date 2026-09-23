import React from 'react';
import { FileText, Calendar, Info, Sliders } from 'lucide-react';
import { Card } from '../../shared/components/Card';

interface PlanGeneralEditorProps {
  title: string;
  date: string;
  onUpdateTitle: (title: string) => void;
  onUpdateDate: (date: string) => void;
  lang?: string;
}

export const PlanGeneralEditor: React.FC<PlanGeneralEditorProps> = ({
  title,
  date,
  onUpdateTitle,
  onUpdateDate,
  lang = 'pt',
}) => {

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-neutral-100">
            {lang === 'en' ? 'General Plan Info' : 'Informações Gerais do Plano'}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">
              {lang === 'en' ? 'Plan Title' : 'Título do Plano'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none transition-colors"
              placeholder="Ex: Plano Alimentar Willian Backhaus"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>{lang === 'en' ? 'Prescription / Consultation Date' : 'Data da Consulta / Prescrição'}</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => onUpdateDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </Card>

      {/* Target integration banner */}
      <Card className="bg-sky-950/20 border-sky-800/40 space-y-2">
        <div className="flex items-center gap-2 text-sky-400">
          <Info className="w-4 h-4 shrink-0" />
          <h5 className="text-xs font-bold uppercase tracking-wider">
            {lang === 'en' ? 'Daily Targets Integration' : 'Metas Diárias de Nutrição & Hábitos'}
          </h5>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          {lang === 'en'
            ? 'Macronutrient targets (Calories, Protein, Carbs, Fat) and daily limits (Water 2L, Soda max 1) can be calibrated in the app Settings to match this nutrition plan.'
            : 'As metas quantitativas de macronutrientes (Calorias, Proteína, Hidratos) e limites diários (Água 2L, Refrigerante máx 1) podem ser calibradas nas Configurações da aplicação para refletir este plano.'}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-sky-300 font-mono pt-1">
          <Sliders className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Accessible via Settings (gear icon in header)' : 'Acessível através das Configurações (ícone de engrenagem no cabeçalho)'}</span>
        </div>
      </Card>
    </div>
  );
};
