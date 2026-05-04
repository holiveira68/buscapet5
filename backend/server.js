// ════════════════════════════════════════════
// BUSCAPET API — server.js  (v3)
// Node.js 18+ | MySQL 8+ | Express
//
// npm install express mysql2 cors dotenv node-cron bcryptjs jsonwebtoken nodemailer
// ════════════════════════════════════════════
require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const cron    = require('node-cron');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const { matchForNewPet, matchForUpdatedPet, runFullMatch, hasRelevantChange } = require('./matcher');

const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET  = process.env.JWT_SECRET  || 'buscapet-dev-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// ── Middleware ─────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, _, next) => { console.log(`${new Date().toLocaleTimeString('pt-BR')} ${req.method} ${req.path}`); next(); });

// ── DB Pool ────────────────────────────────
const pool = mysql.createPool({
  host:    process.env.DB_HOST || 'localhost',
  user:    process.env.DB_USER || 'root',
  password:process.env.DB_PASS || 'aluno',
  database:process.env.DB_NAME || 'buscapet5',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '-03:00',
});
app.locals.pool = pool;
(async()=>{ try{ await pool.query('SELECT 1'); console.log('✅ DB conectado'); }catch(e){ console.error('❌ DB:', e.message); }})();

// ── Auth middleware ────────────────────────
function authMW(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token não fornecido' });
  try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token inválido ou expirado' }); }
}

function fmtUser(u) {
  return { id:u.id, first_name:u.first_name, last_name:u.last_name, email:u.email, phone:u.phone, city:u.city, avatar_url:u.avatar_url, created_at:u.created_at };
}

// ══════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { first_name, last_name, email, phone, city, password } = req.body;
  if (!first_name||!last_name||!email||!password) return res.status(400).json({ error:'Campos obrigatórios faltando' });
  if (password.length < 8) return res.status(400).json({ error:'Senha deve ter mínimo 8 caracteres' });
  try {
    const [[ex]] = await pool.query('SELECT id FROM users WHERE email=?', [email.toLowerCase()]);
    if (ex) return res.status(409).json({ error:'E-mail já cadastrado' });
    const hash = await bcrypt.hash(password, 12);
    const [r] = await pool.query(
      `INSERT INTO users (first_name,last_name,email,phone,city,password_hash,created_at) VALUES(?,?,?,?,?,?,NOW())`,
      [first_name.trim(), last_name.trim(), email.toLowerCase(), phone||null, city||null, hash]
    );
    const [[user]] = await pool.query('SELECT * FROM users WHERE id=?', [r.insertId]);
    const token = jwt.sign({ id:user.id, email:user.email }, JWT_SECRET, { expiresIn:JWT_EXPIRES });
    res.status(201).json({ message:'Conta criada!', token, user: fmtUser(user) });
  } catch(e) { console.error(e); res.status(500).json({ error:'Erro interno' }); }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email||!password) return res.status(400).json({ error:'Informe e-mail e senha' });
  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE email=? AND active=1', [email.toLowerCase()]);
    if (!user) return res.status(401).json({ error:'E-mail ou senha incorretos' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error:'E-mail ou senha incorretos' });
    await pool.query('UPDATE users SET login_attempts=0, last_login=NOW() WHERE id=?', [user.id]);
    const token = jwt.sign({ id:user.id, email:user.email }, JWT_SECRET, { expiresIn:JWT_EXPIRES });
    res.json({ message:`Bem-vindo, ${user.first_name}!`, token, user: fmtUser(user) });
  } catch(e) { res.status(500).json({ error:'Erro interno' }); }
});

// GET /api/auth/me
app.get('/api/auth/me', authMW, async (req, res) => {
  const [[user]] = await pool.query('SELECT * FROM users WHERE id=?', [req.user.id]);
  if (!user) return res.status(404).json({ error:'Usuário não encontrado' });
  res.json(fmtUser(user));
});

// PUT /api/auth/me
app.put('/api/auth/me', authMW, async (req, res) => {
  const { first_name, last_name, phone, city } = req.body;
  await pool.query(`UPDATE users SET first_name=?,last_name=?,phone=?,city=?,updated_at=NOW() WHERE id=?`,
    [first_name, last_name, phone, city, req.user.id]);
  const [[u]] = await pool.query('SELECT * FROM users WHERE id=?', [req.user.id]);
  res.json({ message:'Perfil atualizado', user: fmtUser(u) });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', authMW, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password||!new_password) return res.status(400).json({ error:'Informe senhas' });
  if (new_password.length < 8) return res.status(400).json({ error:'Senha muito curta' });
  const [[user]] = await pool.query('SELECT * FROM users WHERE id=?', [req.user.id]);
  const ok = await bcrypt.compare(current_password, user.password_hash);
  if (!ok) return res.status(401).json({ error:'Senha atual incorreta' });
  const hash = await bcrypt.hash(new_password, 12);
  await pool.query('UPDATE users SET password_hash=? WHERE id=?', [hash, req.user.id]);
  res.json({ message:'Senha alterada!' });
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const ok = { message:'Se o e-mail existir, você receberá o link.' };
  if (!email) return res.json(ok);
  try {
    const [[user]] = await pool.query('SELECT id FROM users WHERE email=?', [email.toLowerCase()]);
    if (!user) return res.json(ok);
    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);
    await pool.query('UPDATE users SET reset_token=?,reset_token_expiry=? WHERE id=?', [token, expiry, user.id]);
    console.log(`[Reset] ${email} → token: ${token}`);
  } catch {}
  res.json(ok);
});

// GET /api/auth/check-email
app.get('/api/auth/check-email', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error:'Informe e-mail' });
  const [[row]] = await pool.query('SELECT id FROM users WHERE email=?', [email.toLowerCase()]);
  res.json({ available: !row });
});

// GET /api/auth/my-pets
app.get('/api/auth/my-pets', authMW, async (req, res) => {
  const [pets] = await pool.query(
    `SELECT p.*,
       (SELECT COUNT(*) FROM matches m WHERE (m.lost_pet_id=p.id OR m.found_pet_id=p.id) AND m.status='active') AS match_count
     FROM pets p WHERE p.user_id=? ORDER BY p.created_at DESC`,
    [req.user.id]
  );
  res.json({ pets });
});

// ══════════════════════════════════════════
// PETS ROUTES
// ══════════════════════════════════════════

// GET /api/pets
app.get('/api/pets', async (req, res) => {
  try {
    const { type, species, size, gender, search } = req.query;
    let sql = `SELECT * FROM pets WHERE status!='resolved'`;
    const p = [];
    if (type)    { sql += ' AND type=?';    p.push(type); }
    if (species) { sql += ' AND species=?'; p.push(species); }
    if (size)    { sql += ' AND size=?';    p.push(size); }
    if (gender)  { sql += ' AND gender=?';  p.push(gender); }
    if (search)  { sql += ' AND (name LIKE ? OR breed LIKE ? OR color LIKE ? OR location LIKE ? OR description LIKE ?)'; const s=`%${search}%`; p.push(s,s,s,s,s); }
    sql += ' ORDER BY created_at DESC';
    const [pets] = await pool.query(sql, p);
    const [[stats]] = await pool.query(`SELECT SUM(type='lost') AS lost, SUM(type='found') AS found, (SELECT COUNT(*) FROM matches WHERE status='active') AS matches FROM pets WHERE status!='resolved'`);
    const [mrows] = await pool.query(`SELECT lost_pet_id, found_pet_id FROM matches WHERE status='active'`);
    const mset = new Set(); mrows.forEach(m=>{ mset.add(m.lost_pet_id); mset.add(m.found_pet_id); });
    res.json({ pets: pets.map(p=>({...p, matched: mset.has(p.id)})), stats });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/pets/:id
app.get('/api/pets/:id', async (req, res) => {
  const [[pet]] = await pool.query('SELECT * FROM pets WHERE id=?', [req.params.id]);
  if (!pet) return res.status(404).json({ error:'Pet não encontrado' });
  const [matches] = await pool.query(`SELECT m.* FROM matches m WHERE (m.lost_pet_id=? OR m.found_pet_id=?) AND m.status='active' ORDER BY m.score DESC`, [req.params.id, req.params.id]);
  res.json({ ...pet, matches });
});

// POST /api/pets  — MOMENTO 1: matching automático no cadastro
app.post('/api/pets', authMW, async (req, res) => {
  const { type, name, species, breed, color, size, gender, date, location, description, owner_name, owner_phone, owner_email, photo } = req.body;
  if (!type||!species||!color||!size||!location||!owner_name||!owner_phone||!owner_email) return res.status(400).json({ error:'Campos obrigatórios faltando' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      `INSERT INTO pets (type,user_id,name,species,breed,color,size,gender,date,location,description,owner_name,owner_phone,owner_email,photo,status,created_at,updated_at)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active',NOW(),NOW())`,
      [type, req.user.id, name||null, species, breed||null, color, size, gender||null, date||null, location, description||null, owner_name, owner_phone, owner_email, photo||null]
    );
    const newId = r.insertId;
    // MOMENTO 1 — matching imediato
    const result = await matchForNewPet(conn, newId);
    await conn.commit();
    res.status(201).json({ id:newId, matches:result.created, message: result.created>0?`🎉 ${result.created} match(es)!`:'Cadastrado! Avisaremos se aparecer um match.' });
  } catch(e) { await conn.rollback(); console.error(e); res.status(500).json({ error:e.message }); }
  finally { conn.release(); }
});

// PUT /api/pets/:id  — MOMENTO 2: re-matching se campos relevantes mudaram
app.put('/api/pets/:id', authMW, async (req, res) => {
  const fields = req.body;
  if (!Object.keys(fields).length) return res.status(400).json({ error:'Nenhum campo enviado' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    fields.updated_at = new Date();
    const sets = Object.keys(fields).map(k=>`\`${k}\`=?`).join(',');
    await conn.query(`UPDATE pets SET ${sets} WHERE id=? AND user_id=?`, [...Object.values(fields), req.params.id, req.user.id]);
    let reMatch = null;
    if (hasRelevantChange(fields)) reMatch = await matchForUpdatedPet(conn, parseInt(req.params.id));
    await conn.commit();
    res.json({ message:'Atualizado', re_match: reMatch });
  } catch(e) { await conn.rollback(); res.status(500).json({ error:e.message }); }
  finally { conn.release(); }
});

// DELETE /api/pets/:id
app.delete('/api/pets/:id', authMW, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`UPDATE pets SET status='resolved',updated_at=NOW() WHERE id=? AND user_id=?`, [req.params.id, req.user.id]);
    await conn.query(`UPDATE matches SET status='resolved',confirmed_at=NOW() WHERE (lost_pet_id=? OR found_pet_id=?) AND status='active'`, [req.params.id, req.params.id]);
    await conn.commit();
    res.json({ message:'🎉 Reencontrado!' });
  } catch(e) { await conn.rollback(); res.status(500).json({ error:e.message }); }
  finally { conn.release(); }
});

// ══════════════════════════════════════════
// MATCHES ROUTES
// ══════════════════════════════════════════

// GET /api/matches
app.get('/api/matches', async (req, res) => {
  const { min_score=40 } = req.query;
  const [rows] = await pool.query(`SELECT * FROM v_matches_full WHERE match_status='active' AND score>=? ORDER BY score DESC, match_created DESC`, [parseInt(min_score)]);
  res.json({ matches:rows, total:rows.length });
});

// PATCH /api/matches/:id/confirm
app.patch('/api/matches/:id/confirm', authMW, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[m]] = await conn.query('SELECT * FROM matches WHERE id=?', [req.params.id]);
    if (!m) return res.status(404).json({ error:'Match não encontrado' });
    await conn.query(`UPDATE matches SET status='confirmed',confirmed_at=NOW() WHERE id=?`, [req.params.id]);
    await conn.query(`UPDATE pets SET status='resolved',updated_at=NOW() WHERE id IN (?,?)`, [m.lost_pet_id, m.found_pet_id]);
    await conn.commit();
    res.json({ message:'🎉 Reencontro confirmado!' });
  } catch(e) { await conn.rollback(); res.status(500).json({ error:e.message }); }
  finally { conn.release(); }
});

// PATCH /api/matches/:id/dismiss
app.patch('/api/matches/:id/dismiss', authMW, async (req, res) => {
  await pool.query(`UPDATE matches SET status='dismissed' WHERE id=?`, [req.params.id]);
  res.json({ message:'Match descartado' });
});

// POST /api/matches/run — MOMENTO 4: full match manual
app.post('/api/matches/run', async (req, res) => {
  if (req.headers['x-admin-key'] !== (process.env.ADMIN_KEY||'buscapet-admin')) return res.status(403).json({ error:'Não autorizado' });
  try { const r=await runFullMatch(pool); res.json({ message:'Full match concluído!', ...r }); }
  catch(e) { res.status(500).json({ error:e.message }); }
});

// GET /api/health
app.get('/api/health', async (req, res) => {
  try {
    const [[{ t }]] = await pool.query('SELECT NOW() AS t');
    const [[lr]] = await pool.query('SELECT ran_at FROM match_runs ORDER BY ran_at DESC LIMIT 1');
    res.json({ status:'ok', db:'connected', db_time:t, last_cron:lr?.ran_at||null });
  } catch(e) { res.status(500).json({ status:'error', message:e.message }); }
});

// ── Cron — MOMENTO 3: full match a cada hora ─
cron.schedule('0 * * * *', async () => {
  console.log('\n[CRON] ⏰ Full match automático...');
  try { const r=await runFullMatch(pool); console.log(`[CRON] ✅ +${r.created} novos, ${r.updated} atualizados\n`); }
  catch(e) { console.error('[CRON] ❌', e.message); }
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════╗`);
  console.log(`║  🐾  BUSCAPET API — porta ${PORT}    ║`);
  console.log(`║  Health: GET /api/health         ║`);
  console.log(`║  Cron:   a cada 1 hora           ║`);
  console.log(`╚══════════════════════════════════╝\n`);
});

module.exports = app;
