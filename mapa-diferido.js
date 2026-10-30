/* ---------- Carga diferida del mapa de cobertura (inicio) ----------
 * Leaflet, Google Maps y Firebase pesan mucho para el celular, así que recién
 * se piden con la primera interacción (tocar, escribir, desplazarse). Mientras
 * tanto #map muestra el botón #mapFacade.
 */
(function () {
  const EVENTOS = ['pointerdown', 'touchstart', 'mousemove', 'keydown', 'scroll'];
  const facade = document.getElementById('mapFacade');
  const input = document.getElementById('mapSearch');
  const btnUbicacion = document.getElementById('mapLocate');

  let cargando = null;
  let listo = false;
  let ubicacionPendiente = false;

  function cargarCss(href) {
    return new Promise((ok, falla) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = ok;
      link.onerror = falla;
      document.head.appendChild(link);
    });
  }

  function cargarScript(src) {
    return new Promise((ok, falla) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = ok;
      script.onerror = falla;
      document.head.appendChild(script);
    });
  }

  function cargar() {
    if (cargando) return cargando;
    EVENTOS.forEach(ev => window.removeEventListener(ev, cargar, true));
    facade.querySelector('span').textContent = 'Cargando mapa…';

    cargando = Promise.all([
      cargarCss('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'),
      cargarScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
        .then(() => cargarScript('https://unpkg.com/leaflet.gridlayer.googlemutant@0.16.0/dist/Leaflet.GoogleMutant.js')),
    ])
      .then(() => import('./mapa-cobertura.js?v=1.1.4'))
      .then(() => {
        listo = true;
        facade.remove();
        // Lo que la persona hizo mientras cargaba
        if (input.value) input.dispatchEvent(new Event('input'));
        if (ubicacionPendiente) btnUbicacion.click();
      })
      .catch(err => {
        console.warn('No se pudo cargar el mapa:', err);
        facade.querySelector('span').textContent = 'No se pudo cargar. Tocá para reintentar';
        cargando = null;
      });
    return cargando;
  }

  EVENTOS.forEach(ev => window.addEventListener(ev, cargar, { capture: true, passive: true }));
  facade.addEventListener('click', cargar);
  btnUbicacion.addEventListener('click', () => {
    if (listo) return;
    ubicacionPendiente = true;
    cargar();
  });

  if (location.hash === '#verificar') cargar();
})();
