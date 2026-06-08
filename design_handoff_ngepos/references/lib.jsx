/* ===================================================================
   Ngepos — Shared primitives & icon set (exports to window)
   =================================================================== */

// ---- Lucide icon paths (inner SVG markup, 24x24, stroke) ----
const ICONS = {
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/><path d="m7.5 4.27 9 5.15"/>',
  boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3z"/><path d="m7 16.5-4.74-2.85M7 16.5l5-3M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3z"/><path d="m17 16.5-5-3M17 16.5l4.74-2.85M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0z"/><path d="M12 8 7.26 5.15M12 8l4.74-2.85M12 13.5V8"/>',
  utensils: '<path d="M3 2v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronsUpDown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M2 7h20"/><path d="M4 12h16"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
  cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>',
  calendar: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  trendUp: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  trendDown: '<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2M12 16v2"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m6.08 9.5-3.49 1.59a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/><path d="m6.08 14.5-3.49 1.59a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  sparkles: '<path d="M9.94 14.34A2 2 0 0 0 8.66 13.06L3 11l5.66-2.06a2 2 0 0 0 1.28-1.28L12 2l2.06 5.66a2 2 0 0 0 1.28 1.28L21 11l-5.66 2.06a2 2 0 0 0-1.28 1.28L12 20Z"/><path d="M19 3v4M21 5h-4"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>',
  google: '<path d="M21.35 11.1H12v3.2h5.35c-.25 1.5-1.7 4.4-5.35 4.4-3.2 0-5.85-2.65-5.85-5.9S8.8 6.9 12 6.9c1.85 0 3.05.8 3.75 1.45l2.55-2.45C16.7 4.35 14.55 3.5 12 3.5 6.95 3.5 2.85 7.6 2.85 12.7S6.95 21.9 12 21.9c5.3 0 8.8-3.7 8.8-8.95 0-.6-.05-1.05-.15-1.85Z" fill="currentColor" stroke="none"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  coffee: '<path d="M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
  menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  dollar: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/',
};

function Icon({ name, size = 18, stroke = 1.75, fill = false, style, className }) {
  const inner = ICONS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}
      fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flex: '0 0 auto', ...style }}
      dangerouslySetInnerHTML={{ __html: inner }} />
  );
}

// ---- Money (IDR) ----
function rp(n) {
  return 'Rp\u00a0' + Math.round(n).toLocaleString('id-ID');
}

// ---- Striped placeholder ----
function Ph({ label, w, h, radius = 12, style, className = '' }) {
  return (
    <div className={'ph ' + className} style={{ width: w, height: h, borderRadius: radius, ...style }}>
      {label && <span className="ph-label">{label}</span>}
    </div>
  );
}

// ---- Button ----
function Btn({ variant = 'secondary', size, icon, iconRight, children, disabled, block, style, onClick }) {
  const cls = ['btn', 'btn-' + variant];
  if (size) cls.push('btn-' + size);
  if (block) cls.push('btn-block');
  if (disabled) cls.push('is-disabled');
  return (
    <button className={cls.join(' ')} style={style} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 17} />}
    </button>
  );
}

// ---- Badge ----
function Badge({ tone = '', dot, children, style }) {
  return (
    <span className={'badge' + (tone ? ' badge-' + tone : '')} style={style}>
      {dot && <span className="badge-dot" style={{ background: dot }} />}
      {children}
    </span>
  );
}

function ProLock() {
  return <span className="lock-badge"><Icon name="lock" size={10} stroke={2.2} />PRO</span>;
}

// ---- Avatar ----
function Avatar({ initials, size = 36, tint, style }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36,
      background: tint || undefined, color: tint ? '#fff' : undefined, ...style }}>{initials}</span>
  );
}

// ---- Notice card (Pro-locked feature gate) ----
function NoticeCard({ title = 'Fitur Pro', desc, cta = 'Upgrade ke Pro' }) {
  return (
    <div className="center" style={{ height: '100%', padding: 40 }}>
      <div className="card center col" style={{ maxWidth: 460, padding: '40px 36px', textAlign: 'center', gap: 18 }}>
        <div className="center" style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-tint)', color: 'var(--accent)' }}>
          <Icon name="lock" size={24} stroke={2} />
        </div>
        <div className="col gap8" style={{ alignItems: 'center' }}>
          <div className="h2">{title}</div>
          <div className="body muted" style={{ maxWidth: 340 }}>{desc}</div>
        </div>
        <Btn variant="accent" icon="sparkles">{cta}</Btn>
      </div>
    </div>
  );
}

// ===================================================================
//  App shell — sidebar + page header. Used by all /[businessId] pages.
// ===================================================================
const NAV = [
  { id: 'pos', label: 'POS', icon: 'cart' },
  { id: 'products', label: 'Produk', icon: 'package' },
  { id: 'inventory', label: 'Inventaris', icon: 'boxes', pro: true },
  { id: 'tables', label: 'Meja', icon: 'utensils', pro: true, fnbOnly: true },
  { id: 'staff', label: 'Staf', icon: 'users' },
  { id: 'analytics', label: 'Analitik', icon: 'chart', pro: true },
  { id: 'reports', label: 'Laporan', icon: 'file', pro: true },
  { id: 'settings', label: 'Pengaturan', icon: 'settings' },
];

function Sidebar({ active, biz = 'fnb', plan = 'pro' }) {
  const bizName = biz === 'fnb' ? 'Kopi Senja' : 'Toko Maju';
  const bizInit = biz === 'fnb' ? 'KS' : 'TM';
  return (
    <aside style={{ width: 256, flex: '0 0 256px', background: 'var(--surface-1)', borderRight: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* business switcher */}
      <div style={{ padding: 12, borderBottom: '1px solid var(--hairline-soft)' }}>
        <button className="between" style={{ width: '100%', gap: 10, padding: 8, borderRadius: 10, border: '1px solid var(--hairline)', background: 'var(--surface-1)', cursor: 'pointer' }}>
          <span className="row gap8" style={{ minWidth: 0 }}>
            <Avatar initials={bizInit} size={32} tint="var(--accent)" style={{ borderRadius: 9 }} />
            <span className="col" style={{ alignItems: 'flex-start', minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{bizName}</span>
              <span className="badge" style={{ height: 16, padding: '0 6px', fontSize: 10, marginTop: 1 }}>{biz === 'fnb' ? 'F&B' : 'Retail'}</span>
            </span>
          </span>
          <Icon name="chevronsUpDown" size={15} style={{ color: 'var(--ink-subtle)' }} />
        </button>
      </div>
      {/* nav */}
      <nav className="grow no-scrollbar" style={{ padding: '10px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.filter(n => !(n.fnbOnly && biz !== 'fnb')).map(n => {
          const on = n.id === active;
          const locked = n.pro && plan === 'starter';
          return (
            <div key={n.id} style={{ position: 'relative' }}>
              {on && <span style={{ position: 'absolute', left: -10, top: 8, bottom: 8, width: 3, borderRadius: 999, background: 'var(--accent)' }} />}
              <div className="row" style={{ gap: 11, padding: '9px 10px', borderRadius: 9, cursor: 'pointer',
                background: on ? 'var(--surface-2)' : 'transparent',
                color: on ? 'var(--ink)' : 'var(--ink-muted)' }}>
                <Icon name={n.icon} size={18} stroke={on ? 2 : 1.75} />
                <span style={{ fontSize: 14, fontWeight: on ? 600 : 500 }} className="grow">{n.label}</span>
                {locked && <ProLock />}
              </div>
            </div>
          );
        })}
      </nav>
      {/* user */}
      <div style={{ padding: 10, borderTop: '1px solid var(--hairline-soft)' }}>
        <button className="row" style={{ width: '100%', gap: 10, padding: 8, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <Avatar initials="BS" size={32} />
          <span className="col grow" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>Budi Santoso</span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-subtle)' }}>Owner</span>
          </span>
          <Icon name="chevronsUpDown" size={14} style={{ color: 'var(--ink-subtle)' }} />
        </button>
      </div>
    </aside>
  );
}

function PageShell({ title, subtitle, action, children, pad = 28 }) {
  return (
    <div className="grow col" style={{ background: 'var(--canvas)', height: '100%', minWidth: 0 }}>
      <header className="between" style={{ padding: '22px 28px 18px', gap: 16 }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="h1">{title}</div>
          {subtitle && <div className="body muted" style={{ fontSize: 14.5 }}>{subtitle}</div>}
        </div>
        {action}
      </header>
      <div className="grow no-scrollbar" style={{ padding: `0 ${pad}px ${pad}px`, overflow: 'auto', minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

// Full desktop app frame: sidebar + page
function AppFrame({ active, biz, plan, children }) {
  return (
    <div className="np row" style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
      <Sidebar active={active} biz={biz} plan={plan} />
      {children}
    </div>
  );
}

Object.assign(window, {
  Icon, ICONS, rp, Ph, Btn, Badge, ProLock, Avatar, NoticeCard,
  Sidebar, PageShell, AppFrame, NAV,
});
