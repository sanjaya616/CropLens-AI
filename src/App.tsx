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

function AppContent() {
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

  // Parse path and params
  const renderPage = () => {
    // Assessment result route: /assessment/:id
    if (currentPath.startsWith('/assessment/') && currentPath !== '/assessment/new') {
      const parts = currentPath.split('/');
      const id = parts[2];
      return <AssessmentResultPage assessmentId={id} navigate={navigate} />;
    }

    // New Assessment
    if (currentPath === '/assessment/new') {
      return <NewAssessmentPage navigate={navigate} />;
    }

    // Dashboard
    if (currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }

    // Auth routes
    if (currentPath === '/login') {
      return <AuthPage navigate={navigate} initialMode="login" />;
    }
    if (currentPath === '/register') {
      return <AuthPage navigate={navigate} initialMode="register" />;
    }

    // Condition library
    if (currentPath.startsWith('/conditions')) {
      const urlParams = new URLSearchParams(window.location.search);
      const selectedId = urlParams.get('id') || undefined;
      return <ConditionLibraryPage navigate={navigate} selectedId={selectedId} />;
    }

    // Admin portal
    if (currentPath === '/admin') {
      return <AdminDashboardPage navigate={navigate} />;
    }

    // Dataset v5 documentation
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
