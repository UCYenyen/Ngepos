/* ===================================================================
   Ngepos — Landing / marketing page
   =================================================================== */

function LMockTablet({ label = 'POS · tablet mockup' }) {
  return (
    <div style={{ position: 'relative', width: 560, maxWidth: '100%' }}>
      {/* cream halo */}
      <div style={{ position: 'absolute', inset: '-12% -8%', background: 'radial-gradient(60% 60% at 50% 40%, var(--accent-tint) 0%, transparent 70%)', borderRadius: 40, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 18, padding: 12 }}>
        <div className="row gap8" style={{ marginBottom: 10, paddingLeft: 4 }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: 'var(--hairline)' }} />
          <span style={{ width: 9, height: 9, borderRadius: 999, background: 'var(--hairline)' }} />
          <span style={{ width: 9, height: 9, borderRadius: 999, background: 'var(--hairline)' }} />
        </div>
        <div className="row" style={{ gap: 10, height: 300 }}>
          <div className="grow col gap8">
            <div className="row gap8 wrap">
              {['Kopi','Teh','Snack','Roti'].map((c,i)=>(
                <span key={c} className="pill" style={{ height: 26, fontSize: 11 }}>{c}</span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['Kopi Susu','18.000'],['Americano','15.000'],['Latte','22.000'],['Matcha','24.000'],['Croissant','20.000'],['Donat','12.000']].map(([n,p])=>(
                <div key={n} className="card col" style={{ padding: 8, gap: 6, borderRadius: 10 }}>
                  <Ph label="" w="100%" h={42} radius={7} />
                  <div style={{ fontSize: 10.5, fontWeight: 600 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--accent)' }}>Rp {p}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card col" style={{ width: 168, flex: '0 0 168px', padding: 10, gap: 8, borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Pesanan</div>
            {[['Kopi Susu','18.000'],['Latte','22.000'],['Donat','12.000']].map(([n,p])=>(
              <div key={n} className="between" style={{ fontSize: 10.5 }}>
                <span className="muted">1× {n}</span><span className="mono">{p}</span>
              </div>
            ))}
            <hr className="divider" />
            <div className="between"><span style={{ fontSize: 11, fontWeight: 700 }}>Total</span><span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>Rp 52.000</span></div>
            <div className="btn btn-accent" style={{ height: 30, fontSize: 11, marginTop: 'auto' }}>Bayar</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LFeature({ icon, title, desc }) {
  return (
    <div className="card col" style={{ padding: 24, gap: 14, borderRadius: 14 }}>
      <div className="center" style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-tint)', color: 'var(--accent)' }}>
        <Icon name={icon} size={21} stroke={1.9} />
      </div>
      <div className="col gap6">
        <div className="h3">{title}</div>
        <div className="body muted" style={{ fontSize: 14 }}>{desc}</div>
      </div>
    </div>
  );
}

function LShowcase({ flip, label, title, bullets, mock }) {
  const text = (
    <div className="col" style={{ gap: 18, flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
      <span className="eyebrow" style={{ color: 'var(--accent)' }}>{label}</span>
      <div className="h1" style={{ fontSize: 34, maxWidth: 420 }}>{title}</div>
      <div className="col gap12">
        {bullets.map(b => (
          <div key={b} className="row gap12">
            <span className="center" style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--success-light)', color: 'var(--success)', flex: '0 0 auto' }}><Icon name="check" size={13} stroke={2.4} /></span>
            <span className="body" style={{ fontSize: 15 }}>{b}</span>
          </div>
        ))}
      </div>
      <a className="row gap6" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Pelajari <Icon name="arrowRight" size={16} /></a>
    </div>
  );
  return (
    <div className="row" style={{ gap: 64, alignItems: 'stretch' }}>
      {flip ? <>{mock}{text}</> : <>{text}{mock}</>}
    </div>
  );
}

function LStep({ n, title, desc }) {
  return (
    <div className="col gap12" style={{ flex: '1 1 0', alignItems: 'flex-start' }}>
      <div className="center" style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--surface-1)', border: '1px solid var(--hairline)', fontWeight: 700, fontSize: 16 }}>{n}</div>
      <div className="h3">{title}</div>
      <div className="body muted" style={{ fontSize: 14 }}>{desc}</div>
    </div>
  );
}

function LPricing({ name, price, per, blurb, features, cta, ctaVariant = 'secondary', popular }) {
  return (
    <div className="card col" style={{ padding: 28, gap: 20, borderRadius: 16, position: 'relative',
      border: popular ? '1.5px solid var(--accent)' : '1px solid var(--hairline)', flex: '1 1 0' }}>
      {popular && <span className="badge badge-accent" style={{ position: 'absolute', top: -11, left: 28, height: 22, background: 'var(--accent)', color: '#fff' }}>Populer</span>}
      <div className="col gap6">
        <div className="h3" style={{ fontSize: 16 }}>{name}</div>
        <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
          <span className="display" style={{ fontSize: 36 }}>{price}</span>
          {per && <span className="muted" style={{ fontSize: 14 }}>{per}</span>}
        </div>
        <div className="body muted" style={{ fontSize: 13.5 }}>{blurb}</div>
      </div>
      <Btn variant={ctaVariant} block>{cta}</Btn>
      <hr className="divider" />
      <div className="col gap12">
        {features.map(f => (
          <div key={f} className="row gap10" style={{ gap: 10 }}>
            <Icon name="check" size={16} stroke={2.2} style={{ color: 'var(--accent)', marginTop: 2 }} />
            <span className="body" style={{ fontSize: 13.5 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LFaq({ q, a, open }) {
  return (
    <div className="card" style={{ padding: '18px 22px', borderRadius: 12 }}>
      <div className="between">
        <span className="h3" style={{ fontSize: 15.5 }}>{q}</span>
        <Icon name={open ? 'minus' : 'plus'} size={18} style={{ color: 'var(--ink-subtle)' }} />
      </div>
      {open && <div className="body muted" style={{ fontSize: 14, marginTop: 12, maxWidth: 680 }}>{a}</div>}
    </div>
  );
}

function LandingPage() {
  const sectionPad = { padding: '0 72px' };
  return (
    <div className="np" style={{ width: '100%', minHeight: '100%', background: 'var(--canvas)', overflow: 'hidden' }}>
      {/* NAV */}
      <div className="between" style={{ ...sectionPad, height: 72, borderBottom: '1px solid var(--hairline-soft)', position: 'sticky', top: 0, background: 'color-mix(in srgb, var(--canvas) 88%, transparent)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
        <div className="row gap8" style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em' }}>
          <span className="center" style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--accent)', color: '#fff' }}><Icon name="zap" size={15} fill /></span>
          Ngepos
        </div>
        <div className="row gap32" style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-muted)' }}>
          {['Fitur','Harga','Untuk F&B','Untuk Retail','FAQ'].map(l => <span key={l} style={{ cursor: 'pointer' }}>{l}</span>)}
        </div>
        <div className="row gap12">
          <Btn variant="tertiary">Masuk</Btn>
          <Btn variant="accent">Mulai gratis</Btn>
        </div>
      </div>

      {/* HERO */}
      <div className="col center" style={{ ...sectionPad, paddingTop: 72, paddingBottom: 64, textAlign: 'center', gap: 26 }}>
        <span className="badge" style={{ height: 30, padding: '0 14px', fontSize: 13, background: 'var(--surface-1)', border: '1px solid var(--hairline)', color: 'var(--ink-muted)' }}>
          <span className="badge-dot" style={{ background: 'var(--accent)' }} />Kasir digital untuk UMKM Indonesia
        </span>
        <h1 className="display" style={{ fontSize: 62, maxWidth: 900, margin: 0 }}>Jualan jadi simpel.<br />Satu aplikasi kasir<br />untuk semua bisnismu.</h1>
        <p className="body muted" style={{ fontSize: 18.5, maxWidth: 560, margin: 0 }}>POS, stok, laporan & analitik dalam satu tempat — untuk F&B dan retail.</p>
        <div className="row gap12">
          <Btn variant="accent" size="lg">Mulai gratis</Btn>
          <Btn variant="secondary" size="lg" icon="play">Lihat demo</Btn>
        </div>
        <div className="row gap16 muted" style={{ fontSize: 13.5 }}>
          <span className="row gap6"><Icon name="check" size={15} stroke={2.2} style={{ color: 'var(--success)' }} />Tanpa kartu kredit</span>
          <span style={{ opacity: .4 }}>·</span>
          <span className="row gap6"><Icon name="check" size={15} stroke={2.2} style={{ color: 'var(--success)' }} />Setup 5 menit</span>
        </div>
        <div style={{ marginTop: 18 }}><LMockTablet /></div>
      </div>

      {/* TRUST BAR */}
      <div className="col center" style={{ ...sectionPad, paddingBottom: 72, gap: 20 }}>
        <div className="eyebrow">Dipakai 1.000+ usaha di Indonesia</div>
        <div className="row gap32 wrap center" style={{ opacity: .5 }}>
          {['Warung Kopi','Resto','Butik','Minimarket','Bakery','Apotek'].map(b => (
            <div key={b} className="row gap8" style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink-muted)' }}>
              <Icon name="store" size={18} />{b}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE GRID */}
      <div style={{ ...sectionPad, paddingBottom: 96 }}>
        <div className="col center" style={{ textAlign: 'center', gap: 12, marginBottom: 44 }}>
          <h2 className="display" style={{ fontSize: 40 }}>Semua yang kasirmu butuhkan</h2>
          <p className="body muted" style={{ fontSize: 17, maxWidth: 520 }}>Dari transaksi sampai laporan bulanan — otomatis, rapi, dan real-time.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <LFeature icon="cart" title="Kasir cepat (POS)" desc="Transaksi cash, QRIS, dan payment gateway dalam satu layar." />
          <LFeature icon="package" title="Manajemen produk" desc="Kategori, varian, dan SKU tertata rapi untuk tiap bisnis." />
          <LFeature icon="boxes" title="Inventaris real-time" desc="Pantau stok, alert stok menipis, dan riwayat pergerakan." />
          <LFeature icon="utensils" title="Manajemen meja" desc="Status meja & order untuk bisnis F&B dan restoran." />
          <LFeature icon="chart" title="Analitik penjualan" desc="Revenue, produk terlaris, dan kinerja kasir secara visual." />
          <LFeature icon="mail" title="Laporan otomatis" desc="Ringkasan bulanan dikirim via Email & WhatsApp tiap tanggal 1." />
        </div>
      </div>

      {/* SEGMENTED SHOWCASE */}
      <div className="col" style={{ ...sectionPad, paddingBottom: 96, gap: 96 }}>
        <LShowcase label="Untuk F&B" title="Kelola meja & pesanan tanpa ribet."
          bullets={['Lihat status tiap meja: kosong, terisi, reservasi','Order langsung tertaut ke transaksi POS','Pembayaran QRIS instan dari pelanggan']}
          mock={<div style={{ flex: '1 1 0', minWidth: 0 }}><Ph label="F&B · table management mockup" w="100%" h={320} radius={16} /></div>} />
        <LShowcase flip label="Untuk Retail" title="Stok & varian terkendali, selalu."
          bullets={['Lacak stok per varian dan SKU','Alert otomatis saat stok menipis','Riwayat pergerakan barang yang lengkap']}
          mock={<div style={{ flex: '1 1 0', minWidth: 0 }}><Ph label="Retail · inventory + variants mockup" w="100%" h={320} radius={16} /></div>} />
      </div>

      {/* HOW IT WORKS */}
      <div style={{ ...sectionPad, paddingBottom: 96 }}>
        <div className="col center" style={{ textAlign: 'center', gap: 12, marginBottom: 44 }}>
          <h2 className="display" style={{ fontSize: 40 }}>Mulai dalam 3 langkah</h2>
        </div>
        <div className="row" style={{ gap: 0, alignItems: 'flex-start', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 20, left: '16%', right: '16%', height: 1, background: 'var(--hairline)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', gap: 32 }}>
            <LStep n="1" title="Buat bisnis & pilih tipe" desc="Retail atau F&B — atur sekali, langsung jalan." />
            <LStep n="2" title="Tambah produk" desc="Impor atau ketik manual lengkap dengan harga & stok." />
            <LStep n="3" title="Mulai transaksi" desc="Buka POS dan terima pembayaran pertamamu hari ini." />
          </div>
        </div>
      </div>

      {/* ANALYTICS SHOWCASE */}
      <div style={{ ...sectionPad, paddingBottom: 96 }}>
        <div className="card" style={{ borderRadius: 20, padding: 40 }}>
          <div className="col center" style={{ textAlign: 'center', gap: 12, marginBottom: 32 }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>Analitik</span>
            <h2 className="display" style={{ fontSize: 38 }}>Pahami bisnismu dengan data.</h2>
          </div>
          <div className="row gap16" style={{ marginBottom: 16 }}>
            {[['Pendapatan','Rp 48,2 jt','+12,4%'],['Transaksi','1.284','+8,1%'],['Rata-rata order','Rp 37.500','+3,2%']].map(([l,v,d])=>(
              <div key={l} className="card grow col gap6" style={{ padding: 18, background: 'var(--canvas)' }}>
                <span className="muted" style={{ fontSize: 13 }}>{l}</span>
                <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{v}</span>
                <span className="row gap4" style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}><Icon name="trendUp" size={13} />{d}</span>
              </div>
            ))}
          </div>
          <Ph label="revenue area chart mockup" w="100%" h={220} radius={14} style={{ background: 'var(--canvas)' }} />
        </div>
      </div>

      {/* PRICING */}
      <div style={{ ...sectionPad, paddingBottom: 96 }}>
        <div className="col center" style={{ textAlign: 'center', gap: 16, marginBottom: 40 }}>
          <h2 className="display" style={{ fontSize: 40 }}>Harga yang tumbuh bersamamu</h2>
          <div className="row gap12 center">
            <span className="muted" style={{ fontSize: 14 }}>Bulanan</span>
            <span className="switch is-on" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Tahunan</span>
            <span className="badge badge-accent" style={{ height: 20 }}>Hemat 20%</span>
          </div>
        </div>
        <div className="row gap20" style={{ gap: 20, alignItems: 'stretch' }}>
          <LPricing name="Starter" price="Gratis" blurb="Untuk yang baru mulai." cta="Mulai gratis"
            features={['1 bisnis','100 produk','2 staf','POS dasar (cash & QRIS)']} />
          <LPricing name="Pro" price="Rp 149rb" per="/bln" popular blurb="Untuk bisnis yang berkembang." cta="Pilih Pro" ctaVariant="accent"
            features={['5 bisnis','1.000 produk','10 staf','Inventaris & Manajemen meja','Analitik & Laporan otomatis','Payment gateway']} />
          <LPricing name="Enterprise" price="Hubungi" blurb="Untuk skala besar & multi-cabang." cta="Hubungi kami"
            features={['Bisnis tak terbatas','Produk tak terbatas','Staf tak terbatas','Semua fitur Pro','Dukungan prioritas']} />
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ ...sectionPad, paddingBottom: 96 }}>
        <div className="row gap20">
          {[['Sari Dewi','Warung Kopi Senja','Sejak pakai Ngepos, antrian kasir jauh lebih cepat dan laporan harian otomatis masuk ke WhatsApp saya.','SD'],
            ['Andi Pratama','Toko Maju Jaya','Stok nggak pernah lagi kosong tanpa ketahuan. Alert stok menipis benar-benar menyelamatkan.','AP'],
            ['Rina Wijaya','Bakery Manis','Analitiknya bikin saya tahu produk mana yang harus didorong. Omzet naik dalam 2 bulan.','RW']].map(([n,b,q,init])=>(
            <div key={n} className="card grow col gap16" style={{ padding: 24 }}>
              <div className="row gap4" style={{ color: 'var(--accent)' }}>{[0,1,2,3,4].map(i=><Icon key={i} name="star" size={15} fill />)}</div>
              <p className="body" style={{ fontSize: 15, margin: 0 }}>"{q}"</p>
              <div className="row gap10" style={{ marginTop: 'auto' }}>
                <Avatar initials={init} />
                <div className="col"><span style={{ fontWeight: 600, fontSize: 14 }}>{n}</span><span className="muted" style={{ fontSize: 12.5 }}>{b}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ ...sectionPad, paddingBottom: 96, maxWidth: 860, margin: '0 auto' }}>
        <h2 className="display" style={{ fontSize: 36, textAlign: 'center', marginBottom: 36 }}>Pertanyaan umum</h2>
        <div className="col gap12">
          <LFaq open q="Apakah benar-benar gratis untuk memulai?" a="Ya. Paket Starter gratis selamanya untuk 1 bisnis, 100 produk, dan 2 staf — tanpa kartu kredit." />
          <LFaq q="Bagaimana keamanan data bisnis saya?" />
          <LFaq q="Bisakah saya mengelola beberapa bisnis sekaligus?" />
          <LFaq q="Metode pembayaran apa saja yang didukung?" />
          <LFaq q="Bagaimana laporan WhatsApp bekerja?" />
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{ ...sectionPad, paddingBottom: 80 }}>
        <div className="col center" style={{ background: '#111111', borderRadius: 24, padding: '64px 40px', textAlign: 'center', gap: 24 }}>
          <h2 className="display" style={{ fontSize: 44, color: '#fff' }}>Siap modernkan kasirmu?</h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 18, margin: 0 }}>Mulai gratis hari ini. Setup hanya 5 menit.</p>
          <Btn variant="accent" size="lg">Mulai gratis sekarang</Btn>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ ...sectionPad, borderTop: '1px solid var(--hairline)', paddingTop: 48, paddingBottom: 36 }}>
        <div className="row" style={{ gap: 64, alignItems: 'flex-start', marginBottom: 40 }}>
          <div className="col gap12" style={{ flex: '1 1 0' }}>
            <div className="row gap8" style={{ fontWeight: 700, fontSize: 18 }}>
              <span className="center" style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--accent)', color: '#fff' }}><Icon name="zap" size={14} fill /></span>Ngepos
            </div>
            <p className="muted" style={{ fontSize: 13.5, maxWidth: 240 }}>Kasir digital untuk UMKM Indonesia.</p>
          </div>
          {[['Produk',['Fitur','Harga','POS','Analitik']],['Perusahaan',['Tentang','Karier','Blog','Kontak']],['Sumber daya',['Bantuan','Panduan','API','Status']],['Legal',['Privasi','Ketentuan','Keamanan']]].map(([h,items])=>(
            <div key={h} className="col gap12" style={{ flex: '1 1 0' }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{h}</div>
              {items.map(it => <span key={it} className="muted" style={{ fontSize: 13.5, cursor: 'pointer' }}>{it}</span>)}
            </div>
          ))}
        </div>
        <hr className="divider" />
        <div className="between" style={{ marginTop: 20 }}>
          <span className="muted" style={{ fontSize: 13 }}>© 2026 Ngepos. Dibuat di Indonesia.</span>
          <div className="row gap12" style={{ color: 'var(--ink-subtle)' }}>
            <Icon name="chat" size={18} /><Icon name="mail" size={18} /><Icon name="phone" size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LandingPage, LMockTablet });
