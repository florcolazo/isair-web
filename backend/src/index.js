require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/auth');
const agenciasRoutes = require('./routes/agencias');
const adminRoutes    = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS: permitir GitHub Pages y localhost ───────────────────
const ALLOWED_ORIGINS = [
  'https://issanjose.com.ar',
  'https://www.issanjose.com.ar',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  // Agregar dominios de agencias nuevas acá:
  // 'https://isconcepcion.com.ar',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, etc.)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' })); // 2mb para GeoJSONs grandes

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/agencias', agenciasRoutes);
app.use('/api/admin',    adminRoutes);

// ── Error handler ─────────────────────────────────────────────
const { initDB } = require('./db');

// ── Inicializar DB y servidor ─────────────────────────────────
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 ISAIR API corriendo en puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error al arrancar:', err);
    process.exit(1);
  }
}

start();
