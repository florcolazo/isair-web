// ── Seguridad del login: captcha (Cloudflare Turnstile) + límite de intentos ──

const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Verifica con Cloudflare el token que manda el navegador en `captcha_token`.
// Sin TURNSTILE_SECRET (desarrollo local) se deja pasar con un aviso.
function captchaMiddleware(req, res, next) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    if (!captchaMiddleware.avisado) {
      console.warn('⚠️  TURNSTILE_SECRET no configurado: el login no verifica captcha');
      captchaMiddleware.avisado = true;
    }
    return next();
  }

  const token = req.body?.captcha_token;
  if (!token) {
    return res.status(400).json({ error: 'Completá la verificación de seguridad' });
  }

  const body = new URLSearchParams({ secret, response: token, remoteip: req.ip || '' });
  fetch(TURNSTILE_URL, { method: 'POST', body })
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        return res.status(400).json({ error: 'La verificación de seguridad falló, probá de nuevo' });
      }
      next();
    })
    .catch(() => res.status(503).json({ error: 'No se pudo verificar el captcha, probá en un momento' }));
}

// Bloquea una IP después de `max` logins fallidos dentro de `ventanaMs`.
// En memoria: alcanza para un solo proceso; se reinicia con el servidor.
function crearLimiteLogin({ max = 5, ventanaMs = 15 * 60 * 1000, ahora = Date.now } = {}) {
  const fallos = new Map(); // ip → { n, desde }

  function vigente(ip) {
    const f = fallos.get(ip);
    if (f && ahora() - f.desde > ventanaMs) {
      fallos.delete(ip);
      return null;
    }
    return f;
  }

  function middleware(req, res, next) {
    const f = vigente(req.ip);
    if (f && f.n >= max) {
      const min = Math.ceil((f.desde + ventanaMs - ahora()) / 60000);
      res.set('Retry-After', String(min * 60));
      return res.status(429).json({ error: `Demasiados intentos fallidos. Probá de nuevo en ${min} min.` });
    }
    next();
  }

  middleware.fallo = ip => {
    const f = vigente(ip) || { n: 0, desde: ahora() };
    f.n += 1;
    fallos.set(ip, f);
  };
  middleware.exito = ip => fallos.delete(ip);

  return middleware;
}

module.exports = { captchaMiddleware, crearLimiteLogin };
