import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import styles from './CoverageEditor.module.css';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type ZoneType = 'fibra';

interface DrawnZone {
  id: string;
  type: ZoneType;
  layer: L.Polygon;
}

const ZONE_CONFIG: Record<ZoneType, { color: string; fill: string; label: string; emoji: string }> = {
  fibra: { color: '#10b950', fill: '#10b950', label: 'Fibra Óptica', emoji: '🟢' },
};

const CENTER: L.LatLngTuple = [-32.185, -58.174];

export default function CoverageEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const drawnRef     = useRef<L.FeatureGroup | null>(null);
  const [zones, setZones]         = useState<DrawnZone[]>([]);
  const [, setSaved]              = useState(false);
  const activeZoneRef             = useRef<ZoneType>('fibra');



  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: CENTER,
      zoom: 15,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 20,
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    drawnItems.addTo(map);
    drawnRef.current = drawnItems;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const AGENCIA = import.meta.env.VITE_AGENCIA_ID || 'sanjose';

    // Load existing coverage from API as reference (semi-transparent)
    fetch(`${API_URL}/api/agencias/${AGENCIA}/coverage`)
      .then(r => r.json())
      .then(gj => {
        L.geoJSON(gj, {
          style: (f) => {
            const z = f?.properties?.zona as ZoneType;
            const c = ZONE_CONFIG[z];
            return { color: c?.color ?? '#888', fillOpacity: 0.07, weight: 1.5, dashArray: '6,4' };
          },
        })
          .bindPopup('Zona existente (referencia)')
          .addTo(map);
      })
      .catch(() => {});

    // Draw control
    const drawControl = new L.Control.Draw({
      edit:  { featureGroup: drawnItems },
      draw:  {
        polygon:   {
          shapeOptions: { color: ZONE_CONFIG[activeZoneRef.current].color, fillOpacity: 0.25, weight: 2.5 },
          showArea: false,
          allowIntersection: false,
        },
        rectangle:  false,
        circle:     false,
        circlemarker: false,
        marker:     false,
        polyline:   false,
      },
    });
    drawControl.addTo(map);

    // On polygon created
    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer as L.Polygon;
      const zone  = activeZoneRef.current;
      const cfg   = ZONE_CONFIG[zone];

      layer.setStyle({ color: cfg.color, fillColor: cfg.fill, fillOpacity: 0.25, weight: 2.5 });
      drawnItems.addLayer(layer);

      const id = crypto.randomUUID();
      // Store zone type on the layer for later
      (layer as unknown as Record<string, unknown>)._zoneType = zone;
      (layer as unknown as Record<string, unknown>)._zoneId   = id;

      layer.bindPopup(`<strong>${cfg.emoji} ${cfg.label}</strong>`);

      setZones(prev => [...prev, { id, type: zone, layer }]);
      setSaved(false);
    });

    // On delete
    map.on(L.Draw.Event.DELETED, (e) => {
      const deletedLayers = (e as unknown as { layers: L.LayerGroup }).layers;
      deletedLayers.eachLayer((layer) => {
        const id = (layer as unknown as Record<string, unknown>)._zoneId as string;
        if (id) setZones(prev => prev.filter(z => z.id !== id));
      });
      setSaved(false);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);



  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');

  const buildGeoJSON = () => {
    const features = zones.map(z => {
      const cfg     = ZONE_CONFIG[z.type];
      const latlngs = (z.layer.getLatLngs()[0] as L.LatLng[]);
      const coords  = latlngs.map(p => [p.lng, p.lat]);
      if (coords.length && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
        coords.push(coords[0]);
      }
      return {
        type: 'Feature',
        properties: { zona: z.type, nombre: `Zona ${cfg.label}`, descripcion: `${cfg.label} - San José, Entre Ríos` },
        geometry: { type: 'Polygon', coordinates: [coords] },
      };
    });
    return {
      _comment:       'Zonas de cobertura ISAIR - San José, Entre Ríos, Argentina',
      _instrucciones: 'Editá los polígonos en https://geojson.io para ajustar a la cobertura real.',
      type: 'FeatureCollection',
      features,
    };
  };

  const handleSave = async () => {
    if (zones.length === 0) return;
    setStatus('saving');
    setSaved(false);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const AGENCIA = import.meta.env.VITE_AGENCIA_ID || 'sanjose';
      const token   = localStorage.getItem('isair_admin_token');

      if (!token) {
        alert('No estás autenticado. Por favor, iniciá sesión en el panel de administrador primero.');
        setStatus('error');
        return;
      }

      const res = await fetch(`${API_URL}/api/agencias/${AGENCIA}/coverage`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(buildGeoJSON()),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('ok');
        setSaved(true);
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(buildGeoJSON(), null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'coverage.geojson'; a.click();
    URL.revokeObjectURL(url);
  };


  const handleDeleteZone = (id: string) => {
    const zone = zones.find(z => z.id === id);
    if (zone && drawnRef.current) {
      drawnRef.current.removeLayer(zone.layer);
      setZones(prev => prev.filter(z => z.id !== id));
      setSaved(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarTitle}>🗺️ Editor de Cobertura</span>
          <span className={styles.toolbarSub}>Dibujá polígonos cuadra por cuadra</span>
        </div>

        <div className={styles.zonePicker}>
          <span className={styles.zoneDot} style={{ background: '#10b950' }} />
          <span className={styles.zoneLabel}>Dibujando zonas de</span>
          <strong style={{ color: '#10b950', fontSize: '14px' }}>Fibra Óptica</strong>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', marginLeft: 4 }}>
            (La cobertura inalámbrica llega a toda la zona)
          </span>
        </div>

        <div className={styles.exportGroup}>
          <button
            className={`${styles.exportBtn} ${status === 'ok' ? styles.exportSaved : status === 'error' ? styles.exportError : ''}`}
            onClick={handleSave}
            disabled={zones.length === 0 || status === 'saving'}
          >
            {status === 'saving' ? '💾 Guardando…'
              : status === 'ok'  ? '✅ ¡Guardado!'
              : status === 'error' ? '❌ Error al guardar'
              : '💾 Guardar en proyecto'}
          </button>
          <button
            className={styles.downloadBtn}
            onClick={handleDownload}
            disabled={zones.length === 0}
            title="Descargar GeoJSON como archivo"
          >⬇️</button>
        </div>
      </div>

      <div className={styles.body}>
        {/* Map */}
        <div className={styles.mapContainer}>
          <div ref={containerRef} className={styles.map} />
          <div className={styles.hint}>
            <span>🖊️ Usá el ícono de polígono en el mapa para dibujar</span>
          </div>
        </div>

        {/* Zone list */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Zonas dibujadas <span className={styles.badge}>{zones.length}</span></div>

          {zones.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Todavía no hay zonas.</p>
              <p>Seleccioná el tipo de zona y hacé clic en el ícono de polígono en el mapa para empezar a dibujar.</p>
            </div>
          ) : (
            <ul className={styles.zoneList}>
              {zones.map((z, i) => (
                <li key={z.id} className={styles.zoneItem}>
                  <span className={styles.zoneDot} style={{ background: ZONE_CONFIG[z.type].color }} />
                  <div className={styles.zoneInfo}>
                    <strong>{ZONE_CONFIG[z.type].emoji} {ZONE_CONFIG[z.type].label}</strong>
                    <span>Zona #{i + 1}</span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteZone(z.id)}
                    title="Eliminar zona"
                  >✕</button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.instructions}>
            <p>📌 <strong>Cómo usar:</strong></p>
            <ol>
              <li>Hacé clic en el ícono <strong>✏️ polígono</strong> en el mapa</li>
              <li>Hacé clic en cada esquina de cuadra para trazar la zona de fibra</li>
              <li>Doble clic para cerrar el polígono</li>
              <li>Repetí para cada sector con fibra</li>
              <li>Exportá el GeoJSON y reemplazá <code>public/coverage.geojson</code></li>
            </ol>
            <p style={{ marginTop: '10px' }}>💡 <strong>Nota:</strong> La inalámbrica llega a toda la zona — no hace falta marcarla.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
