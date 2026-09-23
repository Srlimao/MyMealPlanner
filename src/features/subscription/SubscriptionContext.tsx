import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserTier,
  UserUsageRecord,
  TrackedAction,
  ActionCheckResult,
} from './types';
import { subscriptionService } from './subscriptionService';
import { GeminiModelId } from '../../shared/types/settings';
import { TierManagementModal } from './TierManagementModal';

interface SubscriptionContextValue {
  tier: UserTier;
  usage: UserUsageRecord;
  canPerformAction: (action: TrackedAction) => ActionCheckResult;
  recordAction: (action: TrackedAction) => void;
  setTier: (newTier: UserTier) => void;
  getModelForAction: (action: TrackedAction, preferredModel?: GeminiModelId) => GeminiModelId;
  openTierModal: () => void;
  closeTierModal: () => void;
  isTierModalOpen: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<UserTier>(() => subscriptionService.getUserTier());
  const [usage, setUsageState] = useState<UserUsageRecord>(() => subscriptionService.getUsage());
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  // Sync state on mount and window focus
  useEffect(() => {
    const refresh = () => {
      setTierState(subscriptionService.getUserTier());
      setUsageState(subscriptionService.getUsage());
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const handleSetTier = useCallback((newTier: UserTier) => {
    subscriptionService.setUserTier(newTier);
    setTierState(newTier);
    setUsageState(subscriptionService.getUsage());
  }, []);

  const handleRecordAction = useCallback((action: TrackedAction) => {
    subscriptionService.recordAction(action);
    setUsageState(subscriptionService.getUsage());
  }, []);

  const handleCanPerformAction = useCallback(
    (action: TrackedAction): ActionCheckResult => {
      return subscriptionService.canPerformAction(action);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tier, usage]
  );

  const handleGetModelForAction = useCallback(
    (action: TrackedAction, preferredModel?: GeminiModelId): GeminiModelId => {
      return subscriptionService.getModelForAction(action, preferredModel);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tier]
  );

  const value = useMemo(
    () => ({
      tier,
      usage,
      canPerformAction: handleCanPerformAction,
      recordAction: handleRecordAction,
      setTier: handleSetTier,
      getModelForAction: handleGetModelForAction,
      openTierModal: () => setIsTierModalOpen(true),
      closeTierModal: () => setIsTierModalOpen(false),
      isTierModalOpen,
    }),
    [
      tier,
      usage,
      handleCanPerformAction,
      handleRecordAction,
      handleSetTier,
      handleGetModelForAction,
      isTierModalOpen,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <TierManagementModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
      />
    </SubscriptionContext.Provider>
  );
};

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
