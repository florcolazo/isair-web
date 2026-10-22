// ============================================================
//  ISAIR · Geometría del editor de cobertura (pincel / borrador)
// ============================================================
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson';
import buffer from '@turf/buffer';
import union from '@turf/union';
import difference from '@turf/difference';
import simplify from '@turf/simplify';
import turfArea from '@turf/area';
import { featureCollection, lineString, point } from '@turf/helpers';

/** Toda la zona de fibra como una sola figura (puede tener varias partes y huecos) */
export type Area = Feature<Polygon | MultiPolygon> | null;

// Puntos del trazo más cerca que esto (en grados, ~1,5 m) se descartan
const MIN_STEP = 0.000015;

/** Convierte un trazo del pincel en una franja de `widthM` metros de ancho */
export function strokeToArea(path: [number, number][], widthM: number): Area {
  const coords: Position[] = [];
  for (const [lat, lng] of path) {
    const last = coords[coords.length - 1];
    if (!last || Math.abs(last[0] - lng) > MIN_STEP || Math.abs(last[1] - lat) > MIN_STEP) {
      coords.push([lng, lat]);
    }
  }
  if (coords.length === 0) return null;

  const shape = coords.length === 1 ? point(coords[0]) : lineString(coords);
  return buffer(shape, widthM / 2, { units: 'meters', steps: 8 }) ?? null;
}

function clean(area: Area): Area {
  if (!area) return null;
  // ~1 m de tolerancia: mantiene el archivo chico sin cambiar la forma visible
  return simplify(area, { tolerance: 0.00001, highQuality: false });
}

export function addArea(base: Area, extra: Area): Area {
  if (!extra) return base;
  if (!base) return clean(extra);
  return clean(union(featureCollection([base, extra])));
}

export function subtractArea(base: Area, cut: Area): Area {
  if (!base || !cut) return base;
  return clean(difference(featureCollection([base, cut])));
}

/** Une todos los polígonos de fibra guardados en una sola figura editable */
export function areaFromFeatures(features: Feature[]): Area {
  let area: Area = null;
  for (const f of features) {
    if (f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon') {
      area = addArea(area, f as Feature<Polygon | MultiPolygon>);
    }
  }
  return area;
}

/** Separa la figura en polígonos sueltos para guardarla */
export function areaToFeatures(area: Area, properties: Record<string, string>): Feature<Polygon>[] {
  if (!area) return [];
  const polys = area.geometry.type === 'Polygon'
    ? [area.geometry.coordinates]
    : area.geometry.coordinates;
  return polys.map(coordinates => ({
    type: 'Feature',
    properties,
    geometry: { type: 'Polygon', coordinates },
  }));
}

export function areaParts(area: Area): number {
  if (!area) return 0;
  return area.geometry.type === 'Polygon' ? 1 : area.geometry.coordinates.length;
}

export function areaHectares(area: Area): number {
  return area ? turfArea(area) / 10_000 : 0;
}
