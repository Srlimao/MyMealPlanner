import React, { useState } from 'react';
import { X, User, Crown, Zap, Sparkles, RotateCcw, Check } from 'lucide-react';
import { AdminUserSummary } from './types';
import { UserTier, TIER_CONFIGS } from '../subscription/types';
import { adminService } from './adminService';

interface UserEditModalProps {
  user: AdminUserSummary | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  onClose,
  onUserUpdated,
}) => {
  const [selectedTier, setSelectedTier] = useState<UserTier>(user?.tier || 'free');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!user) return null;

  const handleSaveTier = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      await adminService.overrideUserTier(user.uid, selectedTier);
      setSuccessMsg('Plano atualizado com sucesso!');
      onUserUpdated();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuota = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      await adminService.resetUserDailyQuotas(user.uid);
      setSuccessMsg('Quotas diárias reiniciadas para 0!');
      onUserUpdated();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const tiers: UserTier[] = ['free', 'starter', 'pro'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-neutral-100 truncate">{user.displayName}</h2>
              <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* User Meta */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5 font-mono text-[11px] text-neutral-400">
            <div className="flex justify-between">
              <span>UID:</span>
              <span className="text-neutral-300 truncate max-w-[200px]">{user.uid}</span>
            </div>
            <div className="flex justify-between">
              <span>Conversas hoje:</span>
              <span className="text-neutral-200 font-semibold">{user.chatsToday}</span>
            </div>
            <div className="flex justify-between">
              <span>Fotos hoje:</span>
              <span className="text-neutral-200 font-semibold">{user.photosToday}</span>
            </div>
            <div className="flex justify-between">
              <span>Registo:</span>
              <span className="text-neutral-300">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Tier Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
              Definir Plano / Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {tiers.map((tKey) => {
                const config = TIER_CONFIGS[tKey];
                const isSelected = selectedTier === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setSelectedTier(tKey)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? tKey === 'pro'
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500/50'
                          : tKey === 'starter'
                          ? 'bg-sky-950/80 border-sky-500 text-sky-300 shadow-md ring-1 ring-sky-500/50'
                          : 'bg-neutral-800 border-neutral-600 text-neutral-100'
                        : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {tKey === 'pro' ? (
                      <Crown className="w-4 h-4 text-emerald-400" />
                    ) : tKey === 'starter' ? (
                      <Zap className="w-4 h-4 text-sky-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-neutral-400" />
                    )}
                    <span className="font-bold text-xs">{config.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      {config.priceMonthly === 0 ? 'Grátis' : `$${config.priceMonthly}/mês`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Ações Rápidas
            </label>
            <button
              type="button"
              onClick={handleResetQuota}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Zerar Quota Diária (Chats & Fotos = 0)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveTier}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
