import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

export class AuthService {
  async signInWithGoogle(): Promise<User> {
    if (!auth || !isFirebaseConfigured()) {
      throw new Error('Firebase não está configurado. Por favor, adicione as chaves no arquivo .env.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }

  async signInWithEmail(email: string, pass: string): Promise<User> {
    if (!auth || !isFirebaseConfigured()) {
      throw new Error('Firebase não está configurado. Por favor, adicione as chaves no arquivo .env.');
    }
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  }

  async registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
    if (!auth || !isFirebaseConfigured()) {
      throw new Error('Firebase não está configurado. Por favor, adicione as chaves no arquivo .env.');
    }
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName?.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }
    return result.user;
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (!auth || !isFirebaseConfigured()) {
      throw new Error('Firebase não está configurado. Por favor, adicione as chaves no arquivo .env.');
    }
    await sendPasswordResetEmail(auth, email.trim());
  }

  async signOutUser(): Promise<void> {
    if (!auth) return;
    await signOut(auth);
  }

  onAuthChange(callback: (user: User | null) => void): () => void {
    if (!auth || !isFirebaseConfigured()) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }
}

export const authService = new AuthService();
export type { User };
