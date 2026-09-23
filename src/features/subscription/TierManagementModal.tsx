import React from 'react';
import { X, Sparkles, Check, Zap, Crown } from 'lucide-react';
import { UserTier, TIER_CONFIGS } from './types';
import { useSubscription } from './SubscriptionContext';
import { getTranslation } from '../../shared/i18n';
import { jsonDbService } from '../../shared/services/jsonDbService';

interface TierManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TierManagementModal: React.FC<TierManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { tier: currentTier, setTier } = useSubscription();

  if (!isOpen) return null;

  const lang = jsonDbService.getUserSettings().language || 'pt';
  const t = getTranslation(lang);

  const handleSelectTier = (newTier: UserTier) => {
    setTier(newTier);
    onClose();
  };

  const tiers: UserTier[] = ['free', 'starter', 'pro'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                {t.subscription.title}
              </h2>
              <p className="text-xs text-neutral-400">
                {t.subscription.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tier Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tierKey) => {
            const config = TIER_CONFIGS[tierKey];
            const isCurrent = currentTier === tierKey;
            const isPro = tierKey === 'pro';
            const isStarter = tierKey === 'starter';
            const tierName =
              tierKey === 'free'
                ? t.subscription.freeName
                : tierKey === 'starter'
                ? t.subscription.starterName
                : t.subscription.proName;
            const highlights =
              tierKey === 'free'
                ? t.subscription.freeHighlights
                : tierKey === 'starter'
                ? t.subscription.starterHighlights
                : t.subscription.proHighlights;

            return (
              <div
                key={tierKey}
                className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-neutral-950/90 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                    : isPro
                    ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-emerald-500/30 hover:border-emerald-500/50'
                    : isStarter
                    ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-sky-500/30 hover:border-sky-500/50'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Popular or Recommended Badge */}
                {isPro && (
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>{t.subscription.recommended}</span>
                  </div>
                )}
                {isStarter && !isCurrent && (
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-sky-500 text-neutral-950 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{t.subscription.popular}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-neutral-100 flex items-center gap-1.5">
                      {tierName}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                      {config.badge}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-black text-neutral-100">
                      {config.priceMonthly === 0 ? t.subscription.free : `$${config.priceMonthly.toFixed(2)}`}
                    </span>
                    {config.priceMonthly > 0 && (
                      <span className="text-xs text-neutral-400 font-medium ml-1">{t.subscription.perMonth}</span>
                    )}
                  </div>

                  {/* Highlights list */}
                  <ul className="space-y-2.5 mb-6 text-xs text-neutral-300">
                    {highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => handleSelectTier(tierKey)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-neutral-800 text-neutral-400 cursor-default border border-neutral-700/50'
                      : isPro
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-950/50'
                      : isStarter
                      ? 'bg-sky-500 hover:bg-sky-400 text-neutral-950 shadow-md shadow-sky-950/50'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.subscription.currentPlan}</span>
                    </>
                  ) : (
                    <span>{t.subscription.changeTo} {tierName}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 border-t border-neutral-800/80 bg-neutral-950/60 text-[11px] text-neutral-400 text-center shrink-0">
          {t.subscription.resetNotice}
        </div>
      </div>
    </div>
  );
};
