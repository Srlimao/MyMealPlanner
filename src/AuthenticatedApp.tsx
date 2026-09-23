import { useState, useEffect, lazy, Suspense } from 'react';
import { Calendar, BookOpen, BarChart3, ShieldCheck } from 'lucide-react';
import { DailyLog, NutritionPlan, MealEntry, MealType } from './shared/types/nutrition';
import { UserSettings } from './shared/types/settings';
import { jsonDbService } from './shared/services/jsonDbService';
import { DEFAULT_NUTRITION_PLAN } from './shared/data/defaultPlan';
import { TRANSLATIONS } from './shared/i18n/translations';
import { Header } from './shared/components/Header';
import { AppModals } from './shared/components/AppModals';
import { MobileBottomNav } from './shared/components/MobileBottomNav';
import { DayView } from './features/dashboard/DayView';
import { PlanViewer } from './features/plan/PlanViewer';
import { WeeklyOverview } from './features/metrics/WeeklyOverview';
import { HistoryList } from './features/metrics/HistoryList';
import { adminService } from './features/admin/adminService';
import { useAuth } from './features/auth/AuthContext';
import { usePWAInstall } from './shared/hooks/usePWAInstall';
import { getLocalDateString } from './shared/utils/dateUtils';
import { parseMealSuggestion } from './features/advisor/advisorPrompt';

const AdminDashboard = lazy(() =>
  import('./features/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

type Tab = 'dashboard' | 'plan' | 'metrics' | 'admin';

const emptyLog = (date: string): DailyLog => ({
  date,
  meals: [],
  dayTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  habits: { waterMl: 0, sodaCount: 0 },
  updatedAt: new Date().toISOString(),
});

export function AuthenticatedApp() {
  const { user } = useAuth();
  const isAdmin = adminService.isAdmin(user?.email);

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [currentDate, setCurrentDate] = useState<string>(() => getLocalDateString());
  const [settings, setSettings] = useState<UserSettings>(() => jsonDbService.getUserSettings());
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan>(DEFAULT_NUTRITION_PLAN);
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => emptyLog(getLocalDateString()));
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [reviewMealData, setReviewMealData] = useState<Partial<MealEntry> | null>(null);

  const { canInstall, isStandalone, isIOS, showIOSModal, setShowIOSModal, promptInstall } = usePWAInstall();
  const t = TRANSLATIONS[settings.language];

  // Initial load
  useEffect(() => {
    setSettings(jsonDbService.getUserSettings());
    jsonDbService.getNutritionPlan().then(setNutritionPlan);
    jsonDbService.getRecentLogs(14).then(setRecentLogs);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Load log when date changes
  useEffect(() => {
    let isMounted = true;
    jsonDbService.getDailyLog(currentDate).then((loaded) => {
      if (!isMounted) return;
      if (loaded) {
        setDailyLog(loaded);
      } else {
        setDailyLog(emptyLog(currentDate));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentDate]);

  const handleUpdateDailyLog = async (newLog: DailyLog) => {
    setDailyLog(newLog);
    await jsonDbService.saveDailyLog(newLog);
    setRecentLogs(await jsonDbService.getRecentLogs(14));
  };

  const handleUpdatePlan = async (p: NutritionPlan) => {
    setNutritionPlan(p);
    await jsonDbService.saveNutritionPlan(p);
  };

  const handleUpdateSettings = async (s: UserSettings) => {
    setSettings(s);
    await jsonDbService.saveUserSettings(s);
  };

  const handleConfirmMeal = async (newMeal: MealEntry) => {
    const existingIndex = dailyLog.meals.findIndex((m) => m.id === newMeal.id);
    const meals = existingIndex >= 0
      ? dailyLog.meals.map((m, i) => (i === existingIndex ? newMeal : m))
      : [...dailyLog.meals, newMeal];

    const dayTotals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.totals.calories,
        protein: acc.protein + m.totals.protein,
        carbs: acc.carbs + m.totals.carbs,
        fat: acc.fat + m.totals.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setReviewMealData(null);
    await handleUpdateDailyLog({ ...dailyLog, meals, dayTotals, updatedAt: new Date().toISOString() });
  };

  const handleQuickLogSuggestion = (suggestionText: string, mealType: MealType) => {
    const mealLabel = t.meals[mealType] || mealType;
    const parsed = parseMealSuggestion(suggestionText);
    setReviewMealData({
      name: parsed.optionTitle || `${t.advisor.suggestedOptionPrefix} ${mealLabel}`,
      mealType,
      items: parsed.items,
      notes: suggestionText.slice(0, 150),
      adheresToPlateRule: true,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdvisorChat={() => setIsAdvisorOpen(true)}
        isOnline={isOnline}
        canInstall={canInstall}
        onInstallApp={promptInstall}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Navigation Tabs (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl w-fit mb-5 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.nav.dashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'plan'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.nav.plan}</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'metrics'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.nav.history}</span>
          </button>

          {isAdmin && (
            <button
              data-tab="admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <DayView
            currentDate={currentDate}
            onSelectDate={setCurrentDate}
            dailyLog={dailyLog}
            onUpdateDailyLog={handleUpdateDailyLog}
            nutritionPlan={nutritionPlan}
            settings={settings}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
            onQuickLogSuggestion={handleQuickLogSuggestion}
            onEditMeal={(meal) => setReviewMealData(meal)}
          />
        )}

        {activeTab === 'plan' && (
          <PlanViewer plan={nutritionPlan} onUpdatePlan={handleUpdatePlan} lang={settings.language} />
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-5 pb-20">
            <WeeklyOverview logs={recentLogs} targetCalories={settings.targets.calories} lang={settings.language} />
            <HistoryList
              logs={recentLogs}
              lang={settings.language}
              onSelectDate={(selected) => {
                setCurrentDate(selected);
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <Suspense fallback={<div className="p-8 text-center text-neutral-500 text-xs font-mono">A carregar painel de administração...</div>}>
            <AdminDashboard />
          </Suspense>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        isAdmin={isAdmin}
        translations={t.nav}
      />

      {/* Modals & Drawers */}
      <AppModals
        isSettingsOpen={isSettingsOpen}
        onCloseSettings={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleUpdateSettings}
        canInstall={canInstall}
        isStandalone={isStandalone}
        onInstallApp={promptInstall}
        showIOSModal={showIOSModal}
        onCloseIOSModal={() => setShowIOSModal(false)}
        isIOS={isIOS}
        isAdvisorOpen={isAdvisorOpen}
        onCloseAdvisor={() => setIsAdvisorOpen(false)}
        dailyLog={dailyLog}
        nutritionPlan={nutritionPlan}
        isQuickLogOpen={isQuickLogOpen}
        onCloseQuickLog={() => setIsQuickLogOpen(false)}
        reviewMealData={reviewMealData}
        onCloseReviewMeal={() => setReviewMealData(null)}
        onParsedSuccess={(parsed) => setReviewMealData(parsed)}
        onConfirmMeal={handleConfirmMeal}
      />
    </div>
  );
}
