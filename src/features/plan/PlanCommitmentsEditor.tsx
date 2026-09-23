import React from 'react';
import { ShieldCheck, Plus, Trash2, BookOpen, Droplets, Wine } from 'lucide-react';
import { Card } from '../../shared/components/Card';

interface PlanCommitmentsEditorProps {
  commitments: string[];
  rules: string[];
  onChangeCommitments: (commitments: string[]) => void;
  onChangeRules: (rules: string[]) => void;
  lang?: string;
}

export const PlanCommitmentsEditor: React.FC<PlanCommitmentsEditorProps> = ({
  commitments,
  rules,
  onChangeCommitments,
  onChangeRules,
  lang = 'pt',
}) => {

  const handleAddCommitment = () => {
    onChangeCommitments([...commitments, '']);
  };

  const handleUpdateCommitment = (index: number, val: string) => {
    const updated = [...commitments];
    updated[index] = val;
    onChangeCommitments(updated);
  };

  const handleRemoveCommitment = (index: number) => {
    onChangeCommitments(commitments.filter((_, i) => i !== index));
  };

  const handleAddRule = () => {
    onChangeRules([...rules, '']);
  };

  const handleUpdateRule = (index: number, val: string) => {
    const updated = [...rules];
    updated[index] = val;
    onChangeRules(updated);
  };

  const handleRemoveRule = (index: number) => {
    onChangeRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Active commitments */}
      <Card className="space-y-3 border-emerald-500/20 bg-emerald-950/10">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {lang === 'en' ? 'Commitments Until Next Consultation' : 'Compromissos até à Próxima Consulta'}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleAddCommitment}
            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Add' : 'Adicionar'}</span>
          </button>
        </div>

        <div className="space-y-2">
          {commitments.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-emerald-500 text-xs font-bold">✓</span>
              <input
                type="text"
                value={c}
                onChange={(e) => handleUpdateCommitment(i, e.target.value)}
                placeholder="Ex: Apenas 1 lata cola 0 por dia, 2L de água..."
                className="flex-1 bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveCommitment(i)}
                className="p-1.5 text-neutral-500 hover:text-rose-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {commitments.length === 0 && (
            <p className="text-xs text-neutral-500 italic py-1">
              {lang === 'en' ? 'No commitments recorded.' : 'Nenhum compromisso registado.'}
            </p>
          )}
        </div>
      </Card>

      {/* Habit targets reminder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="text-neutral-400 block font-medium">
              {lang === 'en' ? 'Daily Water Habit' : 'Consumo de Água'}
            </span>
            <span className="font-bold text-neutral-200">
              {lang === 'en' ? '2.0 Liters Target' : 'Meta de 2.0 Litros / dia'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <Wine className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="text-neutral-400 block font-medium">
              {lang === 'en' ? 'Daily Soda Habit' : 'Refrigerante / Cola Zero'}
            </span>
            <span className="font-bold text-neutral-200">
              {lang === 'en' ? 'Max 1 can / day' : 'Máximo 1 lata / dia'}
            </span>
          </div>
        </div>
      </div>

      {/* General Rules */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-300">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {lang === 'en' ? 'Dietary Principles & General Rules' : 'Regras Gerais & Princípios Nutricionais'}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleAddRule}
            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Add' : 'Adicionar'}</span>
          </button>
        </div>

        <div className="space-y-2">
          {rules.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-neutral-500 text-xs">•</span>
              <input
                type="text"
                value={r}
                onChange={(e) => handleUpdateRule(i, e.target.value)}
                placeholder="Ex: 1/2 prato com hortícolas, 1/4 hidratos, 1/4 proteína..."
                className="flex-1 bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveRule(i)}
                className="p-1.5 text-neutral-500 hover:text-rose-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {rules.length === 0 && (
            <p className="text-xs text-neutral-500 italic py-1">
              {lang === 'en' ? 'No rules specified.' : 'Nenhuma regra especificada.'}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
