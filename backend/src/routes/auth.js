const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { getDB } = require('../db');

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { agencia_id, password } = req.body;
  if (!agencia_id || !password) {
    return res.status(400).json({ error: 'agencia_id y password son requeridos' });
  }

  const db = getDB();
  const agencia = await db.get('SELECT * FROM agencias WHERE id = ? AND activa = 1', [agencia_id]);
  if (!agencia) {
    return res.status(401).json({ error: 'Agencia no encontrada o inactiva' });
  }

  const valid = bcrypt.compareSync(password, agencia.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const token = jwt.sign(
    { agencia_id: agencia.id, nombre: agencia.nombre, es_superadmin: agencia.es_superadmin === 1 },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({
    token,
    agencia: {
      id:            agencia.id,
      nombre:        agencia.nombre,
      ciudad:        agencia.ciudad,
      dominio:       agencia.dominio,
      es_superadmin: agencia.es_superadmin === 1,
    },
  });
});

module.exports = router;
