'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { UserRole } from '@/types/business';

interface InviteFormProps {
  businessId: string;
  onInvitationSent?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type FormState = 'form' | 'success' | 'error';

export function InviteForm({ businessId, onInvitationSent, open = false, onOpenChange }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>('form');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (role === 'owner') {
      setError('Cannot invite owner role');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setSuccessMessage(`Invitation sent to ${email}`);
      setFormState('success');

      setTimeout(() => {
        setEmail('');
        setRole('cashier');
        setFormState('form');
        if (onOpenChange) onOpenChange(false);
        if (onInvitationSent) onInvitationSent();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
      setFormState('error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setEmail('');
      setRole('cashier');
      setFormState('form');
      setError(null);
      setSuccessMessage('');
    }
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogDescription>
            Invite a new staff member to this business with a specific role
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {formState === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
            </Alert>
          )}

          {formState === 'error' && error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {formState === 'form' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={loading}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-600 mt-1">
                  {role === 'manager' && 'Managers can view analytics, manage products, and process transactions.'}
                  {role === 'cashier' && 'Cashiers can only process transactions.'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !email.trim()}
                  className="flex-1"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
