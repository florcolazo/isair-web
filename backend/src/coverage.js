// ── Detección de zona de cobertura (punto en polígono) ────────
// Se hace en el servidor para que las zonas no se publiquen en el sitio.

// Ray casting; recorrer todos los anillos hace que los huecos queden afuera
function pointInPolygon([px, py], polygon) {
  let inside = false;
  for (const ring of polygon) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersect =
        yi > py !== yj > py &&
        px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
  }
  return inside;
}

function polygonsOf(geometry) {
  if (geometry?.type === 'Polygon') return [geometry.coordinates];
  if (geometry?.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function inZone(point, features, zona) {
  return features.some(f =>
    f.properties?.zona === zona &&
    polygonsOf(f.geometry).some(poly => pointInPolygon(point, poly)));
}

/** Devuelve 'fibra', 'inalambrica' o 'sin_cobertura' para un lat/lng */
function detectZone(lat, lng, features) {
  const point = [lng, lat]; // GeoJSON: [lng, lat]
  if (inZone(point, features, 'fibra'))       return 'fibra';
  if (inZone(point, features, 'inalambrica')) return 'inalambrica';
  return 'sin_cobertura';
}

module.exports = { detectZone };
