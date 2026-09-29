/* ============================================================
   INTERNET SERVICES · Agencia San José
   mapa-cobertura.js — Mapa de cobertura (inicio y cobertura.html)

   Necesita Leaflet cargado antes y un <div id="map">.
   Atributo opcional en #map:
     data-planes-fibra  → link del botón cuando hay fibra (default "index.html#fibra")
   Si la página tiene la tarjeta #coverageResult, también se actualiza.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { agregarVistas } from "./vistas-mapa.js?v=1.0.0";

const firebaseConfig = {
  apiKey: "AIzaSyCGHZLbAnFb4SpX9XqSEmIyLN0B7703U4A",
  authDomain: "agencia-sanjose.firebaseapp.com",
  projectId: "agencia-sanjose",
  storageBucket: "agencia-sanjose.firebasestorage.app",
  messagingSenderId: "522690203802",
  appId: "1:522690203802:web:5ffecbd5312c683b700f23",
  measurementId: "G-FZQDMFKMDT"
};

// San José, Entre Ríos
const SAN_JOSE_CENTER = [-32.2074, -58.2045];
const SAN_JOSE_ZOOM   = 13;
// Frontera de latitud que separa San José de otras agencias en la misma colección
const LAT_LIMITE_SAN_JOSE = -32.38;

// Colores por tipo de servicio
const COLORES = {
  'fibra':       '#0072ff',
  'inalambrica': '#28a745',
  'tv':          '#e62a22',
  'completa':    '#6f42c1',
};

const mapEl = document.getElementById('map');
const LINK_PLANES_FIBRA = mapEl.dataset.planesFibra || 'index.html#fibra';

// ── Inicializar mapa ─────────────────────────────────
const map = L.map(mapEl, {
  center: SAN_JOSE_CENTER,
  zoom: SAN_JOSE_ZOOM,
  zoomControl: true,
});

agregarVistas(map);

// Marcador de la casa
let casaMarker = null;
// Capas de zonas
let zonasLayers = [];

// ── Cargar zonas desde Firebase ──────────────────────
const db = getFirestore(initializeApp(firebaseConfig));

onSnapshot(collection(db, 'zonas_cobertura'), (snapshot) => {
  zonasLayers.forEach(l => map.removeLayer(l));
  zonasLayers = [];

  snapshot.forEach((doc) => {
    const zona = doc.data();
    if (!zona.geojson) return;
    if (zona.agencia === 'cdelu') return;

    let geojson;
    try { geojson = typeof zona.geojson === 'string' ? JSON.parse(zona.geojson) : zona.geojson; }
    catch (e) { return; }

    // Ignorar zonas de otras agencias (más al sur de San José)
    const lat = primerPuntoLat(geojson.geometry || geojson);
    if (lat !== null && lat < LAT_LIMITE_SAN_JOSE) return;

    const color = COLORES[zona.tipo] || '#0072ff';
    const layer = L.geoJSON(geojson, {
      interactive: false, // el clic lo recibe el mapa para marcar la casa
      style: {
        color:       color,
        fillColor:   color,
        fillOpacity: 0.3,
        weight:      2.5,
        opacity:     0.9,
      }
    }).addTo(map);
    layer.tipoZona   = zona.tipo;
    layer.nombreZona = zona.nombre || 'Fibra Óptica';

    zonasLayers.push(layer);
  });
}, (error) => {
  console.warn("Firestore snapshot error:", error);
});

function primerPuntoLat(geometry) {
  let c = geometry?.coordinates;
  if (!c) return null;
  while (Array.isArray(c) && Array.isArray(c[0])) c = c[0];
  return Array.isArray(c) ? parseFloat(c[1]) : null;
}

// ── Marcar la casa (clic o arrastre del marcador) ──
// color explícito: Leaflet pinta de azul todos los links dentro del mapa
const ESTILO_BTN = 'display:inline-block; margin-top:8px; padding: 6px 14px; font-size: 12px; color:#fff;';

function marcarPunto(lat, lon) {
  if (!casaMarker) {
    casaMarker = L.marker([lat, lon], { draggable: true }).addTo(map);
    casaMarker.on('dragend', () => {
      const p = casaMarker.getLatLng();
      marcarPunto(p.lat, p.lng);
    });
  } else {
    casaMarker.setLatLng([lat, lon]);
  }

  const zona = zonaFibraEn(lat, lon);
  const boton = zona
    ? `<a href="${LINK_PLANES_FIBRA}" class="btn btn-red" style="${ESTILO_BTN}">Ver planes de Fibra</a>`
    : `<a href="contacto.html" class="btn btn-red" style="${ESTILO_BTN}">Consultar</a>`;
  const resumen = zona
    ? `✅ <strong>¡Tenés Fibra Óptica!</strong><br>Zona: ${zona}`
    : '📶 Fibra no confirmada acá.<br>Tenés servicio <strong>inalámbrico</strong>.';

  casaMarker.bindPopup(`<div style="font-family:'Inter',sans-serif; font-size:13px; line-height:1.5;"><strong>Tu casa</strong><br>${resumen}<br>${boton}<br><em style="color:#888; font-size:11px;">Podés arrastrar el marcador para ajustarlo.</em></div>`).openPopup();

  if (zona) {
    mostrarResultado(true, '¡Tenemos cobertura en tu zona!', `Tu casa está dentro de la zona <strong>${zona}</strong>.<br>` + boton);
  } else {
    mostrarResultado(false, 'Consultar por opciones disponibles', 'No confirmamos fibra en esta ubicación, pero el servicio inalámbrico cubre toda el área.<br>' + boton);
  }
}

map.on('click', e => marcarPunto(e.latlng.lat, e.latlng.lng));

// Ray casting: ¿el punto [lon,lat] está dentro del anillo?
function puntoEnAnillo(punto, anillo) {
  const [x, y] = punto;
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    const cruza = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

function puntoEnPoligono(punto, coordsPoligono) {
  if (!puntoEnAnillo(punto, coordsPoligono[0])) return false;
  for (let i = 1; i < coordsPoligono.length; i++) {
    if (puntoEnAnillo(punto, coordsPoligono[i])) return false; // agujero
  }
  return true;
}

// Nombre de la zona de fibra que contiene el punto, o null
function zonaFibraEn(lat, lon) {
  const punto = [lon, lat];
  for (const layer of zonasLayers) {
    if (layer.tipoZona !== 'fibra') continue;
    const dentro = layer.toGeoJSON().features.some(({ geometry: g }) => {
      if (!g) return false;
      if (g.type === 'Polygon') return puntoEnPoligono(punto, g.coordinates);
      if (g.type === 'MultiPolygon') return g.coordinates.some(p => puntoEnPoligono(punto, p));
      return false;
    });
    if (dentro) return layer.nombreZona;
  }
  return null;
}

// Tarjeta de resultado debajo del título (solo si la página la tiene)
function mostrarResultado(tiene, titulo, texto) {
  const result = document.getElementById('coverageResult');
  if (!result) return;

  document.getElementById('resultIcon').textContent  = tiene ? '✅' : '❌';
  document.getElementById('resultTitle').textContent = titulo;
  document.getElementById('resultText').innerHTML    = texto;
  document.getElementById('resultCard').className    = 'result-card ' + (tiene ? 'tiene' : 'no-tiene');
  result.classList.add('visible');
}
