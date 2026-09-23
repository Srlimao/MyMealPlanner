import React from 'react';
import { DollarSign, Cpu, CreditCard, TrendingUp, Users } from 'lucide-react';
import { FinancialSummary } from './types';

interface FinancialMetricsCardProps {
  metrics: FinancialSummary;
}

export const FinancialMetricsCard: React.FC<FinancialMetricsCardProps> = ({ metrics }) => {
  const isHealthyMargin = metrics.netMarginPercentage >= 50;

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100">Saúde Financeira & Custos de IA</h3>
            <p className="text-[11px] text-neutral-400">
              Métricas agregadas baseadas em {metrics.totalUsers} utilizadores registados
            </p>
          </div>
        </div>

        {/* Target Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
              isHealthyMargin
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
            }`}
          >
            <span>Margem Líquida: {metrics.netMarginPercentage}%</span>
            <span className="text-[10px] opacity-75">
              {isHealthyMargin ? '(Meta ≥50% ✓)' : '(Abaixo da Meta)'}
            </span>
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* MRR */}
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Receita Bruta (MRR)</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-neutral-100 font-mono">
            ${metrics.grossRevenueMonthly.toFixed(2)}
          </p>
          <span className="text-[10px] text-neutral-400">Assinaturas mensais</span>
        </div>

        {/* AI Inference Costs */}
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Custo IA (Gemini)</span>
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-sky-400 font-mono">
            ~${metrics.estimatedAiCostMonthly.toFixed(2)}
          </p>
          <span className="text-[10px] text-neutral-400">Tokens de visão e chat</span>
        </div>

        {/* Payment Fees */}
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Taxas de Pagamento</span>
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-400 font-mono">
            ~${metrics.estimatedStripeFeesMonthly.toFixed(2)}
          </p>
          <span className="text-[10px] text-neutral-400">Stripe (2.9% + $0.30)</span>
        </div>

        {/* Net Profit */}
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Lucro Líquido</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
            ${metrics.netProfitMonthly.toFixed(2)}
          </p>
          <span className="text-[10px] text-neutral-400">Após custos e taxas</span>
        </div>
      </div>

      {/* User Tier Breakdown Bar */}
      <div className="pt-2 border-t border-neutral-800/60 space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            Distribuição por Plano
          </span>
          <span className="font-mono text-neutral-300">
            {metrics.freeUsers} Free • {metrics.starterUsers} Starter • {metrics.proUsers} Pro
          </span>
        </div>

        <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden flex">
          {metrics.totalUsers > 0 && (
            <>
              <div
                style={{ width: `${(metrics.freeUsers / metrics.totalUsers) * 100}%` }}
                className="bg-neutral-600 h-full"
                title={`Free: ${metrics.freeUsers}`}
              />
              <div
                style={{ width: `${(metrics.starterUsers / metrics.totalUsers) * 100}%` }}
                className="bg-sky-500 h-full"
                title={`Starter: ${metrics.starterUsers}`}
              />
              <div
                style={{ width: `${(metrics.proUsers / metrics.totalUsers) * 100}%` }}
                className="bg-emerald-500 h-full"
                title={`Pro: ${metrics.proUsers}`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
