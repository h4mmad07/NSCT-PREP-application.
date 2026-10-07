'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlayCircle,
  Layers,
  AlertTriangle,
  RotateCcw,
  Bookmark,
  BarChart3,
  Trophy,
  User,
  ShieldAlert
} from 'lucide-react';

const BASE_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Practice Hub', href: '/practice', icon: PlayCircle },
  { label: 'Subjects & Topics', href: '/subjects', icon: Layers },
  { label: 'Weak Areas', href: '/weak-areas', icon: AlertTriangle },
  { label: 'Mistake Notebook', href: '/mistakes', icon: RotateCcw },
  { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Profile & Goals', href: '/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('nsct_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin' || user.role === 'super_admin') {
          setIsAdmin(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const navItems = isAdmin 
    ? [...BASE_NAV_ITEMS, { label: 'Admin Panel', href: '/admin', icon: ShieldAlert }]
    : BASE_NAV_ITEMS;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Preparation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
        <div className="text-xs font-bold text-slate-800">NSCT Exam Simulation</div>
        <p className="text-xs text-slate-500 mt-1">100 Questions • Proportional weights • Timed</p>
        <Link
          href="/practice?mode=full_mock"
          className="mt-3 block w-full text-center py-2 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow transition-colors"
        >
          Launch Full Mock
        </Link>
      </div>
    </aside>
  );
}
