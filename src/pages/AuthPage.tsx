import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SRI_LANKA_TEA_DISTRICTS } from '../constants/conditions';

interface AuthPageProps {
  navigate: (path: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ navigate, initialMode = 'login' }) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState(SRI_LANKA_TEA_DISTRICTS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await loginWithEmail(email, password);
      } else {
        if (!name || !email || !password) {
          throw new Error('Please fill in all required registration fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await registerWithEmail(email, password, name, district);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Google sign in error:', err);
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (role: 'farmer' | 'admin') => {
    switchDemoRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-0">
      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-900 text-emerald-100 flex items-center justify-center mx-auto shadow-sm">
            <Sprout className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            {mode === 'login' ? 'Welcome to CropLens AI' : 'Create Grower Account'}
          </h2>
          <p className="text-xs text-stone-500">
            {mode === 'login'
              ? 'Sign in to access your tea leaf screening records and farm history'
              : 'Register to start analyzing tea foliar conditions and save reports'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-stone-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400 absolute font-medium">
            or with email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunil Wickramasinghe"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 bg-white"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. grower@tea-estate.lk"
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 bg-white"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 bg-white"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">Primary Planting District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 bg-white"
              >
                {SRI_LANKA_TEA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        {/* Instant Demo Switcher for fast university review */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <div className="text-[11px] text-stone-500 text-center font-medium">
            Evaluation Quick Sign-In (Single Click):
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('farmer')}
              className="p-2 border border-stone-200 hover:border-emerald-500 rounded-xl text-left bg-stone-50 hover:bg-emerald-50/50 transition-colors"
            >
              <div className="font-bold text-stone-900">Sunil (Farmer)</div>
              <div className="text-[10px] text-stone-500">Nuwara Eliya grower</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2 border border-stone-200 hover:border-stone-900 rounded-xl text-left bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <div className="font-bold text-stone-900">Sanjaya (Admin)</div>
              <div className="text-[10px] text-stone-500">sanjayalasnan327@...</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
