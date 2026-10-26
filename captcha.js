/* ---------- Captcha (Cloudflare Turnstile) ----------
 * Se agrega solo a cada <form data-captcha>: muestra el desafío arriba del
 * botón de enviar y no deja enviar el formulario hasta resolverlo.
 * Los formularios públicos abren WhatsApp (no hay servidor que reciba los datos),
 * así que acá el captcha frena envíos automáticos desde el navegador.
 *
 * Reemplazar TURNSTILE_SITEKEY por la clave del sitio de Cloudflare
 * (dash.cloudflare.com → Turnstile → Add site → issanjose.com.ar).
 * Clave del widget "Internet Services San José".
 */
// En la compu (localhost) Cloudflare no acepta la clave real: se usa la de prueba, que siempre aprueba
const ES_LOCAL = ['localhost', '127.0.0.1', ''].includes(location.hostname);
window.TURNSTILE_SITEKEY = window.TURNSTILE_SITEKEY ||
  (ES_LOCAL ? '1x00000000000000000000AA' : '0x4AAAAAAFnPe-mjY_G23h6R');

(function () {
  const estilos = document.createElement('style');
  estilos.textContent =
    '.captcha-box { margin: 14px 0 4px; min-height: 65px; }' +
    '.captcha-error { margin: 6px 0 0; color: #c41f18; font-size: 13.5px; font-weight: 600; }' +
    '.captcha-error[hidden] { display: none; }';
  document.head.appendChild(estilos);

  const pendientes = [];
  let listo = false;

  // Turnstile llama a esta función cuando terminó de cargar
  window.onTurnstileListo = function () {
    listo = true;
    pendientes.splice(0).forEach(fn => fn());
  };
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileListo';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  function cuandoEsteListo(fn) {
    if (listo) fn(); else pendientes.push(fn);
  }

  // Dibuja el captcha en `contenedor`; devuelve funciones para leer el token y reiniciarlo
  window.crearCaptcha = function (contenedor, alResolver) {
    let id = null;
    cuandoEsteListo(() => {
      id = turnstile.render(contenedor, {
        sitekey: window.TURNSTILE_SITEKEY,
        language: 'es',
        theme: 'light',
        size: 'flexible',
        callback: () => alResolver && alResolver(),
      });
    });
    return {
      token: () => (id !== null ? turnstile.getResponse(id) : '') || '',
      reiniciar: () => { if (id !== null) turnstile.reset(id); },
    };
  };

  function protegerFormulario(form) {
    const caja = document.createElement('div');
    caja.className = 'captcha-box';
    const error = document.createElement('p');
    error.className = 'captcha-error';
    error.hidden = true;
    error.textContent = 'Completá la verificación de seguridad para continuar.';

    const boton = form.querySelector('[type="submit"]');
    if (boton) {
      boton.before(caja, error);
    } else {
      form.append(caja, error);
    }

    const captcha = window.crearCaptcha(caja, () => { error.hidden = true; });

    // Fase de captura: corre antes que el envío propio de cada página
    form.addEventListener('submit', e => {
      if (!captcha.token()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        error.hidden = false;
        return;
      }
      // El token sirve una sola vez: se pide uno nuevo para el próximo envío
      setTimeout(captcha.reiniciar, 0);
    }, true);
  }

  function iniciar() {
    document.querySelectorAll('form[data-captcha]').forEach(protegerFormulario);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
