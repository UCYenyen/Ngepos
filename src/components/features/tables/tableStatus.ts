import type { TableStatus } from '@/types/pos';

export const TABLE_STATUSES: TableStatus[] = [
  'available',
  'occupied',
  'reserved',
];

export const TABLE_STATUS_META: Record<
  TableStatus,
  { label: string; dot: string; text: string }
> = {
  available: { label: 'Kosong', dot: 'var(--success)', text: 'text-success' },
  occupied: { label: 'Terisi', dot: 'var(--accent)', text: 'text-accent' },
  reserved: {
    label: 'Reservasi',
    dot: 'var(--ink-tertiary)',
    text: 'text-ink-muted',
  },
};
