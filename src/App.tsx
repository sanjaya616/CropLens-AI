import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewAssessmentPage } from './pages/NewAssessmentPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { ConditionLibraryPage } from './pages/ConditionLibraryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DatasetDocumentationPage } from './pages/DatasetDocumentationPage';
import { ProfilePage } from './pages/ProfilePage';
import { PrivacyPage } from './pages/PrivacyPage';

import { Lock, ShieldAlert, Loader2 } from 'lucide-react';

function ProtectedLoading() {
  return (
    <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-emerald-800 animate-spin" />
      <span className="text-xs text-stone-500 font-medium">Verifying grower credentials...</span>
    </div>
  );
}

function SignInPrompt({ navigate, featureName }: { navigate: (path: string) => void; featureName: string }) {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Sign In Required</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Accessing {featureName} requires an authenticated tea grower account to securely protect your plantation records.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            Sign In with Email
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Register as Tea Grower
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminAccessDenied({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Administrator Authorization Required</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          The administrator control portal is restricted to authorized Tea Research Institute staff and application administrators.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isLoading, isAdmin } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Parse path and params with route protection
  const renderPage = () => {
    // Protected: Assessment result route: /assessment/:id
    if (currentPath.startsWith('/assessment/') && currentPath !== '/assessment/new') {
      if (isLoading) return <ProtectedLoading />;
      if (!user) return <SignInPrompt navigate={navigate} featureName="assessment results" />;
      const parts = currentPath.split('/');
      const id = parts[2];
      return <AssessmentResultPage assessmentId={id} navigate={navigate} />;
    }

    // Protected: New Assessment
    if (currentPath === '/assessment/new') {
      if (isLoading) return <ProtectedLoading />;
      if (!user) return <SignInPrompt navigate={navigate} featureName="leaf screening" />;
      return <NewAssessmentPage navigate={navigate} />;
    }

    // Protected: Dashboard
    if (currentPath === '/dashboard') {
      if (isLoading) return <ProtectedLoading />;
      if (!user) return <SignInPrompt navigate={navigate} featureName="plantation dashboard" />;
      return <DashboardPage navigate={navigate} />;
    }

    // Protected: Profile
    if (currentPath === '/profile') {
      if (isLoading) return <ProtectedLoading />;
      if (!user) return <SignInPrompt navigate={navigate} featureName="user profile" />;
      return <ProfilePage navigate={navigate} />;
    }

    // Privacy & Data Governance (Public)
    if (currentPath === '/privacy') {
      return <PrivacyPage navigate={navigate} />;
    }

    // Auth routes (Public)
    if (currentPath === '/login') {
      return <AuthPage navigate={navigate} initialMode="login" />;
    }
    if (currentPath === '/register') {
      return <AuthPage navigate={navigate} initialMode="register" />;
    }
    if (currentPath === '/forgot-password') {
      return <AuthPage navigate={navigate} initialMode="forgot" />;
    }

    // Condition library (Public)
    if (currentPath.startsWith('/conditions')) {
      const urlParams = new URLSearchParams(window.location.search);
      const selectedId = urlParams.get('id') || undefined;
      return <ConditionLibraryPage navigate={navigate} selectedId={selectedId} />;
    }

    // Admin portal (Protected: Admin only)
    if (currentPath === '/admin') {
      if (isLoading) return <ProtectedLoading />;
      if (!isAdmin) return <AdminAccessDenied navigate={navigate} />;
      return <AdminDashboardPage navigate={navigate} />;
    }

    // Dataset v5 documentation (Public)
    if (currentPath === '/dataset') {
      return <DatasetDocumentationPage navigate={navigate} />;
    }

    // Default Home
    return <HomePage navigate={navigate} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
