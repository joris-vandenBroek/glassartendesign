'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AdminUser {
  uid: string;
  email: string | null;
}

interface AdminAuthValue {
  user: AdminUser | null;
  isAdmin: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setIsAdmin(false);
        setIsHydrated(true);
        return;
      }
      const medewerkerDoc = await getDoc(doc(db, 'medewerkers', firebaseUser.uid));
      setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      setIsAdmin(medewerkerDoc.exists());
      setIsHydrated(true);
    });
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      user,
      isAdmin,
      isHydrated,
      login: async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      logout: async () => {
        await firebaseSignOut(auth);
      },
      resetPassword: async (email: string) => {
        await sendPasswordResetEmail(auth, email);
      },
    }),
    [user, isAdmin, isHydrated]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
