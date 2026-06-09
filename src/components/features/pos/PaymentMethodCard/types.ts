import type { LucideIcon } from 'lucide-react';

export interface PaymentMethodCardProps {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  active: boolean;
  locked?: boolean;
  onSelect: () => void;
}
