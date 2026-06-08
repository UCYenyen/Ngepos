/* ===================================================================
   Ngepos — POS / Point of Sale (tablet-first)
   =================================================================== */

const POS_FNB = {
  cats: [['Semua', null], ['Kopi', 'var(--accent)'], ['Teh', 'var(--c-lime)'], ['Snack', 'var(--c-cyan)'], ['Roti', 'var(--c-pink)']],
  products: [
    ['Kopi Susu Gula Aren', 18000, 'Kopi', false, null],
    ['Americano', 15000, 'Kopi', true, null],
    ['Caffe Latte', 22000, 'Kopi', true, null],
    ['Cappuccino', 22000, 'Kopi', false, null],
    ['Matcha Latte', 24000, 'Teh', true, 'low'],
    ['Es Teh Manis', 8000, 'Teh', false, null],
    ['Croissant', 20000, 'Roti', false, null],
    ['Donat Cokelat', 12000, 'Roti', false, null],
    ['Kentang Goreng', 18000, 'Snack', false, null],
    ['Pisang Goreng', 14000, 'Snack', false, 'low'],
    ['Cromboloni', 28000, 'Roti', true, null],
    ['Red Velvet', 26000, 'Roti', false, null],
  ],
};
const POS_RETAIL = {
  cats: [['Semua', null], ['Minuman', 'var(--accent)'], ['Snack', 'var(--c-lime)'], ['Sembako', 'var(--c-cyan)'], ['Rumah', 'var(--c-pink)']],
  products: [
    ['Aqua 600ml', 4000, 'Minuman', false, null],
    ['Teh Botol', 5000, 'Minuman', false, null],
    ['Kopi Sachet', 2500, 'Minuman', true, null],
    ['Indomie Goreng', 3500, 'Sembako', false, null],
    ['Beras 5kg', 68000, 'Sembako', false, 'low'],
    ['Minyak 1L', 18000, 'Sembako', false, null],
    ['Chitato', 12000, 'Snack', true, null],
    ['Oreo', 9000, 'Snack', false, null],
    ['Sabun Mandi', 6500, 'Rumah', false, null],
    ['Pasta Gigi', 14000, 'Rumah', true, null],
    ['Tisu', 11000, 'Rumah', false, 'low'],
    ['Gula 1kg', 15000, 'Sembako', false, null],
  ],
};

function PosProduct({ name, price, cat, variant, stock, color }) {
  return (
    <div className="card col" style={{ padding: 10, gap: 8, borderRadius: 14, cursor: 'pointer', position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Ph label="" w="100%" h={78} radius={9} />
        {stock === 'low' && <span className="badge badge-error" style={{ position: 'absolute', top: 6, left: 6, height: 18, fontSize: 10 }}>Menipis</span>}
        {variant && <span className="badge" style={{ position: 'absolute', top: 6, right: 6, height: 18, fontSize: 10, background: 'var(--surface-1)', border: '1px solid var(--hairline)' }}><Icon name="layers" size={10} />varian</span>}
      </div>
      <div className="col gap4">
        <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.25, minHeight: 31 }}>{name}</div>
        <div className="between">
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{rp(price)}</span>
          <span className="cap-color" style={{ background: color || 'var(--hairline)', width: 8, height: 8 }} />
        </div>
      </div>
    </div>
  );
}

function CartLine({ name, variant, qty, price }) {
  return (
    <div className="row gap10" style={{ alignItems: 'flex-start' }}>
      <Ph label="" w={40} h={40} radius={8} style={{ flex: '0 0 40px' }} />
      <div className="col grow" style={{ gap: 4 }}>
        <div className="between" style={{ alignItems: 'flex-start' }}>
          <div className="col"><span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>{variant && <span className="muted" style={{ fontSize: 11.5 }}>{variant}</span>}</div>
          <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{rp(price * qty)}</span>
        </div>
        <div className="row between">
          <div className="row gap8" style={{ alignItems: 'center' }}>
            <span className="center" style={{ width: 24, height: 24, borderRadius: 7, border: '1px solid var(--hairline)', cursor: 'pointer' }}><Icon name="minus" size={13} /></span>
            <span className="mono" style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{qty}</span>
            <span className="center" style={{ width: 24, height: 24, borderRadius: 7, border: '1px solid var(--hairline)', cursor: 'pointer' }}><Icon name="plus" size={13} /></span>
          </div>
          <span className="row gap6 muted" style={{ fontSize: 11.5, cursor: 'pointer' }}><Icon name="tag" size={12} />Diskon</span>
        </div>
      </div>
    </div>
  );
}

function PosCart({ biz, items, empty }) {
  const sub = items.reduce((a, i) => a + i.price * i.qty, 0);
  const disc = empty ? 0 : 5000;
  const tax = Math.round((sub - disc) * 0.1);
  const total = sub - disc + tax;
  return (
    <div className="col" style={{ width: 380, flex: '0 0 380px', background: 'var(--surface-1)', borderLeft: '1px solid var(--hairline)', height: '100%' }}>
      <div className="between" style={{ padding: '16px 18px', borderBottom: '1px solid var(--hairline-soft)' }}>
        <div className="row gap10">
          <span className="h3" style={{ fontSize: 16 }}>Pesanan</span>
          {!empty && <span className="badge badge-ink">{items.length}</span>}
        </div>
        <span className="btn-icon center" style={{ width: 32, height: 32, color: 'var(--ink-subtle)' }}><Icon name="trash" size={16} /></span>
      </div>
      {biz === 'fnb' && (
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--hairline-soft)' }}>
          <div className="input row between" style={{ height: 38, alignItems: 'center', cursor: 'pointer' }}>
            <span className="row gap8" style={{ fontSize: 13.5 }}><Icon name="utensils" size={15} style={{ color: 'var(--ink-subtle)' }} />{empty ? 'Pilih meja' : 'Meja 04 · 2 org'}</span>
            <Icon name="chevronDown" size={16} style={{ color: 'var(--ink-subtle)' }} />
          </div>
        </div>
      )}
      {empty ? (
        <div className="grow center col gap12" style={{ color: 'var(--ink-tertiary)' }}>
          <Icon name="cart" size={40} stroke={1.4} />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-subtle)' }}>Keranjang kosong</span>
          <span style={{ fontSize: 12.5, maxWidth: 200, textAlign: 'center' }}>Pilih produk di sebelah kiri untuk memulai transaksi.</span>
        </div>
      ) : (
        <div className="grow no-scrollbar col gap16" style={{ padding: '16px 18px', overflow: 'auto', minHeight: 0 }}>
          {items.map((i, k) => <CartLine key={k} {...i} />)}
        </div>
      )}
      <div style={{ padding: 18, borderTop: '1px solid var(--hairline-soft)' }}>
        <div className="col gap8" style={{ marginBottom: 14 }}>
          <div className="between body muted" style={{ fontSize: 13.5 }}><span>Subtotal</span><span className="mono">{rp(sub)}</span></div>
          <div className="between body muted" style={{ fontSize: 13.5 }}><span>Diskon</span><span className="mono" style={{ color: disc ? 'var(--success)' : undefined }}>{disc ? '−' + rp(disc) : rp(0)}</span></div>
          <div className="between body muted" style={{ fontSize: 13.5 }}><span>Pajak (10%)</span><span className="mono">{rp(tax)}</span></div>
          <hr className="divider" style={{ margin: '4px 0' }} />
          <div className="between"><span className="h3" style={{ fontSize: 16 }}>Total</span><span className="mono" style={{ fontSize: 21, fontWeight: 700 }}>{rp(total)}</span></div>
        </div>
        <Btn variant="accent" block size="lg" icon="wallet" disabled={empty}>Bayar {!empty && '· ' + rp(total)}</Btn>
      </div>
    </div>
  );
}

function PosScreen({ biz = 'fnb', empty = false }) {
  const data = biz === 'fnb' ? POS_FNB : POS_RETAIL;
  const colorOf = (c) => (data.cats.find(x => x[0] === c) || [])[1];
  const items = biz === 'fnb'
    ? [{ name: 'Kopi Susu Gula Aren', qty: 2, price: 18000 }, { name: 'Caffe Latte', variant: 'Large · Oat milk', qty: 1, price: 26000 }, { name: 'Croissant', qty: 1, price: 20000 }, { name: 'Matcha Latte', qty: 1, price: 24000 }]
    : [{ name: 'Beras 5kg', qty: 1, price: 68000 }, { name: 'Minyak 1L', qty: 2, price: 18000 }, { name: 'Indomie Goreng', qty: 5, price: 3500 }, { name: 'Aqua 600ml', qty: 3, price: 4000 }];
  return (
    <AppFrame active="pos" biz={biz} plan="pro">
      <div className="grow col" style={{ background: 'var(--canvas)', minWidth: 0, height: '100%' }}>
        {/* sticky search + categories */}
        <div style={{ padding: '16px 24px 14px', borderBottom: '1px solid var(--hairline-soft)', background: 'var(--canvas)' }}>
          <div className="row gap12" style={{ marginBottom: 14 }}>
            <div className="search-wrap grow"><Icon name="search" /><input className="input" placeholder="Cari produk atau scan barcode…" /></div>
            <Btn variant="secondary" icon="qr">Scan</Btn>
          </div>
          <div className="row gap8 wrap">
            {data.cats.map((c, i) => (
              <span key={c[0]} className={'pill' + (i === 0 ? ' is-active' : '')}>
                {c[1] && <span className="cap-color" style={{ background: c[1] }} />}{c[0]}
              </span>
            ))}
          </div>
        </div>
        {/* product grid */}
        <div className="grow no-scrollbar" style={{ padding: 20, overflow: 'auto', minHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {data.products.map((p, i) => <PosProduct key={i} name={p[0]} price={p[1]} cat={p[2]} variant={p[3]} stock={p[4]} color={colorOf(p[2])} />)}
          </div>
        </div>
      </div>
      <PosCart biz={biz} items={items} empty={empty} />
    </AppFrame>
  );
}

// ---- Payment overlays (rendered over a dimmed POS) ----
function PayShell({ children, wide }) {
  return (
    <div className="np" style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--canvas)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}><PosScreen biz="fnb" /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.45)', backdropFilter: 'blur(2px)' }} />
      <div className="center" style={{ position: 'absolute', inset: 0, padding: 32 }}>
        <div className="card col" style={{ width: wide ? 560 : 460, borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function PayMethodCard({ icon, label, sub, on, locked }) {
  return (
    <div className="card col gap8" style={{ padding: 16, flex: '1 1 0', cursor: 'pointer', alignItems: 'center', textAlign: 'center', position: 'relative',
      border: on ? '1.5px solid var(--accent)' : '1px solid var(--hairline)', background: on ? 'var(--accent-tint)' : 'var(--surface-1)', opacity: locked ? 0.6 : 1 }}>
      {locked && <span style={{ position: 'absolute', top: 8, right: 8 }}><ProLock /></span>}
      <span className="center" style={{ width: 40, height: 40, borderRadius: 11, background: on ? 'var(--accent)' : 'var(--surface-2)', color: on ? '#fff' : 'var(--ink-muted)' }}><Icon name={icon} size={20} /></span>
      <div className="col gap4"><span style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</span><span className="muted" style={{ fontSize: 11.5 }}>{sub}</span></div>
    </div>
  );
}

function PayCashScreen() {
  return (
    <PayShell>
      <div className="between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--hairline-soft)' }}>
        <span className="h3">Pembayaran</span>
        <span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="x" size={18} /></span>
      </div>
      <div className="col gap18" style={{ padding: 22 }}>
        <div className="row gap10">
          <PayMethodCard icon="cash" label="Tunai" sub="Cash" on />
          <PayMethodCard icon="qr" label="QRIS" sub="Scan" />
          <PayMethodCard icon="card" label="Gateway" sub="Midtrans" locked />
        </div>
        <div className="col gap10" style={{ padding: 16, background: 'var(--canvas)', borderRadius: 12 }}>
          <div className="between"><span className="muted" style={{ fontSize: 13.5 }}>Total tagihan</span><span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{rp(93000)}</span></div>
        </div>
        <div className="field">
          <label className="label">Uang diterima</label>
          <input className="input input-lg mono" defaultValue="Rp 100.000" style={{ fontSize: 18, fontWeight: 700 }} />
          <div className="row gap8 wrap" style={{ marginTop: 4 }}>
            {['Uang pas', '100.000', '150.000', '200.000'].map(v => <span key={v} className="pill" style={{ height: 28, fontSize: 12 }}>{v}</span>)}
          </div>
        </div>
        <div className="between" style={{ padding: '14px 16px', background: 'var(--success-light)', borderRadius: 12 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--success)' }}>Kembalian</span>
          <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>{rp(7000)}</span>
        </div>
        <Btn variant="accent" block size="lg">Selesaikan pembayaran</Btn>
      </div>
    </PayShell>
  );
}

function PayQrisScreen() {
  return (
    <PayShell>
      <div className="between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--hairline-soft)' }}>
        <span className="h3">Pembayaran QRIS</span>
        <span className="btn-icon center" style={{ width: 30, height: 30 }}><Icon name="x" size={18} /></span>
      </div>
      <div className="col center gap16" style={{ padding: 26, textAlign: 'center' }}>
        <span className="muted" style={{ fontSize: 13.5 }}>Minta pelanggan scan kode untuk membayar</span>
        <div className="center" style={{ width: 220, height: 220, background: '#fff', border: '1px solid var(--hairline)', borderRadius: 16, padding: 16 }}>
          <Icon name="qr" size={170} stroke={1} style={{ color: '#111' }} />
        </div>
        <div className="col gap4">
          <span className="muted" style={{ fontSize: 13 }}>Total</span>
          <span className="mono" style={{ fontSize: 26, fontWeight: 700 }}>{rp(93000)}</span>
        </div>
        <div className="row gap6 muted" style={{ fontSize: 12.5 }}><Icon name="clock" size={14} />Menunggu pembayaran…</div>
        <div className="row gap10" style={{ width: '100%' }}>
          <Btn variant="secondary" block>Batal</Btn>
          <Btn variant="primary" block icon="check">Tandai lunas</Btn>
        </div>
      </div>
    </PayShell>
  );
}

function ReceiptScreen() {
  return (
    <PayShell>
      <div className="col center" style={{ padding: '26px 22px 0', textAlign: 'center', gap: 10 }}>
        <span className="center" style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--success-light)', color: 'var(--success)' }}><Icon name="check" size={26} stroke={2.4} /></span>
        <div className="h3">Pembayaran berhasil</div>
        <span className="muted" style={{ fontSize: 13 }}>Transaksi #TRX-20260608-0042</span>
      </div>
      <div className="col" style={{ margin: 22, padding: 18, border: '1px dashed var(--hairline)', borderRadius: 12, background: 'var(--canvas)', fontFamily: 'var(--mono)' }}>
        <div className="col center" style={{ marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>KOPI SENJA</span>
          <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Jl. Merdeka No. 12, Bandung</span>
          <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>8 Jun 2026 · 14:32 · Kasir: Sari</span>
        </div>
        <hr className="divider" />
        <div className="col gap6" style={{ padding: '12px 0', fontSize: 12 }}>
          {[['2× Kopi Susu', 36000], ['1× Caffe Latte', 26000], ['1× Croissant', 20000], ['1× Matcha Latte', 24000]].map(([n, p]) => (
            <div key={n} className="between"><span style={{ color: 'var(--ink-muted)' }}>{n}</span><span>{rp(p)}</span></div>
          ))}
        </div>
        <hr className="divider" />
        <div className="col gap5" style={{ padding: '12px 0 0', fontSize: 12 }}>
          <div className="between" style={{ color: 'var(--ink-muted)' }}><span>Subtotal</span><span>{rp(106000)}</span></div>
          <div className="between" style={{ color: 'var(--ink-muted)' }}><span>Diskon</span><span>−{rp(5000)}</span></div>
          <div className="between" style={{ color: 'var(--ink-muted)' }}><span>Pajak 10%</span><span>{rp(10100)}</span></div>
          <div className="between" style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}><span>TOTAL</span><span>{rp(111100)}</span></div>
          <div className="between" style={{ color: 'var(--ink-muted)', marginTop: 6 }}><span>Tunai</span><span>{rp(120000)}</span></div>
          <div className="between" style={{ color: 'var(--ink-muted)' }}><span>Kembalian</span><span>{rp(8900)}</span></div>
        </div>
      </div>
      <div className="row gap10" style={{ padding: '0 22px 22px' }}>
        <Btn variant="secondary" block icon="printer">Cetak</Btn>
        <Btn variant="accent" block icon="plus">Transaksi baru</Btn>
      </div>
    </PayShell>
  );
}

Object.assign(window, { PosScreen, PayCashScreen, PayQrisScreen, ReceiptScreen });
