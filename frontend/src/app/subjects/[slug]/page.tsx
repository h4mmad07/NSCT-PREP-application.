'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TestConfigModal from '@/components/TestConfigModal';
import {
  ArrowLeft,
  Layers,
  Play,
  CheckCircle2,
  AlertCircle,
  Brain,
  Code
} from 'lucide-react';
import { api } from '@/lib/api';
import { Subject, Topic } from '@/types';

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();

  useEffect(() => {
    if (!slug) return;
    api.getSubjectDetails(slug)
      .then((data) => {
        setSubject(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const handlePracticeTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setModalOpen(true);
  };

  if (loading || !subject) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading Subject Taxonomy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="space-y-4">
            <Link
              href="/subjects"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Competencies</span>
            </Link>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs rounded-full">
                    {subject.weight_percentage}% Examination Weight
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {subject.topics?.length || 0} Topics
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{subject.name}</h1>
                <p className="text-xs text-slate-500 max-w-2xl">{subject.description}</p>
              </div>

              <button
                onClick={() => {
                  setSelectedTopicId(undefined);
                  setModalOpen(true);
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors flex items-center space-x-2 shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Practice Full Subject</span>
              </button>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">Official Curriculum Topics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subject.topics?.map((topic: any, idx: number) => {
                const acc = topic.accuracy || 0;
                return (
                  <div
                    key={topic.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-200 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                        <h3 className="text-sm font-bold text-slate-900">{topic.name}</h3>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        {topic.questions_attempted > 0 ? `${acc}% Accuracy • ${topic.questions_attempted} Attempts` : 'Not practiced yet'}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePracticeTopic(topic.id)}
                      className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Practice</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <TestConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialSubjectId={subject.id}
        initialTopicId={selectedTopicId}
        initialMode={selectedTopicId ? 'topic' : 'subject'}
      />
    </div>
  );
}
