'use client';

import React, { useState } from 'react';
import { GraduationCap, Building2, BookOpen, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { UserProfile } from '@/types';

interface OnboardingProfileModalProps {
  currentUser: UserProfile;
  onProfileUpdated: (updatedUser: UserProfile) => void;
  onClose?: () => void;
}

export default function OnboardingProfileModal({
  currentUser,
  onProfileUpdated,
  onClose
}: OnboardingProfileModalProps) {
  const [university, setUniversity] = useState(currentUser.profile?.university || '');
  const [department, setDepartment] = useState(currentUser.profile?.department || 'Computer Science');
  const [semester, setSemester] = useState<number>(currentUser.profile?.semester || 7);
  const [targetScore, setTargetScore] = useState<number>(currentUser.profile?.target_score || 80);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!university.trim()) {
      setError('Please enter your university or institute name.');
      return;
    }
    if (!department.trim()) {
      setError('Please enter your department or major.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.updateProfile({
        university: university.trim(),
        department: department.trim(),
        semester: Number(semester) || 1,
        target_score: Number(targetScore) || 80,
      });

      // Refetch user to get fully updated profile object
      const freshUser = await api.getMe();
      onProfileUpdated(freshUser);
    } catch (err: any) {
      setError(err.message || 'Failed to update academic profile. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 my-8">
        {/* Header with badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Welcome to NSCT Prep</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Complete Your Academic Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Tell us about your university and current semester so we can tailor your diagnostic practice and target goals.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* University Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>University / Institute</span>
            </label>
            <input
              type="text"
              required
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="e.g. FAST-NUCES, NUST, COMSATS, UET, GIKI, etc."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Department / Major Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Department / Major</span>
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science, Software Engineering, AI, IT"
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Semester and Target Score Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Current Semester</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem} {sem >= 7 ? '(Final Year)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>Target Score (%)</span>
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Skip for Now
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Saving Profile...' : 'Save & Get Started'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
