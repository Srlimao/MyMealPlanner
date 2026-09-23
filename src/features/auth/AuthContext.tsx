import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, authService } from './authService';
import { isFirebaseConfigured } from './firebase';
import { jsonDbService } from '../../shared/services/jsonDbService';
import { adminService } from '../admin/adminService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = useMemo(() => isFirebaseConfigured(), []);

  useEffect(() => {
    // Check for E2E test mock session
    const e2eMock = typeof window !== 'undefined' ? localStorage.getItem('eh_e2e_user') : null;
    if (e2eMock) {
      try {
        const mockUser = JSON.parse(e2eMock);
        setUser(mockUser as User);
        jsonDbService.setUserId(mockUser.uid);
        adminService.recordUserPresence(mockUser as User);
        setLoading(false);
        return;
      } catch {
        // ignore
      }
    }

    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        jsonDbService.setUserId(firebaseUser.uid);
        await jsonDbService.autoMigrateLegacyData(firebaseUser.uid);
        adminService.recordUserPresence(firebaseUser);
      } else {
        jsonDbService.setUserId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await authService.signInWithEmail(email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    await authService.registerWithEmail(email, pass, name);
  };

  const sendPasswordReset = async (email: string) => {
    await authService.sendPasswordReset(email);
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eh_e2e_user');
    }
    await authService.signOutUser();
    setUser(null);
    jsonDbService.setUserId(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured,
      signInWithGoogle,
      signInWithEmail,
      registerWithEmail,
      sendPasswordReset,
      signOut,
    }),
    [user, loading, isConfigured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
