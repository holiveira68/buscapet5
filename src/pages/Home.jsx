import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePets } from '../context/PetsContext';
import { PetCard } from '../components/PetCard';
import { MatchCard } from '../components/PetCard';

function Counter({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    let cur = 0;
    const step = Math.max(1, Math.ceil(value / 35));
    const iv = setInterval(() => {
      cur = Math.min(cur + step, value);
      if (ref.current) ref.current.textContent = cur;
      if (cur >= value) clearInterval(iv);
    }, 28);
    return () => clearInterval(iv);
  }, [value]);
  return <span ref={ref}>0</span>;
}

export default function Home() {
  const { pets, matches } = usePets();
  const lost  = pets.filter(p => p.type === 'lost').length;
  const found = pets.filter(p => p.type === 'found').length;

  const HOW_STEPS = [
    { color: '#C25B2A', n: '1', title: 'Cadastre',    desc: 'Registre o animal com foto, raça, cor e localização.' },
    { color: '#4A7C59', n: '2', title: 'Cruzamos',    desc: 'Nossa IA compara espécie, cor, porte, data e local.' },
    { color: '#F5A623', n: '3', title: 'Reencontro!', desc: 'Você recebe um alerta de match e entra em contato.' },
  ];

  return (
    <div>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-68px)] flex items-center relative overflow-hidden" style={{ background: 'var(--cream)' }}>
        <div className="paw-pattern absolute inset-0 opacity-[.04] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(194,91,42,.09),transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(74,124,89,.07),transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
          {/* Left */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6"
              style={{ background: 'rgba(245,166,35,.15)', border: '1px solid rgba(245,166,35,.4)', color: '#a05c00' }}>
              <span className="w-2 h-2 rounded-full animate-pulse-slow" style={{ background: 'var(--amber)' }} />
              Plataforma gratuita de reencontros
            </div>
            <h1 className="font-display font-black leading-[1.05] text-charcoal mb-5" style={{ fontSize: 'clamp(3rem,5.5vw,5rem)' }}>
              Reencontre<br /><span style={{ color: 'var(--terra)' }}>seu melhor</span><br />amigo. 🐾
            </h1>
            <p className="text-lg text-charcoal-soft leading-relaxed max-w-[440px] mb-8">
              Cadastre animais perdidos ou achados e deixe nossa tecnologia cruzar as informações para reunir pets e tutores.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/perdi-meu-pet"    className="btn btn-terra btn-lg">😢 Perdi meu pet</Link>
              <Link to="/encontrei-um-pet" className="btn btn-sage btn-lg">🐾 Encontrei um pet</Link>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-8">
              {[
                [lost,    'Perdidos',  'var(--terra)'],
                [found,   'Achados',   'var(--sage)'],
                [matches.length, 'Matches', 'var(--amber)'],
              ].map(([val, lbl, color], i) => (
                <div key={i} className="flex items-center gap-8">
                  {i > 0 && <div className="w-px h-12" style={{ background: 'var(--cream-dark)' }} />}
                  <div className="text-center">
                    <div className="font-display font-black" style={{ fontSize: '2.2rem', color }}><Counter value={val} /></div>
                    <div className="text-xs text-charcoal-soft mt-1">{lbl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative cards */}
          <div className="hidden md:block relative" style={{ height: 380 }}>
            {[
              { top: 0, right: '2rem', rot: '3deg', rotH: '0deg', emoji: '🐕', name: 'Rex — Golden Retriever', loc: 'Vila Madalena, SP', type: 'lost' },
              { top: '4rem', right: '6rem', rot: '-2deg', rotH: '0deg', emoji: '🐈', name: 'Mia — Gata Siamesa', loc: 'Pinheiros, SP', type: 'found', z: 2 },
            ].map((c, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-3xl p-5 transition-all duration-300"
                style={{ top: c.top, right: c.right, width: 220, boxShadow: '0 16px 48px rgba(0,0,0,.12)', transform: `rotate(${c.rot})`, zIndex: c.z || 1 }}
                onMouseOver={e => e.currentTarget.style.transform = `rotate(${c.rotH}) scale(1.03)`}
                onMouseOut={e => e.currentTarget.style.transform = `rotate(${c.rot})`}
              >
                <div className="h-[130px] rounded-xl flex items-center justify-center text-[4rem] mb-3"
                  style={{ background: c.type === 'lost' ? 'linear-gradient(135deg,rgba(194,91,42,.15),rgba(194,91,42,.04))' : 'linear-gradient(135deg,rgba(74,124,89,.15),rgba(74,124,89,.04))' }}>
                  {c.emoji}
                </div>
                <div className="font-bold text-sm text-charcoal">{c.name}</div>
                <div className="text-xs text-charcoal-soft mt-1">📍 {c.loc}</div>
                <span className={`badge badge-${c.type} mt-2 inline-flex`}>{c.type === 'lost' ? '😢 Perdido' : '🐾 Achada'}</span>
              </div>
            ))}
            <div className="absolute animate-match z-10" style={{ bottom: '1.5rem', left: '1rem', background: 'var(--amber)', color: 'white', borderRadius: 16, padding: '.65rem 1.1rem', boxShadow: '0 8px 24px rgba(245,166,35,.4)', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <span style={{ fontSize: '1.25rem' }}>✨</span>
              <div><div style={{ fontSize: '.75rem', fontWeight: 800 }}>Match encontrado!</div><div style={{ fontSize: '.7rem', opacity: .85 }}>Tutor notificado</div></div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M0 30C360 60 1080 0 1440 30V60H0V30Z" fill="#FFFFFF" />
          </svg>
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="section-title">Como <span style={{ color: 'var(--terra)' }}>funciona?</span></h2>
            <p className="section-sub mt-3 max-w-xl mx-auto">Em 3 passos simples, seu reencontro começa agora.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {HOW_STEPS.map(({ color, n, title, desc }) => (
              <div key={n} className="rounded-2xl p-8 border" style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl mb-5" style={{ background: `${color}18`, color }}>
                  {n}
                </div>
                <h3 className="font-display font-black text-charcoal text-xl mb-2">{title}</h3>
                <p className="text-sm text-charcoal-soft leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/como-funciona" className="btn btn-outline-terra">Ver guia completo →</Link>
          </div>
        </div>
      </section>

      {/* ── PETS RECENTES ────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <h2 className="section-title">Cadastros <span style={{ color: 'var(--terra)' }}>recentes</span></h2>
              <p className="section-sub mt-1">Você reconhece algum?</p>
            </div>
            <div className="flex gap-3">
              <Link to="/perdidos" className="btn btn-outline-terra btn-sm">Ver perdidos</Link>
              <Link to="/achados"  className="btn btn-outline-sage btn-sm">Ver achados</Link>
            </div>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
            {pets.slice(0, 8).map(p => <PetCard key={p.id} pet={p} />)}
          </div>
        </div>
      </section>

      {/* ── MATCHES ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(245,166,35,.12)', border: '1px solid rgba(245,166,35,.35)', color: '#a05c00' }}>
              ✨ Possíveis reencontros detectados
            </div>
            <h2 className="section-title">Matches <span style={{ color: 'var(--amber)' }}>automáticos</span></h2>
            <p className="section-sub mt-2 max-w-lg mx-auto">Cruzamento inteligente entre animais perdidos e achados.</p>
          </div>
          <div className="max-w-3xl mx-auto flex flex-col gap-5">
            {matches.slice(0, 3).length
              ? matches.slice(0, 3).map((m, i) => <MatchCard key={i} match={m} />)
              : <p className="text-center text-charcoal-soft py-8">Nenhum match ainda. Cadastre mais pets!</p>}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-20 text-center" style={{ background: 'var(--charcoal)', color: 'white' }}>
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-7xl mb-5">🐾</div>
          <h2 className="font-display font-black mb-4" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Pronto para começar?</h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            Cada cadastro é uma chance real de reencontro.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/perdi-meu-pet"    className="btn btn-terra btn-lg">😢 Perdi meu pet</Link>
            <Link to="/encontrei-um-pet" className="btn btn-sage btn-lg">🐾 Encontrei um pet</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
