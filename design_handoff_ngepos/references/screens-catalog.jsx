/* ===================================================================
   Ngepos — Products & Categories, Inventory
   =================================================================== */

function Th({ children, style }) { return <th style={{ textAlign: 'left', padding: '11px 16px', fontSize: 12, fontWeight: 600, color: 'var(--ink-subtle)', letterSpacing: '0.02em', textTransform: 'uppercase', whiteSpace: 'nowrap', ...style }}>{children}</th>; }
function Td({ children, style }) { return <td style={{ padding: '12px 16px', fontSize: 13.5, color: 'var(--ink)', borderTop: '1px solid var(--hairline-soft)', verticalAlign: 'middle', ...style }}>{children}</td>; }

const CAT_COLORS = { Kopi: 'var(--accent)', Teh: 'var(--c-lime)', Snack: 'var(--c-cyan)', Roti: 'var(--c-pink)', Minuman: 'var(--accent)', Sembako: 'var(--c-cyan)', Rumah: 'var(--c-pink)' };
function CatBadge({ name }) {
  return <span className="badge" style={{ background: 'var(--surface-2)' }}><span className="badge-dot" style={{ background: CAT_COLORS[name] || 'var(--ink-tertiary)' }} />{name}</span>;
}

const PRODUCTS_FNB = [
  ['Kopi Susu Gula Aren', 'KOP-001', 'Kopi', 18000, false, 42],
  ['Americano', 'KOP-002', 'Kopi', 15000, true, 38],
  ['Caffe Latte', 'KOP-003', 'Kopi', 22000, true, 25],
  ['Matcha Latte', 'TEH-001', 'Teh', 24000, true, 6],
  ['Es Teh Manis', 'TEH-002', 'Teh', 8000, false, 80],
  ['Croissant', 'ROT-001', 'Roti', 20000, false, 14],
  ['Donat Cokelat', 'ROT-002', 'Roti', 12000, false, 30],
  ['Cromboloni', 'ROT-003', 'Roti', 28000, true, 9],
  ['Kentang Goreng', 'SNK-001', 'Snack', 18000, false, 22],
];

function ProductsScreen({ biz = 'fnb', tab = 'produk' }) {
  return (
    <AppFrame active="products" biz={biz} plan="pro">
      <PageShell title="Produk" subtitle="Kelola katalog, kategori, dan varian produkmu."
        action={<div className="row gap12"><span className="badge" style={{ height: 32, padding: '0 12px', fontSize: 13 }}>82 / 1.000 produk</span><Btn variant="accent" icon="plus">Tambah produk</Btn></div>}>
        {/* tabs */}
        <div className="row gap4" style={{ borderBottom: '1px solid var(--hairline)', marginBottom: 18 }}>
          {[['produk', 'Produk'], ['kategori', 'Kategori']].map(([id, l]) => (
            <span key={id} style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: -1,
              color: tab === id ? 'var(--ink)' : 'var(--ink-muted)', borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent' }}>{l}</span>
          ))}
        </div>
        {tab === 'produk' ? <>
          <div className="row gap12" style={{ marginBottom: 16 }}>
            <div className="search-wrap grow" style={{ maxWidth: 320 }}><Icon name="search" /><input className="input" placeholder="Cari produk atau SKU…" /></div>
            <Btn variant="secondary" icon="filter">Kategori</Btn>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--surface-2)' }}>
                <Th style={{ width: 52 }}></Th><Th>Nama</Th><Th>SKU</Th><Th>Kategori</Th><Th style={{ textAlign: 'right' }}>Harga</Th><Th>Stok</Th><Th style={{ width: 48 }}></Th>
              </tr></thead>
              <tbody>
                {PRODUCTS_FNB.map((p, i) => (
                  <tr key={i}>
                    <Td><Ph label="" w={36} h={36} radius={8} /></Td>
                    <Td><div className="row gap8"><span style={{ fontWeight: 600 }}>{p[0]}</span>{p[4] && <span className="badge" style={{ height: 18, fontSize: 10 }}><Icon name="layers" size={10} />varian</span>}</div></Td>
                    <Td><span className="mono muted" style={{ fontSize: 12.5 }}>{p[1]}</span></Td>
                    <Td><CatBadge name={p[2]} /></Td>
                    <Td style={{ textAlign: 'right' }}><span className="mono" style={{ fontWeight: 600 }}>{rp(p[3])}</span></Td>
                    <Td><span className="mono" style={{ color: p[5] <= 10 ? 'var(--error)' : 'var(--ink)' }}>{p[5]}</span></Td>
                    <Td><span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="more" size={16} /></span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </> : (
          <div style={{ maxWidth: 560 }}>
            <div className="card col" style={{ overflow: 'hidden' }}>
              {[['Kopi', 'var(--accent)', 12], ['Teh', 'var(--c-lime)', 6], ['Snack', 'var(--c-cyan)', 9], ['Roti', 'var(--c-pink)', 14]].map(([n, c, ct], i) => (
                <div key={n} className="between" style={{ padding: '14px 18px', borderTop: i ? '1px solid var(--hairline-soft)' : 'none' }}>
                  <div className="row gap12"><span className="cap-color" style={{ background: c, width: 14, height: 14, borderRadius: 5 }} /><span style={{ fontWeight: 600, fontSize: 14 }}>{n}</span><span className="muted" style={{ fontSize: 13 }}>{ct} produk</span></div>
                  <div className="row gap6"><span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="edit" size={15} /></span><span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="trash" size={15} /></span></div>
                </div>
              ))}
              <div className="row gap10" style={{ padding: '12px 18px', borderTop: '1px solid var(--hairline-soft)' }}>
                <span className="cap-color" style={{ background: 'var(--hairline)', width: 14, height: 14, borderRadius: 5 }} />
                <input className="input" placeholder="Tambah kategori baru…" style={{ height: 34 }} />
                <Btn variant="secondary" size="sm">Tambah</Btn>
              </div>
            </div>
          </div>
        )}
      </PageShell>
    </AppFrame>
  );
}

// Add-product sheet open over products
function ProductSheetScreen({ biz = 'fnb' }) {
  return (
    <div className="np" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}><ProductsScreen biz={biz} /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.4)' }} />
      <div className="col" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--surface-1)', borderLeft: '1px solid var(--hairline)', boxShadow: '-12px 0 40px rgba(0,0,0,0.16)' }}>
        <div className="between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--hairline-soft)' }}>
          <span className="h3">Tambah produk</span>
          <span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="x" size={18} /></span>
        </div>
        <div className="grow no-scrollbar col gap18" style={{ padding: 22, overflow: 'auto' }}>
          <div className="field"><label className="label">Foto produk</label>
            <div className="row gap12" style={{ alignItems: 'center' }}>
              <Ph label="preview" w={72} h={72} radius={12} />
              <div className="center col gap6" style={{ flex: 1, border: '1.5px dashed var(--hairline)', borderRadius: 12, padding: '14px', cursor: 'pointer' }}>
                <Icon name="upload" size={18} style={{ color: 'var(--ink-subtle)' }} />
                <span className="muted" style={{ fontSize: 12.5 }}>Seret atau klik untuk unggah</span>
              </div>
            </div>
          </div>
          <FormField label="Nama produk" value="Caffe Latte" />
          <div className="row gap12">
            <div className="grow"><FormField label="SKU" value="KOP-003" /></div>
            <div className="grow"><FormField label="Harga" value="Rp 22.000" /></div>
          </div>
          <div className="field"><label className="label">Kategori</label>
            <div className="input row between"><span>Kopi</span><Icon name="chevronDown" size={16} style={{ color: 'var(--ink-subtle)' }} /></div>
          </div>
          <div className="between" style={{ padding: '12px 0' }}><span className="col"><span className="label">Lacak stok</span><span className="helper">Kurangi stok otomatis tiap penjualan</span></span><span className="switch is-on" /></div>
          <hr className="divider" />
          <div className="between"><span className="col"><span className="label">Punya varian</span><span className="helper">Ukuran, topping, dll.</span></span><span className="switch is-on" /></div>
          <div className="col gap10">
            {[['Regular', '+ Rp 0', 'KOP-003-R'], ['Large', '+ Rp 4.000', 'KOP-003-L'], ['Oat milk', '+ Rp 5.000', 'KOP-003-O']].map(([n, m, s]) => (
              <div key={n} className="card row gap10" style={{ padding: 10, alignItems: 'center' }}>
                <Icon name="grip" size={16} style={{ color: 'var(--ink-tertiary)' }} />
                <span className="grow" style={{ fontSize: 13, fontWeight: 600 }}>{n}</span>
                <span className="mono muted" style={{ fontSize: 12 }}>{m}</span>
                <span className="mono muted" style={{ fontSize: 11.5 }}>{s}</span>
                <Icon name="x" size={15} style={{ color: 'var(--ink-subtle)' }} />
              </div>
            ))}
            <span className="row gap6" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}><Icon name="plus" size={15} />Tambah varian</span>
          </div>
        </div>
        <div className="row gap10" style={{ padding: 18, borderTop: '1px solid var(--hairline-soft)' }}>
          <Btn variant="secondary" block>Batal</Btn>
          <Btn variant="accent" block>Simpan produk</Btn>
        </div>
      </div>
    </div>
  );
}

// ---- Inventory ----
const INV = [
  ['Kopi Susu Gula Aren', 'KOP-001', 'Kopi', 42, 15],
  ['Caffe Latte', 'KOP-003', 'Kopi', 25, 15],
  ['Matcha Latte', 'TEH-001', 'Teh', 6, 15],
  ['Croissant', 'ROT-001', 'Roti', 14, 20],
  ['Cromboloni', 'ROT-003', 'Roti', 9, 20],
  ['Donat Cokelat', 'ROT-002', 'Roti', 30, 20],
];

function InventoryScreen({ biz = 'fnb', plan = 'pro' }) {
  if (plan === 'starter') {
    return <AppFrame active="inventory" biz={biz} plan="starter"><PageShell title="Inventaris" subtitle="Pantau stok produk secara real-time."><NoticeCard desc="Lacak stok real-time, alert stok menipis, dan riwayat pergerakan barang. Tersedia di paket Pro & Enterprise." /></PageShell></AppFrame>;
  }
  return (
    <AppFrame active="inventory" biz={biz} plan="pro">
      <PageShell title="Inventaris" subtitle="Pantau dan sesuaikan stok produk secara real-time."
        action={<div className="row gap10"><Btn variant="secondary" icon="clock">Riwayat</Btn><Btn variant="primary" icon="boxes">Sesuaikan stok</Btn></div>}>
        <div className="row gap12" style={{ marginBottom: 16 }}>
          <div className="search-wrap grow" style={{ maxWidth: 300 }}><Icon name="search" /><input className="input" placeholder="Cari produk…" /></div>
          <Btn variant="secondary" size="sm" iconRight="chevronDown">Urutkan: Nama</Btn>
          <div className="row gap6">
            <span className="pill is-active" style={{ height: 36 }}>Semua</span>
            <span className="pill" style={{ height: 36 }}>Stok menipis</span>
          </div>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--surface-2)' }}>
              <Th style={{ width: 40 }}></Th><Th>Produk</Th><Th>SKU</Th><Th>Kategori</Th><Th style={{ textAlign: 'right' }}>Stok saat ini</Th><Th>Batas minimum</Th><Th>Status</Th>
            </tr></thead>
            <tbody>
              {INV.map((p, i) => {
                const low = p[3] < p[4];
                return (
                  <tr key={i}>
                    <Td><Icon name={i === 1 ? 'chevronDown' : 'chevronRight'} size={15} style={{ color: 'var(--ink-subtle)', cursor: 'pointer' }} /></Td>
                    <Td><span style={{ fontWeight: 600 }}>{p[0]}</span></Td>
                    <Td><span className="mono muted" style={{ fontSize: 12.5 }}>{p[1]}</span></Td>
                    <Td><CatBadge name={p[2]} /></Td>
                    <Td style={{ textAlign: 'right' }}><span className="mono" style={{ fontWeight: 700, fontSize: 15, color: low ? 'var(--error)' : 'var(--ink)' }}>{p[3]}</span></Td>
                    <Td><span className="mono muted">{p[4]}</span></Td>
                    <Td>{low ? <Badge tone="error" dot="var(--error)">Stok menipis</Badge> : <Badge tone="success" dot="var(--success)">Aman</Badge>}</Td>
                  </tr>
                );
              })}
              {/* expanded variant rows under Caffe Latte */}
              <tr><Td style={{ padding: 0 }} /><td colSpan={6} style={{ padding: 0, borderTop: '1px solid var(--hairline-soft)', background: 'var(--canvas)' }}>
                <div className="col" style={{ padding: '8px 16px 8px 24px' }}>
                  {[['Regular', 12], ['Large', 9], ['Oat milk', 4]].map(([v, q]) => (
                    <div key={v} className="between" style={{ padding: '7px 0', fontSize: 13 }}>
                      <span className="row gap8 muted"><Icon name="layers" size={13} />{v}</span>
                      <span className="mono" style={{ color: q < 6 ? 'var(--error)' : 'var(--ink-muted)' }}>{q} unit</span>
                    </div>
                  ))}
                </div>
              </td></tr>
            </tbody>
          </table>
        </div>
      </PageShell>
    </AppFrame>
  );
}

Object.assign(window, { ProductsScreen, ProductSheetScreen, InventoryScreen, Th, Td, CatBadge });
