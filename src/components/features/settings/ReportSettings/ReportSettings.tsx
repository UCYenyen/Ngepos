'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import type { ReportChannel, ReportSettings as ReportSettingsData } from '@/types/business';
import type { ReportSettingsProps } from './types';

export function ReportSettings({ businessId, planHasAutomatedReports }: ReportSettingsProps) {
  const [enabled, setEnabled] = useState(false);
  const [channel, setChannel] = useState<ReportChannel>('email');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(planHasAutomatedReports);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/businesses/${businessId}/report-settings`);
        if (!response.ok) {
          throw new Error('Failed to load report settings');
        }
        const data = (await response.json()) as ReportSettingsData;
        setEnabled(data.report_enabled);
        setChannel(data.report_channel);
        setRecipient(data.report_recipient);
      } catch {
        setError('Could not load report settings. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (planHasAutomatedReports) {
      loadSettings();
    }
  }, [businessId, planHasAutomatedReports]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setStatusMessage(null);
    try {
      const response = await fetch(`/api/businesses/${businessId}/report-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_enabled: enabled,
          report_channel: channel,
          report_recipient: recipient,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save report settings');
      }

      const data = (await response.json()) as ReportSettingsData;
      setEnabled(data.report_enabled);
      setChannel(data.report_channel);
      setRecipient(data.report_recipient);
      setStatusMessage('Report settings saved.');
    } catch {
      setError('Could not save report settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const controlsDisabled = !planHasAutomatedReports || loading || saving;
  const recipientLabel = channel === 'whatsapp' ? 'WhatsApp number' : 'Recipient email';
  const recipientPlaceholder =
    channel === 'whatsapp' ? '+62 812 3456 7890' : 'owner@business.com';

  return (
    <div className="space-y-6">
      {!planHasAutomatedReports ? (
        <NoticeCard
          title="Automated reports require the Pro plan"
          description="Schedule automated monthly sales reports delivered by email or WhatsApp on the Pro and Enterprise plans. Upgrade your subscription to enable this feature."
        />
      ) : null}

      <div className="card max-w-2xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-ink">Automated Monthly Reports</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Send a sales summary at the start of each month to the recipient below.
          </p>
        </div>

        {error ? <p className="text-sm text-error">{error}</p> : null}
        {statusMessage ? (
          <p className="text-sm text-success">{statusMessage}</p>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="report-enabled" className="text-ink">
            Enabled
          </Label>
          <Switch
            id="report-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={controlsDisabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-channel" className="text-ink">
            Delivery channel
          </Label>
          <Select
            value={channel}
            onValueChange={(value) => value && setChannel(value as ReportChannel)}
            disabled={controlsDisabled}
          >
            <SelectTrigger id="report-channel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-recipient" className="text-ink">
            {recipientLabel}
          </Label>
          <Input
            id="report-recipient"
            value={recipient}
            placeholder={recipientPlaceholder}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={controlsDisabled}
          />
        </div>

        <Button onClick={handleSave} disabled={controlsDisabled}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
