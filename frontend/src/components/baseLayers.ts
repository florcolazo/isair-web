import L from 'leaflet';
import GoogleMutant from 'leaflet.gridlayer.googlemutant/src/Leaflet.GoogleMutant.mjs';
import { GOOGLE_KEY, authFailureHandlers, loadGoogleMaps } from '../googleMaps';

function osmLayer(maxZoom: number) {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom,
  });
}

/**
 * Agrega el mapa base: Google Maps (Mapa / Satélite) si hay VITE_GOOGLE_MAPS_KEY,
 * o OpenStreetMap si no hay key o Google falla.
 */
export function addBaseLayers(map: L.Map, maxZoom = 20) {
  if (!GOOGLE_KEY) {
    osmLayer(maxZoom).addTo(map);
    return;
  }

  // OSM se muestra mientras carga Google, así el mapa nunca queda en blanco
  const fallback = osmLayer(maxZoom).addTo(map);
  let control: L.Control.Layers | null = null;
  let google: L.GridLayer[] = [];

  const useFallback = () => {
    google.forEach(l => map.removeLayer(l));
    control?.remove();
    if (!map.hasLayer(fallback)) fallback.addTo(map);
  };
  let removed = false;
  authFailureHandlers.add(useFallback);
  map.on('unload', () => {
    removed = true;
    authFailureHandlers.delete(useFallback);
  });

  loadGoogleMaps()
    .then(() => {
      // El mapa pudo haberse desmontado mientras cargaba el script
      if (removed) return;

      const roadmap   = new GoogleMutant({ type: 'roadmap', maxZoom });
      const satellite = new GoogleMutant({ type: 'hybrid', maxZoom });
      google = [roadmap, satellite];

      map.removeLayer(fallback);
      roadmap.addTo(map);
      control = L.control.layers({ 'Mapa': roadmap, 'Satélite': satellite }, undefined, {
        position: 'topright',
      }).addTo(map);
    })
    .catch((err) => {
      console.warn('Google Maps no disponible, se usa OpenStreetMap:', err);
    });
}
