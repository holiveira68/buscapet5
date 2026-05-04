import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  { color: '#C25B2A', emoji: '😢', label: 'PASSO 1', title: 'Percebeu que seu pet sumiu?',   desc: 'Acesse Perdi meu pet, preencha com foto, espécie, raça, cor, porte e local.', link: '/perdi-meu-pet', linkLabel: 'Cadastrar agora →', btnClass: 'btn-terra' },
  { color: '#4A7C59', emoji: '🐾', label: 'PASSO 2', title: 'Encontrou um animal perdido?',  desc: 'Acesse Encontrei um pet e descreva com máximo de detalhes.', link: '/encontrei-um-pet', linkLabel: 'Registrar →', btnClass: 'btn-sage' },
  { color: '#F5A623', emoji: '🤖', label: 'PASSO 3', title: 'Nossa IA entra em ação',        desc: 'Cruzamos espécie, raça, cor, porte, sexo, data e localização. Cada critério gera pontuação.', link: null },
  { color: '#22C55E', emoji: '✨', label: 'PASSO 4', title: 'Reencontro!',                    desc: 'Matches com score ≥ 40% são exibidos. Tutor e quem achou entram em contato direto.', link: null },
];

const SCORES = [
  { icon: '🐾', label: 'Espécie',     pts: 35, color: '#C25B2A', desc: 'Critério eliminatório' },
  { icon: '🧬', label: 'Raça',        pts: 25, color: '#E07B47', desc: 'Exata=25pts, parcial=15pts' },
  { icon: '📏', label: 'Porte',       pts: 20, color: '#F5A623', desc: 'Pequeno, médio ou grande' },
  { icon: '🎨', label: 'Cor',         pts: 15, color: '#6BA580', desc: 'Palavras em comum' },
  { icon: '📍', label: 'Localização', pts: 15, color: '#4A7C59', desc: 'Cidade ou bairro em comum' },
  { icon: '📅', label: 'Data',        pts: 10, color: '#2F5439', desc: '≤30 dias +10, ≤7 dias +5 bônus' },
  { icon: '⚥',  label: 'Sexo',        pts: 10, color: '#8B3A18', desc: 'Macho ou fêmea' },
];

const FAQS = [
  ['O serviço é realmente gratuito?',  'Sim, 100% gratuito. O Buscapet nunca cobrou e nunca cobrará pelo cadastro ou acesso.'],
  ['Por quanto tempo o cadastro fica ativo?', 'O cadastro fica ativo por 90 dias, renovável. Quando o pet for encontrado, marque como reencontrado.'],
  ['Como entro em contato com quem achou?', 'Cada cadastro exibe nome e telefone. Você contata diretamente por WhatsApp, ligação ou e-mail.'],
  ['O matching é automático?', 'Sim! Ao cadastrar, o sistema já varre todos os do tipo oposto e gera a lista de matches por pontuação.'],
  ['A foto é obrigatória?', 'Não é obrigatória, mas recomendada. Pets com foto têm 3× mais visualizações e chances de match.'],
  ['Quem é a Equipe Buscapet?', 'A equipe é formada por Helder Oliveira, Larissa Procopio, Laura Bevilaqua e Mayara Batista.'],
];

function ScoreBars() {
  const ref = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimate(true); }, { threshold: .3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col gap-5">
      {SCORES.map(s => (
        <div key={s.label} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${s.color}18` }}>{s.icon}</div>
          <div className="flex-1">
            <div className="flex justify-between mb-1.5">
              <div>
                <span className="font-bold text-charcoal">{s.label}</span>
                <span className="text-xs text-charcoal-soft ml-2">{s.desc}</span>
              </div>
              <span className="font-black text-sm" style={{ color: s.color }}>+{s.pts}</span>
            </div>
            <div className="score-track">
              <div className="score-fill" style={{ width: animate ? `${s.pts}%` : '0%', background: s.color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item border-b last:border-0`} style={{ borderColor: 'var(--cream-dark)' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <span className="font-bold text-charcoal">{q}</span>
        <svg className={`faq-arrow w-5 h-5 flex-shrink-0 ${open ? 'open' : ''}`} style={{ transform: open ? 'rotate(180deg)' : '', transition: 'transform .3s' }} fill="none" stroke="var(--terra)" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div style={{ maxHeight: open ? 400 : 0, overflow: 'hidden', transition: 'max-height .4s ease' }}>
        <p className="text-sm text-charcoal-soft leading-relaxed px-6 pb-5">{a}</p>
      </div>
    </div>
  );
}

export default function ComoFunciona() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(194,91,42,.08),transparent)' }}>
        <div className="paw-pattern absolute inset-0 opacity-[.04] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative animate-slide-up">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-5"
            style={{ background: 'rgba(194,91,42,.1)', color: 'var(--terra)' }}>📖 Guia completo</span>
          <h1 className="section-title mb-4" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
            Como o <span style={{ color: 'var(--terra)' }}>Buscapet</span> funciona?
          </h1>
          <p className="section-sub text-lg max-w-xl mx-auto mb-8">Do cadastro ao reencontro — cada etapa foi pensada para ser rápida e eficiente.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/perdi-meu-pet"    className="btn btn-terra btn-lg">😢 Perdi meu pet</Link>
            <Link to="/encontrei-um-pet" className="btn btn-sage btn-lg">🐾 Encontrei um pet</Link>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="section-title text-center mb-14">O caminho até o <span style={{ color: 'var(--terra)' }}>reencontro</span></h2>
          {STEPS.map((s, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white flex-shrink-0"
                  style={{ background: s.color, boxShadow: `0 6px 20px ${s.color}55` }}>{s.emoji}</div>
                {i < STEPS.length - 1 && <div className="flex-1 w-0.5 my-1.5" style={{ background: `linear-gradient(180deg,${s.color},${STEPS[i+1].color})`, minHeight: 40 }} />}
              </div>
              <div className={`${i < STEPS.length - 1 ? 'pb-10' : ''} flex-1`}>
                <span className="inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ background: `${s.color}18`, color: s.color }}>{s.label}</span>
                <h3 className="font-display font-black text-xl text-charcoal mb-2">{s.title}</h3>
                <p className="text-sm text-charcoal-soft leading-relaxed">{s.desc}</p>
                {s.link && <Link to={s.link} className={`btn ${s.btnClass} btn-sm mt-3 inline-flex`}>{s.linkLabel}</Link>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Score */}
      <section className="py-20" style={{ background: 'var(--cream)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="section-title">Como calculamos o <span style={{ color: 'var(--terra)' }}>match?</span></h2>
            <p className="section-sub mt-2">7 critérios · 100 pontos possíveis · Score ≥ 40 = match exibido</p>
          </div>
          <div className="bg-white rounded-2xl border p-8" style={{ borderColor: 'var(--cream-dark)' }}>
            <ScoreBars />
            <div className="tip-box mt-6">
              <span className="text-xl flex-shrink-0">💡</span>
              <div>Pets com foto têm <strong>3× mais visualizações</strong>. Raça e localização precisas aumentam a precisão do match.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="section-title text-center mb-10">Perguntas <span style={{ color: 'var(--terra)' }}>frequentes</span></h2>
          <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--cream)', borderColor: 'var(--cream-dark)' }}>
            {FAQS.map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
