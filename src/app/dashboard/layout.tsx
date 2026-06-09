import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-canvas">{children}</div>
  );
}
