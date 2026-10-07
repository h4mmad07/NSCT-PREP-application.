'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  Eye,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { TestResult } from '@/types';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    api.getTestResult(sessionId)
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [sessionId]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Calculating Results & Analytics...</p>
        </div>
      </div>
    );
  }

  const isPassing = result.accuracy >= 70;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Header Result Hero */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Session Completed</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{result.title}</h1>
                <p className="text-xs text-slate-500">{result.recommendation}</p>
              </div>

              {/* Score Badge */}
              <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 p-5 rounded-2xl">
                <div className="text-center">
                  <div className="text-3xl font-black text-slate-900">{result.score} / {result.question_count}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Score</div>
                </div>
                <div className="h-10 w-[1px] bg-slate-200" />
                <div className="text-center">
                  <div className={`text-3xl font-black ${isPassing ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {result.accuracy}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Accuracy</div>
                </div>
              </div>
            </div>

            {/* 4 Stat Breakdown Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block">{result.total_correct}</span>
                  <span className="text-xs font-semibold text-slate-500">Correct Answers</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block">{result.total_wrong}</span>
                  <span className="text-xs font-semibold text-slate-500">Incorrect Answers</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block">{result.total_unanswered}</span>
                  <span className="text-xs font-semibold text-slate-500">Unanswered</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 block">{formatDuration(result.time_spent_seconds)}</span>
                  <span className="text-xs font-semibold text-slate-500">Time Taken</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/review/${sessionId}`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Review Detailed Answers & Explanations</span>
            </Link>

            {result.total_wrong > 0 && (
              <Link
                href="/practice?mode=mistakes"
                className="px-6 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Mistakes ({result.total_wrong})</span>
              </Link>
            )}

            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Subject & Topic Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900">Subject Competency Performance</h2>
              <div className="space-y-3">
                {result.subject_breakdown.map((s) => (
                  <div key={s.subject_id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{s.subject_name}</span>
                      <span className="font-bold">{s.correct} / {s.total_questions} ({s.accuracy}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.accuracy >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.max(5, s.accuracy)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900">Topic Performance Breakdown</h2>
              <div className="space-y-3">
                {result.topic_breakdown.map((t) => (
                  <div key={t.topic_id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{t.topic_name}</span>
                      <span className="font-bold">{t.correct} / {t.total_questions} ({t.accuracy}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${t.accuracy >= 70 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.max(5, t.accuracy)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
