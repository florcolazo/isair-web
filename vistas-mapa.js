/* ============================================================
   INTERNET SERVICES · Agencia San José
   vistas-mapa.js — Vistas del mapa (calles, satélite, relieve)
   Las usan el mapa de cobertura del sitio y el del admin.
   ============================================================ */

const ESRI_ATTR = 'Imágenes © <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics';

// Esri no tiene fotos más cercanas que el nivel 18 en San José: más allá se amplía esa
const esri = (servicio, opciones = {}) => L.tileLayer(
  `https://server.arcgisonline.com/ArcGIS/rest/services/${servicio}/MapServer/tile/{z}/{y}/{x}`,
  { maxNativeZoom: 18, maxZoom: 19, ...opciones }
);

/**
 * Agrega el selector de vistas al mapa.
 * @param {L.Map} map
 * @param {string} inicial  'calles' | 'satelite' | 'sateliteCalles' | 'relieve'
 */
export function agregarVistas(map, inicial = 'calles') {
  const vistas = {
    calles: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }),
    satelite: esri('World_Imagery', { attribution: ESRI_ATTR }),
    // Foto satelital + nombres de calles y lugares encima
    sateliteCalles: L.layerGroup([
      esri('World_Imagery', { attribution: ESRI_ATTR }),
      esri('Reference/World_Transportation'),
      esri('Reference/World_Boundaries_and_Places'),
    ]),
    relieve: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, © <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxNativeZoom: 17,
      maxZoom: 19,
    }),
  };

  vistas[inicial].addTo(map);
  L.control.layers({
    '🗺️ Calles': vistas.calles,
    '🛰️ Satélite': vistas.satelite,
    '🛰️ Satélite con calles': vistas.sateliteCalles,
    '⛰️ Relieve': vistas.relieve,
  }, null, {
    collapsed: window.innerWidth < 600, // en el celular queda como ícono para no tapar el mapa
    position: 'topright',
  }).addTo(map);
}
