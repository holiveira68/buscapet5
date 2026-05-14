import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePets } from '../context/PetsContext';
import { SPECIES_EMOJI, formatDate } from '../utils/constants';

const PAGE_SIZE_OPTIONS = [6, 12, 24];

// ── Score badge ────────────────────────────────────────
function ScoreBadge({ score }) {
  const { bg, color, label } =
    score >= 75 ? { bg: 'rgba(34,197,94,.12)',  color: '#16A34A', label: 'Alta'   } :
    score >= 55 ? { bg: 'rgba(245,166,35,.15)', color: '#a05c00', label: 'Média'  } :
                  { bg: 'rgba(249,115,22,.12)', color: '#C2410C', label: 'Baixa'     };
  return (
    <span className="inline-flex items-center gap-1 rounded-full font-black px-3 py-1 text-xs"
      style={{ background: bg, color }}>
      {score}% — {label}
    </span>
  );
}

// ── Match card ─────────────────────────────────────────
function MatchRow({ match, onConfirm, onDismiss }) {
  const { lost, found, score } = match;
  const eL = SPECIES_EMOJI[lost.species]  || '🐾';
  const eF = SPECIES_EMOJI[found.species] || '🐾';
  const barColor =
    score >= 75 ? '#22C55E' :
    score >= 55 ? '#F5A623' : '#F97316';

  return (
    <div className="bg-white rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ borderColor: 'var(--cream-dark)' }}>

      {/* Score bar no topo */}
      <div className="h-1" style={{ background: 'var(--cream-dark)' }}>
        <div className="h-full rounded-r transition-all duration-700"
          style={{ width: `${score}%`, background: barColor }} />
      </div>

      <div className="p-5">
        {/* Header: score + ações */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${barColor},${barColor}bb)`, boxShadow: `0 4px 12px ${barColor}55` }}>
              {score}%
            </div>
            <div>
              <ScoreBadge score={score} />
              <div className="text-xs text-charcoal-soft mt-1">Possível reencontro detectado automaticamente</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onConfirm(match)}
              className="btn btn-sm"
              style={{ background: 'rgba(34,197,94,.1)', color: '#16A34A', border: '1px solid rgba(34,197,94,.3)', borderRadius: 10 }}>
              ✅ Confirmar
            </button>
            <button onClick={() => onDismiss(match)}
              className="btn btn-sm"
              style={{ background: 'rgba(239,68,68,.07)', color: '#DC2626', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10 }}>
              ✕ Descartar
            </button>
          </div>
        </div>

        {/* Grid: perdido × achado */}
        <div className="grid grid-cols-2 gap-3">
          {/* Perdido */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(194,91,42,.05)', border: '1px solid rgba(194,91,42,.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-lost" style={{ fontSize: '.65rem' }}>Perdido</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              {lost.photo
                ? <img src={lost.photo} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
                : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'rgba(194,91,42,.1)' }}>{eL}</div>}
              <div className="min-w-0">
                <div className="font-bold text-sm text-charcoal truncate">{lost.name || 'Animal Perdido'}</div>
                <div className="text-xs text-charcoal-soft">{[lost.breed, lost.color].filter(Boolean).join(' · ')}</div>
              </div>
            </div>
            <div className="text-xs text-charcoal-soft space-y-0.5">
              <div>{lost.size || '—'}</div>
              {/* Localização colocar novo icone antes de {lost.location} */}
              <div>{lost.location || '—'}</div>
              {lost.date && <div>{formatDate(lost.date)}</div>}
            </div>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(194,91,42,.15)' }}>
              <div className="text-xs font-semibold text-charcoal">{lost.owner_name}</div>
              <div className="flex gap-2 mt-2">
                <a href={`tel:${lost.owner_phone}`}
                  className="flex-1 text-center rounded-lg py-1.5 text-xs font-semibold transition-colors no-underline"
                  style={{ background: 'rgba(194,91,42,.1)', color: 'var(--terra)' }}>
                  Ligar
                </a>
                <a href={`https://wa.me/55${(lost.owner_phone||'').replace(/\D/g,'')}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 text-center rounded-lg py-1.5 text-xs font-semibold text-white no-underline"
                  style={{ background: '#25D366' }}>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Achado */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(74,124,89,.05)', border: '1px solid rgba(74,124,89,.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-found" style={{ fontSize: '.65rem' }}>🐾 Achado</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              {found.photo
                ? <img src={found.photo} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
                : <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'rgba(74,124,89,.1)' }}>{eF}</div>}
              <div className="min-w-0">
                <div className="font-bold text-sm text-charcoal truncate">{found.name || 'Animal Achado'}</div>
                <div className="text-xs text-charcoal-soft">{[found.breed, found.color].filter(Boolean).join(' · ')}</div>
              </div>
            </div>
            <div className="text-xs text-charcoal-soft space-y-0.5">
              <div>{found.size || '—'}</div>
              {/* Localização colocar novo icone antes de {found.location} */}
              <div>{found.location || '—'}</div>
              {found.date && <div>{formatDate(found.date)}</div>}
            </div>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(74,124,89,.15)' }}>
              <div className="text-xs font-semibold text-charcoal">{found.owner_name}</div>
              <div className="flex gap-2 mt-2">
                <a href={`tel:${found.owner_phone}`}
                  className="flex-1 text-center rounded-lg py-1.5 text-xs font-semibold transition-colors no-underline"
                  style={{ background: 'rgba(74,124,89,.1)', color: 'var(--sage)' }}>
                  Ligar
                </a>
                <a href={`https://wa.me/55${(found.owner_phone||'').replace(/\D/g,'')}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 text-center rounded-lg py-1.5 text-xs font-semibold text-white no-underline"
                  style={{ background: '#25D366' }}>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Links de detalhe */}
        <div className="flex gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--cream-dark)' }}>
          <Link to={`/pet/${lost.id}`}  className="text-xs font-semibold no-underline" style={{ color: 'var(--terra)' }}>Ver cadastro do perdido →</Link>
          <span className="text-charcoal-soft text-xs">·</span>
          <Link to={`/pet/${found.id}`} className="text-xs font-semibold no-underline" style={{ color: 'var(--sage)' }}>Ver cadastro do achado →</Link>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];

  // Sempre mostra: primeira, última, atual e vizinhas
  const rangeStart = Math.max(2, current - 1);
  const rangeEnd   = Math.min(total - 1, current + 1);

  pages.push(1);
  if (rangeStart > 2) pages.push('...');
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < total - 1) pages.push('...');
  if (total > 1) pages.push(total);

  return (
    <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="btn btn-ghost btn-sm rounded-xl disabled:opacity-40"
        style={{ minWidth: 36 }}>
        ←
      </button>
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className="px-2 text-charcoal-soft text-sm">…</span>
          : <button
              key={p}
              onClick={() => onChange(p)}
              className="rounded-xl font-semibold text-sm transition-all duration-150"
              style={{
                minWidth: 36, height: 36,
                background: p === current ? 'var(--amber)' : 'transparent',
                color:      p === current ? 'white'        : 'var(--charcoal-soft)',
                border:     p === current ? 'none'         : '1px solid var(--cream-dark)',
                fontWeight: p === current ? 700             : 500,
              }}>
              {p}
            </button>
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="btn btn-ghost btn-sm rounded-xl disabled:opacity-40"
        style={{ minWidth: 36 }}>
        →
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────
export default function Matches() {
  const { matches, pets } = usePets();

  const [minScore,  setMinScore]  = useState(40);
  const [species,   setSpecies]   = useState('');
  const [scoreSort, setScoreSort] = useState('desc');
  const [page,      setPage]      = useState(1);
  const [pageSize,  setPageSize]  = useState(12);
  const [dismissed, setDismissed] = useState([]);
  const [confirmed, setConfirmed] = useState([]);

  // Filtra matches ativos (não descartados nem confirmados)
  const activeMatches = useMemo(() =>
    matches
      .filter(m => !dismissed.some(d => d.lost.id === m.lost.id && d.found.id === m.found.id))
      .filter(m => !confirmed.some(c => c.lost.id === m.lost.id && c.found.id === m.found.id))
      .filter(m => m.score >= minScore)
      .filter(m => !species || m.lost.species === species)
      .sort((a, b) => scoreSort === 'desc' ? b.score - a.score : a.score - b.score),
    [matches, dismissed, confirmed, minScore, species, scoreSort]
  );

  const totalPages = Math.max(1, Math.ceil(activeMatches.length / pageSize));
  const paginated  = activeMatches.slice((page - 1) * pageSize, page * pageSize);

  // Volta para página 1 quando filtros mudam
  const handleFilter = (fn) => { fn(); setPage(1); };

  function handleConfirm(match) {
    if (!confirm(`Confirmar reencontro de "${match.lost.name || 'animal perdido'}"?`)) return;
    setConfirmed(prev => [...prev, match]);
  }

  function handleDismiss(match) {
    setDismissed(prev => [...prev, match]);
  }

  // Stats
  const highCount = matches.filter(m => m.score >= 75).length;
  const midCount  = matches.filter(m => m.score >= 55 && m.score < 75).length;
  const lowCount  = matches.filter(m => m.score < 55).length;

  return (
    <div>
      {/* ── Banner ──────────────────────────────────────── */}
      <section className="py-14 border-b"
        style={{ background: 'linear-gradient(135deg,rgba(245,166,35,.12),transparent)', borderColor: 'var(--cream-dark)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full animate-match" style={{ background: 'var(--amber)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a05c00' }}>
                  Cruzamento automático de animais
                </span>
              </div>
              <h1 className="section-title" style={{ fontSize: 'clamp(2.2rem,4vw,3.5rem)' }}>
                Matches <span style={{ color: 'var(--amber)' }}>Automáticos ✨</span>
              </h1>
              <p className="section-sub mt-2 max-w-xl">
                Pares de animais perdidos × achados com maior chance de ser o mesmo pet, ordenados por score de similaridade.
              </p>
            </div>

            {/* Stats cards */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Total de matches', value: matches.length,             color: 'var(--amber)',   bg: 'rgba(245,166,35,.1)' },
                { label: 'Alta (≥75%)',       value: highCount,                  color: '#16A34A',         bg: 'rgba(34,197,94,.08)' },
                { label: 'Confirmados',       value: confirmed.length,           color: 'var(--sage)',    bg: 'rgba(74,124,89,.08)' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-xl border px-5 py-3 text-center shadow-sm min-w-[100px]"
                  style={{ borderColor: 'var(--cream-dark)' }}>
                  <div className="font-display font-black text-3xl" style={{ color }}>{value}</div>
                  <div className="text-xs text-charcoal-soft font-semibold mt-0.5 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição de scores */}
          {matches.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border p-4 flex flex-wrap items-center gap-6"
              style={{ borderColor: 'var(--cream-dark)' }}>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-soft">Distribuição:</span>
              {[
                { label: `Alta ≥75%`,  count: highCount, color: '#22C55E' },
                { label: `Média ≥55%`, count: midCount,  color: '#F5A623' },
                { label: `Baixa <55%`, count: lowCount,  color: '#F97316' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-sm font-semibold text-charcoal">{count}</span>
                  <span className="text-xs text-charcoal-soft">{label}</span>
                </div>
              ))}
              <div className="flex-1 min-w-[120px]">
                <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--cream-dark)' }}>
                  {matches.length > 0 && <>
                    <div style={{ width: `${highCount/matches.length*100}%`, background: '#22C55E', height: '100%' }} />
                    <div style={{ width: `${midCount/matches.length*100}%`,  background: '#F5A623', height: '100%' }} />
                    <div style={{ width: `${lowCount/matches.length*100}%`,  background: '#F97316', height: '100%' }} />
                  </>}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Filtros ─────────────────────────────────────── */}
      <section className="bg-white border-b py-4 sticky top-[68px] z-40 shadow-sm"
        style={{ borderColor: 'var(--cream-dark)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 items-center">

          {/* Score mínimo */}
          <div className="flex items-center gap-2 bg-cream rounded-xl px-3 py-2 border" style={{ borderColor: 'var(--cream-dark)' }}>
            <span className="text-xs font-bold text-charcoal-soft whitespace-nowrap">Score mín.:</span>
            <input
              type="range" min={40} max={90} step={5} value={minScore}
              onChange={e => handleFilter(() => setMinScore(Number(e.target.value)))}
              className="w-24 accent-amber-400" />
            <span className="text-xs font-black w-8" style={{ color: 'var(--amber)' }}>{minScore}%</span>
          </div>

          {/* Espécie */}
          <select value={species} onChange={e => handleFilter(() => setSpecies(e.target.value))}
            className="rounded-xl px-3 py-2.5 text-sm border outline-none cursor-pointer"
            style={{ borderColor: 'var(--cream-dark)', background: 'var(--cream)' }}>
            <option value="">Espécie</option>
            <option value="cachorro">🐕 Cachorro</option>
            <option value="gato">🐈 Gato</option>
            <option value="pássaro">🦜 Pássaro</option>
            <option value="outro">Outro</option>
          </select>

          {/* Ordenação */}
          <select value={scoreSort} onChange={e => handleFilter(() => setScoreSort(e.target.value))}
            className="rounded-xl px-3 py-2.5 text-sm border outline-none cursor-pointer"
            style={{ borderColor: 'var(--cream-dark)', background: 'var(--cream)' }}>
            <option value="desc">Maior score primeiro</option>
            <option value="asc">Menor score primeiro</option>
          </select>

          {/* Page size */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-charcoal-soft">Por página:</span>
            <div className="flex gap-1">
              {PAGE_SIZE_OPTIONS.map(n => (
                <button key={n} onClick={() => handleFilter(() => setPageSize(n))}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold transition-all"
                  style={{
                    background: pageSize === n ? 'var(--amber)' : 'var(--cream)',
                    color:      pageSize === n ? 'white' : 'var(--charcoal-soft)',
                    border:     `1px solid ${pageSize === n ? 'var(--amber)' : 'var(--cream-dark)'}`,
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Limpar */}
          <button onClick={() => { setMinScore(40); setSpecies(''); setScoreSort('desc'); setPage(1); }}
            className="btn btn-ghost btn-sm ml-auto">
            ✕ Limpar
          </button>

          {/* Resultado count */}
          <span className="text-xs text-charcoal-soft">
            {activeMatches.length} resultado{activeMatches.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* ── Lista de matches ─────────────────────────────── */}
      <section className="py-10 min-h-96">
        <div className="max-w-7xl mx-auto px-6">
          {activeMatches.length === 0 ? (
            <div className="text-center py-16">
              {/* Estava uma lupa na linha abaixo entre mb-4">🔍</div>" */}
              <div className="text-6xl mb-4"></div>
              <h3 className="font-display font-black text-2xl mb-2">Nenhum match encontrado</h3>
              <p className="text-charcoal-soft mb-6">
                {matches.length === 0
                  ? 'Ainda não há cadastros suficientes. Cadastre mais pets!'
                  : 'Tente reduzir o score mínimo ou mudar os filtros.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/perdi-meu-pet"    className="btn btn-terra btn-sm">Perdi meu pet</Link>
                <Link to="/encontrei-um-pet" className="btn btn-sage btn-sm">Encontrei um pet</Link>
              </div>
            </div>
          ) : (
            <>
              {/* Info da página */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <span className="text-sm text-charcoal-soft">
                  Mostrando <strong className="text-charcoal">{(page-1)*pageSize+1}–{Math.min(page*pageSize, activeMatches.length)}</strong> de <strong className="text-charcoal">{activeMatches.length}</strong> matches
                </span>
                <span className="text-xs text-charcoal-soft">
                  Página {page} de {totalPages}
                </span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {paginated.map((m, i) => (
                  <MatchRow
                    key={`${m.lost.id}-${m.found.id}`}
                    match={m}
                    onConfirm={handleConfirm}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>

              {/* Paginação */}
              <Pagination current={page} total={totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </>
          )}
        </div>
      </section>

      {/* Confirmados */}
      {confirmed.length > 0 && (
        <section className="py-10 border-t" style={{ background: 'rgba(34,197,94,.04)', borderColor: 'rgba(34,197,94,.2)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display font-black text-xl text-charcoal mb-4">
              Reencontros confirmados ({confirmed.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {confirmed.map((m, i) => (
                <div key={i} className="bg-white rounded-xl border p-4 flex items-center gap-3"
                  style={{ borderColor: 'rgba(34,197,94,.25)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    // Estava um icone de check na linha abaixo antes do </div>
                    style={{ background: 'rgba(34,197,94,.1)' }}></div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-charcoal truncate">
                      {/* Estava um icone de match na linha abaixo */}
                      {m.lost.name || 'Animal'} × {m.found.owner_name}
                    </div>
                    <div className="text-xs text-charcoal-soft">Score: {m.score}% — Reencontrado!</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-14 text-center border-t" style={{ borderColor: 'var(--cream-dark)' }}>
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display font-black text-charcoal text-2xl mb-2">Não encontrou o seu?</h2>
          <p className="text-charcoal-soft text-sm mb-5">Cadastre o seu pet para que ele apareça nos próximos matches.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/perdi-meu-pet"    className="btn btn-terra">Perdi meu pet</Link>
            <Link to="/encontrei-um-pet" className="btn btn-sage">Encontrei um pet</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
