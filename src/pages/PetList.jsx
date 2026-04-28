import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePets } from '../context/PetsContext';
import { PetCard } from '../components/PetCard';

export default function PetList({ type }) {
  const { pets } = usePets();
  const isLost = type === 'lost';
  const [search,  setSearch]  = useState('');
  const [species, setSpecies] = useState('');
  const [size,    setSize]    = useState('');
  const [sort,    setSort]    = useState('newest');

  const filtered = pets
    .filter(p => p.type === type)
    .filter(p => !species || p.species === species)
    .filter(p => !size    || p.size    === size)
    .filter(p => !search  || [p.name, p.breed, p.color, p.location, p.description]
      .some(f => (f || '').toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      return (a.name || 'z').localeCompare(b.name || 'z');
    });

  const total = pets.filter(p => p.type === type).length;
  const color = isLost ? 'var(--terra)' : 'var(--sage)';
  const colorRgb = isLost ? '194,91,42' : '74,124,89';

  return (
    <div>
      {/* Banner */}
      <section className="py-14 border-b" style={{ background: `linear-gradient(135deg,rgba(${colorRgb},.1),transparent)`, borderColor: 'var(--cream-dark)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse-slow" style={{ background: color }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {isLost ? 'Animais que precisam de ajuda' : 'Alguém encontrou e quer ajudar'}
              </span>
            </div>
            <h1 className="section-title" style={{ fontSize: 'clamp(2.2rem,4vw,3.5rem)' }}>
              Animais <span style={{ color }}>{isLost ? 'Perdidos 😢' : 'Achados 🐾'}</span>
            </h1>
            <p className="section-sub mt-2">
              {isLost ? 'Você reconhece algum? Cada hora conta!' : 'Alguém encontrou esses pets e espera pelo tutor.'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="bg-white rounded-xl border px-6 py-4 text-center shadow-sm" style={{ borderColor: 'var(--cream-dark)' }}>
              <div className="font-display font-black text-4xl" style={{ color }}>{total}</div>
              <div className="text-xs text-charcoal-soft font-semibold uppercase tracking-wide mt-1">cadastros ativos</div>
            </div>
            <Link to={isLost ? '/perdi-meu-pet' : '/encontrei-um-pet'} className={`btn btn-sm ${isLost ? 'btn-terra' : 'btn-sage'}`}>
              + {isLost ? 'Cadastrar perdido' : 'Cadastrar achado'}
            </Link>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-white border-b py-4 sticky top-[68px] z-40 shadow-sm" style={{ borderColor: 'var(--cream-dark)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Raça, cor, cidade, nome…"
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm border outline-none transition-all"
              style={{ borderColor: 'var(--cream-dark)', background: 'var(--cream)' }}
            />
          </div>
          {[
            { id: 'species', val: species, set: setSpecies, opts: [['', 'Espécie'], ['cachorro', '🐕 Cachorro'], ['gato', '🐈 Gato'], ['pássaro', '🦜 Pássaro'], ['outro', 'Outro']] },
            { id: 'size',    val: size,    set: setSize,    opts: [['', 'Porte'], ['pequeno', 'Pequeno'], ['médio', 'Médio'], ['grande', 'Grande']] },
            { id: 'sort',    val: sort,    set: setSort,    opts: [['newest', 'Mais recentes'], ['oldest', 'Mais antigos'], ['az', 'A–Z']] },
          ].map(({ id, val, set, opts }) => (
            <select key={id} value={val} onChange={e => set(e.target.value)}
              className="rounded-xl px-3 py-2.5 text-sm border outline-none cursor-pointer"
              style={{ borderColor: 'var(--cream-dark)', background: 'var(--cream)' }}>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <button onClick={() => { setSearch(''); setSpecies(''); setSize(''); setSort('newest'); }}
            className="btn btn-ghost btn-sm">✕ Limpar</button>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 min-h-96">
        <div className="max-w-7xl mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display font-black text-2xl mb-2">Nenhum resultado</h3>
              <p className="text-charcoal-soft mb-6">Tente ajustar os filtros de busca.</p>
              <Link to={isLost ? '/perdi-meu-pet' : '/encontrei-um-pet'} className={`btn btn-sm ${isLost ? 'btn-terra' : 'btn-sage'}`}>
                + {isLost ? 'Cadastrar perdido' : 'Cadastrar achado'}
              </Link>
            </div>
          ) : (
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
              {filtered.map(p => <PetCard key={p.id} pet={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center border-t" style={{ background: `rgba(${colorRgb},.05)`, borderColor: `rgba(${colorRgb},.15)` }}>
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display font-black text-charcoal text-3xl mb-3">
            {isLost ? 'Perdeu seu pet?' : 'Encontrou um animal?'}
          </h2>
          <p className="text-charcoal-soft text-sm mb-6">
            {isLost ? 'Cadastre e nossa IA cruza automaticamente com animais achados!' : 'Registre e ajude esse pet a voltar para casa!'}
          </p>
          <Link to={isLost ? '/perdi-meu-pet' : '/encontrei-um-pet'} className={`btn btn-lg ${isLost ? 'btn-terra' : 'btn-sage'}`}>
            {isLost ? '😢 Cadastrar animal perdido' : '🐾 Cadastrar animal achado'}
          </Link>
        </div>
      </section>
    </div>
  );
}
