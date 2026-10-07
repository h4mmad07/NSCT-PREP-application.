'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TestConfigModal from '@/components/TestConfigModal';
import OnboardingProfileModal from '@/components/OnboardingProfileModal';
import {
  Zap,
  Target,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Clock,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { api } from '@/lib/api';
import { OverviewAnalytics, ActiveTestSession, UserProfile } from '@/types';

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState('custom');
  const [analytics, setAnalytics] = useState<OverviewAnalytics | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveTestSession | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getMe().catch(() => null),
      api.getOverviewAnalytics().catch(() => null),
      api.getCurrentActiveSession().catch(() => null),
      api.getTestHistory().catch(() => [])
    ]).then(([userData, analyticsData, activeData, historyData]) => {
      if (userData) setCurrentUser(userData);
      if (analyticsData) setAnalytics(analyticsData);
      if (activeData) setActiveSession(activeData);
      if (historyData) setHistory(historyData);
      setLoading(false);
    });
  }, []);

  const openConfig = (mode: string) => {
    setInitialMode(mode);
    setModalOpen(true);
  };

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Student';
  const targetScore = currentUser?.profile?.target_score ?? analytics?.target_score ?? 80;
  const universityName = currentUser?.profile?.university;
  const semesterNum = currentUser?.profile?.semester;

  const needsOnboarding = !loading && currentUser && (!currentUser.profile?.university || !currentUser.profile?.department || !currentUser.profile?.semester) && !dismissedOnboarding;

  // Real stats with zero defaults for new users
  const accuracy = analytics?.overall_accuracy ?? 0;
  const questionsAttempted = analytics?.total_questions_attempted ?? 0;
  const questionsCorrect = analytics?.total_questions_correct ?? 0;
  const testsTaken = analytics?.total_tests_taken ?? 0;
  const streakDays = analytics?.current_streak_days ?? (testsTaken > 0 ? 1 : 0);
  const studyMinutes = analytics?.total_study_minutes ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Top Greeting & Goal Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-6 rounded-3xl shadow-xl shadow-indigo-100">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-100 mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Preparation Streak: {streakDays} {streakDays === 1 ? 'Day' : 'Days'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Good day, {firstName} 👋
              </h1>
              <p className="text-sm text-indigo-100/90 mt-1 max-w-xl">
                {universityName ? (
                  <>
                    <strong className="text-white">{universityName}</strong>
                    {semesterNum ? ` (Semester ${semesterNum})` : ''} • Target Score: <strong className="text-white">{targetScore}%</strong>
                  </>
                ) : (
                  <>
                    You are preparing for the official NSCT. Target score: <strong className="text-white">{targetScore}%</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => openConfig('quick')}
                className="px-5 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span>Quick Practice</span>
              </button>

              <button
                onClick={() => openConfig('full_mock')}
                className="px-5 py-3 bg-indigo-500/30 hover:bg-indigo-500/40 border border-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Mock Test</span>
              </button>
            </div>
          </div>

          {/* Active Session Resumption Banner */}
          {activeSession && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg shadow-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-100">Unfinished Test in Progress</div>
                  <div className="text-base font-black">{activeSession.title} ({activeSession.question_count} Questions)</div>
                </div>
              </div>

              <Link
                href={`/test/${activeSession.id}`}
                className="px-5 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-2 shrink-0"
              >
                <span>Resume Test</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* 4 Key Stat Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">{accuracy}%</span>
                {questionsAttempted > 0 && (
                  <span className="text-xs font-semibold text-emerald-600">Active</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Target: {targetScore}%</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">{questionsAttempted}</span>
                <span className="text-xs font-semibold text-slate-400">attempted</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{questionsCorrect} answered correctly</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tests Taken</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">{testsTaken}</span>
                <span className="text-xs font-semibold text-blue-600">sessions</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Full mocks & practice</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Study Streak</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-amber-500" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">{streakDays}</span>
                <span className="text-xs font-semibold text-amber-600">{streakDays === 1 ? 'day active' : 'days active'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{studyMinutes} mins total practice</p>
            </div>
          </div>

          {/* Competency Breakdown & Weak Area Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Competency Mastery Breakdown</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your mastery across all 10 official NSCT subject domains</p>
                </div>
                <Link href="/subjects" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
                  <span>View All Topics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 pt-2">
                {(analytics?.subjects || []).map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="truncate pr-2">{s.subject_name} ({s.weight_percentage}%)</span>
                      <span className="font-bold">{s.accuracy}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          s.accuracy >= 75 ? 'bg-emerald-500' : s.accuracy > 0 ? 'bg-amber-500' : 'bg-slate-200'
                        }`}
                        style={{ width: `${Math.max(2, s.accuracy)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas Card */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-amber-900 font-black text-base">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Weak Area Engine</span>
                </div>
                <p className="text-xs text-amber-800/80 mt-1">
                  Topics where accuracy is below 70% with attempt volume:
                </p>

                {analytics?.top_weak_areas && analytics.top_weak_areas.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {analytics.top_weak_areas.map((w, i) => (
                      <div key={i} className="bg-white/90 p-2.5 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{w.topic_name}</span>
                          <span className="text-[10px] font-semibold text-amber-700">{w.accuracy}% Accuracy ({w.questions_attempted} Qs)</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          {w.priority_level}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 p-5 bg-white/70 rounded-2xl border border-amber-200/60 text-center space-y-2">
                    <Sparkles className="w-5 h-5 text-amber-600 mx-auto" />
                    <p className="text-xs font-bold text-amber-950">No Weak Areas Identified Yet</p>
                    <p className="text-[11px] text-slate-500">
                      Complete your first practice test. The system will automatically diagnose areas needing improvement.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => openConfig(analytics?.top_weak_areas && analytics.top_weak_areas.length > 0 ? 'weak_areas' : 'quick')}
                className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>{analytics?.top_weak_areas && analytics.top_weak_areas.length > 0 ? 'Practice Weak Areas Test' : 'Take Diagnostic Test'}</span>
              </button>
            </div>
          </div>

          {/* Recent Test Sessions Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Recent Test History</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your past mock exams and practice performance</p>
              </div>
              <button
                onClick={() => openConfig('custom')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                New Custom Test
              </button>
            </div>

            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Test Title</th>
                      <th className="pb-3">Mode</th>
                      <th className="pb-3">Questions</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Accuracy</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {history.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900">{t.title}</td>
                        <td className="py-3.5">
                          <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-600">
                            {t.mode?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5">{t.question_count} Qs</td>
                        <td className="py-3.5 font-bold">{t.score} / {t.question_count}</td>
                        <td className="py-3.5">
                          <span className={`font-bold ${t.accuracy >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {t.accuracy}%
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            href={`/results/${t.id}`}
                            className="font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            View Results →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No Tests Taken Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Take your first practice or full NSCT mock test. Your test results, scores, and analytics will be tracked here.
                </p>
                <button
                  onClick={() => openConfig('full_mock')}
                  className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Start Your First Test
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {needsOnboarding && currentUser && (
        <OnboardingProfileModal
          currentUser={currentUser}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            setDismissedOnboarding(true);
          }}
          onClose={() => setDismissedOnboarding(true)}
        />
      )}

      <TestConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={initialMode}
      />
    </div>
  );
}
