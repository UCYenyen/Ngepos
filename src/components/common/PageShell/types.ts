import type { ReactNode } from 'react';

export interface PageShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}
