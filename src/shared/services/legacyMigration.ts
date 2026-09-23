export interface LegacyMigrationTarget {
  getCacheKey(key: string): string;
  saveNutritionPlan(plan: any): Promise<void>;
  saveUserSettings(settings: any): Promise<void>;
  saveDailyLog(log: any): Promise<void>;
}

export async function runLegacyDataMigration(target: LegacyMigrationTarget, uid: string): Promise<void> {
  const migrationFlag = `eh_${uid}_legacy_migrated`;
  if (typeof window === 'undefined' || localStorage.getItem(migrationFlag)) return;

  const legacyPlan = localStorage.getItem('eh_active_plan');
  const legacySettings = localStorage.getItem('eh_settings');

  if (legacyPlan && !localStorage.getItem(target.getCacheKey('active_plan'))) {
    try {
      await target.saveNutritionPlan(JSON.parse(legacyPlan));
    } catch {
      // ignore
    }
  }

  if (legacySettings && !localStorage.getItem(target.getCacheKey('settings'))) {
    try {
      await target.saveUserSettings(JSON.parse(legacySettings));
    } catch {
      // ignore
    }
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('eh_log_')) {
      try {
        const logData = JSON.parse(localStorage.getItem(key) || '');
        if (logData?.date) await target.saveDailyLog(logData);
      } catch {
        // ignore
      }
    }
  }

  localStorage.setItem(migrationFlag, 'true');
}
