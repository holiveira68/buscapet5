// ════════════════════════════════════════════
// matcher.js — Motor de Matching do Buscapet
// ════════════════════════════════════════════
//
// 4 momentos em que o matching é executado:
//  1. POST /api/pets          → matchForNewPet()
//  2. PUT  /api/pets/:id      → matchForUpdatedPet()
//  3. Cron job (a cada 1h)   → runFullMatch()
//  4. POST /api/matches/run  → runFullMatch() (manual)

const WEIGHTS = { species:35, breed:25, size:20, color:15, location:15, date:10, gender:10 };
const THRESHOLD = 40;

function calcScore(lost, found) {
  let s = 0;
  if (lost.species && found.species) { if (lost.species !== found.species) return 0; s += WEIGHTS.species; }
  if (lost.breed && found.breed) { const a=lost.breed.toLowerCase(), b=found.breed.toLowerCase(); s += a===b?25:(a.includes(b)||b.includes(a))?15:0; }
  if (lost.size && found.size && lost.size === found.size) s += WEIGHTS.size;
  if (lost.color && found.color) { const aw=tok(lost.color), bw=tok(found.color); if (aw.some(w=>bw.includes(w))) s += WEIGHTS.color; }
  if (lost.location && found.location) { const aw=tok(lost.location), bw=tok(found.location); if (aw.some(w=>bw.includes(w))) s += WEIGHTS.location; }
  if (lost.date && found.date) { const d=Math.abs(new Date(lost.date)-new Date(found.date))/86400000; if(d<=30) s+=10; if(d<=7) s+=5; }
  if (lost.gender && found.gender && lost.gender === found.gender) s += WEIGHTS.gender;
  return Math.min(Math.round(s/135*100), 100);
}

function tok(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[\s,\-/]+/).filter(w=>w.length>=4);
}

async function matchForNewPet(conn, newPetId) {
  const [[pet]] = await conn.query('SELECT * FROM pets WHERE id=?', [newPetId]);
  if (!pet) return { created:0, updated:0 };
  const [candidates] = await conn.query(
    `SELECT * FROM pets WHERE type=? AND status IN ('active','matched') AND id!=?`,
    [pet.type==='lost'?'found':'lost', newPetId]
  );
  return _save(conn, pet, candidates);
}

async function matchForUpdatedPet(conn, petId) {
  await conn.query(`DELETE FROM matches WHERE lost_pet_id=? OR found_pet_id=?`, [petId, petId]);
  await conn.query(`UPDATE pets SET status='active' WHERE id=? AND status='matched'`, [petId]);
  return matchForNewPet(conn, petId);
}

async function runFullMatch(pool) {
  const conn = await pool.getConnection();
  let totalCreated=0, totalUpdated=0;
  try {
    await conn.beginTransaction();
    const [lostPets]  = await conn.query(`SELECT * FROM pets WHERE type='lost'  AND status IN ('active','matched')`);
    const [foundPets] = await conn.query(`SELECT * FROM pets WHERE type='found' AND status IN ('active','matched')`);
    for (const l of lostPets) { const r=await _save(conn,l,foundPets); totalCreated+=r.created; totalUpdated+=r.updated; }
    await conn.query(`INSERT INTO match_runs (lost_count,found_count,new_matches,updated_matches,ran_at) VALUES(?,?,?,?,NOW())`,
      [lostPets.length, foundPets.length, totalCreated, totalUpdated]);
    await conn.commit();
    return { created: totalCreated, updated: totalUpdated };
  } catch(err) { await conn.rollback(); throw err; }
  finally { conn.release(); }
}

async function _save(conn, pet, candidates) {
  let created=0, updated=0;
  for (const c of candidates) {
    const lostPet  = pet.type==='lost'  ? pet : c;
    const foundPet = pet.type==='found' ? pet : c;
    const score = calcScore(lostPet, foundPet);
    if (score < THRESHOLD) continue;
    const [[ex]] = await conn.query(`SELECT id, score FROM matches WHERE lost_pet_id=? AND found_pet_id=?`, [lostPet.id, foundPet.id]);
    if (!ex) {
      await conn.query(`INSERT INTO matches (lost_pet_id,found_pet_id,score,status,created_at) VALUES(?,?,?,'active',NOW())`, [lostPet.id, foundPet.id, score]);
      created++;
    } else if (ex.score !== score) {
      await conn.query(`UPDATE matches SET score=?,status='active',updated_at=NOW() WHERE id=?`, [score, ex.id]);
      updated++;
    }
    await conn.query(`UPDATE pets SET status='matched' WHERE id IN (?,?) AND status='active'`, [lostPet.id, foundPet.id]);
  }
  return { created, updated };
}

const MATCH_FIELDS = new Set(['species','breed','color','size','gender','date','location']);
function hasRelevantChange(fields) { return Object.keys(fields).some(k=>MATCH_FIELDS.has(k)); }

module.exports = { calcScore, matchForNewPet, matchForUpdatedPet, runFullMatch, hasRelevantChange, THRESHOLD, WEIGHTS };
