'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Play, Clock, HelpCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Subject, Topic } from '@/types';
import { api } from '@/lib/api';

interface TestConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: string;
  initialSubjectId?: string;
  initialTopicId?: string;
}

export default function TestConfigModal({
  isOpen,
  onClose,
  initialMode = 'custom',
  initialSubjectId,
  initialTopicId,
}: TestConfigModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Test Config state
  const [mode, setMode] = useState(initialMode);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSubjectId ? [initialSubjectId] : []);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialTopicId ? [initialTopicId] : []);
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);

  useEffect(() => {
    if (isOpen) {
      api.getSubjects().then((data) => {
        setSubjects(data);
        if (initialSubjectId && !selectedSubjects.includes(initialSubjectId)) {
          setSelectedSubjects([initialSubjectId]);
        }
      }).catch(console.error);
    }
  }, [isOpen, initialSubjectId]);

  if (!isOpen) return null;

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleStartTest = async () => {
    setLoading(true);
    try {
      const session = await api.createTest({
        mode,
        subjects: selectedSubjects,
        topics: selectedTopics,
        difficulty,
        question_count: questionCount,
        time_limit_minutes: timeLimitMinutes,
        randomize_questions: randomizeQuestions,
        randomize_options: randomizeOptions,
      });

      router.push(`/test/${session.id}`);
    } catch (err: any) {
      alert(`Failed to start test: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">Configure Your Test</h2>
            <p className="text-xs text-slate-500 mt-0.5">Customize your session parameters or choose full NSCT exam simulation</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Preparation Mode</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'quick', label: '⚡ Quick Practice' },
                { id: 'custom', label: '⚙️ Custom Test' },
                { id: 'weak_areas', label: '🎯 Weak Areas' },
                { id: 'full_mock', label: '🏛️ Full Simulation' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    if (m.id === 'full_mock') {
                      setQuestionCount(100);
                      setTimeLimitMinutes(60);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    mode === m.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection (Only if not full mock) */}
          {mode !== 'full_mock' && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Select Competencies {selectedSubjects.length > 0 ? `(${selectedSubjects.length} selected)` : '(All Subjects)'}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200/60">
                {subjects.map((s) => {
                  const isChecked = selectedSubjects.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSubject(s.id)}
                      className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                          : 'bg-white border-slate-200/60 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-2">{s.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">{s.weight_percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Difficulty</label>
            <div className="grid grid-cols-4 gap-2">
              {['easy', 'medium', 'hard', 'mixed'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                    difficulty === d
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count & Time Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Number of Questions</label>
              <div className="flex space-x-2">
                {[10, 30, 50, 70, 100].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      questionCount === count
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Time Limit</label>
              <div className="flex space-x-2">
                {[
                  { m: 10, l: '10m' },
                  { m: 30, l: '30m' },
                  { m: 60, l: '60m' },
                  { m: 0, l: 'None' },
                ].map((t) => (
                  <button
                    key={t.m}
                    onClick={() => setTimeLimitMinutes(t.m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      timeLimitMinutes === t.m
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Randomization toggles */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeQuestions}
                onChange={(e) => setRandomizeQuestions(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Randomize question sequence</span>
            </label>
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeOptions}
                onChange={(e) => setRandomizeOptions(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Randomize answer options</span>
            </label>
          </div>
        </div>

        {/* Footer Summary & Launch Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-800">{questionCount} Questions</span> •{' '}
            <span className="font-bold text-slate-800">{timeLimitMinutes > 0 ? `${timeLimitMinutes} Mins` : 'No Timer'}</span> •{' '}
            <span className="font-bold text-slate-800 capitalize">{difficulty}</span>
          </div>

          <button
            onClick={handleStartTest}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{loading ? 'Generating...' : 'Start Test'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
