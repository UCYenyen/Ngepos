import { describe, it, expect } from 'vitest';
import { safeNext } from '@/lib/auth-redirect';

describe('safeNext', () => {
  it('returns the path for safe relative paths', () => {
    expect(safeNext('/reset-password')).toBe('/reset-password');
    expect(safeNext('/dashboard/biz-1/pos')).toBe('/dashboard/biz-1/pos');
  });

  it('falls back to /onboarding when the param is missing', () => {
    expect(safeNext(null)).toBe('/onboarding');
    expect(safeNext('')).toBe('/onboarding');
  });

  it('rejects protocol-relative and absolute URLs (open redirect)', () => {
    expect(safeNext('//evil.com')).toBe('/onboarding');
    expect(safeNext('https://evil.com')).toBe('/onboarding');
    expect(safeNext('http://evil.com/path')).toBe('/onboarding');
  });

  it('rejects paths that do not start with a single slash', () => {
    expect(safeNext('reset-password')).toBe('/onboarding');
    expect(safeNext('javascript:alert(1)')).toBe('/onboarding');
  });
});
