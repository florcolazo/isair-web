import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './CoverageMap.module.css';

// Fix default Leaflet marker icon path issue with Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  markerLat?: number | null;
  markerLng?: number | null;
}

const ZONE_STYLES: Record<string, L.PathOptions> = {
  fibra:       { color: '#10b950', fillColor: '#10b950', fillOpacity: 0.18, weight: 2.5 },
  inalambrica: { color: '#0072ff', fillColor: '#0072ff', fillOpacity: 0.14, weight: 2   },
};

const CENTER: L.LatLngTuple = [-32.185, -58.174];

export default function CoverageMap({ markerLat, markerLng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markerRef    = useRef<L.Marker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: CENTER,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Load coverage zones
    fetch('/coverage.geojson')
      .then(r => r.json())
      .then((gj) => {
        L.geoJSON(gj, {
          style: (feature) => {
            const zona = feature?.properties?.zona as string;
            return ZONE_STYLES[zona] ?? { color: '#888', fillOpacity: 0.1, weight: 2 };
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties;
            layer.bindPopup(
              `<strong>${p.nombre}</strong><br/><span style="font-size:12px;color:#555">${p.descripcion}</span>`,
              { className: styles.popup }
            );
          },
        }).addTo(map);
      })
      .catch(() => console.warn('No se pudo cargar coverage.geojson en el mapa'));

    // Legend
    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', styles.legend);
      div.innerHTML = `
        <div class="${styles.legendItem}"><span class="${styles.dotFibra}"></span>Fibra Óptica</div>
        <div class="${styles.legendItem}"><span class="${styles.dotWifi}"></span>Inalámbrica</div>
      `;
      return div;
    };
    legend.addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker whenever coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (markerLat != null && markerLng != null) {
      const marker = L.marker([markerLat, markerLng])
        .addTo(map)
        .bindPopup('<strong>📍 Tu dirección</strong>', { autoClose: false })
        .openPopup();
      markerRef.current = marker;
      map.setView([markerLat, markerLng], 15, { animate: true });
    } else {
      map.setView(CENTER, 13, { animate: true });
    }
  }, [markerLat, markerLng]);

  return <div ref={containerRef} className={styles.map} />;
}
