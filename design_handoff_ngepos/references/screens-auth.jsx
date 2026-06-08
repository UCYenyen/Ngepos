/* ===================================================================
   Ngepos — Auth & Onboarding (login, signup, onboarding)
   =================================================================== */

function Wordmark({ size = 20 }) {
  return (
    <div className="row gap8" style={{ fontWeight: 700, fontSize: size, letterSpacing: '-0.02em' }}>
      <span className="center" style={{ width: size * 1.3, height: size * 1.3, borderRadius: 8, background: 'var(--accent)', color: '#fff' }}><Icon name="zap" size={size * 0.75} fill /></span>
      Ngepos
    </div>
  );
}

function AuthBrandPanel() {
  return (
    <div className="col" style={{ width: 380, flex: '0 0 380px', background: '#111111', padding: 40, justifyContent: 'space-between', color: '#fff' }}>
      <Wordmark />
      <div className="col gap24">
        <div className="display" style={{ fontSize: 32, color: '#fff', letterSpacing: '-0.02em' }}>Kasir digital untuk semua bisnismu.</div>
        <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: 16 }}>
          <Ph label="product mockup" w="100%" h={180} radius={10} style={{ background: 'rgba(255,255,255,.06)' }} />
        </div>
        <div className="row gap12">
          {[['1.000+','Usaha'],['4,9','Rating'],['5 mnt','Setup']].map(([v,l])=>(
            <div key={l} className="col" style={{ flex: '1 1 0' }}>
              <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{v}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>© 2026 Ngepos</span>
    </div>
  );
}

function FormField({ label, type = 'text', placeholder, value, helper, focus }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input className={'input' + (focus ? ' is-focus' : '')} placeholder={placeholder} defaultValue={value} type={type === 'password' ? 'text' : type} />
      {helper && <span className="helper">{helper}</span>}
    </div>
  );
}

function AuthScaffold({ children }) {
  return (
    <div className="np row" style={{ width: '100%', height: '100%', background: 'var(--canvas)' }}>
      <AuthBrandPanel />
      <div className="grow center" style={{ padding: 40 }}>
        {children}
      </div>
    </div>
  );
}

function LoginScreen() {
  return (
    <AuthScaffold>
      <div className="col gap24" style={{ width: 380 }}>
        <div className="col gap8">
          <div className="h1" style={{ fontSize: 26 }}>Masuk ke Ngepos</div>
          <div className="body muted">Selamat datang kembali. Masuk untuk lanjut.</div>
        </div>
        <FormField label="Email" type="email" placeholder="kamu@bisnis.com" value="sari@kopisenja.id" />
        <div className="col gap8">
          <div className="between"><label className="label">Password</label><a style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Lupa password?</a></div>
          <input className="input" type="password" defaultValue="••••••••••" />
        </div>
        <Btn variant="accent" block>Masuk</Btn>
        <div className="row gap12 center"><hr className="divider grow" /><span className="muted" style={{ fontSize: 13 }}>atau</span><hr className="divider grow" /></div>
        <Btn variant="secondary" block icon="google">Lanjutkan dengan Google</Btn>
        <div className="center body muted" style={{ fontSize: 14 }}>Belum punya akun?&nbsp;<a style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Daftar</a></div>
      </div>
    </AuthScaffold>
  );
}

function LoginErrorScreen() {
  return (
    <AuthScaffold>
      <div className="col gap24" style={{ width: 380 }}>
        <div className="col gap8">
          <div className="h1" style={{ fontSize: 26 }}>Masuk ke Ngepos</div>
          <div className="body muted">Selamat datang kembali. Masuk untuk lanjut.</div>
        </div>
        <div className="row gap10" style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--error-light)', color: 'var(--error)', alignItems: 'flex-start' }}>
          <Icon name="alert" size={17} stroke={2} style={{ marginTop: 1 }} />
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>Email atau password salah. Silakan coba lagi.</span>
        </div>
        <FormField label="Email" type="email" value="sari@kopisenja.id" />
        <div className="field">
          <label className="label">Password</label>
          <input className="input" type="password" defaultValue="••••••" style={{ borderColor: 'var(--error)', boxShadow: '0 0 0 3px var(--error-light)' }} />
        </div>
        <Btn variant="accent" block>Masuk</Btn>
        <div className="center body muted" style={{ fontSize: 14 }}>Belum punya akun?&nbsp;<a style={{ color: 'var(--accent)', fontWeight: 600 }}>Daftar</a></div>
      </div>
    </AuthScaffold>
  );
}

function SignupScreen() {
  return (
    <AuthScaffold>
      <div className="col gap24" style={{ width: 380 }}>
        <div className="col gap8">
          <div className="h1" style={{ fontSize: 26 }}>Buat akun gratis</div>
          <div className="body muted">Mulai kelola bisnismu dalam 5 menit.</div>
        </div>
        <FormField label="Nama lengkap" placeholder="Sari Dewi" value="Sari Dewi" />
        <FormField label="Email" type="email" placeholder="kamu@bisnis.com" value="sari@kopisenja.id" />
        <div className="field">
          <label className="label">Password</label>
          <input className="input" type="password" defaultValue="••••••••••••" />
          <div className="row gap6" style={{ marginTop: 2 }}>
            {[0,1,2].map(i => <span key={i} style={{ height: 4, flex: 1, borderRadius: 999, background: 'var(--success)' }} />)}
            <span style={{ height: 4, flex: 1, borderRadius: 999, background: 'var(--hairline)' }} />
          </div>
          <span className="helper">Kekuatan: <strong style={{ color: 'var(--success)' }}>Kuat</strong> · minimal 8 karakter</span>
        </div>
        <Btn variant="accent" block>Buat akun</Btn>
        <Btn variant="secondary" block icon="google">Lanjutkan dengan Google</Btn>
        <p className="muted" style={{ fontSize: 12.5, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>Dengan mendaftar, kamu menyetujui <a style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Ketentuan Layanan</a> & <a style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Kebijakan Privasi</a>.</p>
      </div>
    </AuthScaffold>
  );
}

function TypeCard({ icon, title, desc, selected }) {
  return (
    <div className="card col gap10" style={{ padding: 20, flex: '1 1 0', cursor: 'pointer', position: 'relative',
      border: selected ? '1.5px solid var(--accent)' : '1px solid var(--hairline)',
      background: selected ? 'var(--accent-tint)' : 'var(--surface-1)' }}>
      {selected && <span className="center" style={{ position: 'absolute', top: 14, right: 14, width: 20, height: 20, borderRadius: 999, background: 'var(--accent)', color: '#fff' }}><Icon name="check" size={12} stroke={3} /></span>}
      <div className="center" style={{ width: 44, height: 44, borderRadius: 12, background: selected ? 'var(--accent)' : 'var(--surface-2)', color: selected ? '#fff' : 'var(--ink-muted)' }}>
        <Icon name={icon} size={22} stroke={1.9} />
      </div>
      <div className="h3" style={{ fontSize: 15.5 }}>{title}</div>
      <div className="body muted" style={{ fontSize: 13 }}>{desc}</div>
    </div>
  );
}

function OnboardingScreen() {
  return (
    <div className="np col center" style={{ width: '100%', height: '100%', background: 'var(--canvas)', padding: 40 }}>
      <div className="col gap24" style={{ width: 460 }}>
        <div className="center"><Wordmark size={22} /></div>
        <div className="card col gap24" style={{ padding: 36 }}>
          <div className="col gap8">
            <span className="eyebrow">Langkah 1 dari 1</span>
            <div className="h1" style={{ fontSize: 24 }}>Buat bisnis pertamamu</div>
            <div className="body muted" style={{ fontSize: 14 }}>Atur sekali, langsung bisa jualan.</div>
          </div>
          <FormField label="Nama bisnis" placeholder="Warung Kopi Senja" value="Kopi Senja" />
          <div className="field">
            <label className="label">Tipe bisnis</label>
            <div className="row gap12">
              <TypeCard icon="store" title="Retail" desc="Toko, butik, minimarket" />
              <TypeCard icon="utensils" title="F&B / Restoran" desc="Kafe, resto, warung" selected />
            </div>
          </div>
          <div className="row gap12">
            <div className="field grow"><label className="label">Zona waktu</label>
              <div className="input row between" style={{ alignItems: 'center' }}><span>WIB (GMT+7)</span><Icon name="chevronDown" size={16} style={{ color: 'var(--ink-subtle)' }} /></div>
            </div>
            <div className="field grow"><label className="label">Mata uang</label>
              <div className="input row between" style={{ alignItems: 'center' }}><span>IDR — Rupiah</span><Icon name="chevronDown" size={16} style={{ color: 'var(--ink-subtle)' }} /></div>
            </div>
          </div>
          <Btn variant="accent" block iconRight="arrowRight">Lanjutkan</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Wordmark, LoginScreen, LoginErrorScreen, SignupScreen, OnboardingScreen, AuthBrandPanel, FormField });
