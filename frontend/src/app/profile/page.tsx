'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { User, Target, Building, BookOpen, Clock, Save } from 'lucide-react';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    university: '',
    department: '',
    semester: 1,
    graduation_year: 2026,
    target_score: 80,
    preparation_goal: 'pass_nsct',
    daily_study_target_minutes: 30,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getMe().then((u: any) => {
      if (u) {
        setProfile({
          name: u.name || '',
          email: u.email || '',
          university: u.profile?.university || '',
          department: u.profile?.department || '',
          semester: u.profile?.semester || 1,
          graduation_year: u.profile?.graduation_year || 2026,
          target_score: u.profile?.target_score || 80,
          preparation_goal: u.profile?.preparation_goal || 'pass_nsct',
          daily_study_target_minutes: u.profile?.daily_study_target_minutes || 30,
        });
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Profile & Goals</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your academic background, target NSCT score, and daily practice goals.
            </p>
          </div>

          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
            {saved && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl">
                Profile updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  disabled
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Email</label>
                <input
                  type="text"
                  value={profile.email}
                  disabled
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">University</label>
                <input
                  type="text"
                  value={profile.university}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Department</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Semester</label>
                <input
                  type="number"
                  value={profile.semester}
                  onChange={(e) => setProfile({ ...profile, semester: parseInt(e.target.value) || 1 })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Target NSCT Score (%)</label>
                <input
                  type="number"
                  value={profile.target_score}
                  onChange={(e) => setProfile({ ...profile, target_score: parseInt(e.target.value) || 80 })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  api.logout();
                  window.location.href = '/auth';
                }}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-colors"
              >
                Log Out of Account
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
