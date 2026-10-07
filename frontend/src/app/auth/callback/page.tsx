'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState('Completing Google authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errParam = searchParams.get('error');

    if (errParam) {
      setError(`Authentication failed: ${errParam.replace(/_/g, ' ')}`);
      setTimeout(() => router.replace('/auth'), 3000);
      return;
    }

    if (token) {
      api.setToken(token);
      api.getMe()
        .then((user) => {
          setStatusText('Authentication verified! Loading your dashboard...');
          router.replace('/dashboard');
        })
        .catch((err) => {
          setError(`Session verification error: ${err.message}`);
          setTimeout(() => router.replace('/auth'), 3000);
        });
    } else {
      setError('No session token received from Google authentication.');
      setTimeout(() => router.replace('/auth'), 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
          N
        </div>

        {error ? (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-rose-600">Authentication Issue</h2>
            <p className="text-xs text-slate-500">{error}</p>
            <p className="text-[11px] text-slate-400">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-sm font-bold text-slate-900">{statusText}</h2>
            <p className="text-xs text-slate-400">Please wait while we establish your secure session.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
