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
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: UserRole;
  isLoading: boolean;
  isAdmin: boolean;
  isFirebaseReady: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, district?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Application starts with NO authenticated user by default (strictly per Priority 1)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize authenticated session from Firebase Auth
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          setToken(idToken);

          // Fetch server-verified profile and role from backend
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Fallback basic profile until server responds
            setUser({
              uid: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Tea Grower',
              email: fbUser.email || `${fbUser.uid}@croplens.lk`,
              role: 'farmer',
              preferredLanguage: 'en',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error('[AuthContext] Failed to retrieve user session profile:', err);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithGoogleClient();
      const idToken = await res.user.getIdToken();
      setToken(idToken);

      const profileRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('[AuthContext] Google sign in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailClient(email, pass);
      const idToken = await res.user.getIdToken();
      setToken(idToken);

      const profileRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('[AuthContext] Email sign in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, district?: string) => {
    setIsLoading(true);
    try {
      const res = await registerWithEmailClient(email, pass);
      const idToken = await res.user.getIdToken();
      setToken(idToken);

      // Persist profile with name and district via backend
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
        setUser(data.user);
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

  const logout = async () => {
    await signOutClient();
    setUser(null);
    setToken(null);
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
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
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
