import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Captcha de Cloudflare Turnstile. La clave del sitio va en VITE_TURNSTILE_SITEKEY.
// En localhost (o sin clave) se usa la de prueba de Cloudflare, que siempre aprueba:
// Cloudflare no acepta localhost como dominio de la clave real.
const CLAVE_PRUEBA = '1x00000000000000000000AA';
const ES_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const SITEKEY = (!ES_LOCAL && import.meta.env.VITE_TURNSTILE_SITEKEY) || CLAVE_PRUEBA;
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi }
}

let cargando: Promise<TurnstileApi> | null = null;
function cargarTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!cargando) {
    cargando = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_URL;
      s.async = true;
      s.onload = () => resolve(window.turnstile!);
      s.onerror = () => { cargando = null; reject(new Error('No se pudo cargar el captcha')); };
      document.head.appendChild(s);
    });
  }
  return cargando;
}

export type TurnstileHandle = { reset: () => void };

type Props = { onToken: (token: string) => void };

const Turnstile = forwardRef<TurnstileHandle, Props>(({ onToken }, ref) => {
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current('');
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    let cancelado = false;
    cargarTurnstile().then(ts => {
      if (cancelado || !box.current) return;
      widgetId.current = ts.render(box.current, {
        sitekey: SITEKEY,
        language: 'es',
        theme: 'light',
        size: 'flexible',
        callback: (t: string) => onTokenRef.current(t),
        'expired-callback': () => onTokenRef.current(''),
        'error-callback': () => onTokenRef.current(''),
      });
    }).catch(() => {});
    return () => {
      cancelado = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  return <div ref={box} style={{ minHeight: 65 }} />;
});

export default Turnstile;
