'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TestConfigModal from '@/components/TestConfigModal';
import {
  CheckCircle2,
  XCircle,
  Bookmark,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  AlertCircle,
  Flag,
  Play,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import { TestReviewData } from '@/types';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [reviewData, setReviewData] = useState<TestReviewData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Report Question Modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('incorrect_answer');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Practice Similar Modal state
  const [configModalOpen, setConfigModalOpen] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    api.getTestReview(sessionId)
      .then((data) => {
        setReviewData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [sessionId]);

  const handleToggleBookmark = async () => {
    if (!reviewData) return;
    const currentQ = reviewData.questions[currentIndex];
    try {
      const res = await api.toggleBookmark(currentQ.question_id);
      const updated = [...reviewData.questions];
      updated[currentIndex] = { ...currentQ, is_bookmarked: res.bookmarked };
      setReviewData({ ...reviewData, questions: updated });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewData) return;
    const currentQ = reviewData.questions[currentIndex];
    setReportSubmitting(true);
    try {
      await api.reportQuestion(currentQ.question_id, {
        reason: reportReason,
        description: reportDescription,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportOpen(false);
        setReportSuccess(false);
        setReportDescription('');
      }, 2000);
    } catch (err: any) {
      alert(`Failed to submit report: ${err.message}`);
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading || !reviewData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading Question Review & Explanations...</p>
        </div>
      </div>
    );
  }

  const currentQ = reviewData.questions[currentIndex];
  const totalQuestions = reviewData.questions.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href={`/results/${sessionId}`}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Results</span>
            </Link>

            <div className="text-xs font-bold text-slate-500">
              Question <span className="text-slate-900">{currentIndex + 1}</span> of {totalQuestions}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left 3 Cols: Question Review Box */}
            <div className="lg:col-span-3 space-y-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                
                {/* Meta & Status Bar */}
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
                    {currentQ.is_answered ? (
                      currentQ.is_correct ? (
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                          <XCircle className="w-4 h-4" />
                          <span>Incorrect</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        <AlertCircle className="w-4 h-4" />
                        <span>Unanswered</span>
                      </div>
                    )}

                    <button
                      onClick={handleToggleBookmark}
                      className={`p-2 rounded-xl transition-colors ${
                        currentQ.is_bookmarked
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title="Bookmark Question"
                    >
                      <Bookmark className={`w-4 h-4 ${currentQ.is_bookmarked ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => setIsReportOpen(true)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Report Question Issue"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question stem */}
                <div className="space-y-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    <span className="text-indigo-600 mr-2">Q{currentIndex + 1}.</span>
                    {currentQ.question_text}
                  </h2>

                  {currentQ.code_snippet && (
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                      <pre>{currentQ.code_snippet}</pre>
                    </div>
                  )}
                </div>

                {/* Options with Review Highlighting */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const optionLabel = String.fromCharCode(65 + optIdx);
                    const isSelected = currentQ.selected_option_id === opt.id;
                    const isCorrect = opt.is_correct;

                    let optStyle = 'bg-white border-slate-200 text-slate-700';
                    let badgeStyle = 'bg-slate-100 text-slate-600';

                    if (isCorrect) {
                      optStyle = 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isSelected && !isCorrect) {
                      optStyle = 'bg-rose-50/80 border-rose-400 text-rose-950 font-bold';
                      badgeStyle = 'bg-rose-600 text-white';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                            {optionLabel}
                          </div>
                          <span className="text-sm font-medium">{opt.option_text}</span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {isSelected && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/80 text-slate-800">
                              Your Answer
                            </span>
                          )}
                          {isCorrect && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                              Correct Answer ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {currentQ.explanation && (
                  <div className="mt-6 p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Detailed Conceptual Explanation</span>
                    </div>
                    <p className="text-xs text-indigo-950/90 leading-relaxed whitespace-pre-line">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Practice Similar Topic Shortcut */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setConfigModalOpen(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Practice Similar: {currentQ.topic_name}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Controls */}
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
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentIndex === totalQuestions - 1}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right 1 Col: Quick Question Index */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Jump</h3>

                <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto p-1">
                  {reviewData.questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    let style = 'bg-slate-50 text-slate-700 border-slate-200';

                    if (isCurrent) {
                      style = 'ring-2 ring-indigo-600 bg-indigo-50 font-black text-indigo-700 border-indigo-400';
                    } else if (q.is_correct) {
                      style = 'bg-emerald-50 text-emerald-700 font-bold border-emerald-300';
                    } else if (q.is_answered && !q.is_correct) {
                      style = 'bg-rose-50 text-rose-700 font-bold border-rose-300';
                    }

                    return (
                      <button
                        key={q.session_question_id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-9 rounded-xl text-xs flex items-center justify-center border transition-all ${style}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Report Question Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-600">
                <Flag className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900">Report Question Issue</h3>
              </div>
              <button onClick={() => setIsReportOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl text-center">
                Report submitted! Our academic administrators will review this question.
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-slate-700 uppercase block mb-1">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="incorrect_answer">Incorrect Answer Key</option>
                    <option value="ambiguous">Ambiguous / Multiple Answers</option>
                    <option value="grammar">Grammar / Typo in Question</option>
                    <option value="wrong_topic">Wrong Topic / Subject Categorization</option>
                    <option value="technical_error">Formatting / Rendering Bug</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 uppercase block mb-1">Details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe the issue you observed..."
                    className="w-full p-3 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-100 disabled:opacity-50"
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Practice Similar Test Config Modal */}
      <TestConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        initialMode="custom"
      />
    </div>
  );
}
