'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  Bookmark,
  Flag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Layers,
  Code2
} from 'lucide-react';
import { api } from '@/lib/api';
import { ActiveTestSession, ActiveQuestionItem } from '@/types';

export default function TestRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<ActiveTestSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load active session
  useEffect(() => {
    if (!sessionId) return;
    api.getActiveSession(sessionId)
      .then((data) => {
        if (data.status === 'submitted') {
          router.replace(`/results/${data.id}`);
          return;
        }
        setSession(data);
        if (data.remaining_seconds !== null && data.remaining_seconds !== undefined) {
          setTimeLeft(data.remaining_seconds);
        }
        setLoading(false);
      })
      .catch((err) => {
        alert(`Failed to load test session: ${err.message}`);
        router.push('/dashboard');
      });
  }, [sessionId, router]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAutoSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.submitTest(sessionId);
      router.push(`/results/${sessionId}`);
    } catch (err) {
      console.error(err);
      router.push(`/results/${sessionId}`);
    }
  };

  const handleSelectOption = async (optionId: string) => {
    if (!session) return;
    const currentQ = session.questions[currentIndex];
    
    // Update local state immediately for instant UI feedback
    const updatedQuestions = [...session.questions];
    updatedQuestions[currentIndex] = {
      ...currentQ,
      selected_option_id: optionId,
      is_answered: true,
    };
    setSession({ ...session, questions: updatedQuestions });

    // Autosave to backend
    setSaving(true);
    try {
      await api.saveAnswer(sessionId, {
        session_question_id: currentQ.session_question_id,
        selected_option_id: optionId,
        is_marked_for_review: currentQ.is_marked_for_review,
        time_spent_seconds: currentQ.time_spent_seconds + 5,
      });
    } catch (err) {
      console.error('Autosave failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReview = async () => {
    if (!session) return;
    const currentQ = session.questions[currentIndex];
    const newMarkedState = !currentQ.is_marked_for_review;

    const updatedQuestions = [...session.questions];
    updatedQuestions[currentIndex] = {
      ...currentQ,
      is_marked_for_review: newMarkedState,
    };
    setSession({ ...session, questions: updatedQuestions });

    try {
      await api.saveAnswer(sessionId, {
        session_question_id: currentQ.session_question_id,
        selected_option_id: currentQ.selected_option_id,
        is_marked_for_review: newMarkedState,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!session) return;
    const currentQ = session.questions[currentIndex];
    try {
      const res = await api.toggleBookmark(currentQ.id);
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentIndex] = {
        ...currentQ,
        is_bookmarked: res.bookmarked,
      };
      setSession({ ...session, questions: updatedQuestions });
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Initializing Exam Session...</p>
        </div>
      </div>
    );
  }

  const currentQ = session.questions[currentIndex];
  const totalQuestions = session.questions.length;
  const answeredCount = session.questions.filter((q) => q.is_answered).length;
  const markedCount = session.questions.filter((q) => q.is_marked_for_review).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Test Runner Sticky Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shadow-sm">
              N
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 line-clamp-1">{session.title}</div>
              <div className="text-[10px] font-semibold text-slate-400 capitalize">
                Question {currentIndex + 1} of {totalQuestions} • {session.mode.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sync status */}
            <span className="text-[10px] font-bold text-slate-400 hidden sm:inline-block">
              {saving ? 'Saving...' : 'Synced ✓'}
            </span>

            {/* Live Authoritative Timer */}
            {timeLeft !== null && (
              <div
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-black border transition-colors ${
                  timeLeft < 300
                    ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                    : 'bg-slate-900 text-white border-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-colors flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Test</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Cols: Active Question Area */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* Question Tags & Bookmark */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100">
                  {currentQ.subject_name}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-full">
                  {currentQ.topic_name}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase rounded-md border border-slate-200">
                  {currentQ.difficulty}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleBookmark}
                  className={`p-2 rounded-xl transition-colors ${
                    currentQ.is_bookmarked
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                  title="Bookmark question"
                >
                  <Bookmark className={`w-4 h-4 ${currentQ.is_bookmarked ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                <span className="text-indigo-600 mr-2">Q{currentIndex + 1}.</span>
                {currentQ.question_text}
              </h2>

              {/* Code Snippet Box (if present) */}
              {currentQ.code_snippet && (
                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                  <pre>{currentQ.code_snippet}</pre>
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = currentQ.selected_option_id === opt.id;
                const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center space-x-4 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 shadow-sm'
                        : 'bg-white border-slate-200/80 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {optionLabel}
                    </div>
                    <span className="text-sm font-medium leading-relaxed">{opt.option_text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Question Controls */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleToggleReview}
              className={`px-4 py-2.5 font-bold text-xs rounded-xl border transition-colors flex items-center space-x-1.5 ${
                currentQ.is_marked_for_review
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${currentQ.is_marked_for_review ? 'fill-white' : ''}`} />
              <span>{currentQ.is_marked_for_review ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentIndex === totalQuestions - 1}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Question Grid Navigator */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Navigator</h3>

            {/* Navigator Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1">
              {session.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = q.is_answered;
                const isMarked = q.is_marked_for_review;

                let btnStyle = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                if (isCurrent) {
                  btnStyle = 'ring-2 ring-indigo-600 bg-indigo-50 font-black text-indigo-700 border-indigo-400';
                } else if (isMarked) {
                  btnStyle = 'bg-amber-500 text-white font-bold border-amber-500 shadow-sm';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm';
                }

                return (
                  <button
                    key={q.session_question_id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs flex items-center justify-center border transition-all ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-md bg-emerald-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-md bg-amber-500" />
                <span>Marked for Review ({markedCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-indigo-600">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Send className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Submit Test?</h3>
            </div>

            <p className="text-xs text-slate-500">
              Please review your test progress before final submission. You will not be able to modify your answers afterwards.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-slate-700">
                <span>Total Questions:</span>
                <span className="font-bold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Answered:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span>Marked for Review:</span>
                <span className="font-bold">{markedCount}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Unanswered:</span>
                <span className="font-bold">{unansweredCount}</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={handleAutoSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
