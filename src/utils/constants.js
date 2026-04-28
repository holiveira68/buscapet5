// ═══════════════════════════════════════════════════════
// utils/constants.js — Demo data, helpers, matching engine
// ═══════════════════════════════════════════════════════

export const API_BASE = 'http://localhost:3001/api';
export const TOKEN_KEY = 'bp_token';
export const USER_KEY  = 'bp_user';

export const SPECIES_EMOJI = {
  cachorro: '🐕', gato: '🐈', 'pássaro': '🦜', coelho: '🐇', outro: '🐾',
};

export const DEMO_PETS = [
  { id:1,  type:'lost',  name:'Rex',   species:'cachorro', breed:'Golden Retriever', color:'Dourado',       size:'grande',  gender:'macho',  date:'2025-03-10', location:'Vila Madalena, SP', description:'Usa coleira azul. Muito dócil.',            owner_name:'Carlos Silva',    owner_phone:'11991234567', owner_email:'carlos@email.com', photo:null, matched:true,  created_at:'2025-03-10T10:00:00' },
  { id:2,  type:'found', name:null,    species:'cachorro', breed:'Golden Retriever', color:'Caramelo',      size:'grande',  gender:'macho',  date:'2025-03-11', location:'Pinheiros, SP',     description:'Encontrado perto do metrô.',               owner_name:'Ana Souza',       owner_phone:'11987654321', owner_email:'ana@email.com',    photo:null, matched:true,  created_at:'2025-03-11T08:00:00' },
  { id:3,  type:'lost',  name:'Mia',   species:'gato',     breed:'Siamês',           color:'Creme/Escuro',  size:'pequeno', gender:'fêmea',  date:'2025-03-08', location:'Jardins, SP',       description:'Olhos azuis. Tem microchip.',              owner_name:'Beatriz Lima',    owner_phone:'11955551234', owner_email:'bea@email.com',    photo:null, matched:false, created_at:'2025-03-08T14:00:00' },
  { id:4,  type:'found', name:null,    species:'gato',     breed:'SRD',              color:'Laranja/Branco',size:'pequeno', gender:'macho',  date:'2025-03-12', location:'Moema, SP',         description:'Encontrado na rua, assustado.',            owner_name:'Pedro Costa',     owner_phone:'11944440987', owner_email:'pedro@email.com',  photo:null, matched:false, created_at:'2025-03-12T16:00:00' },
  { id:5,  type:'lost',  name:'Bob',   species:'cachorro', breed:'Labrador',         color:'Preto',         size:'grande',  gender:'macho',  date:'2025-03-13', location:'Lapa, SP',          description:'Adora bola. Usa coleira preta.',           owner_name:'Mariana Alves',   owner_phone:'11933330765', owner_email:'mari@email.com',   photo:null, matched:false, created_at:'2025-03-13T09:00:00' },
  { id:6,  type:'found', name:null,    species:'pássaro',  breed:'Calopsita',        color:'Cinza/Amarelo', size:'pequeno', gender:null,     date:'2025-03-14', location:'Santana, SP',       description:'Pousou na janela. Parece bem cuidado.',    owner_name:'Lucas Ferreira',  owner_phone:'11922220543', owner_email:'lucas@email.com',  photo:null, matched:false, created_at:'2025-03-14T11:00:00' },
  { id:7,  type:'lost',  name:'Luna',  species:'gato',     breed:'Persa',            color:'Branco',        size:'pequeno', gender:'fêmea',  date:'2025-03-15', location:'Moema, SP',         description:'Pelos longos. Muito tímida.',              owner_name:'Fernando Costa',  owner_phone:'11977778888', owner_email:'fern@email.com',   photo:null, matched:false, created_at:'2025-03-15T07:00:00' },
  { id:8,  type:'found', name:null,    species:'gato',     breed:'Persa',            color:'Branco',        size:'pequeno', gender:'fêmea',  date:'2025-03-16', location:'Moema, SP',         description:'Gata branca com pelos longos no jardim.',  owner_name:'Camila Ramos',    owner_phone:'11966661234', owner_email:'cami@email.com',   photo:null, matched:false, created_at:'2025-03-16T15:00:00' },
  { id:9,  type:'lost',  name:'Thor',  species:'cachorro', breed:'Bulldog Francês',  color:'Tigrado',       size:'pequeno', gender:'macho',  date:'2025-03-14', location:'Itaim Bibi, SP',    description:'Usa peitoral vermelho. Muito carinhoso.',  owner_name:'Priscila Santos', owner_phone:'11966665555', owner_email:'pri@email.com',    photo:null, matched:false, created_at:'2025-03-14T13:00:00' },
  { id:10, type:'found', name:null,    species:'cachorro', breed:'SRD',              color:'Preto/Branco',  size:'médio',   gender:'fêmea',  date:'2025-03-16', location:'Vila Mariana, SP',  description:'Dócil, estava sozinha na praça.',          owner_name:'Camila Rodrigues',owner_phone:'11955554321', owner_email:'cami2@email.com',  photo:null, matched:false, created_at:'2025-03-16T10:00:00' },
];

// ── Helpers ────────────────────────────────────────────
export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR');
}

export function daysAgo(d) {
  if (!d) return -1;
  return Math.round((Date.now() - new Date(d)) / 86400000);
}

export function formatPhoneValue(v) {
  v = v.replace(/\D/g, '').slice(0, 11);
  if      (v.length === 0)  return '';
  else if (v.length <= 2)   return `(${v}`;
  else if (v.length <= 6)   return `(${v.slice(0,2)}) ${v.slice(2)}`;
  else if (v.length <= 10)  return `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
  else                      return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
}

export function fileToB64(file) {
  return new Promise(r => {
    const fr = new FileReader();
    fr.onload = e => r(e.target.result);
    fr.readAsDataURL(file);
  });
}

// ── Matching engine ────────────────────────────────────
function tok(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
          .split(/[\s,\-/]+/).filter(w => w.length >= 4);
}

export function calcMatchScore(l, f) {
  let s = 0;
  if (l.species && f.species) { if (l.species !== f.species) return 0; s += 35; }
  if (l.breed && f.breed) {
    const a = l.breed.toLowerCase(), b = f.breed.toLowerCase();
    s += a === b ? 25 : (a.includes(b) || b.includes(a)) ? 15 : 0;
  }
  if (l.size && f.size && l.size === f.size) s += 20;
  if (l.color && f.color) { const ta = tok(l.color), tb = tok(f.color); if (ta.some(w => tb.includes(w))) s += 15; }
  if (l.location && f.location) { const ta = tok(l.location), tb = tok(f.location); if (ta.some(w => tb.includes(w))) s += 15; }
  if (l.date && f.date) {
    const d = Math.abs(new Date(l.date) - new Date(f.date)) / 86400000;
    s += d <= 30 ? 10 : 0;
    s += d <= 7  ? 5  : 0;
  }
  if (l.gender && f.gender && l.gender === f.gender) s += 10;
  return Math.min(Math.round(s / 130 * 100), 100);
}

export function computeMatches(pets) {
  const lost  = pets.filter(p => p.type === 'lost');
  const found = pets.filter(p => p.type === 'found');
  const out   = [];
  for (const l of lost)
    for (const f of found) {
      const sc = calcMatchScore(l, f);
      if (sc >= 40) out.push({ lost: l, found: f, score: sc });
    }
  return out.sort((a, b) => b.score - a.score);
}
