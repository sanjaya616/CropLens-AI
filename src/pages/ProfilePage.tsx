import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SRI_LANKA_TEA_DISTRICTS } from '../constants/conditions';
import { User, MapPin, Globe, Save, CheckCircle2, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, token, role, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [district, setDistrict] = useState(user?.district || SRI_LANKA_TEA_DISTRICTS[0]);
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'si' | 'ta'>(
    user?.preferredLanguage || 'en'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-3">
          <User className="w-10 h-10 text-stone-400 mx-auto" />
          <h2 className="text-lg font-bold text-stone-900">Sign In Required</h2>
          <p className="text-xs text-stone-600">Please sign in to view and manage your grower profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        district,
        preferredLanguage,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[ProfilePage] Save error:', err);
      setError('Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6 px-4 sm:px-0">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-800" />
            <span>Grower Profile & Preferences</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your regional planting district, interface language, and account details.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Profile successfully updated and saved in Firestore.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email (Readonly) */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 block">Registered Email Address</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-stone-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-stone-400">Authenticated with Firebase UID: {user.uid}</span>
          </div>

          {/* Role badge */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 block">System Role</label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>{role === 'admin' ? 'Administrator' : 'Tea Grower'}</span>
              </span>
              <span className="text-[11px] text-stone-400">Verified server-side</span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 block">Grower / User Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500/50 bg-white"
              required
            />
          </div>

          {/* Planting District */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Primary Tea Planting District (Sri Lanka)</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500/50 bg-white"
            >
              {SRI_LANKA_TEA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Language */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 block flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>Preferred Language</span>
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'si' | 'ta')}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500/50 bg-white"
            >
              <option value="en">English (Current default)</option>
              <option value="si">Sinhala (Structured for translation)</option>
              <option value="ta">Tamil (Structured for translation)</option>
            </select>
            <span className="text-[10px] text-stone-400">
              Application is English-first; translations will be published following verified review.
            </span>
          </div>

          <div className="pt-3 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
