import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from './AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { TRANSLATIONS } from '../../shared/i18n/translations';
import { SUPPORTED_LANGUAGES } from '../../shared/i18n';
import { AppLanguage } from '../../shared/types/settings';

interface AuthScreenProps {
  currentLang: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ currentLang, onLanguageChange }) => {
  const { isConfigured, signInWithGoogle, signInWithEmail, registerWithEmail, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const t = TRANSLATIONS[currentLang];

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.authFailed;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (password.length < 6) {
        setError(t.auth.passwordTooShort);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.auth.passwordsDoNotMatch);
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.auth.authFailed;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 relative font-sans text-neutral-100">
      {/* Top Language Bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 rounded-xl px-2.5 py-1 text-xs backdrop-blur-sm">
        <Globe className="w-3.5 h-3.5 text-neutral-400" />
        <select
          value={currentLang}
          onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
          className="bg-transparent text-neutral-200 text-xs focus:outline-none cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-neutral-900 text-neutral-200">
              {l.flag} {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-950/60 mx-auto">
            <Sparkles className="w-7 h-7 text-neutral-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">{t.appTitle}</h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">{t.auth.welcomeSubtitle}</p>
        </div>

        {/* Not Configured Banner */}
        {!isConfigured && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              {t.auth.firebaseNotConfigured}
            </p>
            <p className="text-[11px] text-amber-400/80 leading-relaxed">
              Consulte o ficheiro <code className="bg-neutral-950 px-1 py-0.5 rounded">.env.example</code> para preencher as credenciais no GitHub ou no arquivo <code className="bg-neutral-950 px-1 py-0.5 rounded">.env</code>.
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-sm space-y-5">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {t.auth.signIn}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {t.auth.signUp}
            </button>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || !isConfigured}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-700/80 text-xs font-semibold text-neutral-100 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t.auth.continueWithGoogle}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-800 w-full" />
            <span className="bg-neutral-900 px-3 text-[11px] text-neutral-500 uppercase tracking-wider shrink-0">
              {t.auth.orWithEmail}
            </span>
            <div className="border-t border-neutral-800 w-full" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                {t.auth.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                {t.auth.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  {t.auth.confirmPassword}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.confirmPasswordPlaceholder}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none"
                />
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[11px] text-neutral-400 hover:text-emerald-400 transition-colors"
                >
                  {t.auth.forgotPassword}
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{mode === 'signin' ? t.auth.signIn : t.auth.signUp}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-800 text-center">
            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {t.auth.continueAsGuest}
            </button>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        lang={currentLang}
      />
    </div>
  );
};
