const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function superadminMiddleware(req, res, next) {
  if (!req.user?.es_superadmin) {
    return res.status(403).json({ error: 'Solo superadmin puede realizar esta acción' });
  }
  next();
}

module.exports = { authMiddleware, superadminMiddleware };
