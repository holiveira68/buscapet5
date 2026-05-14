// ═══════════════════════════════════════════════════════
// components/PetCard.jsx
// ═══════════════════════════════════════════════════════
import { Link } from 'react-router-dom';
import { SPECIES_EMOJI, formatDate, daysAgo } from '../utils/constants';

export function PetCard({ pet }) {
  const emoji  = SPECIES_EMOJI[pet.species] || '🐾';
  const days   = daysAgo(pet.date);
  const isLost = pet.type === 'lost';
  const urgent = isLost && days >= 0 && days <= 7;
  const isNew  = !isLost && days >= 0 && days <= 3;

  return (
    <Link to={`/pet/${pet.id}`} className="pet-card block no-underline">
      {pet.photo
        ? <img src={pet.photo} className="pet-card-img" alt={pet.name || 'Animal'} />
        : (
          <div
            className="pet-card-emoji"
            style={{ background: isLost
              ? 'linear-gradient(135deg,rgba(194,91,42,.15),rgba(194,91,42,.04))'
              : 'linear-gradient(135deg,rgba(74,124,89,.15),rgba(74,124,89,.04))' }}
          >{emoji}</div>
        )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-black text-charcoal leading-tight" style={{ fontSize: '1.05rem' }}>
            {pet.name || (isLost ? 'Animal Perdido' : 'Animal Achado')}
          </h3>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`badge badge-${pet.type}`}>{isLost ? 'Perdido' : '🐾 Achado'}</span>
            {urgent && <span className="badge badge-urgent" style={{ fontSize: '.62rem' }}>Urgente</span>}
            {isNew  && <span className="badge badge-new"    style={{ fontSize: '.62rem' }}>Novo</span>}
          </div>
        </div>
        <p className="text-xs text-charcoal-soft">{[pet.breed, pet.color, pet.size].filter(Boolean).join(' · ')}</p>
        {/* icone de localização antes do {pet.location}   */}
        <p className="text-xs text-charcoal-soft mt-1">{pet.location || '—'}</p>
        {pet.date && <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{formatDate(pet.date)}</p>}
        {pet.matched && (
          <div className="mt-2 text-xs font-bold rounded-lg px-2 py-1" style={{ color: '#a05c00', background: 'rgba(245,166,35,.12)' }}>
            Possível match!
          </div>
        )}
      </div>
    </Link>
  );
}


// ═══════════════════════════════════════════════════════
// components/MatchCard.jsx
// ═══════════════════════════════════════════════════════
export function MatchCard({ match }) {
  const { lost, found, score } = match;
  const sc  = score >= 75 ? '#22C55E' : score >= 55 ? '#F5A623' : '#F97316';
  const eL  = SPECIES_EMOJI[lost.species]  || '🐾';
  const eF  = SPECIES_EMOJI[found.species] || '🐾';
  const lbl = score >= 75 ? 'Alta' : score >= 55 ? 'Média' : 'Baixa';

  const waPhone = (phone) =>
    `https://wa.me/55${(phone || '').replace(/\D/g, '')}`;

  const PetSide = ({ pet, emoji, type }) => (
    <div
      className="rounded-xl p-4"
      style={{
        background: type === 'lost' ? 'rgba(194,91,42,.06)' : 'rgba(74,124,89,.06)',
        border: `1px solid ${type === 'lost' ? 'rgba(194,91,42,.15)' : 'rgba(74,124,89,.15)'}`,
      }}
    >
      <div className="text-3xl mb-2">
        {pet.photo
          ? <img src={pet.photo} className="w-12 h-12 rounded-xl object-cover" alt="" />
          : emoji}
      </div>
      <div className="font-bold text-sm text-charcoal">{pet.name || (type === 'lost' ? 'Animal Perdido' : 'Animal Achado')}</div>
      <div className="text-xs text-charcoal-soft mt-1">{[pet.breed, pet.color].filter(Boolean).join(' · ')}</div>
      {/* icone de localização antes do {pet.location}   */}
      <div className="text-xs text-charcoal-soft">{pet.location || '—'}</div>
      <span className={`badge badge-${type} mt-2`} style={{ fontSize: '.68rem', display: 'inline-flex' }}>
        {type === 'lost' ? 'Perdido' : 'Achado'}
      </span>
      <div className="text-xs font-semibold text-charcoal mt-2">
        {type === 'lost' ? 'Tutor:' : 'Contato:'} {pet.owner_name}
      </div>
      <a
        href={waPhone(pet.owner_phone)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold text-white no-underline"
        style={{ background: '#25D366' }}
      >WhatsApp</a>
    </div>
  );

  return (
    <div className="match-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="match-score-circle" style={{ background: `linear-gradient(135deg,${sc},${sc}bb)` }}>
          {score}%
        </div>
        <div>
          <div className="font-bold text-charcoal">Compatibilidade: {lbl}</div>
          <div className="text-xs text-charcoal-soft">Possível reencontro detectado</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <PetSide pet={lost}  emoji={eL} type="lost"  />
        <PetSide pet={found} emoji={eF} type="found" />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// components/AuthGuard.jsx — Protege rotas autenticadas
// ═══════════════════════════════════════════════════════
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthGuard({ children }) {
  const { isLogged } = useAuth();
  const location = useLocation();

  if (!isLogged) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
}


// ═══════════════════════════════════════════════════════
// components/Spinner.jsx
// ═══════════════════════════════════════════════════════
export function Spinner({ size = 'md' }) {
  const cls = size === 'sm'
    ? 'w-5 h-5 border-2 border-white/30 border-t-white'
    : 'w-10 h-10 border-[3px] border-cream-dark border-t-terra';
  return <div className={`${cls} rounded-full animate-spin`} />;
}
