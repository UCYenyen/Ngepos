'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  Mail,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Play,
  Plus,
  ShoppingCart,
  Star,
  Store,
  TrendingUp,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Harga', href: '#harga' },
  { label: 'Untuk F&B', href: '#fnb' },
  { label: 'Untuk Retail', href: '#retail' },
  { label: 'FAQ', href: '#faq' },
];

const CONTACT = {
  email: 'halo@ngepos.com',
  whatsapp: 'https://wa.me/6281234567890',
  phone: '+6281234567890',
};

const FOOTER_COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Produk',
    links: [
      { label: 'Fitur', href: '#fitur' },
      { label: 'Harga', href: '#harga' },
      { label: 'Untuk F&B', href: '#fnb' },
      { label: 'Untuk Retail', href: '#retail' },
    ],
  },
  {
    heading: 'Bantuan',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Kontak', href: `mailto:${CONTACT.email}` },
      { label: 'WhatsApp', href: CONTACT.whatsapp },
    ],
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ShoppingCart,
    title: 'Kasir cepat (POS)',
    desc: 'Transaksi cash, QRIS, dan payment gateway dalam satu layar.',
  },
  {
    icon: Package,
    title: 'Manajemen produk',
    desc: 'Kategori, varian, dan SKU tertata rapi untuk tiap bisnis.',
  },
  {
    icon: Boxes,
    title: 'Inventaris real-time',
    desc: 'Pantau stok, alert stok menipis, dan riwayat pergerakan.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Manajemen meja',
    desc: 'Status meja & order untuk bisnis F&B dan restoran.',
  },
  {
    icon: BarChart3,
    title: 'Analitik penjualan',
    desc: 'Revenue, produk terlaris, dan kinerja kasir secara visual.',
  },
  {
    icon: Mail,
    title: 'Laporan otomatis',
    desc: 'Ringkasan bulanan via Email & WhatsApp tiap tanggal 1.',
  },
];

const STEPS = [
  {
    title: 'Buat bisnis & pilih tipe',
    desc: 'Retail atau F&B — atur sekali, langsung jalan.',
  },
  {
    title: 'Tambah produk',
    desc: 'Impor atau ketik manual lengkap dengan harga & stok.',
  },
  {
    title: 'Mulai transaksi',
    desc: 'Buka POS dan terima pembayaran pertamamu hari ini.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sari Dewi',
    business: 'Warung Kopi Senja',
    quote:
      'Sejak pakai Ngepos, antrian kasir jauh lebih cepat dan laporan harian otomatis masuk ke WhatsApp saya.',
    initials: 'SD',
  },
  {
    name: 'Andi Pratama',
    business: 'Toko Maju Jaya',
    quote:
      'Stok nggak pernah lagi kosong tanpa ketahuan. Alert stok menipis benar-benar menyelamatkan.',
    initials: 'AP',
  },
  {
    name: 'Rina Wijaya',
    business: 'Bakery Manis',
    quote:
      'Analitiknya bikin saya tahu produk mana yang harus didorong. Omzet naik dalam 2 bulan.',
    initials: 'RW',
  },
];

const FAQS = [
  {
    q: 'Apakah benar-benar gratis untuk memulai?',
    a: 'Ya. Paket Starter gratis selamanya untuk 1 bisnis, 100 produk, dan 2 staf — tanpa kartu kredit.',
  },
  {
    q: 'Bagaimana keamanan data bisnis saya?',
    a: 'Setiap bisnis terisolasi dengan kebijakan keamanan tingkat baris (RLS). Data kamu tidak pernah tercampur dengan bisnis lain.',
  },
  {
    q: 'Bisakah saya mengelola beberapa bisnis sekaligus?',
    a: 'Bisa. Satu akun dapat memiliki beberapa bisnis dan kamu bisa berpindah dengan cepat lewat business switcher.',
  },
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Tunai, QRIS statis, dan payment gateway (Xendit) untuk paket Pro & Enterprise.',
  },
  {
    q: 'Bagaimana laporan WhatsApp bekerja?',
    a: 'Tiap tanggal 1, ringkasan penjualan bulan sebelumnya dikirim otomatis ke Email atau nomor WhatsApp penerima yang kamu atur.',
  },
];

export function Landing({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  const startHref = isAuthenticated ? '/billing' : '/signup';
  const planHref = isAuthenticated ? '/billing' : '/signup';

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-hairline-soft backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-300 items-center justify-between px-6 lg:px-10">
          <Wordmark />
          <nav className="hidden items-center gap-8 text-[14.5px] font-medium text-ink-muted md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-ink">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/billing"
                className="btn-accent h-9 gap-2 px-4 text-sm"
              >
                Billing
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-tertiary h-9 px-4 text-sm">
                  Masuk
                </Link>
                <Link href="/signup" className="btn-accent h-9 px-4 text-sm">
                  Mulai gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-300 px-6 lg:px-10">
        <section className="flex flex-col items-center gap-6 pb-16 pt-16 text-center md:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1 px-3.5 py-1.5 text-[13px] text-ink-muted">
            <span className="size-1.5 rounded-full bg-accent" />
            Kasir digital untuk UMKM Indonesia
          </span>
          <h1 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Jualan jadi simpel. Satu aplikasi kasir untuk semua bisnismu.
          </h1>
          <p className="max-w-xl text-lg text-ink-muted">
            POS, stok, laporan & analitik dalam satu tempat — untuk F&B dan
            retail.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={startHref} className="btn-accent h-12 px-6 text-base">
              {isAuthenticated ? 'Buka dashboard' : 'Mulai gratis'}
            </Link>
            <a href="#fitur" className="btn-secondary h-12 gap-2 px-6 text-base">
              <Play className="size-4" />
              Lihat demo
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13.5px] text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-success" strokeWidth={2.2} />
              Tanpa kartu kredit
            </span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-success" strokeWidth={2.2} />
              Setup 5 menit
            </span>
          </div>
          <div className="mt-6 flex w-full justify-center">
            <HeroMock />
          </div>
        </section>

        <section className="flex flex-col items-center gap-5 pb-20 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
            Dipakai 1.000+ usaha di Indonesia
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-50">
            {['Warung Kopi', 'Resto', 'Butik', 'Minimarket', 'Bakery', 'Apotek'].map(
              (label) => (
                <span
                  key={label}
                  className="flex items-center gap-2 text-base font-bold text-ink-muted"
                >
                  <Store className="size-4.5" />
                  {label}
                </span>
              )
            )}
          </div>
        </section>

        <section id="fitur" className="scroll-mt-20 pb-24">
          <SectionHeading
            title="Semua yang kasirmu butuhkan"
            subtitle="Dari transaksi sampai laporan bulanan — otomatis, rapi, dan real-time."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex flex-col gap-3.5 rounded-2xl border border-hairline bg-surface-1 p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-lg font-semibold text-ink">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-ink-muted">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-24 pb-24">
          <Showcase
            id="fnb"
            label="Untuk F&B"
            title="Kelola meja & pesanan tanpa ribet."
            bullets={[
              'Lihat status tiap meja: kosong, terisi, reservasi',
              'Order langsung tertaut ke transaksi POS',
              'Pembayaran QRIS instan dari pelanggan',
            ]}
            mockLabel="Manajemen meja F&B"
          />
          <Showcase
            id="retail"
            flip
            label="Untuk Retail"
            title="Stok & varian terkendali, selalu."
            bullets={[
              'Lacak stok per varian dan SKU',
              'Alert otomatis saat stok menipis',
              'Riwayat pergerakan barang yang lengkap',
            ]}
            mockLabel="Inventaris + varian retail"
          />
        </section>

        <section className="pb-24">
          <SectionHeading title="Mulai dalam 3 langkah" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="flex flex-col items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-hairline bg-surface-1 text-base font-bold text-ink">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                <p className="text-sm text-ink-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-24">
          <div className="rounded-3xl border border-hairline bg-surface-1 p-8 md:p-10">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                Analitik
              </span>
              <h2 className="text-3xl font-medium tracking-tight text-ink md:text-4xl">
                Pahami bisnismu dengan data.
              </h2>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ['Pendapatan', 'Rp 48,2 jt', '+12,4%'],
                ['Transaksi', '1.284', '+8,1%'],
                ['Rata-rata order', 'Rp 37.500', '+3,2%'],
              ].map(([label, value, delta]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1.5 rounded-xl bg-canvas p-5"
                >
                  <span className="text-[13px] text-ink-muted">{label}</span>
                  <span className="font-mono text-2xl font-bold tabular-nums text-ink">
                    {value}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-success">
                    <TrendingUp className="size-3.5" />
                    {delta}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex h-52 items-end gap-2 rounded-xl bg-canvas p-5">
              {[40, 52, 46, 64, 58, 76, 70, 88, 82, 96].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 9 ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 35%, transparent)',
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="harga" className="scroll-mt-20 pb-24">
          <div className="mb-10 flex flex-col items-center gap-5 text-center">
            <h2 className="text-3xl font-medium tracking-tight text-ink md:text-4xl">
              Harga yang tumbuh bersamamu
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'text-sm',
                  annual ? 'text-ink-muted' : 'font-semibold text-ink'
                )}
              >
                Bulanan
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={annual}
                onClick={() => setAnnual((value) => !value)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  annual ? 'bg-ink' : 'bg-surface-2'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 size-5 rounded-full bg-surface-1 transition-transform',
                    annual ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
              <span
                className={cn(
                  'text-sm',
                  annual ? 'font-semibold text-ink' : 'text-ink-muted'
                )}
              >
                Tahunan
              </span>
              <span className="badge badge-accent h-5 text-[11px]">
                Hemat 20%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <PricingCard
              name="Starter"
              price="Gratis"
              blurb="Untuk yang baru mulai."
              cta="Mulai gratis"
              href={startHref}
              features={[
                '1 bisnis',
                '100 produk',
                '2 staf',
                'POS dasar (cash & QRIS)',
              ]}
            />
            <PricingCard
              name="Pro"
              price={annual ? 'Rp 119rb' : 'Rp 149rb'}
              per="/bln"
              popular
              blurb="Untuk bisnis yang berkembang."
              cta="Pilih Pro"
              href={planHref}
              ctaAccent
              features={[
                '5 bisnis',
                '1.000 produk',
                '10 staf',
                'Inventaris & Manajemen meja',
                'Analitik & Laporan otomatis',
                'Payment gateway',
              ]}
            />
            <PricingCard
              name="Enterprise"
              price="Hubungi"
              blurb="Untuk skala besar & multi-cabang."
              cta="Hubungi kami"
              href="mailto:sales@ngepos.com?subject=Enterprise%20Ngepos"
              features={[
                'Bisnis tak terbatas',
                'Produk tak terbatas',
                'Staf tak terbatas',
                'Semua fitur Pro',
                'Dukungan prioritas',
              ]}
            />
          </div>
        </section>

        <section className="pb-24">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface-1 p-6"
              >
                <div className="flex gap-0.5 text-accent">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="flex-1 text-[15px] text-ink">
                  “{testimonial.quote}”
                </p>
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-[13px] font-semibold text-ink">
                    {testimonial.initials}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-ink">
                      {testimonial.name}
                    </span>
                    <span className="text-[12.5px] text-ink-muted">
                      {testimonial.business}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 pb-24">
          <h2 className="mb-9 text-center text-3xl font-medium tracking-tight text-ink">
            Pertanyaan umum
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-hairline bg-surface-1 px-5 py-4"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="text-[15.5px] font-semibold text-ink">
                      {faq.q}
                    </span>
                    {open ? (
                      <Minus className="size-4.5 shrink-0 text-ink-subtle" />
                    ) : (
                      <Plus className="size-4.5 shrink-0 text-ink-subtle" />
                    )}
                  </button>
                  {open && (
                    <p className="mt-3 max-w-2xl text-sm text-ink-muted">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="pb-20">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-ink px-6 py-16 text-center">
            <h2 className="text-3xl font-medium tracking-tight text-surface-1 sm:text-4xl md:text-5xl">
              Siap modernkan kasirmu?
            </h2>
            <p className="text-lg text-surface-1/70">
              Mulai gratis hari ini. Setup hanya 5 menit.
            </p>
            <Link href={startHref} className="btn-accent h-12 px-6 text-base">
              {isAuthenticated ? 'Buka dashboard' : 'Mulai gratis sekarang'}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-300 px-6 pb-9 pt-12 lg:px-10">
          <div className="mb-10 flex flex-col gap-10 md:flex-row md:gap-16">
            <div className="flex flex-1 flex-col gap-3">
              <Wordmark />
              <p className="max-w-60 text-[13.5px] text-ink-muted">
                Kasir digital untuk UMKM Indonesia.
              </p>
            </div>
            {FOOTER_COLUMNS.map(({ heading, links }) => (
              <div key={heading} className="flex flex-1 flex-col gap-3">
                <span className="text-[13.5px] font-semibold text-ink">
                  {heading}
                </span>
                {links.map(({ label, href }) => {
                  const external = href.startsWith('http');
                  return (
                    <a
                      key={label}
                      href={href}
                      {...(external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="text-[13.5px] text-ink-muted transition-colors hover:text-ink"
                    >
                      {label}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="border-t border-hairline-soft pt-5" />
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-muted">
              © 2026 Ngepos. Dibuat di Indonesia.
            </span>
            <div className="flex items-center gap-3 text-ink-subtle">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="transition-colors hover:text-ink"
              >
                <MessageCircle className="size-4.5" />
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                aria-label="Email"
                className="transition-colors hover:text-ink"
              >
                <Mail className="size-4.5" />
              </a>
              <a
                href={`tel:${CONTACT.phone}`}
                aria-label="Telepon"
                className="transition-colors hover:text-ink"
              >
                <Phone className="size-4.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 text-[19px] font-bold tracking-tight text-ink">
      <span className="inline-flex size-6.5 items-center justify-center rounded-lg bg-accent text-surface-1">
        <Zap className="size-3.5 fill-current" />
      </span>
      Ngepos
    </span>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-11 flex flex-col items-center gap-3 text-center">
      <h2 className="text-3xl font-medium tracking-tight text-ink md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-xl text-base text-ink-muted md:text-lg">{subtitle}</p>
      )}
    </div>
  );
}

function Showcase({
  id,
  flip,
  label,
  title,
  bullets,
  mockLabel,
}: {
  id: string;
  flip?: boolean;
  label: string;
  title: string;
  bullets: string[];
  mockLabel: string;
}) {
  const text = (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
        {label}
      </span>
      <h3 className="max-w-md text-3xl font-medium tracking-tight text-ink">
        {title}
      </h3>
      <div className="flex flex-col gap-3">
        {bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
              <Check className="size-3" strokeWidth={2.4} />
            </span>
            <span className="text-[15px] text-ink">{bullet}</span>
          </div>
        ))}
      </div>
      <span className="flex items-center gap-1.5 text-[15px] font-semibold text-accent">
        Pelajari
        <ArrowRight className="size-4" />
      </span>
    </div>
  );
  const mock = (
    <div className="flex flex-1 items-center justify-center rounded-2xl border border-hairline bg-surface-2 text-center text-[13px] font-medium text-ink-subtle">
      <span className="aspect-video w-full content-center">{mockLabel}</span>
    </div>
  );
  return (
    <div
      id={id}
      className="flex scroll-mt-20 flex-col items-stretch gap-10 md:flex-row md:gap-16"
    >
      {flip ? (
        <>
          <div className="hidden flex-1 md:block">{mock}</div>
          {text}
          <div className="md:hidden">{mock}</div>
        </>
      ) : (
        <>
          {text}
          {mock}
        </>
      )}
    </div>
  );
}

function PricingCard({
  name,
  price,
  per,
  blurb,
  cta,
  href,
  ctaAccent,
  popular,
  features,
}: {
  name: string;
  price: string;
  per?: string;
  blurb: string;
  cta: string;
  href: string;
  ctaAccent?: boolean;
  popular?: boolean;
  features: string[];
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-5 rounded-2xl border bg-surface-1 p-7',
        popular ? 'border-accent' : 'border-hairline'
      )}
    >
      {popular && (
        <span className="absolute -top-2.5 left-7 inline-flex h-5 items-center rounded-full bg-accent px-2 text-[10px] font-bold uppercase text-surface-1">
          Populer
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        <span className="text-base font-semibold text-ink">{name}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-medium tracking-tight text-ink">
            {price}
          </span>
          {per && <span className="text-sm text-ink-muted">{per}</span>}
        </div>
        <span className="text-[13.5px] text-ink-muted">{blurb}</span>
      </div>
      <Link
        href={href}
        className={cn(ctaAccent ? 'btn-accent' : 'btn-secondary', 'w-full')}
      >
        {cta}
      </Link>
      <div className="border-t border-hairline-soft" />
      <div className="flex flex-col gap-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-2.5">
            <Check
              className="mt-0.5 size-4 shrink-0 text-accent"
              strokeWidth={2.2}
            />
            <span className="text-[13.5px] text-ink">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroMock() {
  const products = [
    ['Kopi Susu', '18.000'],
    ['Americano', '15.000'],
    ['Latte', '22.000'],
    ['Matcha', '24.000'],
    ['Croissant', '20.000'],
    ['Donat', '12.000'],
  ];
  const cart = [
    ['Kopi Susu', '18.000'],
    ['Latte', '22.000'],
    ['Donat', '12.000'],
  ];
  return (
    <div className="relative w-full max-w-xl">
      <div
        className="absolute -inset-x-8 -inset-y-10 rounded-[40px]"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 40%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 70%)',
        }}
      />
      <div className="relative rounded-[18px] border border-hairline bg-surface-1 p-3">
        <div className="mb-2.5 flex gap-2 pl-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-hairline" />
          ))}
        </div>
        <div className="flex gap-2.5">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              {['Kopi', 'Teh', 'Snack', 'Roti'].map((category, i) => (
                <span
                  key={category}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    i === 0
                      ? 'bg-ink text-surface-1'
                      : 'border border-hairline text-ink-muted'
                  )}
                >
                  {category}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {products.map(([name, price]) => (
                <div
                  key={name}
                  className="flex flex-col gap-1.5 rounded-[10px] border border-hairline bg-surface-1 p-2"
                >
                  <div className="aspect-4/3 rounded-md bg-surface-2" />
                  <span className="text-[10px] font-semibold leading-tight text-ink">
                    {name}
                  </span>
                  <span className="font-mono text-[9.5px] font-bold text-accent">
                    Rp {price}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex w-40 shrink-0 flex-col gap-2 rounded-[10px] border border-hairline bg-surface-1 p-2.5">
            <span className="text-[11px] font-bold text-ink">Pesanan</span>
            {cart.map(([name, price]) => (
              <div key={name} className="flex justify-between text-[10px]">
                <span className="text-ink-muted">1× {name}</span>
                <span className="font-mono text-ink">{price}</span>
              </div>
            ))}
            <div className="my-0.5 border-t border-hairline-soft" />
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-ink">Total</span>
              <span className="font-mono text-[11px] font-bold text-ink">
                Rp 52.000
              </span>
            </div>
            <div className="mt-auto flex h-7 items-center justify-center rounded-md bg-accent text-[10px] font-semibold text-surface-1">
              Bayar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
