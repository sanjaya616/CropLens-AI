import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  auth,
  signInWithGoogleClient,
  signInWithEmailClient,
  registerWithEmailClient,
  signOutClient,
} from '../services/firebaseClient';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: UserRole;
  isLoading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, district?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_FARMER: UserProfile = {
  uid: 'user-farmer-01',
  name: 'Sunil Wickramasinghe',
  email: 'farmer.sunil@croplens.lk',
  role: 'farmer',
  preferredLanguage: 'en',
  district: 'Nuwara Eliya (Up-Country High Grown)',
  createdAt: '2025-01-10T08:00:00.000Z',
};

const DEMO_ADMIN: UserProfile = {
  uid: 'user-admin-01',
  name: 'Sanjaya Lasnan (TRI Admin)',
  email: 'sanjayalasnan327@gmail.com',
  role: 'admin',
  preferredLanguage: 'en',
  district: 'Kandy (Mid-Country)',
  createdAt: '2025-01-01T08:00:00.000Z',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('croplens_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_FARMER;
      }
    }
    return DEMO_FARMER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('croplens_token') || 'demo-token-user-farmer-01';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('croplens_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('croplens_user');
    }
    if (token) {
      localStorage.setItem('croplens_token', token);
    } else {
      localStorage.removeItem('croplens_token');
    }
  }, [user, token]);

  // Listen to Firebase auth changes if auth is initialized
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        const isAdmin = fbUser.email === 'sanjayalasnan327@gmail.com' || fbUser.email?.includes('admin');
        const profile: UserProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Tea Grower',
          email: fbUser.email || `${fbUser.uid}@croplens.lk`,
          role: isAdmin ? 'admin' : 'farmer',
          preferredLanguage: 'en',
          createdAt: new Date().toISOString(),
        };
        setUser(profile);
        setToken(idToken);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithGoogleClient();
      const idToken = await res.user.getIdToken();
      const isAdmin =
        res.user.email?.toLowerCase() === 'sanjayalasnan327@gmail.com' ||
        res.user.email?.toLowerCase().includes('admin');

      const profile: UserProfile = {
        uid: res.user.uid,
        name: res.user.displayName || res.user.email?.split('@')[0] || 'Tea Grower',
        email: res.user.email || `${res.user.uid}@croplens.lk`,
        role: isAdmin ? 'admin' : 'farmer',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      };

      setUser(profile);
      setToken(idToken);
    } catch (err) {
      console.error('Google Sign In failed:', err);
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
      const isAdmin =
        res.user.email?.toLowerCase() === 'sanjayalasnan327@gmail.com' ||
        res.user.email?.toLowerCase().includes('admin');

      const profile: UserProfile = {
        uid: res.user.uid,
        name: res.user.displayName || res.user.email?.split('@')[0] || 'Tea Grower',
        email: res.user.email || `${res.user.uid}@croplens.lk`,
        role: isAdmin ? 'admin' : 'farmer',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      };

      setUser(profile);
      setToken(idToken);
    } catch (err) {
      console.error('Email sign in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, district?: string) => {
    setIsLoading(true);
    try {
      const res = await registerWithEmailClient(email, pass, name);
      const idToken = await res.user.getIdToken();
      const isAdmin =
        email.toLowerCase() === 'sanjayalasnan327@gmail.com' || email.toLowerCase().includes('admin');

      const profile: UserProfile = {
        uid: res.user.uid,
        name: name || res.user.displayName || email.split('@')[0],
        email: res.user.email || email,
        role: isAdmin ? 'admin' : 'farmer',
        preferredLanguage: 'en',
        district,
        createdAt: new Date().toISOString(),
      };

      setUser(profile);
      setToken(idToken);
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOutClient();
    setUser(null);
    setToken(null);
  };

  const switchDemoRole = (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      setUser(DEMO_ADMIN);
      setToken('demo-token-user-admin-01');
    } else {
      setUser(DEMO_FARMER);
      setToken('demo-token-user-farmer-01');
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('Profile sync failed:', err);
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
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        switchDemoRole,
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
