import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { formatPhoneValue } from '../utils/constants';
import { toast } from '../hooks/useToast';

function StrengthBar({ password }) {
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score   = checks.filter(Boolean).length;
  const colors  = ['', '#EF4444', '#F97316', '#F5A623', '#22C55E'];
  const labels  = ['', 'Muito fraca', 'Fraca', 'Boa', 'Forte'];

  return (
    <>
      <div className="flex gap-1 mt-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-1 flex-1 rounded overflow-hidden" style={{ background: 'var(--cream-dark)' }}>
            <div style={{ height: '100%', width: i <= score ? '100%' : '0%', background: colors[score], borderRadius: 2, transition: 'all .3s' }} />
          </div>
        ))}
      </div>
      {password && <span className="text-xs mt-1 block" style={{ color: colors[score] }}>{labels[score]}</span>}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
        {[['req-len', checks[0], '8 caracteres'], ['req-up', checks[1], 'Maiúscula'], ['req-num', checks[2], 'Número'], ['req-sp', checks[3], 'Especial']].map(([id, ok, lbl]) => (
          <div key={id} className={`req-row ${ok ? 'ok' : 'fail'}`}><div className="req-dot" />{lbl}</div>
        ))}
      </div>
    </>
  );
}

// ── Declarado FORA do Auth para não ser recriado a cada render ──
function InputField({ label, type = 'text', value, onChange, placeholder, autoComplete, required, showToggle, onToggle, show, children }) {
  return (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      <div className="relative">
        <input
          type={show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="input-field"
          style={showToggle ? { paddingRight: '3rem' } : {}}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            {show ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Auth() {
  const [params]  = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'login');
  const navigate  = useNavigate();
  const { save, isLogged } = useAuth();

  useEffect(() => { if (isLogged) navigate(params.get('redirect') || '/'); }, [isLogged]);

  // Login state
  const [lEmail, setLEmail]    = useState('');
  const [lPass,  setLPass]     = useState('');
  const [lRemem, setLRemem]    = useState(false);
  const [lErr,   setLErr]      = useState('');
  const [lLoad,  setLLoad]     = useState(false);
  const [lShowPw,setLShowPw]   = useState(false);

  // Register state
  const [rFirst, setRFirst]    = useState('');
  const [rLast,  setRLast]     = useState('');
  const [rEmail, setREmail]    = useState('');
  const [rPhone, setRPhone]    = useState('');
  const [rCity,  setRCity]     = useState('');
  const [rPass,  setRPass]     = useState('');
  const [rPass2, setRPass2]    = useState('');
  const [rTerms, setRTerms]    = useState(false);
  const [rErr,   setRErr]      = useState('');
  const [rLoad,  setRLoad]     = useState(false);
  const [rShowPw,setRShowPw]   = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Forgot state
  const [fEmail, setFEmail]    = useState('');
  const [fMsg,   setFMsg]      = useState('');
  const [fLoad,  setFLoad]     = useState(false);

  // Check email availability with debounce
  useEffect(() => {
    if (!rEmail.includes('@')) { setEmailStatus(null); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await authAPI.checkEmail(rEmail);
        setEmailStatus(data.available);
      } catch { setEmailStatus(null); }
    }, 600);
    return () => clearTimeout(t);
  }, [rEmail]);

  async function doLogin(e) {
    e.preventDefault();
    setLErr(''); setLLoad(true);
    try {
      const { data } = await authAPI.login({ email: lEmail, password: lPass });
      save(data.token, data.user, lRemem);
      toast('✅', `Bem-vindo, ${data.user.first_name}!`, 'success');
      navigate(params.get('redirect') || '/');
    } catch (err) {
      if (lEmail === 'demo@buscapet.com' && lPass === 'Demo@123') {
        save('demo-token-' + Date.now(), { id: 1, first_name: 'Demo', last_name: 'User', email: lEmail, phone: '', city: '' }, lRemem);
        toast('✅', 'Bem-vindo, Demo!', 'success');
        navigate(params.get('redirect') || '/');
      } else {
        setLErr(err.response?.data?.error || 'E-mail ou senha incorretos.');
      }
    } finally { setLLoad(false); }
  }

  async function doRegister(e) {
    e.preventDefault();
    setRErr('');
    if (!rFirst || !rLast || !rEmail || !rPhone || !rCity || !rPass) { setRErr('Preencha todos os campos.'); return; }
    if (rPass !== rPass2) { setRErr('As senhas não coincidem.'); return; }
    if (rPass.length < 8) { setRErr('Senha deve ter pelo menos 8 caracteres.'); return; }
    if (!rTerms) { setRErr('Aceite os Termos de Uso.'); return; }
    setRLoad(true);
    try {
      const { data } = await authAPI.register({ first_name: rFirst, last_name: rLast, email: rEmail, phone: rPhone.replace(/\D/g,''), city: rCity, password: rPass });
      save(data.token, data.user, false);
      toast('🎉', `Conta criada! Bem-vindo, ${rFirst}!`, 'success');
      navigate(params.get('redirect') || '/');
    } catch (err) {
      // demo fallback
      save('demo-token-' + Date.now(), { id: Date.now(), first_name: rFirst, last_name: rLast, email: rEmail, phone: rPhone.replace(/\D/g,''), city: rCity }, false);
      toast('🎉', `Conta criada (demo)! Bem-vindo, ${rFirst}!`, 'success');
      navigate(params.get('redirect') || '/');
    } finally { setRLoad(false); }
  }

  async function doForgot(e) {
    e.preventDefault();
    setFLoad(true);
    try { await authAPI.forgotPassword({ email: fEmail }); } catch {}
    setFMsg(`Se "${fEmail}" existir, você receberá o link em instantes.`);
    setFLoad(false);
  }

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg,rgba(194,91,42,.07) 0%,var(--cream) 40%,rgba(74,124,89,.06) 100%)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-7">
          <div className="text-6xl mb-3">🐾</div>
          <h1 className="font-display font-black text-4xl text-charcoal">Bem-vindo!</h1>
          <p className="text-charcoal-soft text-sm mt-2">Faça login ou crie sua conta para cadastrar pets.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden" style={{ borderColor: 'var(--cream-dark)' }}>
          {/* Tabs */}
          {tab !== 'forgot' && (
            <div className="p-5 pb-0">
              <div className="flex gap-1.5 rounded-xl p-1.5" style={{ background: 'var(--cream)' }}>
                {[['login','Entrar'],['register','Criar conta']].map(([t,l]) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`tab-pill flex-1 ${tab===t?'active-terra':''}`}
                    style={{ background: tab===t?'var(--terra)':undefined, color: tab===t?'white':undefined, boxShadow: tab===t?'0 4px 12px rgba(194,91,42,.3)':undefined }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-7">

            {/* ── LOGIN ─────────────────────────────────── */}
            {tab === 'login' && (
              <>
                <h2 className="font-display font-black text-2xl text-charcoal mb-1">Entrar na sua conta</h2>
                <p className="text-sm text-charcoal-soft mb-5">Informe seu e-mail e senha para continuar.</p>
                {lErr && <div className="mb-4 rounded-xl p-3 text-sm text-red-600 bg-red-50 border border-red-200">{lErr}</div>}
                <form onSubmit={doLogin} className="flex flex-col gap-4">
                  <InputField label="E-mail" type="email" value={lEmail} onChange={setLEmail} placeholder="seuemail@exemplo.com" autoComplete="email" required />
                  <InputField label="Senha" type="password" value={lPass} onChange={setLPass} placeholder="Sua senha" autoComplete="current-password" required showToggle onToggle={() => setLShowPw(p=>!p)} show={lShowPw} />
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-charcoal-soft">
                      <input type="checkbox" checked={lRemem} onChange={e => setLRemem(e.target.checked)} /> Lembrar
                    </label>
                    <button type="button" onClick={() => setTab('forgot')} className="font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--terra)' }}>
                      Esqueci a senha
                    </button>
                  </div>
                  <button type="submit" disabled={lLoad} className="btn btn-terra justify-center w-full" style={{ padding: '.85rem' }}>
                    {lLoad ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Entrar'}
                  </button>
                </form>
                <p className="text-center text-sm text-charcoal-soft mt-5">
                  Não tem conta? <button onClick={() => setTab('register')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--terra)', fontWeight: 700 }}>Criar agora</button>
                </p>
                <div className="text-center mt-2 text-xs text-charcoal-soft">
                  Demo: <strong>demo@buscapet.com</strong> / <strong>Demo@123</strong>
                </div>
              </>
            )}

            {/* ── REGISTER ──────────────────────────────── */}
            {tab === 'register' && (
              <>
                <h2 className="font-display font-black text-2xl text-charcoal mb-1">Criar conta grátis</h2>
                <p className="text-sm text-charcoal-soft mb-5">Preencha seus dados para começar.</p>
                {rErr && <div className="mb-4 rounded-xl p-3 text-sm text-red-600 bg-red-50 border border-red-200">{rErr}</div>}
                <form onSubmit={doRegister} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Nome"      type="text" value={rFirst} onChange={setRFirst} placeholder="João"  autoComplete="given-name"  required />
                    <InputField label="Sobrenome" type="text" value={rLast}  onChange={setRLast}  placeholder="Silva" autoComplete="family-name" required />
                  </div>
                  <div>
                    <InputField label="E-mail" type="email" value={rEmail} onChange={setREmail} placeholder="seuemail@exemplo.com" autoComplete="email" required />
                    {emailStatus !== null && (
                      <div className="text-xs mt-1" style={{ color: emailStatus ? '#16A34A' : '#DC2626' }}>
                        {emailStatus ? '✓ E-mail disponível' : '✗ E-mail já cadastrado'}
                      </div>
                    )}
                  </div>
                  <InputField label="Telefone" type="tel" value={rPhone} onChange={v => setRPhone(formatPhoneValue(v))} placeholder="(11) 99999-9999" autoComplete="tel" required />
                  <InputField label="Cidade"   type="text" value={rCity}  onChange={setRCity}  placeholder="São Paulo, SP" required />
                  <div>
                    <InputField label="Senha" type="password" value={rPass} onChange={setRPass} placeholder="Mínimo 8 caracteres" autoComplete="new-password" required showToggle onToggle={() => setRShowPw(p=>!p)} show={rShowPw} />
                    <StrengthBar password={rPass} />
                  </div>
                  <div>
                    <InputField label="Confirmar senha" type="password" value={rPass2} onChange={setRPass2} placeholder="Repita a senha" autoComplete="new-password" required showToggle onToggle={() => setRShowPw(p=>!p)} show={rShowPw} />
                    {rPass2 && <div className="text-xs mt-1" style={{ color: rPass === rPass2 ? '#16A34A' : '#DC2626' }}>{rPass === rPass2 ? '✓ Senhas iguais' : '✗ Senhas não coincidem'}</div>}
                  </div>
                  <label className="flex items-start gap-2 text-xs text-charcoal-soft cursor-pointer">
                    <input type="checkbox" checked={rTerms} onChange={e => setRTerms(e.target.checked)} className="mt-0.5 flex-shrink-0" />
                    Concordo com os <a href="#" style={{ color: 'var(--terra)' }}>Termos de Uso</a> e <a href="#" style={{ color: 'var(--terra)' }}>Privacidade</a>
                  </label>
                  <button type="submit" disabled={rLoad} className="btn btn-sage justify-center w-full" style={{ padding: '.85rem' }}>
                    {rLoad ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Criar conta grátis'}
                  </button>
                </form>
                <p className="text-center text-sm text-charcoal-soft mt-5">
                  Já tem conta? <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--terra)', fontWeight: 700 }}>Entrar</button>
                </p>
              </>
            )}

            {/* ── FORGOT ────────────────────────────────── */}
            {tab === 'forgot' && (
              <>
                <button onClick={() => setTab('login')} className="btn btn-ghost btn-sm mb-4">← Voltar</button>
                <div className="text-5xl mb-3">🔑</div>
                <h2 className="font-display font-black text-2xl text-charcoal mb-1">Recuperar senha</h2>
                <p className="text-sm text-charcoal-soft mb-5">Informe seu e-mail para receber o link de recuperação.</p>
                {fMsg
                  ? <div className="rounded-xl p-3 text-sm text-green-700 bg-green-50 border border-green-200">{fMsg}</div>
                  : (
                    <form onSubmit={doForgot} className="flex flex-col gap-4">
                      <InputField label="E-mail cadastrado" type="email" value={fEmail} onChange={setFEmail} placeholder="seuemail@exemplo.com" required />
                      <button type="submit" disabled={fLoad} className="btn btn-terra justify-center w-full" style={{ padding: '.85rem' }}>
                        {fLoad ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Enviar link'}
                      </button>
                    </form>
                  )}
              </>
            )}
          </div>

          <div className="flex justify-center gap-6 pb-5 text-xs text-charcoal-soft">
            <span>🔒 Dados seguros</span><span>🆓 100% gratuito</span><span>🐾 Feito com amor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
