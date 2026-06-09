import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ngepos — Kasir digital',
    short_name: 'Ngepos',
    description:
      'Aplikasi kasir multi-bisnis untuk F&B dan retail di Indonesia.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f5f1ec',
    theme_color: '#ff5600',
    lang: 'id',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
