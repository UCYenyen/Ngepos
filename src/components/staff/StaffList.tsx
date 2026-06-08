'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StaffMemberResponse } from '@/types/api';
import type { UserRole } from '@/types/business';
import { InviteForm } from './InviteForm';

interface StaffListProps {
  businessId: string;
}

type SortBy = 'name' | 'role' | 'date';

interface RoleChangeState {
  dialogOpen: boolean;
  selectedStaff: StaffMemberResponse | null;
  newRole: UserRole;
  loading: boolean;
  error: string | null;
}

interface RemoveState {
  staffId: string | null;
  loading: boolean;
  error: string | null;
}

export function StaffList({ businessId }: StaffListProps) {
  const [staff, setStaff] = useState<StaffMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [inviteFormOpen, setInviteFormOpen] = useState(false);
  const [roleChangeState, setRoleChangeState] = useState<RoleChangeState>({
    dialogOpen: false,
    selectedStaff: null,
    newRole: 'cashier',
    loading: false,
    error: null,
  });
  const [removeState, setRemoveState] = useState<RemoveState>({
    staffId: null,
    loading: false,
    error: null,
  });

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/staff?businessId=${businessId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.statusText}`);
      }
      const data = await response.json();
      setStaff(data.data?.staff || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchStaff();
  }, [businessId, fetchStaff]);

  const handleRetry = () => {
    fetchStaff();
  };

  const handleRoleChange = (member: StaffMemberResponse) => {
    if (member.role === 'owner') return;
    setRoleChangeState({
      dialogOpen: true,
      selectedStaff: member,
      newRole: member.role === 'manager' ? 'cashier' : 'manager',
      loading: false,
      error: null,
    });
  };

  const handleRemove = async (member: StaffMemberResponse) => {
    if (member.role === 'owner') return;
    setRemoveState({
      staffId: member.id,
      loading: true,
      error: null,
    });
  };

  const confirmRemove = async () => {
    if (!removeState.staffId) return;

    try {
      const response = await fetch(`/api/staff/${removeState.staffId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove staff');
      }

      setRemoveState({
        staffId: null,
        loading: false,
        error: null,
      });
      await fetchStaff();
    } catch (err) {
      setRemoveState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to remove staff',
        loading: false,
      }));
    }
  };

  const handleRoleSubmit = async () => {
    if (!roleChangeState.selectedStaff) return;

    try {
      setRoleChangeState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch(`/api/staff/${roleChangeState.selectedStaff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, role: roleChangeState.newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      setRoleChangeState({
        dialogOpen: false,
        selectedStaff: null,
        newRole: 'cashier',
        loading: false,
        error: null,
      });
      await fetchStaff();
    } catch (err) {
      setRoleChangeState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update role',
        loading: false,
      }));
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'cashier':
        return 'bg-slate-100 text-slate-800 border border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const sorted = [...staff];
  if (sortBy === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'role') {
    const roleOrder: Record<UserRole, number> = { owner: 0, manager: 1, cashier: 2 };
    sorted.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
  } else {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading staff...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRetry} variant="outline" className="w-full">
          Retry
        </Button>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <p className="text-slate-600">No staff members yet.</p>
          <Button onClick={() => setInviteFormOpen(true)}>Invite First Staff Member</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="w-full md:w-48">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="role">Sort by Role</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setInviteFormOpen(true)}>Invite New Staff</Button>
      </div>

      {removeState.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{removeState.error}</AlertDescription>
        </Alert>
      )}

      <ScrollArea className="rounded-lg border">
        <div className="space-y-2 p-4">
          {sorted.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700"
                        aria-label={`${member.name} avatar`}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getRoleBadgeColor(member.role))}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      <span className="text-xs text-slate-600 px-2 py-1">
                        Joined {formatDate(member.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                    {member.role !== 'owner' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(member)}
                          aria-label={`Change role for ${member.name}`}
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Change Role
                        </Button>
                        <AlertDialog open={removeState.staffId === member.id}>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemove(member)}
                            disabled={removeState.loading}
                            aria-label={`Remove ${member.name} from staff`}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            {removeState.loading ? 'Removing...' : 'Remove'}
                          </Button>
                          <AlertDialogContent>
                            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.name} from your business? This action cannot be undone.
                            </AlertDialogDescription>
                            <div className="flex gap-3">
                              <AlertDialogCancel
                                onClick={() =>
                                  setRemoveState({
                                    staffId: null,
                                    loading: false,
                                    error: null,
                                  })
                                }
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={confirmRemove} disabled={removeState.loading}>
                                {removeState.loading ? 'Removing...' : 'Remove'}
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    {member.role === 'owner' && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                        Business Owner
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {roleChangeState.dialogOpen && roleChangeState.selectedStaff && (
        <Card className="p-6 space-y-4 border-blue-200 bg-blue-50">
          <div>
            <h3 className="font-semibold mb-2">Change Role for {roleChangeState.selectedStaff.name}</h3>
            <p className="text-sm text-slate-600 mb-4">Current role: {roleChangeState.selectedStaff.role}</p>

            {roleChangeState.error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{roleChangeState.error}</AlertDescription>
              </Alert>
            )}

            <Select value={roleChangeState.newRole} onValueChange={(v) => setRoleChangeState((prev) => ({ ...prev, newRole: v as UserRole }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setRoleChangeState({ dialogOpen: false, selectedStaff: null, newRole: 'cashier', loading: false, error: null })}
              disabled={roleChangeState.loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleSubmit}
              disabled={roleChangeState.loading}
              className="flex-1"
            >
              {roleChangeState.loading ? 'Updating...' : 'Update Role'}
            </Button>
          </div>
        </Card>
      )}

      <InviteForm
        businessId={businessId}
        onInvitationSent={() => {
          setInviteFormOpen(false);
          fetchStaff();
        }}
        open={inviteFormOpen}
        onOpenChange={setInviteFormOpen}
      />
    </div>
  );
}
