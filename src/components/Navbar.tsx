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
  User,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, role, isAdmin, logout } = useAuth();
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
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
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

            {/* User status */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-stone-200">
                <button
                  onClick={() => handleNav('/profile')}
                  className="text-right hover:opacity-80 transition-opacity cursor-pointer"
                  title="View Profile"
                >
                  <div className="text-xs font-semibold text-stone-900 truncate max-w-[140px] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{user.name}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                    {role === 'admin' ? 'TRI Administrator' : 'Tea Grower'}
                  </div>
                </button>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="text-stone-700 hover:text-stone-900 text-sm font-semibold px-3 py-1.5 rounded-md hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3.5 py-2 rounded-md transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
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
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md cursor-pointer"
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
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-3 cursor-pointer ${
                  active ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <link.icon className={`w-5 h-5 ${active ? 'text-emerald-700' : 'text-stone-400'}`} />
                {link.label}
              </button>
            );
          })}

          {user ? (
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-sm">
              <button onClick={() => handleNav('/profile')} className="text-left cursor-pointer">
                <div className="font-semibold text-stone-900">{user.name}</div>
                <div className="text-xs text-stone-500">{user.email} · {role}</div>
              </button>
              <button
                onClick={logout}
                className="text-stone-500 hover:text-stone-900 text-xs px-2.5 py-1.5 border border-stone-200 rounded cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-stone-200 flex gap-2">
              <button
                onClick={() => handleNav('/login')}
                className="flex-1 py-2 text-xs font-semibold border border-stone-200 rounded-md text-stone-800"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="flex-1 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-md"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
