/* ===================================================================
   Ngepos — Analytics & Reports  (Pro/Enterprise)
   =================================================================== */

// ---- Area chart (revenue over time) ----
function AreaChart({ h = 240 }) {
  const data = [22, 28, 25, 34, 30, 42, 38, 48, 44, 52, 49, 58, 54, 62];
  const w = 900, pad = 8;
  const max = 70, min = 0;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, h - pad - ((v - min) / (max - min)) * (h - pad * 2 - 18)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L ${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(g => <line key={g} x1={pad} x2={w - pad} y1={(h - pad * 2 - 18) * g + pad} y2={(h - pad * 2 - 18) * g + pad} stroke="var(--hairline-soft)" strokeWidth="1" />)}
      <path d={area} fill="url(#rev)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[11][0]} cy={pts[11][1]} r="4" fill="var(--accent)" stroke="var(--surface-1)" strokeWidth="2" />
    </svg>
  );
}

function HBars() {
  const data = [['Kopi Susu Gula Aren', 1280, 'var(--accent)'], ['Caffe Latte', 980, 'var(--c-blue)'], ['Croissant', 740, 'var(--c-cyan)'], ['Matcha Latte', 610, 'var(--c-lime)'], ['Es Teh Manis', 520, 'var(--c-pink)']];
  const max = 1280;
  return (
    <div className="col gap14">
      {data.map(([n, v, c]) => (
        <div key={n} className="col gap6">
          <div className="between" style={{ fontSize: 13 }}><span style={{ fontWeight: 500 }}>{n}</span><span className="mono muted">{v} terjual</span></div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}><div style={{ width: (v / max * 100) + '%', height: '100%', borderRadius: 999, background: c }} /></div>
        </div>
      ))}
    </div>
  );
}

function Donut({ data, size = 150 }) {
  const total = data.reduce((a, d) => a + d[1], 0);
  const r = size / 2 - 14, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="row gap20" style={{ alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flex: '0 0 auto' }}>
        {data.map(([n, v, c], i) => {
          const len = (v / total) * C;
          const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />;
          off += len; return el;
        })}
      </svg>
      <div className="col gap8">
        {data.map(([n, v, c]) => (
          <div key={n} className="row gap8" style={{ fontSize: 12.5 }}>
            <span className="cap-color" style={{ background: c, borderRadius: 3 }} />
            <span className="grow" style={{ fontWeight: 500 }}>{n}</span>
            <span className="mono muted">{Math.round(v / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, up = true }) {
  return (
    <div className="card grow col gap8" style={{ padding: 20 }}>
      <span className="muted" style={{ fontSize: 13 }}>{label}</span>
      <span className="mono" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</span>
      <span className="row gap4" style={{ fontSize: 12.5, fontWeight: 600, color: up ? 'var(--success)' : 'var(--error)' }}><Icon name={up ? 'trendUp' : 'trendDown'} size={14} />{delta} <span className="muted" style={{ fontWeight: 400 }}>vs bulan lalu</span></span>
    </div>
  );
}

function ChartCard({ title, sub, action, children, style }) {
  return (
    <div className="card col" style={{ padding: 20, ...style }}>
      <div className="between" style={{ marginBottom: 16 }}>
        <div className="col gap2"><span className="h3" style={{ fontSize: 15 }}>{title}</span>{sub && <span className="muted" style={{ fontSize: 12.5 }}>{sub}</span>}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function AnalyticsScreen({ biz = 'fnb', plan = 'pro' }) {
  if (plan === 'starter') {
    return <AppFrame active="analytics" biz={biz} plan="starter"><PageShell title="Analitik" subtitle="Pahami performa bisnismu dengan data."><NoticeCard desc="Dashboard analitik lengkap: revenue, produk terlaris, kinerja kasir, dan tren penjualan. Tersedia di paket Pro & Enterprise." /></PageShell></AppFrame>;
  }
  return (
    <AppFrame active="analytics" biz={biz} plan="pro">
      <PageShell title="Analitik" subtitle="Performa penjualan Kopi Senja, Juni 2026."
        action={<div className="row gap6">{['Hari ini', 'Minggu ini', 'Bulan ini', 'Kustom'].map((p, i) => <span key={p} className={'pill' + (i === 2 ? ' is-active' : '')} style={{ height: 36 }}>{p}</span>)}</div>}>
        <div className="col gap16">
          <div className="row gap16">
            <Kpi label="Total Pendapatan" value="Rp 48,2 jt" delta="+12,4%" />
            <Kpi label="Jumlah Transaksi" value="1.284" delta="+8,1%" />
            <Kpi label="Rata-rata Order (AOV)" value="Rp 37.500" delta="+3,2%" />
          </div>
          <ChartCard title="Pendapatan" sub="14 hari terakhir" action={<span className="row gap6 muted" style={{ fontSize: 12.5 }}><span className="cap-color" style={{ background: 'var(--accent)', borderRadius: 999 }} />Revenue</span>}>
            <AreaChart />
            <div className="between" style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-tertiary)' }}><span>26 Mei</span><span>1 Jun</span><span>5 Jun</span><span>8 Jun</span></div>
          </ChartCard>
          <div className="row gap16">
            <ChartCard title="Produk terlaris" style={{ flex: '1.3 1 0' }}><HBars /></ChartCard>
            <ChartCard title="Penjualan per kategori" style={{ flex: '1 1 0' }}>
              <Donut data={[['Kopi', 48, 'var(--accent)'], ['Roti', 24, 'var(--c-blue)'], ['Teh', 18, 'var(--c-cyan)'], ['Snack', 10, 'var(--c-lime)']]} />
            </ChartCard>
          </div>
          <div className="row gap16">
            <ChartCard title="Metode pembayaran" style={{ flex: '1 1 0' }}>
              <Donut data={[['Tunai', 42, 'var(--c-green)'], ['QRIS', 46, 'var(--c-blue)'], ['Gateway', 12, 'var(--c-pink)']]} />
            </ChartCard>
            <ChartCard title="Kinerja kasir" style={{ flex: '1.3 1 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><Th style={{ padding: '0 0 10px' }}>Kasir</Th><Th style={{ padding: '0 0 10px', textAlign: 'right' }}>Pendapatan</Th><Th style={{ padding: '0 0 10px', textAlign: 'right' }}>Transaksi</Th></tr></thead>
                <tbody>
                  {[['Sari Dewi', 'SD', 18200000, 482], ['Andi Pratama', 'AP', 14800000, 396], ['Rina Wijaya', 'RW', 9100000, 268], ['Doni Saputra', 'DS', 6100000, 138]].map(([n, init, rev, tx]) => (
                    <tr key={n}><Td style={{ padding: '9px 0', borderTopColor: 'var(--hairline-soft)' }}><div className="row gap8"><Avatar initials={init} size={26} style={{ fontSize: 10 }} />{n}</div></Td><Td style={{ padding: '9px 0', textAlign: 'right' }}><span className="mono" style={{ fontWeight: 600 }}>{rp(rev)}</span></Td><Td style={{ padding: '9px 0', textAlign: 'right' }}><span className="mono muted">{tx}</span></Td></tr>
                  ))}
                </tbody>
              </table>
            </ChartCard>
          </div>
        </div>
      </PageShell>
    </AppFrame>
  );
}

function ReportsScreen({ biz = 'fnb', plan = 'pro' }) {
  if (plan === 'starter') {
    return <AppFrame active="reports" biz={biz} plan="starter"><PageShell title="Laporan" subtitle="Unduh ringkasan bisnis bulanan."><NoticeCard desc="Buat dan unduh laporan PDF & CSV, serta aktifkan laporan otomatis via Email & WhatsApp. Tersedia di paket Pro & Enterprise." /></PageShell></AppFrame>;
  }
  return (
    <AppFrame active="reports" biz={biz} plan="pro">
      <PageShell title="Laporan" subtitle="Ringkasan performa bisnis untuk periode tertentu.">
        <div className="row gap20" style={{ alignItems: 'flex-start' }}>
          <div className="col gap16" style={{ flex: '1.4 1 0' }}>
            <div className="card col gap16" style={{ padding: 22 }}>
              <div className="between">
                <div className="col gap2"><span className="h3">Kopi Senja</span><span className="muted" style={{ fontSize: 13 }}>Laporan bulanan</span></div>
                <div className="input row between" style={{ width: 160, height: 38 }}><span style={{ fontSize: 13.5 }}>Mei 2026</span><Icon name="chevronDown" size={15} style={{ color: 'var(--ink-subtle)' }} /></div>
              </div>
              <div className="row gap12">
                {[['Total pendapatan', 'Rp 48,2 jt'], ['Transaksi', '1.284'], ['Produk terjual', '3.842']].map(([l, v]) => (
                  <div key={l} className="col gap4" style={{ flex: '1 1 0', padding: 14, background: 'var(--canvas)', borderRadius: 10 }}>
                    <span className="muted" style={{ fontSize: 12 }}>{l}</span><span className="mono" style={{ fontSize: 17, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
              <hr className="divider" />
              <div className="col gap10">
                <span className="eyebrow">Produk terlaris</span>
                {[['Kopi Susu Gula Aren', 1280], ['Caffe Latte', 980], ['Croissant', 740]].map(([n, v]) => (
                  <div key={n} className="between" style={{ fontSize: 13.5 }}><span>{n}</span><span className="mono muted">{v} terjual</span></div>
                ))}
              </div>
              <div className="row gap8" style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--error-light)', color: 'var(--error)' }}>
                <Icon name="alert" size={16} stroke={2} /><span style={{ fontSize: 13, fontWeight: 500 }}>3 produk dengan stok menipis pada akhir periode.</span>
              </div>
            </div>
          </div>
          <div className="col gap16" style={{ flex: '1 1 0' }}>
            <div className="card col gap14" style={{ padding: 22 }}>
              <span className="h3" style={{ fontSize: 15 }}>Unduh laporan</span>
              <div className="card row gap12" style={{ padding: 14, alignItems: 'center', background: 'var(--canvas)' }}>
                <span className="center" style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-tint)', color: 'var(--accent)' }}><Icon name="file" size={18} /></span>
                <div className="col grow"><span style={{ fontWeight: 600, fontSize: 13.5 }}>PDF lengkap</span><span className="muted" style={{ fontSize: 12 }}>Ringkasan visual + tabel</span></div>
                <Btn variant="accent" size="sm" icon="download">Unduh</Btn>
              </div>
              <div className="card row gap12" style={{ padding: 14, alignItems: 'center', background: 'var(--canvas)' }}>
                <span className="center" style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface-2)', color: 'var(--ink-muted)' }}><Icon name="file" size={18} /></span>
                <div className="col grow"><span style={{ fontWeight: 600, fontSize: 13.5 }}>Data CSV</span><span className="muted" style={{ fontSize: 12 }}>Transaksi mentah</span></div>
                <Btn variant="secondary" size="sm" icon="download">Unduh</Btn>
              </div>
            </div>
            <div className="card col gap10" style={{ padding: 20, background: 'var(--canvas)' }}>
              <span className="center" style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-tint)', color: 'var(--accent)' }}><Icon name="sparkles" size={18} /></span>
              <span className="h3" style={{ fontSize: 14.5 }}>Laporan otomatis</span>
              <span className="muted" style={{ fontSize: 13 }}>Kirim ringkasan ini otomatis tiap tanggal 1 via Email atau WhatsApp.</span>
              <a className="row gap6" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>Atur di Pengaturan <Icon name="arrowRight" size={15} /></a>
            </div>
          </div>
        </div>
      </PageShell>
    </AppFrame>
  );
}

Object.assign(window, { AnalyticsScreen, ReportsScreen });
