// ═══════════════════════════════════════════════════════
// utils/constants.js — Helpers, matching engine
// ═══════════════════════════════════════════════════════

export const API_BASE = 'http://localhost:3001/api';
export const TOKEN_KEY = 'bp_token';
export const USER_KEY  = 'bp_user';

export const SPECIES_EMOJI = {
  cachorro: '🐕', gato: '🐈', 'pássaro': '🦜', coelho: '🐇', outro: '🐾',
};

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
  if (!s || typeof s !== 'string') return [];
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/[\s,\-/]+/)
    .filter(w => w.length >= 4);
}

export function calcMatchScore(l, f) {
  if (!l || !f) return 0;

  let s = 0;

  // Espécie — deve bater obrigatoriamente
  if (l.species && f.species) {
    if (l.species !== f.species) return 0;
    s += 35;
  }

  // Raça
  if (l.breed && f.breed) {
    const a = String(l.breed).toLowerCase();
    const b = String(f.breed).toLowerCase();
    s += a === b ? 25 : (a.includes(b) || b.includes(a)) ? 15 : 0;
  }

  // Porte
  if (l.size && f.size && l.size === f.size) s += 20;

  // Cor
  const ta = tok(l.color), tb = tok(f.color);
  if (ta.length && tb.length && ta.some(w => tb.includes(w))) s += 15;

  // Localização
  const la = tok(l.location), lb = tok(f.location);
  if (la.length && lb.length && la.some(w => lb.includes(w))) s += 15;

  // Data
  if (l.date && f.date) {
    const da = new Date(l.date), db = new Date(f.date);
    if (!isNaN(da) && !isNaN(db)) {
      const diff = Math.abs(da - db) / 86400000;
      s += diff <= 30 ? 10 : 0;
      s += diff <= 7  ? 5  : 0;
    }
  }

  // Gênero
  if (l.gender && f.gender && l.gender === f.gender) s += 10;

  return Math.min(Math.round(s / 130 * 100), 100);
}

export function computeMatches(pets) {
  if (!Array.isArray(pets) || pets.length === 0) return [];

  const lost  = pets.filter(p => p?.type === 'lost');
  const found = pets.filter(p => p?.type === 'found');
  const out   = [];

  for (const l of lost) {
    for (const f of found) {
      const sc = calcMatchScore(l, f);
      if (sc >= 40) out.push({ lost: l, found: f, score: sc });
    }
  }

  return out.sort((a, b) => b.score - a.score);
}
