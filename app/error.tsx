'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[NagrikOne Error]', error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: '#040914',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1>NagrikOne needs a moment</h1>

        <p style={{ opacity: 0.7 }}>
          Something went wrong while loading this page.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: '20px',
            padding: '12px 22px',
            borderRadius: '999px',
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
