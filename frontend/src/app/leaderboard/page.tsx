'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Trophy, Medal, Flame, Award, Users, BookOpen, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  email: string;
  university: string;
  department: string;
  accuracy: number;
  questions: number;
  streak: number;
  tests_completed: number;
  is_current_user: boolean;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then((data) => {
        setLeaderboard(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load authentic leaderboard:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 mb-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Live Registered Student Rankings</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Competency Leaderboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Authentic accuracy and performance metrics for registered students across universities.
              </p>
            </div>

            <Link
              href="/practice"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors self-start sm:self-auto flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Practice & Rank Up</span>
            </Link>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-bold text-xs space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div>Loading real-time leaderboard statistics...</div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-12 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No Registered Students Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Take practice tests to establish your initial score and rank on the platform.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 w-16">Rank</th>
                      <th className="pb-3">Student</th>
                      <th className="pb-3">University</th>
                      <th className="pb-3">Accuracy</th>
                      <th className="pb-3">Questions</th>
                      <th className="pb-3 text-right">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {leaderboard.map((u) => (
                      <tr
                        key={u.user_id}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          u.is_current_user ? 'bg-indigo-50/70 font-bold text-indigo-950' : ''
                        }`}
                      >
                        <td className="py-4">
                          {u.rank === 1 ? (
                            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center shadow-xs border border-amber-200">
                              🥇
                            </div>
                          ) : u.rank === 2 ? (
                            <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 font-black flex items-center justify-center">
                              🥈
                            </div>
                          ) : u.rank === 3 ? (
                            <div className="w-7 h-7 rounded-xl bg-amber-700/20 text-amber-800 font-black flex items-center justify-center">
                              🥉
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold pl-2">{u.rank}</span>
                          )}
                        </td>
                        <td className="py-4 font-bold text-slate-900">
                          <div className="flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {u.is_current_user && (
                              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-black">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-slate-500">
                          <span className={u.university === 'University Not Set' ? 'italic text-slate-400' : 'font-medium'}>
                            {u.university}
                          </span>
                        </td>
                        <td className="py-4 font-black text-emerald-600">
                          {u.accuracy}%
                        </td>
                        <td className="py-4 text-slate-700">
                          <strong className="text-slate-900">{u.questions}</strong> Qs
                        </td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center space-x-1 text-amber-600 font-bold">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{u.streak}d</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
