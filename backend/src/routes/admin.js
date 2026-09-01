const express  = require('express');
const bcrypt   = require('bcryptjs');
const { getDB } = require('../db');
const { authMiddleware, superadminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Todos los endpoints admin requieren auth + superadmin
router.use(authMiddleware, superadminMiddleware);

// GET /api/admin/agencias — listar todas las agencias
router.get('/agencias', async (req, res) => {
  const db = getDB();
  const agencias = await db.all('SELECT id, nombre, ciudad, dominio, es_superadmin, activa, created_at FROM agencias WHERE es_superadmin = 0');
  res.json(agencias);
});

// POST /api/admin/agencias — crear agencia nueva
router.post('/agencias', async (req, res) => {
  const { id, nombre, ciudad, dominio, password } = req.body;
  if (!id || !nombre || !ciudad || !password) {
    return res.status(400).json({ error: 'id, nombre, ciudad y password son requeridos' });
  }

  const db = getDB();
  const exists = await db.get('SELECT id FROM agencias WHERE id = ?', [id]);
  if (exists) {
    return res.status(409).json({ error: `Ya existe una agencia con id "${id}"` });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  
  await db.run(`
    INSERT INTO agencias (id, nombre, ciudad, dominio, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `, [id, nombre, ciudad || '', dominio || null, password_hash]);

  // Precios iniciales vacíos
  await db.run(`
    INSERT INTO precios (agencia_id, fibra_300, fibra_istv_move, fibra_istv_full, fibra_iscam, inalambrica_15, updated_at)
    VALUES (?, 0, 0, 0, 0, 0, datetime('now'))
  `, [id]);

  res.status(201).json({ ok: true, id });
});

// PATCH /api/admin/agencias/:id — editar datos de agencia
router.patch('/agencias/:id', async (req, res) => {
  const { nombre, ciudad, dominio } = req.body;
  const db = getDB();
  await db.run(`
    UPDATE agencias SET nombre=?, ciudad=?, dominio=? WHERE id=?
  `, [nombre, ciudad, dominio || null, req.params.id]);
  res.json({ ok: true });
});

// DELETE /api/admin/agencias/:id — desactivar agencia (soft delete)
router.delete('/agencias/:id', async (req, res) => {
  if (req.params.id === 'superadmin') {
    return res.status(400).json({ error: 'No se puede eliminar el superadmin' });
  }
  const db = getDB();
  await db.run('UPDATE agencias SET activa = 0 WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// POST /api/admin/agencias/:id/reset-password
router.post('/agencias/:id/reset-password', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'password requerido' });
  
  const hash = bcrypt.hashSync(password, 10);
  const db = getDB();
  await db.run('UPDATE agencias SET password_hash = ? WHERE id = ?', [hash, req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
