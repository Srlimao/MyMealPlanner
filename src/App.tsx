import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AuthScreen } from './features/auth/AuthScreen';
import { AuthenticatedApp } from './AuthenticatedApp';
import { jsonDbService } from './shared/services/jsonDbService';
import { AppLanguage } from './shared/types/settings';

import { SubscriptionProvider } from './features/subscription/SubscriptionContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [lang, setLang] = useState<AppLanguage>(() => jsonDbService.getUserSettings().language);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-950/60 animate-pulse">
          <Sparkles className="w-6 h-6 text-neutral-950" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        currentLang={lang}
        onLanguageChange={(newLang) => {
          setLang(newLang);
          const current = jsonDbService.getUserSettings();
          jsonDbService.saveUserSettings({ ...current, language: newLang });
        }}
      />
    );
  }

  return (
    <SubscriptionProvider>
      <AuthenticatedApp />
    </SubscriptionProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
