/* ============================================================
   INTERNET SERVICES · Agencia San José
   buscador-direccion.js — Buscador de dirección del mapa de cobertura

   Sugerencias mientras se escribe (Google Places; si Google no
   responde, GeoRef + Photon/OpenStreetMap) y botón "Usar mi ubicación".
   Necesita en la página:
     #mapSearch      → <input> donde se escribe la dirección
     #mapSearchList  → <ul> donde aparecen las sugerencias
     #mapLocate      → botón de ubicación actual
     #mapSearchClear → (opcional) botón para borrar lo escrito
     #mapSearchMsg   → (opcional) mensaje de error / estado
   ============================================================ */

// Key de Google Maps: vive en config-google.js (ver config-google.example.js).
// Si no está, se usan GeoRef y OpenStreetMap.
let GOOGLE_MAPS_KEY = '';
const keyCargada = import('./config-google.js?v=2')
  .then(m => { GOOGLE_MAPS_KEY = m.GOOGLE_MAPS_KEY || ''; })
  .catch(() => {});

// Rectángulo alrededor de San José, Entre Ríos: solo se sugieren direcciones de acá
const ZONA = { north: -32.13, south: -32.29, east: -58.10, west: -58.32 };
const CENTRO = { lat: -32.2074, lng: -58.2045 };

const ICONO_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

// "Moreno 2425" con lo escrito ("more") en negrita, sin meter HTML ajeno en la página
function resaltar(el, texto, buscado) {
  const i = texto.toLowerCase().indexOf(buscado.toLowerCase());
  if (!buscado || i < 0) { el.textContent = texto; return; }
  const b = document.createElement('b');
  b.textContent = texto.slice(i, i + buscado.length);
  el.append(texto.slice(0, i), b, texto.slice(i + buscado.length));
}

/**
 * Conecta el buscador. `onUbicacion(lat, lng)` se llama al elegir una dirección
 * o al usar la ubicación actual.
 */
export function iniciarBuscador(onUbicacion) {
  const input = document.getElementById('mapSearch');
  const lista = document.getElementById('mapSearchList');
  const btnUbicacion = document.getElementById('mapLocate');
  const msg = document.getElementById('mapSearchMsg');
  const btnBorrar = document.getElementById('mapSearchClear');
  if (!input || !lista) return;

  let sugerencias = [];   // [{ principal, secundario, ubicar: () => Promise<{lat,lng}> }]
  let activa = -1;        // sugerencia marcada con las flechas
  let busqueda = 0;       // descarta respuestas viejas si el usuario siguió escribiendo
  let timer = null;

  const mostrarMsg = (texto) => {
    if (!msg) return;
    msg.textContent = texto || '';
    msg.hidden = !texto;
  };

  const cerrar = () => {
    lista.hidden = true;
    lista.innerHTML = '';
    activa = -1;
    input.setAttribute('aria-expanded', 'false');
  };

  const pintar = () => {
    lista.innerHTML = '';
    if (!sugerencias.length) {
      const li = document.createElement('li');
      li.className = 'map-search-empty';
      li.textContent = 'No encontramos esa dirección en San José';
      lista.appendChild(li);
    }
    sugerencias.forEach((s, i) => {
      const li = document.createElement('li');
      li.role = 'option';
      li.className = i === activa ? 'activa' : '';
      li.innerHTML = `<span class="map-search-pin">${ICONO_PIN}</span><span class="map-search-texto"><strong></strong><small></small></span>`;
      resaltar(li.querySelector('strong'), s.principal, input.value.trim().split(',')[0]);
      li.querySelector('small').textContent = s.secundario;
      // mousedown y no click: el blur del input cerraría la lista antes del click
      li.addEventListener('mousedown', e => { e.preventDefault(); elegir(i); });
      lista.appendChild(li);
    });
    lista.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  const elegir = async (i) => {
    const s = sugerencias[i];
    if (!s) return;
    input.value = s.secundario ? `${s.principal}, ${s.secundario}` : s.principal;
    actualizarBorrar();
    cerrar();
    mostrarMsg('');
    try {
      const { lat, lng } = await s.ubicar();
      onUbicacion(lat, lng);
    } catch {
      mostrarMsg('No pudimos ubicar esa dirección. Probá tocando tu casa en el mapa.');
    }
  };

  const actualizarBorrar = () => { if (btnBorrar) btnBorrar.hidden = !input.value; };

  btnBorrar?.addEventListener('click', () => {
    input.value = '';
    actualizarBorrar();
    cerrar();
    mostrarMsg('');
    input.focus();
  });

  input.addEventListener('input', () => {
    clearTimeout(timer);
    actualizarBorrar();
    mostrarMsg('');
    const texto = input.value.trim();
    if (texto.length < 3) { cerrar(); return; }
    timer = setTimeout(async () => {
      const id = ++busqueda;
      const resultado = await buscarSugerencias(texto);
      if (id !== busqueda) return;
      sugerencias = resultado;
      activa = -1;
      pintar();
    }, 250);
  });

  input.addEventListener('keydown', (e) => {
    if (lista.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = sugerencias.length;
      if (!n) return;
      activa = e.key === 'ArrowDown' ? (activa + 1) % n : (activa - 1 + n) % n;
      pintar();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      elegir(activa >= 0 ? activa : 0);
    } else if (e.key === 'Escape') {
      cerrar();
    }
  });

  input.addEventListener('blur', cerrar);

  btnUbicacion?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      mostrarMsg('Tu navegador no permite obtener la ubicación. Escribí tu dirección.');
      return;
    }
    const esperando = (si) => {
      btnUbicacion.disabled = si;
      btnUbicacion.classList.toggle('cargando', si);
    };
    esperando(true);
    cerrar();
    mostrarMsg('');

    // La primera lectura suele ser por WiFi/IP (imprecisa): se escucha unos segundos
    // y se queda la más precisa, cortando antes si ya llegó una buena (GPS)
    let mejor = null;
    let terminado = false;
    const terminar = () => {
      if (terminado) return;
      terminado = true;
      navigator.geolocation.clearWatch(vigilancia);
      clearTimeout(limite);
      esperando(false);
      if (mejor) usarUbicacion(mejor);
    };
    const vigilancia = navigator.geolocation.watchPosition(({ coords }) => {
      if (!mejor || coords.accuracy < mejor.accuracy) mejor = coords;
      if (coords.accuracy <= PRECISION_BUENA) terminar();
    }, (err) => {
      if (mejor) return terminar();
      terminado = true;
      navigator.geolocation.clearWatch(vigilancia);
      clearTimeout(limite);
      esperando(false);
      mostrarMsg(err.code === err.PERMISSION_DENIED
        ? 'No diste permiso para usar tu ubicación. Podés escribir tu dirección.'
        : 'No pudimos obtener tu ubicación. Escribí tu dirección o tocá el mapa.');
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    const limite = setTimeout(() => {
      if (mejor) return terminar();
      // sin ninguna lectura todavía: se espera al timeout de watchPosition
    }, 10000);
  });

  const usarUbicacion = async ({ latitude: lat, longitude: lng, accuracy }) => {
    const enZona = lat <= ZONA.north && lat >= ZONA.south && lng <= ZONA.east && lng >= ZONA.west;
    if (!enZona) {
      // Pasa mucho en la compu: el navegador ubica por la IP del proveedor, que puede estar en otra ciudad
      mostrarMsg('Tu dispositivo nos da una ubicación fuera de San José (suele pasar en la compu). Escribí tu dirección o tocá tu casa en el mapa.');
      return;
    }
    onUbicacion(lat, lng);
    if (accuracy > PRECISION_ACEPTABLE) {
      input.value = '';
      actualizarBorrar();
      mostrarMsg(`Tu ubicación es aproximada (±${Math.round(accuracy)} m). Arrastrá el pin hasta tu casa o escribí tu dirección.`);
      return;
    }
    input.value = await direccionDe(lat, lng) || 'Mi ubicación';
    actualizarBorrar();
  };
}

// Precisión (en metros) de la ubicación del dispositivo
const PRECISION_BUENA = 25;        // con esto ya se deja de esperar (GPS)
const PRECISION_ACEPTABLE = 80;    // más que esto: se marca pero se avisa que es aproximada

// ── Google ─────────────────────────────────────────────
let googlePromesa = null;
let googleFalla = false;   // si Google falla una vez (o no hay key), se usa GeoRef/Photon el resto de la visita
const alFallarGoogle = new Set();

/** Avisa si Google rechaza la key (ej: dominio no autorizado) después de haber cargado. */
export function siGoogleFalla(fn) { alFallarGoogle.add(fn); }

/** Carga la API de Google Maps una sola vez (la usan el buscador y el mapa). */
export async function cargarGoogle() {
  await keyCargada;
  if (!GOOGLE_MAPS_KEY) {
    googleFalla = true;
    throw new Error('Sin key de Google Maps (falta config-google.js)');
  }
  if (!googlePromesa) {
    googlePromesa = new Promise((ok, falla) => {
      window.__buscadorGoogleListo = ok;
      // Google llama a esta función si la key no es válida para este dominio
      window.gm_authFailure = () => {
        googleFalla = true;
        alFallarGoogle.forEach(fn => fn());
      };
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&loading=async&language=es&region=AR&callback=__buscadorGoogleListo`;
      s.async = true;
      s.onerror = falla;
      document.head.appendChild(s);
    });
  }
  return googlePromesa;
}

let sessionToken = null;   // agrupa las sugerencias de una búsqueda en un solo cobro de Google

async function sugerenciasGoogle(texto) {
  await cargarGoogle();
  const { AutocompleteSuggestion, AutocompleteSessionToken } = await google.maps.importLibrary('places');
  sessionToken ??= new AutocompleteSessionToken();
  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input: texto,
    sessionToken,
    language: 'es',
    region: 'ar',
    includedRegionCodes: ['ar'],
    locationRestriction: ZONA,
    origin: CENTRO,
  });
  return suggestions
    .filter(s => s.placePrediction)
    .map(({ placePrediction: p }) => ({
      principal: p.mainText?.text || p.text.text,
      secundario: p.secondaryText?.text || '',
      ubicar: async () => {
        const place = p.toPlace();
        await place.fetchFields({ fields: ['location'] });
        sessionToken = null;   // la búsqueda terminó: la próxima usa otro token
        return { lat: place.location.lat(), lng: place.location.lng() };
      },
    }));
}

async function direccionGoogle(lat, lng) {
  await cargarGoogle();
  const { Geocoder } = await google.maps.importLibrary('geocoding');
  const { results } = await new Geocoder().geocode({ location: { lat, lng } });
  return results[0]?.formatted_address.replace(/, Argentina$/, '');
}

// ── Photon (OpenStreetMap), de respaldo ────────────────
const PHOTON = 'https://photon.komoot.io';
const BBOX = `${ZONA.west},${ZONA.south},${ZONA.east},${ZONA.north}`;

const textoPhoton = (p) => ({
  principal: [p.street || p.name, p.housenumber].filter(Boolean).join(' ') || p.name || 'Dirección',
  secundario: [p.city || p.locality || p.district, p.state].filter(Boolean).join(', '),
});

async function sugerenciasPhoton(texto) {
  const url = `${PHOTON}/api/?q=${encodeURIComponent(texto)}&bbox=${BBOX}&lat=${CENTRO.lat}&lon=${CENTRO.lng}&limit=6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Photon ${res.status}`);
  const { features } = await res.json();
  return features.map(f => {
    const [lng, lat] = f.geometry.coordinates;
    return { ...textoPhoton(f.properties), ubicar: async () => ({ lat, lng }) };
  });
}

async function direccionPhoton(lat, lng) {
  const res = await fetch(`${PHOTON}/reverse?lat=${lat}&lon=${lng}&limit=1`);
  const { features } = await res.json();
  if (!features?.length) return null;
  const { principal, secundario } = textoPhoton(features[0].properties);
  return secundario ? `${principal}, ${secundario}` : principal;
}

// ── GeoRef (Gobierno argentino), de respaldo ───────────
// Tiene la numeración de las calles de San José, que a OpenStreetMap le falta
const GEOREF = 'https://apis.datos.gob.ar/georef/api/direcciones';
const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y']);

const nombrePropio = (texto) => texto.toLowerCase().split(' ')
  .map((p, i) => i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

async function sugerenciasGeoRef(texto) {
  if (!/\d/.test(texto)) return [];   // GeoRef busca direcciones con número, no calles sueltas
  const params = new URLSearchParams({
    direccion: texto.split(',')[0],   // "Moreno 2425, San José" → "Moreno 2425"
    provincia: 'entre rios',
    localidad: 'san jose',
    max: '5',
  });
  const res = await fetch(`${GEOREF}?${params}`);
  if (!res.ok) throw new Error(`GeoRef ${res.status}`);
  const { direcciones } = await res.json();
  const vistas = new Set();
  return direcciones
    .filter(d => d.ubicacion?.lat != null)
    .map(d => ({
      principal: `${nombrePropio(d.calle.nombre)} ${d.altura.valor ?? ''}`.trim(),
      secundario: `${d.localidad_censal.nombre}, ${d.provincia.nombre}`,
      ubicar: async () => ({ lat: d.ubicacion.lat, lng: d.ubicacion.lon }),
    }))
    // GeoRef a veces devuelve la misma dirección varias veces (una por tramo de calle)
    .filter(s => !vistas.has(s.principal) && vistas.add(s.principal));
}

// ── Elegir proveedor ───────────────────────────────────
async function buscarSugerencias(texto) {
  if (!googleFalla) {
    try {
      const r = await sugerenciasGoogle(texto);
      if (!googleFalla) return r;
    } catch (e) {
      console.warn('Google Places no respondió, se usa OpenStreetMap:', e);
      googleFalla = true;
    }
  }
  // GeoRef primero (tiene la numeración); Photon completa con lo que falte
  const [georef, photon] = await Promise.all([
    sugerenciasGeoRef(texto).catch(() => []),
    sugerenciasPhoton(texto).catch(() => []),
  ]);
  const vistas = new Set(georef.map(s => s.principal.toLowerCase()));
  return [...georef, ...photon.filter(s => !vistas.has(s.principal.toLowerCase()))].slice(0, 6);
}

async function direccionDe(lat, lng) {
  if (!googleFalla) {
    try { return await direccionGoogle(lat, lng); }
    catch { /* sigue con Photon */ }
  }
  try { return await direccionPhoton(lat, lng); }
  catch { return null; }
}
