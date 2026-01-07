'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get('code');
      if (!code) {
        setErrorMessage('Missing OAuth code. Please try logging in again.');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const next = localStorage.getItem('postAuthRedirect') || '/';
      localStorage.removeItem('postAuthRedirect');
      router.replace(next);
    };

    void run();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/30 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 max-w-md w-full p-6">
        <h1 className="text-xl font-semibold text-gray-900">Signing you in…</h1>
        <p className="text-sm text-gray-600 mt-2">Please wait a moment.</p>
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

