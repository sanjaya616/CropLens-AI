import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  auth,
  isFirebaseConfigured,
  signInWithGoogleClient,
  signInWithEmailClient,
  registerWithEmailClient,
  resetPasswordClient,
  signOutClient,
} from '../services/firebaseClient';
import { onAuthStateChanged, User as FirebaseUser, sendEmailVerification } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: UserRole;
  isLoading: boolean;
  isAdmin: boolean;
  isFirebaseReady: boolean;
  emailVerified: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, district?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  retryAuth: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Synchronize authenticated session from Firebase Auth and verify through backend
  const verifyBackendProfile = async (fbUser: FirebaseUser) => {
    try {
      setAuthError(null);
      const idToken = await fbUser.getIdToken();
      setEmailVerified(Boolean(fbUser.emailVerified));

      // Fetch server-verified profile and role from backend
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setToken(idToken);
        setUser(data.user);
      } else {
        const errData = await res.json().catch(() => ({}));
        const errorMsg =
          errData.error ||
          `Backend identity verification failed (${res.status}). Server could not authenticate this token.`;
        console.error('[AuthContext] Backend verification rejected token:', errorMsg);
        // Per Phase 2: Never create a fallback profile on backend verification failure.
        setUser(null);
        setToken(null);
        setAuthError(errorMsg);
      }
    } catch (err: unknown) {
      console.error('[AuthContext] Error retrieving backend session profile:', err);
      const msg = err instanceof Error ? err.message : 'Network error communicating with authentication service.';
      setUser(null);
      setToken(null);
      setAuthError(msg);
    }
  };

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (fbUser) {
        await verifyBackendProfile(fbUser);
      } else {
        setUser(null);
        setToken(null);
        setEmailVerified(false);
        setAuthError(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const retryAuth = async () => {
    if (auth?.currentUser) {
      setIsLoading(true);
      await verifyBackendProfile(auth.currentUser);
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogleClient();
      await verifyBackendProfile(res.user);
    } catch (err) {
      console.error('[AuthContext] Google sign in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await signInWithEmailClient(email, pass);
      await verifyBackendProfile(res.user);
    } catch (err) {
      console.error('[AuthContext] Email sign in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, district?: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await registerWithEmailClient(email, pass);
      const idToken = await res.user.getIdToken();

      // Persist initial profile with name and district via backend
      const profileRes = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name, district, preferredLanguage: 'en' }),
      });

      if (profileRes.ok) {
        const data = await profileRes.json();
        setToken(idToken);
        setUser(data.user);
        setEmailVerified(Boolean(res.user.emailVerified));
      } else {
        await verifyBackendProfile(res.user);
      }
    } catch (err) {
      console.error('[AuthContext] Registration failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await resetPasswordClient(email);
  };

  const sendVerificationEmail = async () => {
    if (auth?.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const logout = async () => {
    await signOutClient();
    setUser(null);
    setToken(null);
    setEmailVerified(false);
    setAuthError(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!token || !user) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update user profile.');
      }
    } catch (err) {
      console.error('[AuthContext] Update profile error:', err);
      throw err;
    }
  };

  const role: UserRole = user?.role || 'farmer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        isAdmin,
        isFirebaseReady: isFirebaseConfigured,
        emailVerified,
        authError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        sendVerificationEmail,
        retryAuth,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
