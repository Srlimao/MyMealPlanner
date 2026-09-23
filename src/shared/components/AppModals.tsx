import React from 'react';
import { SettingsModal } from './SettingsModal';
import { InstallPromptModal } from './InstallPromptModal';
import { AdvisorChatDrawer } from '../../features/advisor/AdvisorChatDrawer';
import { QuickLogModal } from '../../features/logger/QuickLogModal';
import { MealReviewModal } from '../../features/logger/MealReviewModal';
import { DailyLog, NutritionPlan, MealEntry } from '../types/nutrition';
import { UserSettings } from '../types/settings';

interface AppModalsProps {
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => Promise<void>;
  canInstall?: boolean;
  isStandalone: boolean;
  onInstallApp: () => void;
  showIOSModal: boolean;
  onCloseIOSModal: () => void;
  isIOS: boolean;
  isAdvisorOpen: boolean;
  onCloseAdvisor: () => void;
  dailyLog: DailyLog;
  nutritionPlan: NutritionPlan;
  isQuickLogOpen: boolean;
  onCloseQuickLog: () => void;
  reviewMealData: Partial<MealEntry> | null;
  onCloseReviewMeal: () => void;
  onParsedSuccess: (parsed: Partial<MealEntry>) => void;
  onConfirmMeal: (meal: MealEntry) => Promise<void>;
}

export const AppModals: React.FC<AppModalsProps> = ({
  isSettingsOpen,
  onCloseSettings,
  settings,
  onSaveSettings,
  canInstall,
  isStandalone,
  onInstallApp,
  showIOSModal,
  onCloseIOSModal,
  isIOS,
  isAdvisorOpen,
  onCloseAdvisor,
  dailyLog,
  nutritionPlan,
  isQuickLogOpen,
  onCloseQuickLog,
  reviewMealData,
  onCloseReviewMeal,
  onParsedSuccess,
  onConfirmMeal,
}) => {
  return (
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        settings={settings}
        onSave={onSaveSettings}
        canInstall={canInstall}
        isStandalone={isStandalone}
        onInstallApp={onInstallApp}
      />
      <InstallPromptModal
        isOpen={showIOSModal}
        onClose={onCloseIOSModal}
        isIOS={isIOS}
        language={settings.language}
      />
      <AdvisorChatDrawer
        isOpen={isAdvisorOpen}
        onClose={onCloseAdvisor}
        todayLog={dailyLog}
        nutritionPlan={nutritionPlan}
        settings={settings}
      />
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={onCloseQuickLog}
        onParsedSuccess={onParsedSuccess}
        settings={settings}
      />
      {reviewMealData && (
        <MealReviewModal
          isOpen={true}
          onClose={onCloseReviewMeal}
          initialMeal={reviewMealData}
          onConfirm={onConfirmMeal}
          lang={settings.language}
        />
      )}
    </>
  );
};
