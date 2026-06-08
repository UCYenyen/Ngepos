import type { ReactNode } from 'react';

export interface PageShellProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}
