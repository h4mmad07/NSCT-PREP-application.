'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if already authenticated or if redirected with error
  useEffect(() => {
    try {
      const token = api.getToken();
      if (token) {
        router.replace('/dashboard');
        return;
      }
    } catch {
      // ignore
    }

    const err = searchParams.get('error');
    if (err) {
      if (err === 'oauth_not_configured') {
        setErrorMsg('Google OAuth is not yet configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env to connect to live Google authentication.');
      } else {
        setErrorMsg(`Google authentication failed: ${err.replace(/_/g, ' ')}`);
      }
    }
  }, [router, searchParams]);

  const handleRealGoogleOAuth = () => {
    setLoading(true);
    setErrorMsg('');
    // Direct redirect to the backend Google OAuth login endpoint
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            N
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            NSCT <span className="text-indigo-600">PREP</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            National Skill Competency Test Preparation Platform
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 text-left leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Real Google OAuth Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleRealGoogleOAuth}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
