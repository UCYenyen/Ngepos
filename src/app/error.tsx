'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { Wordmark } from '@/components/layout/Wordmark/Wordmark';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 bg-canvas px-6 text-center">
      <Wordmark size={22} />
      <div className="flex flex-col items-center gap-2.5">
        <h1 className="text-xl font-semibold text-ink">
          Ada yang tidak beres
        </h1>
        <p className="max-w-sm text-sm text-ink-muted">
          Maaf, terjadi kesalahan saat memuat halaman ini. Coba muat ulang
          sebentar lagi.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-accent h-11 gap-2 px-6"
        >
          <RotateCcw className="size-4" />
          Coba lagi
        </button>
        <Link href="/" className="btn-secondary h-11 px-6">
          Beranda
        </Link>
      </div>
    </div>
  );
}
