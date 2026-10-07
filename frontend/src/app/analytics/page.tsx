'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Clock,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';
import { OverviewAnalytics } from '@/types';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<OverviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOverviewAnalytics()
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">
              Comprehensive breakdown of competency accuracy, question volume, and study metrics.
            </p>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Accuracy</span>
              <div className="mt-2 text-3xl font-black text-slate-900">{analytics?.overall_accuracy ?? 0}%</div>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Target: {analytics?.target_score ?? 80}%</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</span>
              <div className="mt-2 text-3xl font-black text-slate-900">{analytics?.total_questions_attempted ?? 0}</div>
              <p className="text-xs text-slate-500 font-semibold mt-1">{analytics?.total_questions_correct ?? 0} correct</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tests</span>
              <div className="mt-2 text-3xl font-black text-slate-900">{analytics?.total_tests_taken ?? 0}</div>
              <p className="text-xs text-slate-500 font-semibold mt-1">Completed sessions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Study Time</span>
              <div className="mt-2 text-3xl font-black text-slate-900">{analytics?.total_study_minutes ?? 0}m</div>
              <p className="text-xs text-amber-600 font-semibold mt-1">
                {analytics?.current_streak_days ?? (analytics?.total_tests_taken ? 1 : 0)}-day active streak 🔥
              </p>
            </div>
          </div>

          {/* Subject Mastery Performance Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900">Subject Competency Mastery</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Competency Area</th>
                    <th className="pb-3">NSCT Weight</th>
                    <th className="pb-3">Attempted</th>
                    <th className="pb-3">Correct</th>
                    <th className="pb-3">Accuracy</th>
                    <th className="pb-3 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {(analytics?.subjects || []).map((s) => (
                    <tr key={s.subject_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">{s.subject_name}</td>
                      <td className="py-3.5 font-bold text-indigo-600">{s.weight_percentage}%</td>
                      <td className="py-3.5">{s.questions_attempted} Qs</td>
                      <td className="py-3.5">{s.questions_correct} Qs</td>
                      <td className="py-3.5 font-bold">
                        <span className={s.accuracy >= 75 ? 'text-emerald-600' : 'text-amber-600'}>
                          {s.accuracy}%
                        </span>
                      </td>
                      <td className="py-3.5 text-right w-36">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.accuracy >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.max(5, s.accuracy)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
