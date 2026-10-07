'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TestConfigModal from '@/components/TestConfigModal';
import {
  AlertTriangle,
  Zap,
  Target,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '@/lib/api';
import { WeakAreaItem } from '@/types';

export default function WeakAreasPage() {
  const [weakAreas, setWeakAreas] = useState<WeakAreaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.getWeakAreas()
      .then((data) => {
        setWeakAreas(data || []);
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
          <div className="bg-amber-500/10 border border-amber-200/80 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Weak Area Diagnostic Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Your Focus Areas</h1>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Ranked automatically using the Weakness Formula: (100 - Accuracy) × ln(Attempts + 1). Target these topics to maximize your overall NSCT score.
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-amber-200 transition-colors flex items-center space-x-2 shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>{weakAreas.length > 0 ? 'Generate Weak Area Test' : 'Take Diagnostic Test'}</span>
            </button>
          </div>

          {/* Weak Topics List */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">Ranked Priority Topics</h2>

            {weakAreas.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Weak Areas Identified Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Start by completing practice questions or full NSCT mock exams. Our adaptive analytics engine will automatically identify and rank your weak topics here.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Start Practice Test
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {weakAreas.map((item, idx) => {
                  let badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                  if (item.priority_level === 'Critical') badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
                  else if (item.priority_level === 'High') badgeColor = 'bg-orange-100 text-orange-800 border-orange-200';

                  return (
                    <div
                      key={item.topic_id}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h3 className="text-base font-black text-slate-900">{item.topic_name}</h3>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                            {item.priority_level}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-400 pl-8">
                          Subject: <span className="text-slate-700">{item.subject_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 pl-8 md:pl-0">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
                          <span className="text-base font-black text-rose-600">{item.accuracy}%</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attempts</span>
                          <span className="text-base font-black text-slate-900">{item.questions_attempted} Qs</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weakness Score</span>
                          <span className="text-base font-black text-amber-600">{item.weakness_score.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <TestConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode="weak_areas"
      />
    </div>
  );
}
