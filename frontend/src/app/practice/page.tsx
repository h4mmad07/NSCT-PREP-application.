'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TestConfigModal from '@/components/TestConfigModal';
import {
  Zap,
  BookOpen,
  Layers,
  Shuffle,
  AlertTriangle,
  RotateCcw,
  Flame,
  Sliders,
  Award,
  ArrowRight
} from 'lucide-react';

const PRACTICE_MODES = [
  {
    id: 'quick',
    title: 'Quick Practice',
    desc: 'Rapid 10-question practice test with mixed difficulty and instant feedback.',
    icon: Zap,
    badge: 'Fast',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200'
  },
  {
    id: 'subject',
    title: 'Subject Practice',
    desc: 'Target one specific NSCT competency (e.g. DSA, Databases, Networks).',
    icon: BookOpen,
    badge: 'Targeted',
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200'
  },
  {
    id: 'topic',
    title: 'Topic Practice',
    desc: 'Drill down into a subtopic (e.g. Normalization, Graph BFS, CPU Scheduling).',
    icon: Layers,
    badge: 'Granular',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200'
  },
  {
    id: 'mixed',
    title: 'Mixed Practice',
    desc: 'Select 2 to 5 subjects; engine distributes questions dynamically.',
    icon: Shuffle,
    badge: 'Multi-Subject',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
  },
  {
    id: 'weak_areas',
    title: 'Weak Areas Engine',
    desc: 'Automatically targets topics where your accuracy is below 65%.',
    icon: AlertTriangle,
    badge: 'Adaptive',
    color: 'bg-rose-500/10 text-rose-600 border-rose-200'
  },
  {
    id: 'mistakes',
    title: 'Mistake Practice',
    desc: 'Retry questions you answered incorrectly in past test sessions.',
    icon: RotateCcw,
    badge: 'Revision',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200'
  },
  {
    id: 'challenge',
    title: 'Challenge Mode',
    desc: 'High-difficulty conceptual and code output questions only.',
    icon: Flame,
    badge: 'Hard Only',
    color: 'bg-orange-500/10 text-orange-600 border-orange-200'
  },
  {
    id: 'full_mock',
    title: 'Full NSCT Simulation',
    desc: '100 questions distributed according to official percentage weights.',
    icon: Award,
    badge: 'Official Simulation',
    color: 'bg-slate-900 text-white border-slate-900'
  },
  {
    id: 'custom',
    title: 'Custom Test Builder',
    desc: 'Full control over subjects, topics, time limits, question counts & rules.',
    icon: Sliders,
    badge: 'Customizable',
    color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200'
  },
];

export default function PracticeHubPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('custom');

  const handleLaunch = (modeId: string) => {
    setSelectedMode(modeId);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Practice Hub</h1>
            <p className="text-sm text-slate-500 mt-1">
              Choose from 9 specialized preparation modes powered by the dynamic test generation engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRACTICE_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <div
                  key={mode.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl border ${mode.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {mode.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{mode.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{mode.desc}</p>
                  </div>

                  <button
                    onClick={() => handleLaunch(mode.id)}
                    className="mt-6 w-full py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Configure & Start</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <TestConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={selectedMode}
      />
    </div>
  );
}
