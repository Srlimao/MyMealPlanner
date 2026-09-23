import React from 'react';

interface UsageMeterBarProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
  icon?: React.ReactNode;
  isHighest?: boolean;
}

export const UsageMeterBar: React.FC<UsageMeterBarProps> = ({
  label,
  current,
  limit,
  unit = '',
  icon,
  isHighest = false,
}) => {
  const isUnlimited = limit === Infinity || isHighest;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100));

  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/20';

  if (!isUnlimited) {
    if (percentage >= 100) {
      barColor = 'bg-rose-500';
      badgeColor = 'text-rose-400 bg-rose-950/60 border-rose-500/30';
    } else if (percentage >= 80) {
      barColor = 'bg-amber-500';
      badgeColor = 'text-amber-400 bg-amber-950/60 border-amber-500/30';
    }
  }

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between text-neutral-300">
        <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
          {icon}
          <span>{label}</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded font-mono font-semibold text-[11px] border ${badgeColor}`}>
          {isUnlimited ? (
            'Highest'
          ) : (
            `${current}/${limit}${unit ? ` ${unit}` : ''}`
          )}
        </span>
      </div>

      {!isUnlimited && (
        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
