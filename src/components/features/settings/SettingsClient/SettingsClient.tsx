'use client';

import { useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Building2,
  CreditCard,
  Mail,
  QrCode,
  Upload,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SettingsSection } from '../SettingsSection/SettingsSection';
import { ReportSettings } from '../ReportSettings/ReportSettings';
import { XenditConnect } from '../XenditConnect/XenditConnect';
import { useAssetUpload, type AssetKind } from '@/hooks/business/useAssetUpload';
import type { SettingsClientProps } from './types';

const TIMEZONES = [
  { value: 'Asia/Jakarta', label: 'WIB (GMT+7) — Jakarta' },
  { value: 'Asia/Makassar', label: 'WITA (GMT+8) — Makassar' },
  { value: 'Asia/Jayapura', label: 'WIT (GMT+9) — Jayapura' },
];

const INPUT_CLASS =
  'h-10 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

export function SettingsClient({
  business,
  planHasAutomatedReports,
}: SettingsClientProps) {
  const router = useRouter();
  const { uploading, upload } = useAssetUpload();

  const [name, setName] = useState(business.name);
  const [address, setAddress] = useState(business.address ?? '');
  const [timezone, setTimezone] = useState(business.timezone);
  const [currency, setCurrency] = useState(business.currency);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    business.logo_url ?? null
  );
  const [qrisUrl, setQrisUrl] = useState<string | null>(
    business.qris_image_url ?? null
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function patchBusiness(
    updates: Record<string, string | null>
  ): Promise<boolean> {
    const response = await fetch(`/api/businesses/${business.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.ok;
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const ok = await patchBusiness({ name, address, timezone, currency });
      if (!ok) throw new Error();
      toast.success('Profil bisnis disimpan');
      router.refresh();
    } catch {
      toast.error('Gagal menyimpan profil');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAssetChange(
    event: ChangeEvent<HTMLInputElement>,
    kind: AssetKind
  ) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const url = await upload(file, business.id, kind);
    if (!url) {
      toast.error('Gagal mengunggah gambar');
      return;
    }
    const field = kind === 'logo' ? 'logo_url' : 'qris_image_url';
    const ok = await patchBusiness({ [field]: url });
    if (!ok) {
      toast.error('Gagal menyimpan gambar');
      return;
    }
    if (kind === 'logo') setLogoUrl(url);
    else setQrisUrl(url);
    toast.success(kind === 'logo' ? 'Logo diperbarui' : 'QRIS diperbarui');
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      toast.success('Bisnis dihapus');
      router.push('/dashboard');
    } catch {
      toast.error('Gagal menghapus bisnis');
      setDeleting(false);
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <SettingsSection
        icon={Building2}
        title="Profil bisnis"
        description="Informasi dasar tentang bisnismu."
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo bisnis"
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              ) : (
                <Building2 className="size-6 text-ink-subtle" />
              )}
            </div>
            <label className="btn-secondary h-9 cursor-pointer gap-2 px-4 text-[13px]">
              <Upload className="size-4" />
              {uploading ? 'Mengunggah…' : 'Ganti logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(event) => handleAssetChange(event, 'logo')}
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink">
                Nama bisnis
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={INPUT_CLASS}
              />
            </label>
            <div className="flex w-40 flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink">Tipe</span>
              <div className="flex h-10 items-center rounded-md border border-hairline bg-surface-2 px-3">
                <span className="badge bg-surface-1">
                  {business.type === 'fnb' ? 'F&B' : 'Retail'}
                </span>
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink">Alamat</span>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Jl. Merdeka No. 12, Bandung"
              className={INPUT_CLASS}
            />
          </label>

          <div className="flex flex-col gap-4 sm:flex-row">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink">
                Zona waktu
              </span>
              <select
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                className={INPUT_CLASS}
              >
                {TIMEZONES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink">
                Mata uang
              </span>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className={INPUT_CLASS}
              >
                <option value="IDR">IDR — Rupiah</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="btn-primary disabled:opacity-50"
            >
              {savingProfile ? 'Menyimpan…' : 'Simpan perubahan'}
            </button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={QrCode}
        title="Pembayaran — QRIS"
        description="Gambar QRIS statis yang muncul di alur pembayaran POS."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-white">
            {qrisUrl ? (
              <Image
                src={qrisUrl}
                alt="Kode QRIS"
                width={96}
                height={96}
                className="size-full object-contain p-1.5"
              />
            ) : (
              <QrCode className="size-12 text-ink-tertiary" />
            )}
          </div>
          <label className="flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-hairline px-4 py-5 text-center transition-colors hover:border-ink-subtle">
            <Upload className="size-5 text-ink-subtle" />
            <span className="text-[12.5px] text-ink-muted">
              {uploading ? 'Mengunggah…' : 'Unggah gambar QRIS (PNG/JPG)'}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(event) => handleAssetChange(event, 'qris')}
            />
          </label>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={CreditCard}
        title="Pembayaran — Xendit"
        description="Hubungkan akun Xendit untuk menerima pembayaran gateway langsung ke rekeningmu."
      >
        <XenditConnect businessId={business.id} />
      </SettingsSection>

      <SettingsSection
        icon={Mail}
        title="Laporan otomatis"
        description="Kirim ringkasan bulanan otomatis tiap tanggal 1."
      >
        <ReportSettings
          businessId={business.id}
          planHasAutomatedReports={planHasAutomatedReports}
        />
      </SettingsSection>

      <SettingsSection
        icon={AlertTriangle}
        title="Zona berbahaya"
        description="Tindakan permanen yang tidak bisa dibatalkan."
        danger
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[13.5px] font-semibold text-ink">
              Hapus bisnis ini
            </span>
            <span className="text-[12.5px] text-ink-muted">
              Semua data produk, transaksi, dan staf akan dihapus permanen.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-error px-5 py-2.5 font-medium text-surface-1 transition-colors hover:bg-error/90"
          >
            Hapus bisnis
          </button>
        </div>
      </SettingsSection>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteOpen(false);
            setDeleteConfirm('');
          }
        }}
      >
        <DialogContent className="sm:max-w-115">
          <DialogHeader>
            <DialogTitle>Hapus bisnis?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-muted">
            Tindakan ini permanen — semua produk, transaksi, staf, dan meja akan
            dihapus. Ketik{' '}
            <span className="font-semibold text-ink">{business.name}</span> untuk
            konfirmasi.
          </p>
          <input
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            placeholder={business.name}
            className={INPUT_CLASS}
          />
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirm('');
              }}
              className="btn-secondary"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || deleteConfirm !== business.name}
              className="inline-flex items-center justify-center rounded-md bg-error px-6 py-2.5 font-medium text-surface-1 transition-colors hover:bg-error/90 disabled:opacity-50"
            >
              {deleting ? 'Menghapus…' : 'Hapus permanen'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
