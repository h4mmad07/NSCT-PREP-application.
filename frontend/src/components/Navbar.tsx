'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Target,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Settings,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role?: string;
  };
}

export default function Navbar({ user: initialUser }: NavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role?: string }>(
    initialUser || { name: 'Student', email: '', role: 'student' }
  );
  const [stats, setStats] = useState<{ streak: number; target: number }>({ streak: 0, target: 80 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nsct_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
      }
    } catch {
      // ignore
    }

    // Refresh user profile and live stats dynamically from server
    if (api.getToken()) {
      api.getMe().then((freshUser) => {
        if (freshUser) {
          setCurrentUser(freshUser);
        }
      }).catch(() => {});

      api.getOverviewAnalytics().then((ov) => {
        if (ov) {
          setStats({
            streak: ov.current_streak_days ?? (ov.total_tests_taken > 0 ? 1 : 0),
            target: ov.target_score ?? 80
          });
        }
      }).catch(() => {});
    }
  }, [initialUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    api.logout();
    router.push('/auth');
  };

  const displayName = currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Student');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
                N
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  NSCT <span className="text-indigo-600">PREP</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Competency Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Stats Bar */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-900">
                {stats.streak} {stats.streak === 1 ? 'Day Streak' : 'Days Streak'}
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200/60 px-3 py-1.5 rounded-full">
              <Target className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">Target: {stats.target}%</span>
            </div>
          </div>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-3">
            <Link
              href="/practice"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              Start Practice
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    {displayName}
                  </span>
                  <span className={`text-[10px] font-bold ${isAdmin ? 'text-indigo-600 uppercase tracking-wider' : 'text-slate-400 capitalize'}`}>
                    {isAdmin ? 'Administrator' : 'Student'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Modal */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isAdmin ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'}`}>
                      {isAdmin ? 'Super Admin' : 'Student'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Profile & Goals</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
