/* ===================================================================
   Ngepos — Tables (F&B only) & Staff
   =================================================================== */

const TABLES = [
  ['Meja 01', 2, 'available'], ['Meja 02', 2, 'occupied'], ['Meja 03', 4, 'available'],
  ['Meja 04', 4, 'occupied'], ['Meja 05', 6, 'reserved'], ['Meja 06', 2, 'available'],
  ['Meja 07', 4, 'occupied'], ['Meja 08', 8, 'available'], ['Meja 09', 2, 'reserved'],
  ['Meja 10', 4, 'available'], ['Meja 11', 6, 'occupied'], ['Meja 12', 2, 'available'],
];
const TSTATUS = {
  available: ['Kosong', 'var(--success)', 'var(--success-light)'],
  occupied: ['Terisi', 'var(--accent)', 'var(--accent-tint)'],
  reserved: ['Reservasi', 'var(--ink-muted)', 'var(--surface-2)'],
};

function TableCard({ name, cap, status }) {
  const [label, fg, bg] = TSTATUS[status];
  return (
    <div className="card col gap10" style={{ padding: 16, borderRadius: 14, cursor: 'pointer', borderColor: status === 'occupied' ? 'var(--accent)' : 'var(--hairline)' }}>
      <div className="between">
        <span className="h3" style={{ fontSize: 15 }}>{name}</span>
        <span className="row gap4 muted" style={{ fontSize: 12.5 }}><Icon name="users" size={14} />{cap}</span>
      </div>
      <span className="badge" style={{ background: bg, color: fg, alignSelf: 'flex-start', height: 24 }}><span className="badge-dot" style={{ background: fg }} />{label}</span>
      {status === 'occupied' && <span className="mono muted" style={{ fontSize: 11.5 }}>3 item · {rp(64000)}</span>}
      {status === 'reserved' && <span className="muted" style={{ fontSize: 11.5 }}>19:30 · a.n. Andi</span>}
      {status === 'available' && <span className="muted" style={{ fontSize: 11.5 }}>Siap digunakan</span>}
    </div>
  );
}

function TablesScreen({ plan = 'pro' }) {
  if (plan === 'starter') {
    return <AppFrame active="tables" biz="fnb" plan="starter"><PageShell title="Meja" subtitle="Kelola status meja dan pesanan."><NoticeCard desc="Kelola status meja, reservasi, dan pesanan yang tertaut ke POS. Tersedia di paket Pro & Enterprise." /></PageShell></AppFrame>;
  }
  return (
    <AppFrame active="tables" biz="fnb" plan="pro">
      <PageShell title="Meja" subtitle="Pantau status lantai dan pesanan tiap meja secara langsung."
        action={<Btn variant="accent" icon="plus">Tambah meja</Btn>}>
        <div className="row gap16 wrap" style={{ marginBottom: 18 }}>
          {Object.entries(TSTATUS).map(([k, [l, fg]]) => (
            <span key={k} className="row gap6 muted" style={{ fontSize: 13 }}><span className="badge-dot" style={{ background: fg, width: 8, height: 8 }} />{l}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxWidth: 920 }}>
          {TABLES.map((t, i) => <TableCard key={i} name={t[0]} cap={t[1]} status={t[2]} />)}
        </div>
      </PageShell>
    </AppFrame>
  );
}

function TableDrawerScreen() {
  return (
    <div className="np" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}><TablesScreen /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.4)' }} />
      <div className="col" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 400, background: 'var(--surface-1)', borderLeft: '1px solid var(--hairline)', boxShadow: '-12px 0 40px rgba(0,0,0,0.16)' }}>
        <div className="between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--hairline-soft)' }}>
          <div className="col"><span className="h3">Meja 04</span><span className="muted" style={{ fontSize: 12.5 }}>Kapasitas 4 · 2 orang</span></div>
          <span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="x" size={18} /></span>
        </div>
        <div className="grow no-scrollbar col gap18" style={{ padding: 22, overflow: 'auto' }}>
          <div className="between">
            <span className="badge" style={{ background: 'var(--accent-tint)', color: 'var(--accent)', height: 26 }}><span className="badge-dot" style={{ background: 'var(--accent)' }} />Terisi</span>
            <span className="badge badge-success" style={{ height: 26 }}>Disajikan</span>
          </div>
          <div className="col gap8">
            <span className="eyebrow">Pesanan · #TRX-0041</span>
            {[['2× Kopi Susu', 36000], ['1× Croissant', 20000], ['1× Es Teh Manis', 8000]].map(([n, p]) => (
              <div key={n} className="between" style={{ fontSize: 13.5 }}><span className="muted">{n}</span><span className="mono">{rp(p)}</span></div>
            ))}
            <hr className="divider" />
            <div className="between"><span style={{ fontWeight: 600 }}>Total</span><span className="mono" style={{ fontWeight: 700, fontSize: 16 }}>{rp(64000)}</span></div>
          </div>
          <div className="col gap8">
            <span className="eyebrow">Status order</span>
            <div className="row gap8 wrap">
              {[['Pending', false], ['Diproses', false], ['Disajikan', true], ['Lunas', false]].map(([s, on]) => (
                <span key={s} className={'pill' + (on ? ' is-active' : '')} style={{ height: 30 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="row gap10" style={{ padding: 18, borderTop: '1px solid var(--hairline-soft)' }}>
          <Btn variant="secondary" block>Pindah meja</Btn>
          <Btn variant="accent" block icon="cart">Buka di POS</Btn>
        </div>
      </div>
    </div>
  );
}

// ---- Staff ----
const STAFF = [
  ['Budi Santoso', 'budi@kopisenja.id', 'Owner', 'BS', '12 Jan 2025'],
  ['Sari Dewi', 'sari@kopisenja.id', 'Manager', 'SD', '3 Feb 2025'],
  ['Andi Pratama', 'andi@kopisenja.id', 'Cashier', 'AP', '18 Mar 2025'],
  ['Rina Wijaya', 'rina@kopisenja.id', 'Cashier', 'RW', '2 Apr 2025'],
  ['Doni Saputra', 'doni@kopisenja.id', 'Cashier', 'DS', '20 May 2025'],
];
const ROLE_TONE = { Owner: 'badge-ink', Manager: 'badge-accent', Cashier: '' };

function StaffScreen({ biz = 'fnb' }) {
  return (
    <AppFrame active="staff" biz={biz} plan="pro">
      <PageShell title="Staf" subtitle="Kelola anggota tim dan peran akses mereka."
        action={<div className="row gap12"><span className="badge" style={{ height: 32, padding: '0 12px', fontSize: 13 }}>8 / 10 staf</span><Btn variant="accent" icon="plus">Undang staf</Btn></div>}>
        <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--surface-2)' }}>
              <Th>Anggota</Th><Th>Peran</Th><Th>Bergabung</Th><Th style={{ width: 48 }}></Th>
            </tr></thead>
            <tbody>
              {STAFF.map((s, i) => (
                <tr key={i}>
                  <Td><div className="row gap12"><Avatar initials={s[3]} size={36} /><div className="col"><span style={{ fontWeight: 600 }}>{s[0]}</span><span className="muted" style={{ fontSize: 12.5 }}>{s[1]}</span></div></div></Td>
                  <Td><span className={'badge ' + ROLE_TONE[s[2]]}>{s[2]}</span></Td>
                  <Td><span className="muted">{s[4]}</span></Td>
                  <Td>{s[2] !== 'Owner' ? <span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="more" size={16} /></span> : <span className="muted" style={{ fontSize: 11.5 }}>—</span>}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col gap10" style={{ maxWidth: 620 }}>
          <span className="eyebrow">Undangan tertunda</span>
          <div className="card between" style={{ padding: '12px 16px' }}>
            <div className="row gap12"><Avatar initials="?" size={36} style={{ background: 'var(--surface-2)' }} /><div className="col"><span style={{ fontWeight: 600, fontSize: 13.5 }}>maya@email.com</span><span className="muted" style={{ fontSize: 12 }}>Cashier · dikirim 2 hari lalu</span></div></div>
            <div className="row gap8"><span className="badge">Menunggu</span><Btn variant="tertiary" size="sm">Kirim ulang</Btn><span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="x" size={15} /></span></div>
          </div>
        </div>
      </PageShell>
    </AppFrame>
  );
}

function StaffInviteScreen({ biz = 'fnb' }) {
  return (
    <div className="np" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}><StaffScreen biz={biz} /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.45)' }} />
      <div className="center" style={{ position: 'absolute', inset: 0, padding: 32 }}>
        <div className="card col" style={{ width: 480, borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>
          <div className="between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline-soft)' }}>
            <span className="h3">Undang staf baru</span>
            <span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="x" size={18} /></span>
          </div>
          <div className="col gap18" style={{ padding: 24 }}>
            <FormField label="Email" type="email" placeholder="nama@email.com" value="maya@email.com" />
            <div className="field">
              <label className="label">Peran</label>
              <div className="col gap8">
                {[['Owner', 'Akses penuh ke semua fitur & pengaturan', false], ['Manager', 'Semua kecuali kelola staf & pengaturan', true], ['Cashier', 'Hanya akses transaksi POS', false]].map(([r, d, on]) => (
                  <div key={r} className="card row gap12" style={{ padding: 14, cursor: 'pointer', alignItems: 'center', border: on ? '1.5px solid var(--accent)' : '1px solid var(--hairline)', background: on ? 'var(--accent-tint)' : 'var(--surface-1)' }}>
                    <span className="center" style={{ width: 18, height: 18, borderRadius: 999, border: on ? '5px solid var(--accent)' : '2px solid var(--hairline)', background: 'var(--surface-1)' }} />
                    <div className="col"><span style={{ fontWeight: 600, fontSize: 13.5 }}>{r}</span><span className="muted" style={{ fontSize: 12 }}>{d}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="row gap10" style={{ padding: '0 24px 24px' }}>
            <Btn variant="secondary" block>Batal</Btn>
            <Btn variant="accent" block icon="mail">Kirim undangan</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TablesScreen, TableDrawerScreen, StaffScreen, StaffInviteScreen });
