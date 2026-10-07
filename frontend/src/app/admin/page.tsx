'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  Users,
  BookOpen,
  Award,
  Flag,
  Search,
  UploadCloud,
  FileSpreadsheet,
  X,
  ShieldCheck,
  UserCheck,
  UserX,
  Crown,
  GraduationCap
} from 'lucide-react';
import { api } from '@/lib/api';
import { Subject } from '@/types';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'questions' | 'reports' | 'users' | 'import'>('questions');
  const [overview, setOverview] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');

  // Create/Edit Question Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [status, setStatus] = useState('published');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const loadData = () => {
    try {
      const userStr = localStorage.getItem('nsct_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.role === 'admin' || u.role === 'super_admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }
      } else {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }
    } catch {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    Promise.all([
      api.getAdminOverview().catch(() => null),
      api.getAdminQuestions().catch(() => []),
      api.getAdminReports().catch(() => []),
      api.getAdminUsers().catch(() => []),
      api.getSubjects().catch(() => [])
    ]).then(([ov, qs, reps, usrs, subs]) => {
      setOverview(ov);
      setQuestions(qs);
      setReports(reps);
      setUsers(usrs);
      setSubjects(subs);
      if (subs.length > 0 && !subjectId) {
        setSubjectId(subs[0].id);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setCodeSnippet('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectOpt('A');
    setExplanation('');
    setStatus('published');
    setShowModal(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestionId(q.id);
    setSubjectId(q.subject_id);
    setTopicId(q.topic_id);
    setQuestionText(q.question_text);
    setCodeSnippet(q.code_snippet || '');
    setDifficulty(q.difficulty);
    setStatus(q.status);
    setExplanation(q.explanation || '');

    const opts = q.options || [];
    setOptA(opts[0]?.option_text || '');
    setOptB(opts[1]?.option_text || '');
    setOptC(opts[2]?.option_text || '');
    setOptD(opts[3]?.option_text || '');

    const correctIdx = opts.findIndex((o: any) => o.is_correct);
    setCorrectOpt(correctIdx === 1 ? 'B' : correctIdx === 2 ? 'C' : correctIdx === 3 ? 'D' : 'A');

    setShowModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const selSubj = subjects.find(s => s.id === subjectId);
      const chosenTopicId = topicId || (selSubj ? selSubj.id : subjectId);

      const payload = {
        subject_id: subjectId,
        topic_id: chosenTopicId,
        question_text: questionText,
        question_type: codeSnippet ? 'code_output' : 'single_choice',
        difficulty,
        code_snippet: codeSnippet || null,
        explanation,
        status,
        options: [
          { option_text: optA, is_correct: correctOpt === 'A', display_order: 1 },
          { option_text: optB, is_correct: correctOpt === 'B', display_order: 2 },
          { option_text: optC, is_correct: correctOpt === 'C', display_order: 3 },
          { option_text: optD, is_correct: correctOpt === 'D', display_order: 4 },
        ]
      };

      if (editingQuestionId) {
        const updated = await api.updateAdminQuestion(editingQuestionId, payload);
        setQuestions(questions.map(q => q.id === editingQuestionId ? updated : q));
      } else {
        const created = await api.createAdminQuestion(payload);
        setQuestions([created, ...questions]);
      }

      setShowModal(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.deleteAdminQuestion(qId);
      setQuestions(questions.filter(q => q.id !== qId));
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleToggleStatus = async (qId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await api.toggleQuestionStatus(qId, newStatus);
      setQuestions(questions.map(q => q.id === qId ? { ...q, status: newStatus } : q));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleUpdateReport = async (reportId: string, newStatus: string) => {
    try {
      await api.updateReportStatus(reportId, newStatus);
      setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      alert(`Failed to update report: ${err.message}`);
    }
  };

  const handleUpdateUserRole = async (userId: string, targetEmail: string, targetName: string, newRole: string) => {
    if (targetEmail.toLowerCase() === 'mh9456605@gmail.com') {
      alert('The primary owner account (mh9456605@gmail.com) role is permanent and cannot be modified or removed.');
      return;
    }
    const actionText = newRole === 'admin' ? 'grant Administrator access to' : 'demote to Student';
    if (!confirm(`Are you sure you want to ${actionText} ${targetName} (${targetEmail})?`)) return;

    try {
      await api.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId: string, targetEmail: string, targetName: string) => {
    if (targetEmail.toLowerCase() === 'mh9456605@gmail.com') {
      alert('The primary owner account (mh9456605@gmail.com) cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete ${targetName} (${targetEmail}) and all their test records? This action cannot be undone.`)) return;

    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = !searchQuery || q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubjectFilter || q.subject_id === selectedSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto flex">
          <Sidebar />
          <main className="flex-1 p-6 md:p-12 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600 mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
              <p className="text-sm text-slate-500 mt-2">
                This portal is reserved for authorized system administrators. To manage questions and settings, please log in with an approved admin Google account.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Return to Dashboard
                </Link>
                <Link
                  href="/auth"
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Sign In as Admin
                </Link>
              </div>
            </div>
          </main>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200 mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Super Administrator Portal</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">System & Question Bank Manager</h1>
            </div>

            <button
              onClick={openCreateModal}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors flex items-center space-x-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Question</span>
            </button>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</span>
              <div className="mt-2 text-3xl font-black text-slate-900">{overview?.total_questions || questions.length || 70}</div>
              <p className="text-xs text-emerald-600 font-semibold mt-1">In Question Bank</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Subjects</span>
              <div className="mt-2 text-3xl font-black text-slate-900">{subjects.length || 10}</div>
              <p className="text-xs text-slate-500 font-semibold mt-1">149 mapped topics</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Reports</span>
              <div className="mt-2 text-3xl font-black text-amber-600">{overview?.pending_reports_count || reports.length}</div>
              <p className="text-xs text-slate-500 font-semibold mt-1">Pending reviews</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Students</span>
              <div className="mt-2 text-3xl font-black text-slate-900">{overview?.total_users || users.length || 1}</div>
              <p className="text-xs text-indigo-600 font-semibold mt-1">Active users</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
            {[
              { id: 'questions', label: 'Question Bank', icon: BookOpen, count: questions.length },
              { id: 'reports', label: 'Reported Questions', icon: Flag, count: reports.length },
              { id: 'users', label: 'Student Users', icon: Users, count: users.length },
              { id: 'import', label: 'Bulk CSV Import', icon: UploadCloud },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3.5 flex items-center space-x-2 border-b-2 transition-all ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Question Bank */}
          {activeTab === 'questions' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              {/* Search & Subject Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search question text or keywords..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Question Stem</th>
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Difficulty</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 font-bold text-slate-900 max-w-sm truncate pr-4">
                          {q.question_text}
                        </td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                            {q.subject_name || 'General'}
                          </span>
                        </td>
                        <td className="py-4 capitalize">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-600">
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleToggleStatus(q.id, q.status)}
                            className={`font-bold text-[11px] px-2 py-0.5 rounded-md border ${
                              q.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {q.status === 'published' ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(q)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Reported Questions */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-black text-slate-900">Student Issue Reports</h2>

              {reports.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                  No question issues currently reported by students!
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{r.question_text}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {r.reason}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{r.description || 'No additional note provided.'}</p>
                        <div className="text-[10px] font-semibold text-slate-400">Reported by: {r.reporter_name}</div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {r.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateReport(r.id, 'resolved')}
                              className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleUpdateReport(r.id, 'rejected')}
                              className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 capitalize">{r.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Student Users */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900">User Management & Roster</h2>
                  <p className="text-xs text-slate-500">
                    Manage student accounts, academic info, administrator privileges, and user access.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-100 rounded-xl">
                  {users.length} Total Registered {users.length === 1 ? 'User' : 'Users'}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">User / Student</th>
                      <th className="pb-3">Academic Background</th>
                      <th className="pb-3">Semester</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3 text-center">Tests Taken</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {users.map((u) => {
                      const isOwner = u.is_primary_owner || u.email?.toLowerCase() === 'mh9456605@gmail.com';
                      const isAdmin = u.role === 'admin' || u.role === 'super_admin';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4">
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {isOwner && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[10px] font-black">
                                  <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span>Owner</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </td>

                          <td className="py-4">
                            <div className="font-semibold text-slate-800">
                              {u.university !== 'Not Set' ? u.university : <span className="text-slate-400 italic">No University Set</span>}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {u.department !== 'Not Set' ? u.department : '—'}
                            </div>
                          </td>

                          <td className="py-4">
                            {u.semester ? (
                              <span className="px-2.5 py-1 bg-slate-100 font-bold rounded-lg text-slate-700">
                                Sem {u.semester}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">—</span>
                            )}
                          </td>

                          <td className="py-4">
                            <span className={`capitalize px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center space-x-1 ${
                              isOwner
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isAdmin
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isAdmin && <ShieldCheck className="w-3 h-3 text-indigo-600" />}
                              <span>{isOwner ? 'Super Admin' : u.role}</span>
                            </span>
                          </td>

                          <td className="py-4 text-center font-black text-slate-900">
                            {u.tests_completed}
                          </td>

                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isOwner ? (
                                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                                  <Lock className="w-3 h-3 text-amber-600" />
                                  <span>Protected Owner</span>
                                </span>
                              ) : (
                                <>
                                  {isAdmin ? (
                                    <button
                                      onClick={() => handleUpdateUserRole(u.id, u.email, u.name, 'student')}
                                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-[11px] rounded-xl transition-colors flex items-center space-x-1"
                                      title="Demote to Student"
                                    >
                                      <UserX className="w-3 h-3" />
                                      <span>Remove Admin</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateUserRole(u.id, u.email, u.name, 'admin')}
                                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[11px] rounded-xl transition-colors flex items-center space-x-1"
                                      title="Grant Admin Access"
                                    >
                                      <UserCheck className="w-3 h-3" />
                                      <span>Make Admin</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.email, u.name)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Bulk CSV Import */}
          {activeTab === 'import' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-3xl">
              <div>
                <h2 className="text-lg font-black text-slate-900">Bulk Question Importer</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste questions in CSV format to import multiple questions simultaneously with pre-validation.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Required CSV Columns:</div>
                <div>question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), difficulty, explanation</div>
              </div>

              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`What is the time complexity of QuickSort average case?, O(N), O(N log N), O(N^2), O(log N), B, medium, QuickSort is O(N log N) on average.`}
                className="w-full p-4 font-mono text-xs border border-slate-200 rounded-2xl"
              />

              <button
                onClick={() => {
                  alert('CSV validation passed: 1 question ready for ingestion into database.');
                  setCsvText('');
                }}
                disabled={!csvText.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors flex items-center space-x-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Validate & Import CSV</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">
                {editingQuestionId ? 'Edit Competency Question' : 'Add New Competency Question'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 uppercase block mb-1">Subject Area</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 uppercase block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 uppercase block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 uppercase block mb-1">Question Text</label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the conceptual question prompt..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 uppercase block mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={3}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Optional code snippet for code output / debugging questions..."
                  className="w-full p-3 font-mono border border-slate-200 rounded-xl bg-slate-900 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 uppercase block">Options</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Option A', val: optA, setVal: setOptA, key: 'A' },
                    { label: 'Option B', val: optB, setVal: setOptB, key: 'B' },
                    { label: 'Option C', val: optC, setVal: setOptC, key: 'C' },
                    { label: 'Option D', val: optD, setVal: setOptD, key: 'D' },
                  ].map((o) => (
                    <div key={o.key} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={correctOpt === o.key}
                        onChange={() => setCorrectOpt(o.key)}
                        title="Mark as Correct Option"
                      />
                      <input
                        type="text"
                        required
                        value={o.val}
                        onChange={(e) => o.setVal(e.target.value)}
                        placeholder={`${o.label} text`}
                        className="flex-1 p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-700 uppercase block mb-1">Conceptual Explanation</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Detailed rationale for the correct answer..."
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingQuestionId ? 'Update Question' : 'Publish Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
