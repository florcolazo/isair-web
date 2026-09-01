const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt   = require('bcryptjs');
const path     = require('path');
const fs       = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'isair.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let dbInstance = null;

async function initDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Habilitar WAL y foreign keys
  await dbInstance.exec('PRAGMA journal_mode = WAL;');
  await dbInstance.exec('PRAGMA foreign_keys = ON;');

  // ── Crear tablas ──────────────────────────────────────────────
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS agencias (
      id            TEXT PRIMARY KEY,
      nombre        TEXT NOT NULL,
      ciudad        TEXT NOT NULL,
      dominio       TEXT,
      password_hash TEXT NOT NULL,
      es_superadmin INTEGER DEFAULT 0,
      activa        INTEGER DEFAULT 1,
      created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS precios (
      agencia_id      TEXT PRIMARY KEY,
      fibra_300       INTEGER DEFAULT 0,
      fibra_istv_move INTEGER DEFAULT 0,
      fibra_istv_full INTEGER DEFAULT 0,
      fibra_iscam     INTEGER DEFAULT 0,
      inalambrica_15  INTEGER DEFAULT 0,
      updated_at      TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agencia_id) REFERENCES agencias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coverage (
      agencia_id TEXT PRIMARY KEY,
      geojson    TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agencia_id) REFERENCES agencias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS banners (
      id         TEXT PRIMARY KEY,
      agencia_id TEXT NOT NULL,
      imagen     TEXT NOT NULL,
      orden      INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agencia_id) REFERENCES agencias(id) ON DELETE CASCADE
    );
  `);

  // ── Seed: crear superadmin si no existe ──────────────────────
  const SUPERADMIN_PWD = process.env.SUPERADMIN_PASSWORD || 'admin1234';
  const existing = await dbInstance.get('SELECT id FROM agencias WHERE id = ?', ['superadmin']);
  
  if (!existing) {
    const hash = bcrypt.hashSync(SUPERADMIN_PWD, 10);
    await dbInstance.run(`
      INSERT INTO agencias (id, nombre, ciudad, dominio, password_hash, es_superadmin)
      VALUES (?, ?, ?, ?, ?, 1)
    `, ['superadmin', 'Super Admin', 'ISAIR Central', null, hash]);

    // Precios vacíos para superadmin
    await dbInstance.run('INSERT INTO precios (agencia_id) VALUES (?)', ['superadmin']);
    console.log('✅ Superadmin creado (id: superadmin, pwd: ' + SUPERADMIN_PWD + ')');
  }

  return dbInstance;
}

function getDB() {
  if (!dbInstance) throw new Error("DB no inicializada");
  return dbInstance;
}

module.exports = { initDB, getDB };

