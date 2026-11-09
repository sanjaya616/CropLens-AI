import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  ScanLine,
  LayoutDashboard,
  BookOpen,
  Database,
  ShieldCheck,
  LogOut,
  LogIn,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, role, isAdmin, logout, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/', icon: Sprout },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Condition Library', path: '/conditions', icon: BookOpen },
    { label: 'Dataset v5', path: '/dataset', icon: Database },
  ];

  if (isAdmin) {
    navLinks.push({ label: 'Admin Portal', path: '/admin', icon: ShieldCheck });
  }

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('/')}>
            <div className="w-10 h-10 rounded-lg bg-emerald-900 text-emerald-100 flex items-center justify-center shadow-sm">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-1.5">
                CropLens <span className="text-emerald-700">AI</span>
              </span>
              <span className="block text-[11px] font-medium text-stone-700 tracking-wide uppercase">
                Sri Lanka Tea Screening
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-stone-600">
            {navLinks.map((link) => {
              const active = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'text-emerald-900 bg-emerald-50 font-semibold'
                      : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-stone-400'}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Primary CTA: Scan Tea Leaf */}
            <button
              onClick={() => handleNav('/assessment/new')}
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <ScanLine className="w-4 h-4 text-emerald-300" />
              <span>Scan a Tea Leaf</span>
            </button>

            {/* Demo Role Switcher Toggle */}
            <div className="flex items-center border border-stone-200 rounded-md p-0.5 text-xs bg-stone-50">
              <button
                onClick={() => switchDemoRole('farmer')}
                title="Switch to Farmer Role"
                className={`px-2.5 py-1 rounded transition-colors ${
                  role === 'farmer'
                    ? 'bg-white text-emerald-900 font-semibold shadow-xs border border-stone-200'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Farmer
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                title="Switch to Admin Role"
                className={`px-2.5 py-1 rounded transition-colors ${
                  role === 'admin'
                    ? 'bg-stone-900 text-white font-semibold shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                TRI Admin
              </button>
            </div>

            {/* User status */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="text-right">
                  <div className="text-xs font-semibold text-stone-900 truncate max-w-[130px]">{user.name}</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider">{role}</div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-md hover:bg-stone-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('/login')}
                className="text-stone-600 hover:text-stone-900 text-sm font-medium px-3 py-1.5 flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => handleNav('/assessment/new')}
              className="bg-emerald-800 text-white p-2 rounded-md text-xs font-semibold flex items-center gap-1"
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const active = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-3 ${
                  active ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <link.icon className={`w-5 h-5 ${active ? 'text-emerald-700' : 'text-stone-400'}`} />
                {link.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-stone-200">
            <div className="text-xs text-stone-500 mb-2 font-medium">Demo Role Mode:</div>
            <div className="flex gap-2">
              <button
                onClick={() => switchDemoRole('farmer')}
                className={`flex-1 py-1.5 text-xs rounded border text-center ${
                  role === 'farmer' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'border-stone-200'
                }`}
              >
                Farmer
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className={`flex-1 py-1.5 text-xs rounded border text-center ${
                  role === 'admin' ? 'bg-stone-900 text-white font-semibold' : 'border-stone-200'
                }`}
              >
                TRI Admin
              </button>
            </div>
          </div>

          {user && (
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold text-stone-900">{user.name}</div>
                <div className="text-xs text-stone-500">{user.email}</div>
              </div>
              <button
                onClick={logout}
                className="text-stone-500 hover:text-stone-900 text-xs px-2.5 py-1.5 border border-stone-200 rounded"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
