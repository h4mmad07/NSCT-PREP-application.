'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TestConfigModal from '@/components/TestConfigModal';
import {
  RotateCcw,
  Play,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

export default function MistakesPage() {
  const [mistakesData, setMistakesData] = useState<any>({ total_mistakes: 0, mistakes: [] });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.getMistakes()
      .then((data) => {
        setMistakesData(data);
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
          {/* Header Hero */}
          <div className="bg-purple-500/10 border border-purple-200/80 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold shadow-sm">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Automated Revision Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Mistake Notebook</h1>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Every question you miss during practice tests is logged here automatically so you can target and eliminate conceptual gaps.
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-200 transition-colors flex items-center space-x-2 shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Practice My Mistakes ({mistakesData.total_mistakes || 0})</span>
            </button>
          </div>

          {/* Mistakes Feed */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">Recorded Incorrect Questions</h2>

            {mistakesData.mistakes?.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Recorded Mistakes!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Take a practice test or mock exam. Any questions answered incorrectly will automatically be collected here for focused revision.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mistakesData.mistakes?.map((m: any, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full">
                          {m.subject_name}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-full">
                          {m.topic_name}
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase rounded-md border border-slate-200">
                          {m.difficulty}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-relaxed">
                      {m.question_text}
                    </h3>

                    {m.explanation && (
                      <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-1">
                        <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                          Explanation Note
                        </span>
                        <p className="text-xs text-purple-950/90 leading-relaxed">
                          {m.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <TestConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode="mistakes"
      />
    </div>
  );
}
