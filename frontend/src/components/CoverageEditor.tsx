import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import type { Feature, Polygon } from 'geojson';
import { addBaseLayers } from './baseLayers';
import {
  type Area,
  addArea, subtractArea, strokeToArea, areaFromFeatures, areaToFeatures, areaParts, areaHectares,
} from './coverageGeometry';
import styles from './CoverageEditor.module.css';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Tool = 'pincel' | 'borrador' | 'mover';

const FIBRA_COLOR  = '#10b950';
const ERASE_COLOR  = '#e62a22';
const FIBRA_PROPS  = { zona: 'fibra', nombre: 'Zona Fibra Óptica', descripcion: 'Fibra Óptica - San José, Entre Ríos' };
const MAX_HISTORY  = 40;

const CENTER: L.LatLngTuple = [-32.208, -58.217];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const AGENCIA = import.meta.env.VITE_AGENCIA_ID || 'sanjose';

// Metros que ocupa un píxel en pantalla, para que el trazo se vea del ancho real
function metersPerPixel(map: L.Map): number {
  const lat = map.getCenter().lat;
  return 40075016.686 * Math.abs(Math.cos(lat * Math.PI / 180)) / Math.pow(2, map.getZoom() + 8);
}

export default function CoverageEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const areaLayerRef = useRef<L.GeoJSON | null>(null);

  // La zona de fibra vive en un ref (la usan los eventos del mapa) y se copia a estado para la UI
  const areaRef       = useRef<Area>(null);
  const otherRef      = useRef<Feature[]>([]);   // zonas que no son fibra: se guardan tal cual
  const historyRef    = useRef<Area[]>([]);
  const [area, setAreaState]      = useState<Area>(null);
  const [canUndo, setCanUndo]     = useState(false);
  const [dirty, setDirty]         = useState(false);
  const [loaded, setLoaded]       = useState(false);
  // Si no se pudo cargar lo guardado no se deja guardar: pisaría la cobertura existente
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tool, setTool]           = useState<Tool>('pincel');
  const [width, setWidth]         = useState(100);
  const toolRef  = useRef<Tool>('pincel');
  const widthRef = useRef(100);

  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');

  const render = (a: Area) => {
    areaLayerRef.current?.clearLayers();
    if (a) areaLayerRef.current?.addData(a);
  };

  // Aplica un cambio guardando el estado anterior para poder deshacer
  const commit = useCallback((next: Area) => {
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), areaRef.current];
    areaRef.current = next;
    render(next);
    setAreaState(next);
    setCanUndo(true);
    setDirty(true);
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    areaRef.current = prev;
    render(prev);
    setAreaState(prev);
    setCanUndo(historyRef.current.length > 0);
    setDirty(true);
  }, []);

  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { widthRef.current = width; }, [width]);

  // Mover el mapa solo con la herramienta "mover"; con pincel/borrador arrastrar pinta
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tool === 'mover') map.dragging.enable(); else map.dragging.disable();
    map.getContainer().style.cursor = tool === 'mover' ? '' : 'crosshair';
  }, [tool, loaded]);

  // Ctrl+Z para deshacer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo]);

  // Avisar antes de cerrar la pestaña con cambios sin guardar
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [dirty]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: CENTER,
      zoom: 16,
      scrollWheelZoom: true,
    });

    addBaseLayers(map);

    const areaLayer = L.geoJSON(undefined, {
      interactive: false,
      style: { color: FIBRA_COLOR, fillColor: FIBRA_COLOR, fillOpacity: 0.3, weight: 2 },
    }).addTo(map);
    areaLayerRef.current = areaLayer;

    // Cargar la cobertura guardada para seguir editándola
    const token = localStorage.getItem('isair_admin_token');
    fetch(`${API_URL}/api/agencias/${AGENCIA}/coverage`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(r => {
        if (r.status === 401 || r.status === 403) throw new Error('auth');
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(gj => {
        const features: Feature[] = gj.features ?? [];
        otherRef.current = features.filter(f => f.properties?.zona !== 'fibra');
        const a = areaFromFeatures(features.filter(f => f.properties?.zona === 'fibra'));
        areaRef.current = a;
        render(a);
        setAreaState(a);
      })
      .catch(e => {
        console.error('Error cargando cobertura:', e);
        setLoadError(e.message === 'auth'
          ? 'Tenés que iniciar sesión en el panel de administración para editar la cobertura.'
          : 'No se pudo cargar la cobertura guardada. Revisá la conexión y recargá la página.');
      })
      .finally(() => setLoaded(true));

    // ── Pincel / borrador ──
    // Círculo que sigue al mouse mostrando el ancho del pincel
    const cursor = L.circle(CENTER, { radius: 1, interactive: false, weight: 1.5, fillOpacity: 0.15 });
    let stroke: L.Polyline | null = null;
    let path: [number, number][] = [];

    const brushColor = () => (toolRef.current === 'borrador' ? ERASE_COLOR : FIBRA_COLOR);

    const finishStroke = () => {
      if (!stroke) return;
      stroke.remove();
      stroke = null;
      const shape = strokeToArea(path, widthRef.current);
      path = [];
      if (!shape) return;
      commit(toolRef.current === 'borrador'
        ? subtractArea(areaRef.current, shape)
        : addArea(areaRef.current, shape));
    };

    map.on('mousedown', (e: L.LeafletMouseEvent) => {
      if (toolRef.current === 'mover' || e.originalEvent.button !== 0) return;
      path = [[e.latlng.lat, e.latlng.lng]];
      stroke = L.polyline([e.latlng], {
        color: brushColor(),
        weight: widthRef.current / metersPerPixel(map),
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      }).addTo(map);
    });

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (toolRef.current === 'mover') {
        cursor.remove();
        return;
      }
      cursor.setLatLng(e.latlng).setRadius(widthRef.current / 2).setStyle({ color: brushColor(), fillColor: brushColor() });
      if (!map.hasLayer(cursor)) cursor.addTo(map);
      if (stroke) {
        path.push([e.latlng.lat, e.latlng.lng]);
        stroke.addLatLng(e.latlng);
      }
    });

    map.on('mouseout', () => cursor.remove());
    map.on('mouseup', finishStroke);
    document.addEventListener('mouseup', finishStroke);

    // ── Polígono: para marcar un barrio entero de una vez ──
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          shapeOptions: { color: FIBRA_COLOR, fillOpacity: 0.25, weight: 2.5 },
          showArea: false,
          allowIntersection: false,
        },
        rectangle:    false,
        circle:       false,
        circlemarker: false,
        marker:       false,
        polyline:     false,
      },
    });
    drawControl.addTo(map);

    // Mientras se dibuja un polígono, el arrastre no tiene que pintar
    map.on(L.Draw.Event.DRAWSTART, () => setTool('mover'));

    map.on(L.Draw.Event.CREATED, (e) => {
      const poly = (e.layer as L.Polygon).toGeoJSON() as Feature<Polygon>;
      commit(addArea(areaRef.current, poly));
    });

    mapRef.current = map;
    return () => {
      document.removeEventListener('mouseup', finishStroke);
      map.remove();
      mapRef.current = null;
    };
  }, [commit]);

  const buildGeoJSON = () => ({
    _comment:       'Zonas de cobertura ISAIR - San José, Entre Ríos, Argentina',
    _instrucciones: 'Editá la cobertura desde el editor del panel de administración.',
    type: 'FeatureCollection',
    features: [...otherRef.current, ...areaToFeatures(areaRef.current, FIBRA_PROPS)],
  });

  const handleSave = async () => {
    if (!areaRef.current && !confirm('No hay ninguna zona de fibra marcada. ¿Guardar igual y dejar la cobertura vacía?')) return;
    setStatus('saving');
    try {
      const token = localStorage.getItem('isair_admin_token');

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
        setDirty(false);
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

  const hectares = areaHectares(area);
  const parts    = areaParts(area);

  const TOOLS: { id: Tool; icon: string; label: string; color: string }[] = [
    { id: 'pincel',   icon: '🖌️', label: 'Pincel',   color: FIBRA_COLOR },
    { id: 'borrador', icon: '🧽', label: 'Borrador', color: ERASE_COLOR },
    { id: 'mover',    icon: '✋', label: 'Mover',    color: '#0072ff' },
  ];

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarTitle}>🗺️ Editor de Cobertura</span>
          <span className={styles.toolbarSub}>Pintá las calles que tienen Fibra Óptica</span>
        </div>

        <div className={styles.zonePicker}>
          {TOOLS.map(t => (
            <button
              key={t.id}
              className={`${styles.zoneBtn} ${tool === t.id ? styles.zoneBtnActive : ''}`}
              style={tool === t.id ? { borderColor: t.color, background: `${t.color}33` } : undefined}
              onClick={() => setTool(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}

          <label className={styles.widthControl}>
            <span>Ancho</span>
            <input
              type="range"
              min={30}
              max={250}
              step={10}
              value={width}
              onChange={e => setWidth(Number(e.target.value))}
            />
            <strong>{width} m</strong>
          </label>

          <button className={styles.zoneBtn} onClick={undo} disabled={!canUndo} title="Deshacer (Ctrl+Z)">
            ↩️ Deshacer
          </button>
        </div>

        <div className={styles.exportGroup}>
          <button
            className={`${styles.exportBtn} ${status === 'ok' ? styles.exportSaved : status === 'error' ? styles.exportError : ''}`}
            onClick={handleSave}
            disabled={!dirty || !!loadError || status === 'saving'}
          >
            {status === 'saving' ? '💾 Guardando…'
              : status === 'ok'  ? '✅ ¡Guardado!'
              : status === 'error' ? '❌ Error al guardar'
              : dirty ? '💾 Guardar cambios' : '💾 Sin cambios'}
          </button>
          <button
            className={styles.downloadBtn}
            onClick={handleDownload}
            disabled={!area}
            title="Descargar GeoJSON como archivo"
          >⬇️</button>
        </div>
      </div>

      <div className={styles.body}>
        {/* Map */}
        <div className={styles.mapContainer}>
          <div ref={containerRef} className={styles.map} />
          <div className={styles.hint}>
            <span>
              {tool === 'pincel'   ? '🖌️ Mantené apretado el clic y pasá por las calles con fibra'
                : tool === 'borrador' ? '🧽 Pasá por encima de lo que quieras borrar'
                : '✋ Arrastrá para mover el mapa'}
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Cobertura de fibra</div>

          {!loaded ? (
            <div className={styles.emptyState}><p>Cargando cobertura…</p></div>
          ) : loadError ? (
            <div className={styles.loadError}>
              <p>⚠️ {loadError}</p>
              <a href="admin.html">Ir al panel →</a>
            </div>
          ) : !area ? (
            <div className={styles.emptyState}>
              <p>Todavía no hay zonas.</p>
              <p>Elegí el pincel y pasá por las calles que tienen fibra.</p>
            </div>
          ) : (
            <div className={styles.stats}>
              <div><strong>{hectares.toLocaleString('es-AR', { maximumFractionDigits: 1 })} ha</strong><span>≈ {Math.round(hectares)} manzanas</span></div>
              <div><strong>{parts}</strong><span>{parts === 1 ? 'sector' : 'sectores separados'}</span></div>
            </div>
          )}

          <div className={styles.instructions}>
            <p>📌 <strong>Cómo usar:</strong></p>
            <ol>
              <li>Con el <strong>🖌️ Pincel</strong>, mantené apretado el clic y recorré las calles con fibra</li>
              <li>Con <strong>100 m</strong> de ancho se cubren las casas de los dos lados de la calle</li>
              <li>Lo que pintás se suma a lo que ya estaba; las partes que se tocan se unen solas</li>
              <li>Si te equivocás: <strong>↩️ Deshacer</strong> (Ctrl+Z) o el <strong>🧽 Borrador</strong></li>
              <li>Para moverte por el mapa usá <strong>✋ Mover</strong> o la rueda del mouse para el zoom</li>
              <li>Al terminar, tocá <strong>💾 Guardar cambios</strong></li>
            </ol>
            <p style={{ marginTop: '10px' }}>💡 Para un barrio entero, el ícono de <strong>polígono</strong> del mapa marca toda el área de una vez.</p>
            <p>💡 La inalámbrica llega a toda la zona — no hace falta marcarla.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
