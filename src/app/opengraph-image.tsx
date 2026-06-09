import { ImageResponse } from 'next/og';

export const alt = 'Ngepos — Kasir digital untuk semua bisnismu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#111111',
          padding: 80,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#ff5600',
            }}
          >
            <svg width="42" height="42" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M13 2 L3 14 h7 l-1 8 L19 10 h-7 z" />
            </svg>
          </div>
          <span style={{ color: '#ffffff', fontSize: 44, fontWeight: 700 }}>
            Ngepos
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <span
            style={{
              color: '#ffffff',
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Kasir digital untuk semua bisnismu.
          </span>
          <span style={{ color: '#9a9a98', fontSize: 32 }}>
            POS multi-bisnis untuk F&B dan retail di Indonesia.
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
