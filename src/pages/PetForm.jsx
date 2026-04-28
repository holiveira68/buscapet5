import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetsContext';
import { petsAPI } from '../services/api';
import { fileToB64, formatPhoneValue, computeMatches, calcMatchScore } from '../utils/constants';
import { toast } from '../hooks/useToast';

const REQUIRED = ['species', 'color', 'size', 'date', 'location', 'ownerName', 'ownerPhone', 'ownerEmail'];

function FloatField({ id, label, value, onChange, required, type = 'text', hint, textarea, select, options, maxLength, counter, className = '' }) {
  const hasValue = String(value || '').length > 0;
  const wrapClass = `field-wrap${textarea ? ' is-textarea' : ''}${select ? ' is-select' : ''}${hasValue ? ' has-value' : ''}`;

  return (
    <div className={wrapClass}>
      {select ? (
        <select id={id} value={value} onChange={e => onChange(e.target.value)} className={`field-input ${className}`} required={required} style={{ paddingTop: '1.3rem', paddingBottom: '.4rem', paddingRight: '2rem', cursor: 'pointer' }}>
          {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : textarea ? (
        <textarea id={id} value={value} onChange={e => onChange(e.target.value)} className={`field-input ${className}`} rows={4} maxLength={maxLength} placeholder=" " required={required} />
      ) : (
        <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className={`field-input ${className}`} placeholder=" " required={required} maxLength={maxLength} />
      )}
      <label className="field-label" htmlFor={id}>
        {label}{required && <span style={{ color: 'var(--terra)' }}> *</span>}
      </label>
      {hint && <div className="field-hint">{hint}</div>}
      {counter && maxLength && <div className="field-counter">{value.length}/{maxLength}</div>}
    </div>
  );
}

export default function PetForm({ type }) {
  const isLost    = type === 'lost';
  const color     = isLost ? 'var(--terra)' : 'var(--sage)';
  const { user, isLogged } = useAuth();
  const { addPet, pets }   = usePets();
  const navigate           = useNavigate();

  const [form, setForm]     = useState({
    name: '', species: '', breed: '', color: '', size: '', gender: '',
    date: new Date().toISOString().split('T')[0], time: '', location: '', description: '', context: '',
    ownerName: '', ownerPhone: '', ownerEmail: '',
  });
  const [photo,    setPhoto]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(null);

  // Prefill contato se logado
  useEffect(() => {
    if (user) setForm(f => ({
      ...f,
      ownerName:  f.ownerName  || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      ownerPhone: f.ownerPhone || user.phone || '',
      ownerEmail: f.ownerEmail || user.email || '',
    }));
  }, [user]);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const pct = Math.round(REQUIRED.filter(k => String(form[k] || '').trim()).length / REQUIRED.length * 100);
  const step = pct < 35 ? 1 : pct < 70 ? 2 : 3;
  const stepLabels = ['Passo 1 — Dados do animal', 'Passo 2 — Local e data', 'Passo 3 — Seus dados'];

  function handlePhoto(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast('⚠️', 'Foto muito grande. Máx. 5MB.', 'error'); return; }
    setPhoto(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
  }

  function validate() {
    const errs = {};
    REQUIRED.forEach(k => { if (!String(form[k] || '').trim()) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isLogged) { navigate('/auth?redirect=' + encodeURIComponent(location.pathname)); return; }
    if (!validate()) { toast('⚠️', 'Preencha os campos obrigatórios.', 'error'); return; }

    setLoading(true);
    const photoB64 = photo ? await fileToB64(photo) : null;
    const pet = {
      id: Date.now(), type,
      name:        form.name || null,
      species:     form.species,
      breed:       form.breed || null,
      color:       form.color,
      size:        form.size,
      gender:      form.gender || null,
      date:        form.date,
      location:    form.location,
      description: [form.description, form.context].filter(Boolean).join(' | '),
      owner_name:  form.ownerName,
      owner_phone: form.ownerPhone.replace(/\D/g, ''),
      owner_email: form.ownerEmail,
      photo:       photoB64,
      matched:     false,
      created_at:  new Date().toISOString(),
    };

    let matchCount = 0;
    try {
      const { data } = await petsAPI.create(pet);
      pet.id = data.id;
      matchCount = data.matches || 0;
    } catch {
      // offline: calcula matches localmente
      const allWithNew = [...pets, pet];
      matchCount = allWithNew
        .filter(p => p.type !== type)
        .filter(p => calcMatchScore(isLost ? pet : p, isLost ? p : pet) >= 40)
        .length;
    }

    if (matchCount > 0) pet.matched = true;
    addPet(pet);
    setLoading(false);
    setSuccess({ pet, matchCount });
    toast('🎉', `${isLost ? 'Animal perdido' : 'Animal achado'} cadastrado!`, 'success');
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center py-20 px-6" style={{ background: 'var(--cream)' }}>
      <div className="text-center max-w-lg animate-slide-up">
        <div className="text-8xl mb-5">{isLost ? '😢' : '💚'}</div>
        <h2 className="font-display font-black text-4xl text-charcoal mb-3">Animal cadastrado!</h2>
        <p className="text-charcoal-soft mb-6 leading-relaxed">
          {success.pet.name ? `"${success.pet.name}" foi` : 'O animal foi'} cadastrado com sucesso!
          Nossa IA vai cruzar automaticamente com animais {isLost ? 'achados' : 'perdidos'}.
        </p>
        {success.matchCount > 0 && (
          <div className="rounded-xl p-5 mb-6 text-left" style={{ background: 'rgba(245,166,35,.12)', border: '1px solid rgba(245,166,35,.35)' }}>
            <div className="font-black mb-1" style={{ color: '#a05c00' }}>✨ {success.matchCount} possível(is) match(es)!</div>
            <p className="text-sm text-charcoal-soft">O tutor pode entrar em contato em breve!</p>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={isLost ? '/perdidos' : '/achados'} className={`btn btn-lg ${isLost ? 'btn-terra' : 'btn-sage'}`}>
            Ver {isLost ? 'perdidos' : 'achados'}
          </Link>
          <Link to="/" className="btn btn-ghost btn-lg">Ir para o início</Link>
        </div>
      </div>
    </div>
  );

  const fieldClass = isLost ? '' : 'field-found';

  return (
    <div>
      {/* Header da página */}
      <section className="py-10 border-b" style={{ background: `linear-gradient(135deg,rgba(${isLost?'194,91,42':'74,124,89'},.07),transparent)`, borderColor: `rgba(${isLost?'194,91,42':'74,124,89'},.12)` }}>
        <div className="max-w-2xl mx-auto px-6">
          <Link to={isLost ? '/perdidos' : '/achados'} className="btn btn-ghost btn-sm mb-4 inline-flex pl-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Voltar
          </Link>
          <h1 className="section-title mb-2" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
            {isLost ? 'Perdi meu' : 'Encontrei um'} <span style={{ color }}>Pet</span> {isLost ? '😢' : '🐾'}
          </h1>
          <p className="section-sub max-w-lg">
            {isLost
              ? 'Preencha com o máximo de detalhes. Nossa IA cruza automaticamente com animais achados.'
              : 'Obrigado por ajudar! Descreva o animal para facilitar o reencontro com o tutor.'}
          </p>
          {/* Progress bar */}
          <div className="mt-6 bg-white rounded-xl border px-5 py-4" style={{ borderColor: 'var(--cream-dark)' }}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(n => (
                  <div key={n} className="step-dot" style={{ background: n < step ? '#22C55E' : n === step ? color : 'var(--cream-dark)' }} />
                ))}
                <span className="text-xs font-semibold text-charcoal-soft ml-1">{stepLabels[step - 1]}</span>
              </div>
              <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%`, background: isLost ? 'linear-gradient(90deg,var(--terra),var(--amber))' : 'linear-gradient(90deg,var(--sage),var(--sage-light))' }} />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="tip-box mb-6">
          <span className="text-xl flex-shrink-0">💡</span>
          <div>Quanto mais detalhes, <strong>maior a chance de reencontro</strong>. Pets com foto têm <strong>3× mais visualizações!</strong></div>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ① FOTO */}
          <div className="form-section-card">
            <div className="fsc-header">
              <div className="fsc-icon" style={{ background: `rgba(${isLost?'194,91,42':'74,124,89'},.1)` }}>📷</div>
              <div><div className="fsc-title">Foto do Animal</div><div className="text-xs text-charcoal-soft">Ajuda muito no reconhecimento</div></div>
            </div>
            <div className="fsc-body">
              <div className={`photo-drop ${!isLost ? 'found' : ''} p-10 text-center`} onClick={() => document.getElementById('photoInput').click()}>
                {preview ? (
                  <div className="flex flex-col items-center">
                    <img src={preview} className="w-36 h-36 object-cover rounded-xl shadow-md mb-3" alt="Preview" />
                    <p className="text-sm text-charcoal-soft">Clique para trocar a foto</p>
                  </div>
                ) : (
                  <>
                    <div className="text-5xl mb-3 leading-none">📸</div>
                    <p className="font-bold text-charcoal">Clique para adicionar uma foto</p>
                    <p className="text-sm text-charcoal-soft mt-1">JPG ou PNG — máx. 5MB</p>
                  </>
                )}
                <input type="file" id="photoInput" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>
            </div>
          </div>

          {/* ② DADOS */}
          <div className="form-section-card">
            <div className="fsc-header">
              <div className="fsc-icon" style={{ background: 'rgba(245,166,35,.15)' }}>🐾</div>
              <div><div className="fsc-title">Identificação do Animal</div><div className="text-xs text-charcoal-soft">Preencha com todos os detalhes</div></div>
            </div>
            <div className="fsc-body">
              <FloatField id="petName" label="Nome do animal" value={form.name} onChange={set('name')} hint="Se não souber, pode deixar em branco" className={fieldClass} />
              <FloatField id="petSpecies" label="Espécie" value={form.species} onChange={set('species')} required select className={errors.species ? 'field-error ' + fieldClass : fieldClass}
                options={[['','Selecione'],['cachorro','🐕 Cachorro'],['gato','🐈 Gato'],['pássaro','🦜 Pássaro'],['coelho','🐇 Coelho'],['outro','🐾 Outro']]} />
              <FloatField id="petBreed" label="Raça" value={form.breed} onChange={set('breed')} hint="Ex: Labrador, SRD…" className={fieldClass} />
              <FloatField id="petColor" label="Cor principal" value={form.color} onChange={set('color')} required hint="Ex: Caramelo, Preto e Branco…" className={errors.color ? 'field-error ' + fieldClass : fieldClass} />
              <FloatField id="petSize" label="Porte" value={form.size} onChange={set('size')} required select className={errors.size ? 'field-error ' + fieldClass : fieldClass}
                options={[['','Selecione'],['pequeno','Pequeno — até 10kg'],['médio','Médio — 10 a 25kg'],['grande','Grande — acima de 25kg']]} />
              <FloatField id="petGender" label="Sexo" value={form.gender} onChange={set('gender')} select className={fieldClass}
                options={[['','Não sei'],['macho','Macho'],['fêmea','Fêmea']]} />
              <FloatField id="petDesc" label="Descrição detalhada" value={form.description} onChange={set('description')} required textarea maxLength={500} counter hint="Marcas especiais, coleira, microchip, comportamento…" className={errors.description ? 'field-error ' + fieldClass : fieldClass} />
            </div>
          </div>

          {/* ③ LOCAL */}
          <div className="form-section-card">
            <div className="fsc-header">
              <div className="fsc-icon" style={{ background: 'rgba(74,124,89,.1)' }}>📍</div>
              <div><div className="fsc-title">Onde e Quando</div><div className="text-xs text-charcoal-soft">{isLost ? 'Data e local do desaparecimento' : 'Data e local do achado'}</div></div>
            </div>
            <div className="fsc-body">
              <FloatField id="petDate" label={isLost ? 'Data do desaparecimento' : 'Data do achado'} value={form.date} onChange={set('date')} required type="date" className={errors.date ? 'field-error ' + fieldClass : fieldClass} />
              <FloatField id="petTime" label="Horário aproximado" value={form.time} onChange={set('time')} type="time" hint="Opcional" className={fieldClass} />
              <FloatField id="petLocation" label="Endereço / Bairro / Cidade" value={form.location} onChange={set('location')} required hint="Quanto mais preciso, melhor o match" className={errors.location ? 'field-error ' + fieldClass : fieldClass} />
              <FloatField id="petContext" label={isLost ? 'Como aconteceu' : 'Contexto do achado'} value={form.context} onChange={set('context')} textarea maxLength={300} hint={isLost ? 'Ex: Fugiu pelo portão…' : 'Ex: Estava sozinho na calçada…'} className={fieldClass} />
            </div>
          </div>

          {/* ④ CONTATO */}
          <div className="form-section-card">
            <div className="fsc-header">
              <div className="fsc-icon" style={{ background: 'rgba(30,30,30,.06)' }}>👤</div>
              <div><div className="fsc-title">Seus Dados de Contato</div><div className="text-xs text-charcoal-soft">Exibidos para a outra parte entrar em contato</div></div>
            </div>
            <div className="fsc-body">
              <div className="tip-box privacy">
                <span className="text-lg flex-shrink-0">🔒</span>
                <div>Seus dados são exibidos apenas para a pessoa do lado oposto. <strong>Nunca compartilhamos com terceiros</strong>.</div>
              </div>
              <FloatField id="ownerName"  label="Nome completo"       value={form.ownerName}  onChange={set('ownerName')}  required className={errors.ownerName  ? 'field-error ' + fieldClass : fieldClass} />
              <FloatField id="ownerPhone" label="WhatsApp / Telefone" value={form.ownerPhone} onChange={v => set('ownerPhone')(formatPhoneValue(v))} required type="tel" hint="Será o principal meio de contato" className={errors.ownerPhone ? 'field-error ' + fieldClass : fieldClass} />
              <FloatField id="ownerEmail" label="E-mail"              value={form.ownerEmail} onChange={set('ownerEmail')} required type="email" className={errors.ownerEmail ? 'field-error ' + fieldClass : fieldClass} />
            </div>
          </div>

          <div className="mt-6">
            <button type="submit" disabled={loading} className={isLost ? 'btn-submit-terra' : 'btn-submit-sage'}>
              {loading ? (
                <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Cadastrando…</span></>
              ) : (
                <span>{isLost ? '😢 Cadastrar Animal Perdido' : '🐾 Cadastrar Animal Achado'}</span>
              )}
            </button>
            <p className="text-center text-xs text-charcoal-soft mt-3">
              Ao cadastrar, você concorda com os <a href="#" style={{ color }}>Termos de Uso</a>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
