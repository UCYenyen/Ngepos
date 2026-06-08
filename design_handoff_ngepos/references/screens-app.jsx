/* ===================================================================
   Ngepos — App shell chrome, Dashboard & Business switcher
   =================================================================== */

function AccountTopbar({ active = 'dashboard' }) {
  return (
    <div className="between" style={{ height: 60, padding: '0 28px', background: 'var(--surface-1)', borderBottom: '1px solid var(--hairline)', flex: '0 0 60px' }}>
      <div className="row gap32">
        <Wordmark size={18} />
        <div className="row gap6">
          {[['dashboard','Bisnis'],['billing','Billing']].map(([id,l])=>(
            <span key={id} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: id===active?600:500,
              background: id===active?'var(--surface-2)':'transparent', color: id===active?'var(--ink)':'var(--ink-muted)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </div>
      <div className="row gap12">
        <span className="btn-icon center"><Icon name="bell" size={18} /></span>
        <span className="row gap8" style={{ cursor: 'pointer' }}><Avatar initials="BS" size={32} /><Icon name="chevronDown" size={15} style={{ color: 'var(--ink-subtle)' }} /></span>
      </div>
    </div>
  );
}

function BizCard({ name, type, init, members, role, tint }) {
  return (
    <div className="card col" style={{ padding: 22, gap: 18 }}>
      <div className="between" style={{ alignItems: 'flex-start' }}>
        <Avatar initials={init} size={48} tint={tint} style={{ borderRadius: 13, fontSize: 18 }} />
        <span className={'badge ' + (role==='Owner'?'badge-ink':'')}>{role}</span>
      </div>
      <div className="col gap6">
        <div className="h3" style={{ fontSize: 17 }}>{name}</div>
        <div className="row gap8">
          <span className="badge">{type==='fnb'?'F&B':'Retail'}</span>
          <span className="row gap4 muted" style={{ fontSize: 13 }}><Icon name="users" size={14} />{members} anggota</span>
        </div>
      </div>
      <hr className="divider" />
      <div className="between">
        <span className="row gap6 muted" style={{ fontSize: 12.5 }}><span className="badge-dot" style={{ background: 'var(--success)' }} />Aktif</span>
        <Btn variant="secondary" size="sm" iconRight="arrowRight">Buka</Btn>
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="np col" style={{ width: '100%', height: '100%', background: 'var(--canvas)', overflow: 'hidden' }}>
      <AccountTopbar />
      <div className="grow no-scrollbar" style={{ padding: '32px 40px', overflow: 'auto' }}>
        <div className="between" style={{ marginBottom: 28 }}>
          <div className="col gap6">
            <div className="h1">Bisnismu</div>
            <div className="body muted">Kelola semua bisnis dari satu tempat. <strong style={{ color: 'var(--ink)' }}>3 dari 5</strong> bisnis terpakai.</div>
          </div>
          <Btn variant="accent" icon="plus">Buat bisnis baru</Btn>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1080 }}>
          <BizCard name="Kopi Senja" type="fnb" init="KS" members={6} role="Owner" tint="var(--accent)" />
          <BizCard name="Toko Maju Jaya" type="retail" init="TM" members={4} role="Owner" tint="#03b2cb" />
          <BizCard name="Bakery Manis" type="fnb" init="BM" members={3} role="Manager" tint="#ff2067" />
          <div className="center" style={{ border: '1.5px dashed var(--hairline)', borderRadius: 12, padding: 22, minHeight: 200, cursor: 'pointer' }}>
            <div className="col center gap10 muted">
              <span className="center" style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)' }}><Icon name="plus" size={22} /></span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Buat bisnis baru</span>
              <span style={{ fontSize: 12.5 }}>2 slot tersisa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardEmptyScreen() {
  return (
    <div className="np col" style={{ width: '100%', height: '100%', background: 'var(--canvas)', overflow: 'hidden' }}>
      <AccountTopbar />
      <div className="grow center" style={{ padding: 40 }}>
        <div className="col center gap20" style={{ textAlign: 'center', maxWidth: 420 }}>
          <div className="center" style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--surface-1)', border: '1px solid var(--hairline)', color: 'var(--ink-subtle)' }}><Icon name="building" size={32} stroke={1.6} /></div>
          <div className="col gap8">
            <div className="h2">Belum ada bisnis</div>
            <div className="body muted">Buat bisnis pertamamu untuk mulai berjualan. Setup hanya butuh beberapa menit.</div>
          </div>
          <Btn variant="accent" icon="plus">Buat bisnis pertama</Btn>
        </div>
      </div>
    </div>
  );
}

function SwitcherScreen({ biz = 'fnb' }) {
  return (
    <div className="np row" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <Sidebar active="pos" biz={biz} plan="pro" />
        {/* open switcher popover */}
        <div className="card" style={{ position: 'absolute', top: 56, left: 12, width: 232, padding: 6, zIndex: 30, boxShadow: '0 12px 32px rgba(0,0,0,.14)' }}>
          <div style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-subtle)' }}>Bisnismu</div>
          {[['Kopi Senja','F&B','KS','var(--accent)',true],['Toko Maju Jaya','Retail','TM','#03b2cb',false],['Bakery Manis','F&B','BM','#ff2067',false]].map(([n,t,i,c,on])=>(
            <div key={n} className="row gap10" style={{ padding: 8, borderRadius: 8, cursor: 'pointer', background: on?'var(--surface-2)':'transparent' }}>
              <Avatar initials={i} size={30} tint={c} style={{ borderRadius: 8 }} />
              <div className="col grow"><span style={{ fontSize: 13.5, fontWeight: 600 }}>{n}</span><span className="muted" style={{ fontSize: 11.5 }}>{t}</span></div>
              {on && <Icon name="check" size={16} stroke={2.4} style={{ color: 'var(--accent)' }} />}
            </div>
          ))}
          <hr className="divider" style={{ margin: '6px 4px' }} />
          <div className="row gap10" style={{ padding: 8, borderRadius: 8, cursor: 'pointer', color: 'var(--accent)' }}>
            <span className="center" style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-tint)' }}><Icon name="plus" size={16} /></span>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Buat bisnis baru</span>
          </div>
        </div>
      </div>
      <div className="grow" style={{ background: 'var(--canvas)', filter: 'blur(0px)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.04)' }} />
      </div>
    </div>
  );
}

Object.assign(window, { AccountTopbar, DashboardScreen, DashboardEmptyScreen, SwitcherScreen, BizCard });
