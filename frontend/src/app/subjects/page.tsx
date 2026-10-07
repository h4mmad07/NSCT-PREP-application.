'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TestConfigModal from '@/components/TestConfigModal';
import {
  Layers,
  ChevronRight,
  Play,
  Brain,
  Code,
  Binary,
  Cpu,
  GitBranch,
  Globe,
  Sparkles,
  ShieldCheck,
  Database,
  Network
} from 'lucide-react';
import { api } from '@/lib/api';
import { Subject } from '@/types';

const ICON_MAP: Record<string, any> = {
  brain: Brain,
  code: Code,
  'binary-tree': Binary,
  cpu: Cpu,
  'git-branch': GitBranch,
  globe: Globe,
  sparkles: Sparkles,
  'shield-check': ShieldCheck,
  database: Database,
  network: Network,
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | undefined>();

  useEffect(() => {
    api.getSubjects()
      .then((data) => {
        setSubjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePracticeSubject = (e: React.MouseEvent, subjectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSubjectId(subjectId);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">NSCT Competency Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              All 10 official subjects and 150+ subtopics with examination percentage weightages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subjects.map((s) => {
              const Icon = ICON_MAP[s.icon || 'brain'] || Layers;
              const accuracy = s.accuracy || 0;

              return (
                <div
                  key={s.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 line-clamp-1">{s.name}</h3>
                          <span className="text-xs font-semibold text-slate-400">
                            {s.questions_count || 25}+ Practice Questions
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shrink-0">
                        {s.weight_percentage}% Weight
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {s.description || 'Master this competency area according to official NSCT curriculum.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Mastery Accuracy</span>
                        <span className="font-bold">{accuracy}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            accuracy >= 75 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.max(5, accuracy)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href={`/subjects/${s.slug}`}
                      className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center transition-colors"
                    >
                      View Subtopics
                    </Link>

                    <button
                      onClick={(e) => handlePracticeSubject(e, s.id)}
                      className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Practice</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <TestConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialSubjectId={activeSubjectId}
        initialMode="subject"
      />
    </div>
  );
}
