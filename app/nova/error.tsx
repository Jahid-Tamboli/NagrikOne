'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function NovaError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[NOVA Error]', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#030712] text-slate-100">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold">NOVA needs a moment</h1>

        <p className="mt-3 text-sm opacity-70">
          Something went wrong while processing your request.
          Your information has not been submitted automatically.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full px-5 py-3 border border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400 text-xs font-bold transition-colors"
          >
            Try again
          </button>

          <Link
            href="/"
            className="rounded-full px-5 py-3 border border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400 text-xs font-bold transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
