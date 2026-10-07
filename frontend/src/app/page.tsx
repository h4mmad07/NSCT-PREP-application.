'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  Code,
  Binary,
  Cpu,
  GitBranch,
  Globe,
  Sparkles,
  ShieldCheck,
  Database,
  Network,
  CheckCircle2,
  BarChart3,
  Target,
  Zap,
  RotateCcw,
  Bookmark,
  Award,
  BookOpen,
  User,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { Subject, UserProfile } from '@/types';

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

const DEFAULT_COMPETENCIES = [
  { name: 'Problem Solving & Analytical Skills', slug: 'problem-solving-analytical-skills', weight_percentage: 20, icon: 'brain', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  { name: 'Programming (C++/Java/Python)', slug: 'programming', weight_percentage: 10, icon: 'code', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { name: 'Data Structures & Algorithms', slug: 'data-structures-algorithms', weight_percentage: 10, icon: 'binary-tree', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { name: 'Software Engineering', slug: 'software-engineering', weight_percentage: 10, icon: 'git-branch', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { name: 'Web Development', slug: 'web-development', weight_percentage: 10, icon: 'globe', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { name: 'AI / Machine Learning & Data Analytics', slug: 'ai-ml-data-analytics', weight_percentage: 10, icon: 'sparkles', color: 'text-rose-600 bg-rose-50 border-rose-100' },
  { name: 'Databases', slug: 'databases', weight_percentage: 10, icon: 'database', color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
  { name: 'Computer Networks & Cloud Computing', slug: 'computer-networks-cloud-computing', weight_percentage: 10, icon: 'network', color: 'text-sky-600 bg-sky-50 border-sky-100' },
  { name: 'Operating Systems', slug: 'operating-systems', weight_percentage: 5, icon: 'cpu', color: 'text-orange-600 bg-orange-50 border-orange-100' },
  { name: 'Cyber Security', slug: 'cyber-security', weight_percentage: 5, icon: 'shield-check', color: 'text-red-600 bg-red-50 border-red-100' },
];

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const token = api.getToken();
    if (token) {
      api.getMe().then(setCurrentUser).catch(() => setCurrentUser(null));
    }

    // Fetch live subjects from backend taxonomy
    api.getSubjects()
      .then((data) => {
        if (data && data.length > 0) {
          setSubjects(data);
        }
      })
      .catch(() => {});
  }, []);

  const displayCompetencies = subjects.length > 0 ? subjects : DEFAULT_COMPETENCIES;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                NSCT <span className="text-indigo-600">PREP</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Competency Platform
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-600">
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 transition-colors">Home</Link>
            <Link href="#competencies" className="hover:text-slate-900 transition-colors">Competencies</Link>
            <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center space-x-2"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth"
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  href="/auth"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center space-x-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-6">
            <Zap className="w-3.5 h-3.5 fill-indigo-600" />
            <span>Aligned with Official NSCT Competency Standards</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Master Your <span className="text-indigo-600">NSCT</span> Preparation.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Practice across all official competency areas, identify your weak topics, take realistic mock tests, and track your progress in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={currentUser ? "/dashboard" : "/auth"}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center space-x-3"
            >
              <span>{currentUser ? "Open Preparation Dashboard" : "Start Preparing Free"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="#competencies"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-sm sm:text-base rounded-2xl border border-slate-200 shadow-sm transition-all text-center"
            >
              Explore 10 Competencies
            </Link>
          </div>

          {/* Highlight Stats Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            {[
              { title: '10 Competency Domains', desc: '149 subtopics categorized' },
              { title: 'Largest-Remainder Engine', desc: 'Proportional 100-Q mock distribution' },
              { title: 'Authoritative Timer', desc: 'Exam mode with server-side validation' },
              { title: 'Weak-Area Diagnostics', desc: 'Mathematical performance ranking' },
            ].map((f, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 mb-1.5" />
                <div className="text-xs font-black text-slate-900">{f.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Official Competency Overview */}
        <section id="competencies" className="py-16 bg-white border-y border-slate-200/80 scroll-mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Curriculum Taxonomy</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Official NSCT Competency Areas
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Every topic is structured according to the official examination percentage weightages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCompetencies.map((s: any, idx: number) => {
                const Icon = ICON_MAP[s.icon || 'brain'] || Brain;
                return (
                  <Link
                    key={idx}
                    href={`/subjects/${s.slug}`}
                    className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex items-start space-x-4 bg-slate-50/50 hover:bg-white group"
                  >
                    <div className="p-3 rounded-xl border bg-indigo-50 border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {s.name}
                        </span>
                        <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0 border border-indigo-100">
                          {s.weight_percentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {s.description || 'Master this competency area according to official NSCT curriculum.'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Features Built for Success</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Engineered for High-Score Mastery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Everything you need to systematically diagnose gaps, practice effectively, and pass with distinction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Practice Your Way',
                desc: 'Quick Practice, Subject, Topic, Mixed, Weak-Area, Mistakes, Revision, and Challenge modes.',
                icon: Layers,
                color: 'text-indigo-600 bg-indigo-50'
              },
              {
                title: 'Realistic Mock Tests',
                desc: 'Full 100-question NSCT simulations using largest-remainder proportional competency weighting.',
                icon: Award,
                color: 'text-blue-600 bg-blue-50'
              },
              {
                title: 'Identify Weak Areas',
                desc: 'Automatic diagnostics that detect and rank topics with below 65% accuracy for targeted drills.',
                icon: Target,
                color: 'text-rose-600 bg-rose-50'
              },
              {
                title: 'Track Your Progress',
                desc: 'Real-time accuracy calculations, 7-day streaks, study time metrics, and competency charts.',
                icon: BarChart3,
                color: 'text-emerald-600 bg-emerald-50'
              },
              {
                title: 'Review Every Mistake',
                desc: 'Automated Mistake Notebook with comprehensive explanations, hints, and one-click retry.',
                icon: RotateCcw,
                color: 'text-purple-600 bg-purple-50'
              },
              {
                title: 'Bookmark Questions',
                desc: 'Save challenging conceptual questions into personalized collections for quick revision.',
                icon: Bookmark,
                color: 'text-amber-600 bg-amber-50'
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. How It Works Section */}
        <section id="how-it-works" className="py-16 bg-white border-y border-slate-200/80 scroll-mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Simple Workflow</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                How NSCT PREP Works
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Sign In', desc: 'Log in with your Google account in one click.' },
                { step: '02', title: 'Choose Preparation', desc: 'Select subject, topic, difficulty, question count, and timer.' },
                { step: '03', title: 'Practice & Test', desc: 'Answer questions with live autosave and server-authoritative timer.' },
                { step: '04', title: 'Analyze & Improve', desc: 'Review detailed explanations and focus on diagnosed weak areas.' },
              ].map((s, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-200/70 space-y-2">
                  <span className="text-2xl font-black text-indigo-600 block">{s.step}</span>
                  <h3 className="text-sm font-black text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Final Call to Action */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-indigo-100 space-y-6">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Start Your NSCT Preparation?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto leading-relaxed">
              Join students preparing across all 10 computer science competency areas. Test your skills today.
            </p>
            <div>
              <Link
                href={currentUser ? "/dashboard" : "/auth"}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white hover:bg-indigo-50 text-indigo-900 font-extrabold text-sm rounded-2xl shadow-md transition-all"
              >
                <span>{currentUser ? "Go to Dashboard" : "Get Started Now"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Truthful Clean Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2 text-white font-black text-base">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                N
              </div>
              <span>NSCT <span className="text-indigo-400">PREP</span></span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              A comprehensive preparation platform designed for BSCS and IT graduates preparing for the National Skill Competency Test.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/subjects" className="hover:text-white transition-colors">10 Competency Domains</Link></li>
              <li><Link href="/practice" className="hover:text-white transition-colors">Practice Hub</Link></li>
              <li><Link href="/practice?mode=full_mock" className="hover:text-white transition-colors">Full Exam Simulation</Link></li>
              <li><Link href="/weak-areas" className="hover:text-white transition-colors">Weak Area Diagnostics</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Account</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/auth" className="hover:text-white transition-colors">Log In with Google</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Profile & Goals</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>© {new Date().getFullYear()} NSCT PREP. All rights reserved.</div>
          <div className="mt-2 sm:mt-0">Independent preparation platform for Computer Science & IT students.</div>
        </div>
      </footer>
    </div>
  );
}
