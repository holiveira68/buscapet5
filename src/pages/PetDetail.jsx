import { useParams, useNavigate } from 'react-router-dom';
import { usePets } from '../context/PetsContext';
import { SPECIES_EMOJI, formatDate } from '../utils/constants';

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pets, matches } = usePets();

  const pet = pets.find(p => p.id === parseInt(id));
  if (!pet) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="font-display font-black text-2xl mb-2">Pet não encontrado</h2>
        <button onClick={() => navigate(-1)} className="btn btn-terra mt-4">Voltar</button>
      </div>
    </div>
  );

  const emoji    = SPECIES_EMOJI[pet.species] || '🐾';
  const isLost   = pet.type === 'lost';
  const petMatches = matches.filter(m => m.lost.id === pet.id || m.found.id === pet.id);
  const waLink   = `https://wa.me/55${(pet.owner_phone || '').replace(/\D/g, '')}`;

  const InfoBlock = ({ label, value }) => value ? (
    <div className="rounded-xl p-3" style={{ background: 'var(--cream)' }}>
      <div className="text-xs font-bold uppercase tracking-wide text-charcoal-soft">{label}</div>
      <div className="font-semibold text-charcoal capitalize mt-0.5">{value}</div>
    </div>
  ) : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-6 pl-1">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-md" style={{ borderColor: 'var(--cream-dark)' }}>
        {pet.photo
          ? <img src={pet.photo} className="w-full object-cover" style={{ height: 300 }} alt={pet.name} />
          : (
            <div className="w-full flex items-center justify-center" style={{
              height: 260, fontSize: '7rem',
              background: isLost
                ? 'linear-gradient(135deg,rgba(194,91,42,.15),rgba(194,91,42,.04))'
                : 'linear-gradient(135deg,rgba(74,124,89,.15),rgba(74,124,89,.04))',
            }}>{emoji}</div>
          )}

        <div className="p-8">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="font-display font-black text-3xl text-charcoal">
              {pet.name || (isLost ? 'Animal Perdido' : 'Animal Achado')}
            </h1>
            <span className={`badge badge-${pet.type} flex-shrink-0 mt-1 text-sm`}>
              {isLost ? '😢 Perdido' : '🐾 Achado'}
            </span>
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <InfoBlock label="🐾 Espécie"   value={pet.species} />
            <InfoBlock label="🎨 Cor"        value={pet.color} />
            <InfoBlock label="📏 Porte"      value={pet.size} />
            <InfoBlock label="🧬 Raça"       value={pet.breed} />
            <InfoBlock label="⚥ Sexo"        value={pet.gender} />
            <InfoBlock label="📅 Data"       value={formatDate(pet.date)} />
          </div>

          {/* Location */}
          <div className="rounded-xl p-4 mb-4 flex gap-3 items-start" style={{ background: 'var(--cream)' }}>
            <span className="text-xl">📍</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-charcoal-soft">Localização</div>
              <div className="font-semibold text-charcoal mt-0.5">{pet.location || 'Não informada'}</div>
            </div>
          </div>

          {/* Description */}
          {pet.description && (
            <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--cream)' }}>
              <div className="text-xs font-bold uppercase tracking-wide text-charcoal-soft mb-2">Descrição</div>
              <p className="text-sm text-charcoal leading-relaxed">{pet.description}</p>
            </div>
          )}

          {/* Contact */}
          <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--cream)' }}>
            <div className="text-xs font-bold uppercase tracking-wide text-charcoal-soft mb-3">
              {isLost ? 'Tutor' : 'Contato de quem achou'}
            </div>
            <div className="font-bold text-charcoal">{pet.owner_name}</div>
            <div className="text-sm text-charcoal-soft mt-0.5">{pet.owner_email}</div>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href={`tel:${pet.owner_phone}`} className="btn btn-ghost flex-1 min-w-[120px] justify-center" style={{ border: '1.5px solid var(--cream-dark)', borderRadius: 12 }}>
                📞 Ligar
              </a>
              <a href={waLink} target="_blank" rel="noreferrer" className="btn flex-1 min-w-[120px] justify-center text-white no-underline" style={{ background: '#25D366', borderRadius: 12, border: 'none' }}>
                💬 WhatsApp
              </a>
              <a href={`mailto:${pet.owner_email}`} className="btn btn-terra flex-1 min-w-[120px] justify-center" style={{ borderRadius: 12 }}>
                ✉️ E-mail
              </a>
            </div>
          </div>

          {/* Match alert */}
          {petMatches.length > 0 && (
            <div className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
              style={{ background: 'rgba(245,166,35,.1)', border: '1px solid rgba(245,166,35,.3)' }}>
              <div>
                <div className="font-bold" style={{ color: '#a05c00' }}>✨ {petMatches.length} match(es) detectado(s)!</div>
                <div className="text-sm text-charcoal-soft mt-0.5">Possíveis reencontros encontrados</div>
              </div>
              <button onClick={() => navigate('/')} className="btn btn-sm text-white" style={{ background: 'var(--amber)', borderRadius: 10, border: 'none' }}>
                Ver matches
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
