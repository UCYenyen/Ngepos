// A subscription only grants its plan while it is 'active' AND not past its
// period_end. Without the period_end check, a one-time payment would unlock the
// plan forever. Used everywhere plan access is resolved.
export function isSubscriptionActive(
  status: string | null | undefined,
  periodEnd: string | null | undefined
): boolean {
  if (status !== 'active') return false;
  if (!periodEnd) return true;
  return new Date(periodEnd).getTime() > Date.now();
}
