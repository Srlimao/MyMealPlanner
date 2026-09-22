import { useState, useEffect } from 'react';
import { Calendar, BookOpen, BarChart3, Plus } from 'lucide-react';
import { DailyLog, NutritionPlan, MealEntry, MealType } from './shared/types/nutrition';
import { UserSettings } from './shared/types/settings';
import { jsonDbService } from './shared/services/jsonDbService';
import { DEFAULT_NUTRITION_PLAN } from './shared/data/defaultPlan';
import { TRANSLATIONS } from './shared/i18n/translations';
import { Header } from './shared/components/Header';
import { SettingsModal } from './shared/components/SettingsModal';
import { InstallPromptModal } from './shared/components/InstallPromptModal';
import { AdvisorChatDrawer } from './features/advisor/AdvisorChatDrawer';
import { QuickLogModal } from './features/logger/QuickLogModal';
import { MealReviewModal } from './features/logger/MealReviewModal';
import { DayView } from './features/dashboard/DayView';
import { PlanViewer } from './features/plan/PlanViewer';
import { WeeklyOverview } from './features/metrics/WeeklyOverview';
import { HistoryList } from './features/metrics/HistoryList';
import { usePWAInstall } from './shared/hooks/usePWAInstall';

type Tab = 'dashboard' | 'plan' | 'metrics';

const emptyLog = (date: string): DailyLog => ({
  date,
  meals: [],
  dayTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  habits: { waterMl: 0, sodaCount: 0 },
  updatedAt: new Date().toISOString(),
});

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [currentDate, setCurrentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [settings, setSettings] = useState<UserSettings>(jsonDbService.getUserSettings());
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan>(DEFAULT_NUTRITION_PLAN);
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => emptyLog(new Date().toISOString().split('T')[0]));
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
    const meals = [...dailyLog.meals, newMeal];
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
    setReviewMealData({
      name: `Opção sugerida para ${mealType}`,
      mealType,
      items: [
        { id: `item_${Date.now()}`, name: 'Opção do plano recomendada', portion: '1 porção', calories: 350, protein: 25, carbs: 35, fat: 8 },
      ],
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
            <span>{t.dashboard}</span>
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
            <span>{t.plan}</span>
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
            <span>{t.history}</span>
          </button>
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
          />
        )}

        {activeTab === 'plan' && (
          <PlanViewer plan={nutritionPlan} onUpdatePlan={handleUpdatePlan} />
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-5 pb-20">
            <WeeklyOverview logs={recentLogs} targetCalories={settings.targets.calories} />
            <HistoryList
              logs={recentLogs}
              onSelectDate={(selected) => {
                setCurrentDate(selected);
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800/90 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.dashboard}</span>
        </button>

        {/* Center Quick Log Action Button */}
        <button
          onClick={() => setIsQuickLogOpen(true)}
          className="flex items-center justify-center w-11 h-11 -mt-4 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-950/80 border-2 border-neutral-950 active:scale-90 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'plan' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t.plan}</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'metrics' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t.history}</span>
        </button>
      </nav>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleUpdateSettings}
        canInstall={canInstall}
        isStandalone={isStandalone}
        onInstallApp={promptInstall}
      />
      <InstallPromptModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        isIOS={isIOS}
        language={settings.language}
      />
      <AdvisorChatDrawer
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        todayLog={dailyLog}
        nutritionPlan={nutritionPlan}
        settings={settings}
      />
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onParsedSuccess={(parsed) => setReviewMealData(parsed)}
        settings={settings}
      />
      {reviewMealData && (
        <MealReviewModal
          isOpen={true}
          onClose={() => setReviewMealData(null)}
          initialMeal={reviewMealData}
          onConfirm={handleConfirmMeal}
          lang={settings.language}
        />
      )}
    </div>
  );
}
