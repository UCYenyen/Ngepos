import Link from 'next/link';
import { Wordmark } from '@/components/layout/Wordmark/Wordmark';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 bg-canvas px-6 text-center">
      <Wordmark size={22} />
      <div className="flex flex-col items-center gap-2.5">
        <span className="font-mono text-7xl font-bold tracking-tight text-ink">
          404
        </span>
        <h1 className="text-xl font-semibold text-ink">
          Halaman tidak ditemukan
        </h1>
        <p className="max-w-sm text-sm text-ink-muted">
          Halaman yang kamu cari mungkin sudah dipindahkan atau tidak pernah
          ada.
        </p>
      </div>
      <Link href="/" className="btn-accent h-11 px-6">
        Kembali ke beranda
      </Link>
    </div>
  );
}
