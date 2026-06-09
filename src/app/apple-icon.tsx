import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ff5600',
        }}
      >
        <svg width="104" height="104" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M13 2 L3 14 h7 l-1 8 L19 10 h-7 z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
