import type { ParkedOrder } from '@/types/pos';

export interface ParkedOrdersDialogProps {
  open: boolean;
  orders: ParkedOrder[];
  onOpenChange: (open: boolean) => void;
  onRecall: (order: ParkedOrder) => void;
  onDiscard: (order: ParkedOrder) => void;
}
