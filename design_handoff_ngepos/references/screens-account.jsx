/* ===================================================================
   Ngepos — Settings & Billing
   =================================================================== */

function SettingsSection({ icon, title, desc, children, danger }) {
  return (
    <div className="card col" style={{ overflow: 'hidden', border: danger ? '1px solid var(--error-light)' : '1px solid var(--hairline)' }}>
      <div className="row gap12" style={{ padding: '18px 22px', borderBottom: '1px solid var(--hairline-soft)' }}>
        <span className="center" style={{ width: 36, height: 36, borderRadius: 10, background: danger ? 'var(--error-light)' : 'var(--surface-2)', color: danger ? 'var(--error)' : 'var(--ink-muted)', flex: '0 0 auto' }}><Icon name={icon} size={18} /></span>
        <div className="col gap2"><span className="h3" style={{ fontSize: 15 }}>{title}</span>{desc && <span className="muted" style={{ fontSize: 12.5 }}>{desc}</span>}</div>
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </div>
  );
}

function SettingsScreen({ biz = 'fnb', plan = 'pro' }) {
  const nav = [['profil', 'Profil bisnis'], ['bayar', 'Pembayaran'], ['laporan', 'Laporan otomatis'], ['danger', 'Zona berbahaya']];
  return (
    <AppFrame active="settings" biz={biz} plan={plan}>
      <PageShell title="Pengaturan" subtitle="Kelola profil bisnis, pembayaran, dan preferensi.">
        <div className="row gap24" style={{ alignItems: 'flex-start', maxWidth: 960 }}>
          <div className="col gap2" style={{ width: 180, flex: '0 0 180px', position: 'sticky', top: 0 }}>
            {nav.map(([id, l], i) => (
              <span key={id} style={{ padding: '9px 12px', borderRadius: 8, fontSize: 13.5, fontWeight: i === 0 ? 600 : 500, cursor: 'pointer',
                background: i === 0 ? 'var(--surface-2)' : 'transparent', color: id === 'danger' ? 'var(--error)' : (i === 0 ? 'var(--ink)' : 'var(--ink-muted)') }}>{l}</span>
            ))}
          </div>
          <div className="col gap20 grow">
            <SettingsSection icon="building" title="Profil bisnis" desc="Informasi dasar tentang bisnismu.">
              <div className="col gap16">
                <div className="row gap16" style={{ alignItems: 'center' }}>
                  <Ph label="logo" w={64} h={64} radius={14} />
                  <Btn variant="secondary" size="sm" icon="upload">Ganti logo</Btn>
                </div>
                <div className="row gap16">
                  <div className="grow"><FormField label="Nama bisnis" value="Kopi Senja" /></div>
                  <div className="field" style={{ width: 160 }}><label className="label">Tipe</label><div className="input row" style={{ alignItems: 'center', background: 'var(--surface-2)' }}><span className="badge">{biz === 'fnb' ? 'F&B' : 'Retail'}</span></div></div>
                </div>
                <FormField label="Alamat" value="Jl. Merdeka No. 12, Bandung" />
                <div className="row gap16">
                  <div className="grow"><div className="field"><label className="label">Zona waktu</label><div className="input row between"><span>WIB (GMT+7)</span><Icon name="chevronDown" size={15} style={{ color: 'var(--ink-subtle)' }} /></div></div></div>
                  <div className="grow"><div className="field"><label className="label">Mata uang</label><div className="input row between"><span>IDR — Rupiah</span><Icon name="chevronDown" size={15} style={{ color: 'var(--ink-subtle)' }} /></div></div></div>
                </div>
                <div className="row" style={{ justifyContent: 'flex-end' }}><Btn variant="primary">Simpan perubahan</Btn></div>
              </div>
            </SettingsSection>

            <SettingsSection icon="qr" title="Pembayaran — QRIS" desc="Gambar QRIS statis yang muncul di alur pembayaran POS.">
              <div className="row gap16" style={{ alignItems: 'center' }}>
                <div className="center" style={{ width: 96, height: 96, background: '#fff', border: '1px solid var(--hairline)', borderRadius: 12 }}><Icon name="qr" size={64} stroke={1} style={{ color: '#111' }} /></div>
                <div className="center col gap8 grow" style={{ border: '1.5px dashed var(--hairline)', borderRadius: 12, padding: 20, cursor: 'pointer' }}>
                  <Icon name="upload" size={20} style={{ color: 'var(--ink-subtle)' }} />
                  <span className="muted" style={{ fontSize: 12.5 }}>Unggah gambar QRIS (PNG/JPG)</span>
                </div>
              </div>
            </SettingsSection>

            {plan === 'starter' ? (
              <SettingsSection icon="mail" title="Laporan otomatis">
                <div className="row gap12" style={{ alignItems: 'center', padding: '4px 0' }}>
                  <ProLock /><span className="muted" style={{ fontSize: 13.5 }}>Aktifkan laporan otomatis dengan paket Pro.</span><Btn variant="accent" size="sm" style={{ marginLeft: 'auto' }}>Upgrade</Btn>
                </div>
              </SettingsSection>
            ) : (
              <SettingsSection icon="mail" title="Laporan otomatis" desc="Kirim ringkasan bulanan secara otomatis tiap tanggal 1.">
                <div className="col gap16">
                  <div className="between"><span className="col"><span className="label">Aktifkan laporan otomatis</span><span className="helper">Dikirim otomatis tiap tanggal 1.</span></span><span className="switch is-on" /></div>
                  <hr className="divider" />
                  <div className="field"><label className="label">Channel pengiriman</label>
                    <div className="row gap10">
                      {[['mail', 'Email', false], ['chat', 'WhatsApp', true]].map(([ic, l, on]) => (
                        <div key={l} className="card row gap10" style={{ padding: 12, flex: '1 1 0', cursor: 'pointer', alignItems: 'center', border: on ? '1.5px solid var(--accent)' : '1px solid var(--hairline)', background: on ? 'var(--accent-tint)' : 'var(--surface-1)' }}>
                          <span className="center" style={{ width: 16, height: 16, borderRadius: 999, border: on ? '5px solid var(--accent)' : '2px solid var(--hairline)', background: 'var(--surface-1)' }} />
                          <Icon name={ic} size={16} /><span style={{ fontSize: 13.5, fontWeight: 600 }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormField label="Nomor WhatsApp penerima" value="+62 812-3456-7890" helper="Format internasional, diawali +62." />
                  <div className="row" style={{ justifyContent: 'flex-end' }}><Btn variant="primary">Simpan</Btn></div>
                </div>
              </SettingsSection>
            )}

            <SettingsSection icon="alert" title="Zona berbahaya" desc="Tindakan permanen yang tidak bisa dibatalkan." danger>
              <div className="between">
                <div className="col"><span style={{ fontWeight: 600, fontSize: 13.5 }}>Hapus bisnis ini</span><span className="muted" style={{ fontSize: 12.5 }}>Semua data produk, transaksi, dan staf akan dihapus permanen.</span></div>
                <Btn variant="danger">Hapus bisnis</Btn>
              </div>
            </SettingsSection>
          </div>
        </div>
      </PageShell>
    </AppFrame>
  );
}

// ---- Billing ----
function UsageMeter({ label, val, max, unit }) {
  const pct = Math.min(100, val / max * 100);
  const near = pct > 80;
  return (
    <div className="col gap8">
      <div className="between" style={{ fontSize: 13 }}><span style={{ fontWeight: 500 }}>{label}</span><span className="mono muted">{val} / {max} {unit}</span></div>
      <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', borderRadius: 999, background: near ? 'var(--accent)' : 'var(--ink)' }} /></div>
    </div>
  );
}

function BillPlan({ name, price, per, features, current, accent }) {
  return (
    <div className="card col gap16" style={{ padding: 22, flex: '1 1 0', border: current ? '1.5px solid var(--accent)' : '1px solid var(--hairline)', position: 'relative' }}>
      {current && <span className="badge badge-accent" style={{ position: 'absolute', top: -11, left: 22, height: 22, background: 'var(--accent)', color: '#fff' }}>Paket aktif</span>}
      <div className="col gap6">
        <span className="h3" style={{ fontSize: 15 }}>{name}</span>
        <div className="row" style={{ alignItems: 'baseline', gap: 5 }}><span className="display" style={{ fontSize: 28 }}>{price}</span>{per && <span className="muted" style={{ fontSize: 13 }}>{per}</span>}</div>
      </div>
      <div className="col gap8">
        {features.map(f => <div key={f} className="row gap8"><Icon name="check" size={15} stroke={2.2} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 13 }}>{f}</span></div>)}
      </div>
      <Btn variant={current ? 'secondary' : (accent ? 'accent' : 'primary')} block disabled={current}>{current ? 'Paket saat ini' : (accent ? 'Upgrade' : 'Pilih')}</Btn>
    </div>
  );
}

function BillingScreen() {
  return (
    <div className="np col" style={{ width: '100%', height: '100%', background: 'var(--canvas)', overflow: 'hidden' }}>
      <AccountTopbar active="billing" />
      <div className="grow no-scrollbar" style={{ padding: '32px 40px', overflow: 'auto' }}>
        <div className="col gap8" style={{ marginBottom: 24 }}>
          <div className="h1">Billing & Langganan</div>
          <div className="body muted">Kelola paket, penggunaan, dan metode pembayaranmu.</div>
        </div>
        <div className="row gap20" style={{ alignItems: 'flex-start' }}>
          <div className="col gap20" style={{ flex: '1.5 1 0' }}>
            {/* current plan */}
            <div className="card between" style={{ padding: 24 }}>
              <div className="col gap10">
                <div className="row gap10"><span className="h2">Paket Pro</span><span className="badge badge-success" style={{ height: 22 }}><span className="badge-dot" style={{ background: 'var(--success)' }} />Aktif</span></div>
                <div className="row gap16 muted" style={{ fontSize: 13.5 }}><span>Rp 149.000 / bulan</span><span>·</span><span>Diperpanjang 1 Jul 2026</span></div>
              </div>
              <Btn variant="secondary">Kelola langganan</Btn>
            </div>
            {/* plan comparison */}
            <div className="row gap16" style={{ alignItems: 'stretch' }}>
              <BillPlan name="Starter" price="Gratis" features={['1 bisnis', '100 produk', '2 staf']} />
              <BillPlan name="Pro" price="Rp 149rb" per="/bln" current features={['5 bisnis', '1.000 produk', '10 staf', 'Semua fitur']} />
              <BillPlan name="Enterprise" price="Hubungi" accent features={['Tak terbatas', 'Semua fitur', 'Prioritas']} />
            </div>
            {/* invoice history */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline-soft)' }}><span className="h3" style={{ fontSize: 15 }}>Riwayat tagihan</span></div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><Th>Tanggal</Th><Th>Jumlah</Th><Th>Status</Th><Th style={{ textAlign: 'right' }}>Invoice</Th></tr></thead>
                <tbody>
                  {[['1 Jun 2026', 149000, 'Lunas'], ['1 Mei 2026', 149000, 'Lunas'], ['1 Apr 2026', 149000, 'Lunas']].map(([d, a, s]) => (
                    <tr key={d}><Td>{d}</Td><Td><span className="mono">{rp(a)}</span></Td><Td><Badge tone="success" dot="var(--success)">{s}</Badge></Td><Td style={{ textAlign: 'right' }}><a className="row gap4" style={{ justifyContent: 'flex-end', color: 'var(--accent)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}><Icon name="download" size={14} />Unduh</a></Td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col gap20" style={{ flex: '1 1 0' }}>
            <div className="card col gap16" style={{ padding: 22 }}>
              <span className="h3" style={{ fontSize: 15 }}>Penggunaan</span>
              <UsageMeter label="Bisnis" val={3} max={5} unit="" />
              <UsageMeter label="Produk" val={847} max={1000} unit="" />
              <UsageMeter label="Staf" val={8} max={10} unit="" />
            </div>
            <div className="card col gap14" style={{ padding: 22 }}>
              <span className="h3" style={{ fontSize: 15 }}>Metode pembayaran</span>
              <div className="row gap12" style={{ alignItems: 'center', padding: 14, background: 'var(--canvas)', borderRadius: 10 }}>
                <span className="center" style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--hairline)' }}><Icon name="card" size={18} /></span>
                <div className="col grow"><span style={{ fontWeight: 600, fontSize: 13.5 }}>Midtrans</span><span className="muted" style={{ fontSize: 12 }}>•••• 4821 · Visa</span></div>
                <span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="edit" size={15} /></span>
              </div>
              <div className="col gap8" style={{ padding: 14, background: 'var(--canvas)', borderRadius: 10 }}>
                <span className="row gap8" style={{ fontWeight: 600, fontSize: 13 }}><Icon name="building" size={15} />Transfer manual</span>
                <span className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>BCA 1234567890<br />a.n. PT Ngepos Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen, BillingScreen });
