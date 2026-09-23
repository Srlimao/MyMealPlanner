import React, { useState } from 'react';
import { X, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { TRANSLATIONS } from '../../shared/i18n/translations';
import { AppLanguage } from '../../shared/types/settings';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.authFailed;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-neutral-100">{t.auth.forgotPasswordTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-neutral-400 leading-relaxed">{t.auth.forgotPasswordDesc}</p>

          {success ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{t.auth.resetSent}</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">{t.auth.email}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              {t.common.cancel}
            </button>
            {!success && (
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow transition-all"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{t.auth.sendResetLink}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
