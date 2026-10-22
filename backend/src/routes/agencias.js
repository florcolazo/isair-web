const express  = require('express');
const crypto   = require('crypto');
const { getDB } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { normalizeBannerLink } = require('../banner-links');
const { detectZone } = require('../coverage');

const router = express.Router();

// ── Precios ───────────────────────────────────────────────────

// GET /api/agencias/:id/precios  (público — el frontend lo consume)
router.get('/:id/precios', async (req, res) => {
  const db = getDB();
  const row = await db.get('SELECT * FROM precios WHERE agencia_id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Agencia no encontrada' });
  const { agencia_id, updated_at, ...precios } = row;
  res.json(precios);
});

// PUT /api/agencias/:id/precios  (requiere JWT de esa agencia o superadmin)
router.put('/:id/precios', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { agencia_id: tokenAgencia, es_superadmin } = req.user;

  if (!es_superadmin && tokenAgencia !== id) {
    return res.status(403).json({ error: 'No tenés permiso para editar esta agencia' });
  }

  const { fibra_300, fibra_istv_move, fibra_istv_full, fibra_iscam, inalambrica_15 } = req.body;
  const db = getDB();
  
  await db.run(`
    INSERT INTO precios (agencia_id, fibra_300, fibra_istv_move, fibra_istv_full, fibra_iscam, inalambrica_15, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(agencia_id) DO UPDATE SET
      fibra_300       = excluded.fibra_300,
      fibra_istv_move = excluded.fibra_istv_move,
      fibra_istv_full = excluded.fibra_istv_full,
      fibra_iscam     = excluded.fibra_iscam,
      inalambrica_15  = excluded.inalambrica_15,
      updated_at      = excluded.updated_at
  `, [id, fibra_300, fibra_istv_move, fibra_istv_full, fibra_iscam, inalambrica_15]);

  res.json({ ok: true });
});

// ── Cobertura ─────────────────────────────────────────────────

async function loadCoverage(agenciaId) {
  const db = getDB();
  const row = await db.get('SELECT geojson FROM coverage WHERE agencia_id = ?', [agenciaId]);
  return row ? JSON.parse(row.geojson) : { type: 'FeatureCollection', features: [] };
}

// GET /api/agencias/:id/coverage/check?lat=..&lng=..  (público — solo dice qué zona hay, no las zonas)
router.get('/:id/coverage/check', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'lat y lng son requeridos' });
  }
  try {
    const { features = [] } = await loadCoverage(req.params.id);
    res.json({ zona: detectZone(lat, lng, features) });
  } catch {
    res.status(500).json({ error: 'GeoJSON corrupto' });
  }
});

// GET /api/agencias/:id/coverage  (requiere JWT — lo usa el editor de cobertura)
router.get('/:id/coverage', authMiddleware, async (req, res) => {
  const { agencia_id: tokenAgencia, es_superadmin } = req.user;
  if (!es_superadmin && tokenAgencia !== req.params.id) {
    return res.status(403).json({ error: 'No tenés permiso para ver esta agencia' });
  }

  const db = getDB();
  const row = await db.get('SELECT * FROM coverage WHERE agencia_id = ?', [req.params.id]);
  if (!row) {
    // Devolver FeatureCollection vacío si no hay datos aún
    return res.json({ type: 'FeatureCollection', features: [] });
  }
  try {
    res.json(JSON.parse(row.geojson));
  } catch {
    res.status(500).json({ error: 'GeoJSON corrupto' });
  }
});

// PUT /api/agencias/:id/coverage  (requiere JWT)
router.put('/:id/coverage', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { agencia_id: tokenAgencia, es_superadmin } = req.user;

  if (!es_superadmin && tokenAgencia !== id) {
    return res.status(403).json({ error: 'No tenés permiso para editar esta agencia' });
  }

  const geojson = req.body;
  if (!geojson?.type) {
    return res.status(400).json({ error: 'GeoJSON inválido' });
  }

  const db = getDB();
  await db.run(`
    INSERT INTO coverage (agencia_id, geojson, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(agencia_id) DO UPDATE SET
      geojson    = excluded.geojson,
      updated_at = excluded.updated_at
  `, [id, JSON.stringify(geojson)]);
  
  res.json({ ok: true });
});

// ── Banners (Slider) ──────────────────────────────────────────

// GET /api/agencias/:id/banners
router.get('/:id/banners', async (req, res) => {
  const db = getDB();
  const rows = await db.all('SELECT id, imagen, enlace FROM banners WHERE agencia_id = ? ORDER BY orden ASC, created_at ASC', [req.params.id]);
  res.json(rows);
});

// POST /api/agencias/:id/banners (subir imagen base64)
router.post('/:id/banners', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { agencia_id: tokenAgencia, es_superadmin } = req.user;

  if (!es_superadmin && tokenAgencia !== id) {
    return res.status(403).json({ error: 'No tenés permiso para editar esta agencia' });
  }

  const { imagen, enlace } = req.body;
  if (!imagen || !imagen.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Formato de imagen inválido' });
  }

  const db = getDB();
  const bannerId = crypto.randomUUID();
  await db.run(
    'INSERT INTO banners (id, agencia_id, imagen, enlace) VALUES (?, ?, ?, ?)',
    [bannerId, id, imagen, normalizeBannerLink(enlace)]
  );
  
  res.json({ ok: true, id: bannerId });
});

// DELETE /api/agencias/:id/banners/:bannerId
router.delete('/:id/banners/:bannerId', authMiddleware, async (req, res) => {
  const { id, bannerId } = req.params;
  const { agencia_id: tokenAgencia, es_superadmin } = req.user;

  if (!es_superadmin && tokenAgencia !== id) {
    return res.status(403).json({ error: 'No tenés permiso' });
  }

  const db = getDB();
  await db.run('DELETE FROM banners WHERE id = ? AND agencia_id = ?', [bannerId, id]);
  res.json({ ok: true });
});

module.exports = router;
