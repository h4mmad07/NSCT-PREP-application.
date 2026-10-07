'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TestConfigModal from '@/components/TestConfigModal';
import {
  Bookmark,
  Play,
  Trash2,
  BookOpen
} from 'lucide-react';
import { api } from '@/lib/api';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.getBookmarks()
      .then((data) => {
        setBookmarks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleRemoveBookmark = async (questionId: string) => {
    try {
      await api.toggleBookmark(questionId);
      setBookmarks(prev => prev.filter(b => b.question_id !== questionId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Header Hero */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Saved Questions ({bookmarks.length})</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Bookmarked Questions</h1>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                Review questions you have saved during mock exams and practice sessions for focused study.
              </p>
            </div>

            {bookmarks.length > 0 && (
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-100 transition-colors flex items-center space-x-2 shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Practice Bookmarks</span>
              </button>
            )}
          </div>

          {/* Bookmarks Grid */}
          <div className="space-y-4">
            {bookmarks.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Bookmarked Questions Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the bookmark icon during a test or result review to save important questions here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((b) => (
                  <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full">
                          {b.subject_name}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-full">
                          {b.topic_name}
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase rounded-md border border-slate-200">
                          {b.difficulty}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-relaxed pt-1">
                        {b.question_text}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleRemoveBookmark(b.question_id)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
        initialMode="revision"
      />
    </div>
  );
}
