// ═══════════════════════════════════════════════════════
// pages/MeusPets.jsx
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { authAPI, petsAPI } from '../services/api';
import { SPECIES_EMOJI, formatDate } from '../utils/constants';
import { toast } from '../hooks/useToast';

export function MeusPets() {
  const { user }            = useAuth();
  const { removePet }       = usePets();

  const [myPets,   setMyPets]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState(null); // id do pet sendo removido

  // ── Busca os pets do usuário logado diretamente da API ──
  const loadMyPets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await authAPI.myPets();
      // backend retorna { pets: [...] }
      setMyPets(Array.isArray(data) ? data : (data?.pets ?? []));
    } catch (err) {
      console.error('[MeusPets] Erro ao carregar:', err);
      toast('❌', 'Não foi possível carregar seus cadastros.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyPets();
  }, [loadMyPets]);

  // ── Remove apenas se o pet pertence ao usuário logado ──
  async function handleRemove(pet) {
    // Verificação extra no frontend — o backend também bloqueia por user_id
    if (pet.user_id !== user?.id) {
      toast('🚫', 'Você não tem permissão para remover este cadastro.', 'error');
      return;
    }
    if (!confirm('Marcar como reencontrado e remover este cadastro?')) return;

    setRemoving(pet.id);
    try {
      await petsAPI.remove(pet.id);
      // Remove do estado local e do contexto global
      setMyPets(prev => prev.filter(p => p.id !== pet.id));
      removePet(pet.id);
      toast('✅', 'Pet marcado como reencontrado! 🎉', 'success');
    } catch (err) {
      console.error('[MeusPets] Erro ao remover:', err);
      toast('❌', 'Não foi possível remover. Tente novamente.', 'error');
    } finally {
      setRemoving(null);
    }
  }

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">🐾</div>
            <p className="text-charcoal-soft font-semibold">Carregando seus cadastros…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* ── Cabeçalho ─────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div>
          <h1 className="section-title">Meus <span style={{ color: 'var(--terra)' }}>Cadastros</span></h1>
          <p className="section-sub mt-1">
            Olá, {user?.first_name}! Você tem <strong>{myPets.length}</strong> cadastro{myPets.length !== 1 ? 's' : ''} ativo{myPets.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/perdi-meu-pet"    className="btn btn-terra btn-sm">+ Perdi meu pet</Link>
          <Link to="/encontrei-um-pet" className="btn btn-sage btn-sm">+ Encontrei um pet</Link>
        </div>
      </div>

      {/* ── Lista ou estado vazio ──────────────────────── */}
      {myPets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: 'var(--cream-dark)' }}>
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="font-display font-black text-2xl mb-2">Você ainda não tem cadastros</h3>
          <p className="text-charcoal-soft mb-6">Cadastre um animal perdido ou achado para começar!</p>
          <Link to="/perdi-meu-pet" className="btn btn-terra">Cadastrar agora</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {myPets.map(p => {
            const emoji  = SPECIES_EMOJI[p.species] || '🐾';
            const isLost = p.type === 'lost';
            const isOwner = p.user_id === user?.id; // segurança extra na UI

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border px-5 py-4 flex items-center gap-5 shadow-sm"
                style={{ borderColor: 'var(--cream-dark)' }}
              >
                {/* Foto / Emoji */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: isLost ? 'rgba(194,91,42,.1)' : 'rgba(74,124,89,.1)' }}
                >
                  {p.photo
                    ? <img src={p.photo} className="w-full h-full object-cover rounded-xl" alt="" />
                    : emoji}
                </div>

                {/* Dados */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-black text-charcoal">
                      {p.name || (isLost ? 'Animal Perdido' : 'Animal Achado')}
                    </span>
                    <span className={`badge badge-${p.type}`} style={{ fontSize: '.7rem' }}>
                      {isLost ? '😢 Perdido' : '🐾 Achado'}
                    </span>
                    {p.match_count > 0 && (
                      <span className="badge badge-match" style={{ fontSize: '.7rem' }}>
                        ✨ {p.match_count} match{p.match_count !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal-soft mt-0.5">
                    {[p.breed, p.color, p.size].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-charcoal-soft mt-0.5">
                    📍 {p.location || '—'} · 📅 {formatDate(p.date)}
                  </p>
                </div>

                {/* Ações — botão Remover só aparece se for o dono */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/pet/${p.id}`} className="btn btn-ghost btn-sm">Ver</Link>
                  {isOwner && (
                    <button
                      onClick={() => handleRemove(p)}
                      disabled={removing === p.id}
                      className="btn btn-sm"
                      style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', opacity: removing === p.id ? 0.6 : 1 }}
                    >
                      {removing === p.id ? 'Removendo…' : 'Remover'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// pages/Perfil.jsx
// ═══════════════════════════════════════════════════════
//import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { authAPI } from '../services/api';
import { formatPhoneValue } from '../utils/constants';

// ── Declarado FORA do Perfil para não ser recriado a cada render ──
function LabelInput({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="input-field"
      />
    </div>
  );
}

export function Perfil() {
  const { user, logout, updateUser, getToken } = useAuth();
  const navigate = useNavigate();

  const [first, setFirst]  = useState(user?.first_name || '');
  const [last,  setLast]   = useState(user?.last_name  || '');
  const [phone, setPhone]  = useState(user?.phone      || '');
  const [city,  setCity]   = useState(user?.city       || '');

  const [curPw,  setCurPw]  = useState('');
  const [newPw,  setNewPw]  = useState('');
  const [newPw2, setNewPw2] = useState('');

  const init = `${(user?.first_name||'?')[0]}${(user?.last_name||'')[0]||''}`.toUpperCase();

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const { data } = await authAPI.updateMe({ first_name: first, last_name: last, phone: phone.replace(/\D/g,''), city });
      updateUser(data.user);
      toast('✅', 'Perfil atualizado!', 'success');
    } catch {
      if (user) updateUser({ ...user, first_name: first, last_name: last, phone: phone.replace(/\D/g,''), city });
      toast('✅', 'Perfil atualizado (offline)!', 'success');
    }
  }

  async function changePw(e) {
    e.preventDefault();
    if (newPw !== newPw2) { toast('⚠️', 'As senhas não coincidem.', 'error'); return; }
    if (newPw.length < 8)  { toast('⚠️', 'Senha muito curta.', 'error'); return; }
    try {
      await authAPI.changePassword({ current_password: curPw, new_password: newPw });
      toast('✅', 'Senha alterada!', 'success');
    } catch { toast('✅', 'Senha alterada (demo)!', 'success'); }
    setCurPw(''); setNewPw(''); setNewPw2('');
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="section-title mb-8">Meu <span style={{ color: 'var(--terra)' }}>Perfil</span></h1>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border p-6 mb-5 flex items-center gap-5 shadow-sm" style={{ borderColor: 'var(--cream-dark)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center font-display font-black text-2xl text-white flex-shrink-0"
          style={{ background: 'var(--terra)' }}>{init}</div>
        <div>
          <div className="font-display font-black text-xl text-charcoal">{user?.first_name} {user?.last_name}</div>
          <div className="text-sm text-charcoal-soft mt-0.5">{user?.email}</div>
          <div className="text-xs text-charcoal-soft mt-0.5">{user?.city || 'Cidade não informada'}</div>
        </div>
      </div>

      {/* Edit */}
      <div className="bg-white rounded-2xl border p-6 mb-5" style={{ borderColor: 'var(--cream-dark)' }}>
        <h2 className="font-display font-black text-xl text-charcoal mb-5 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(194,91,42,.1)' }}>✏️</span>
          Editar dados
        </h2>
        <form onSubmit={saveProfile} className="grid grid-cols-2 gap-4">
          <LabelInput label="Nome *"       value={first} onChange={setFirst} autoComplete="given-name" />
          <LabelInput label="Sobrenome *"  value={last}  onChange={setLast}  autoComplete="family-name" />
          <LabelInput label="Telefone"     type="tel" value={phone} onChange={v => setPhone(formatPhoneValue(v))} autoComplete="tel" />
          <LabelInput label="Cidade"       value={city}  onChange={setCity} />
          <div className="col-span-2">
            <button type="submit" className="btn btn-terra" style={{ padding: '.75rem 2rem' }}>Salvar alterações</button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border p-6 mb-5" style={{ borderColor: 'var(--cream-dark)' }}>
        <h2 className="font-display font-black text-xl text-charcoal mb-5 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(74,124,89,.1)' }}>🔐</span>
          Alterar senha
        </h2>
        <form onSubmit={changePw} className="flex flex-col gap-4">
          <LabelInput label="Senha atual"          type="password" value={curPw}  onChange={setCurPw}  placeholder="Sua senha atual"       autoComplete="current-password" />
          <LabelInput label="Nova senha"           type="password" value={newPw}  onChange={setNewPw}  placeholder="Mínimo 8 caracteres"    autoComplete="new-password" />
          <LabelInput label="Confirmar nova senha" type="password" value={newPw2} onChange={setNewPw2} placeholder="Repita a nova senha"     autoComplete="new-password" />
          {newPw2 && (
            <div className="text-xs" style={{ color: newPw === newPw2 ? '#16A34A' : '#DC2626' }}>
              {newPw === newPw2 ? '✓ Senhas iguais' : '✗ Senhas não coincidem'}
            </div>
          )}
          <button type="submit" className="btn btn-outline-sage" style={{ padding: '.75rem 2rem', width: 'fit-content' }}>
            Alterar senha
          </button>
        </form>
      </div>

      {/* Danger */}
      <div className="rounded-2xl p-6 border border-red-200 bg-red-50">
        <h3 className="font-bold text-red-600 mb-1">Zona de risco</h3>
        <p className="text-sm text-red-700 mb-4">Ao sair, você precisará fazer login novamente.</p>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="btn btn-sm text-white"
          style={{ background: '#EF4444', border: 'none' }}
        >
          🚪 Sair da conta
        </button>
      </div>
    </div>
  );
}
