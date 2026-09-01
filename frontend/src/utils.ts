// ============================================================
//  ISAIR · Utilidades: cobertura geográfica + WhatsApp URL
// ============================================================
import type { GeoFeature, Zone, SelectedPlan, FormData } from './types';
import { WA_BASE } from './data';

// ── Algoritmo punto-en-polígono (ray casting) ────────────────
function pointInPolygon(point: [number, number], polygon: number[][][]): boolean {
  const [px, py] = point;
  let inside = false;

  for (const ring of polygon) {
    let j = ring.length - 1;
    for (let i = 0; i < ring.length; j = i++) {
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

// ── Detectar zona según lat/lng ──────────────────────────────
export function detectZone(lat: number, lng: number, features: GeoFeature[]): Zone {
  const point: [number, number] = [lng, lat]; // GeoJSON: [lng, lat]

  for (const f of features) {
    if (f.properties.zona === 'fibra' && pointInPolygon(point, f.geometry.coordinates))
      return 'fibra';
  }
  for (const f of features) {
    if (f.properties.zona === 'inalambrica' && pointInPolygon(point, f.geometry.coordinates))
      return 'inalambrica';
  }
  return 'sin_cobertura';
}

// ── Geocodificar ─────────────────────────────────────────────
// Diccionario local de emergencia para calles sin ningún dato online
const LOCAL_STREETS: Record<string, { lat: number; lng: number }> = {
  'belgrano':      { lat: -32.1850, lng: -58.1740 },
  'san martin':    { lat: -32.1845, lng: -58.1760 },
  'san martín':    { lat: -32.1845, lng: -58.1760 },
  '25 de mayo':    { lat: -32.1855, lng: -58.1750 },
};

const SAN_JOSE_CENTER = { lat: -32.185, lng: -58.174 };

/**
 * Intento 1 — GeoRef (API oficial de datos.gob.ar)
 * Tiene el nomenclador completo nacional, incluye calles de San José ER.
 */
async function georefSearch(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://apis.datos.gob.ar/georef/api/direcciones?` +
      `direccion=${encodeURIComponent(address)}` +
      `&provincia=entre+rios&departamento=colon&max=1&formato=json`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const d = data?.direcciones?.[0];
    if (!d?.ubicacion?.lat) return null;
    return { lat: d.ubicacion.lat, lng: d.ubicacion.lon };
  } catch { return null; }
}

/**
 * Intento 2 — Nominatim (OpenStreetMap) con viewbox de San José
 */
const SAN_JOSE_VIEWBOX = '-58.21,-32.22,-58.14,-32.15';

async function nominatimSearch(q: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(q)}` +
      `&format=json&limit=3&countrycodes=ar` +
      `&viewbox=${SAN_JOSE_VIEWBOX}&bounded=0`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'ISAIR-Internet-Services/1.0 (isaircolon1@gmail.com)' },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.length) return null;
    const local = data.find((d: { lat: string; lon: string }) => {
      const lat = parseFloat(d.lat), lng = parseFloat(d.lon);
      return lat > -32.22 && lat < -32.15 && lng > -58.21 && lng < -58.14;
    });
    const best = local ?? data[0];
    return { lat: parseFloat(best.lat), lng: parseFloat(best.lon) };
  } catch { return null; }
}

/**
 * Intento 3 — diccionario local hardcodeado
 */
function localStreetLookup(address: string): { lat: number; lng: number } | null {
  const lower = address.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [key, coords] of Object.entries(LOCAL_STREETS)) {
    const normalKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(normalKey)) return coords;
  }
  return null;
}

export async function geocodeAddress(rawAddress: string): Promise<{ lat: number; lng: number }> {
  const input = rawAddress.trim();

  // 1️⃣ GeoRef — nomenclador oficial argentino (más preciso para San José ER)
  const r1 = await georefSearch(input);
  if (r1) return r1;

  // 2️⃣ GeoRef sin el número (solo calle)
  const streetOnly = input.replace(/\d+/g, '').trim();
  if (streetOnly !== input) {
    const r2 = await georefSearch(streetOnly);
    if (r2) return r2;
  }

  // 3️⃣ Nominatim como segundo intento
  const r3 = await nominatimSearch(`${input}, San José, Entre Ríos, Argentina`);
  if (r3) return r3;

  // 4️⃣ Diccionario local de emergencia
  const local = localStreetLookup(input);
  if (local) return local;

  // 5️⃣ Centro de San José (nunca falla)
  return SAN_JOSE_CENTER;
}

// ── Formatear precio ─────────────────────────────────────────
export function formatPrice(amount: number): string {
  return '$' + amount.toLocaleString('es-AR');
}

// ── Construir URL de WhatsApp ────────────────────────────────
export function buildWhatsAppUrl(
  selected: SelectedPlan | null,
  form: Omit<FormData, 'acceptedTerms'>
): string {
  let texto = '👋 Hola ISAIR, quiero realizar una consulta / solicitud de servicio:\n\n';
  if (selected?.name) {
    texto += `📌 *Plan:* ${selected.name} — ${selected.price}\n`;
    texto += `⚽ *Pack Fútbol:* ${selected.futbol ? 'Sí' : 'No'}\n\n`;
  } else {
    texto += `📌 *Consulta:* Contacto / Solicitud de información general\n\n`;
  }
  texto +=
    '👤 *Mis datos:*\n' +
    `- Nombre: ${form.nombre}\n` +
    `- DNI: ${form.dni}\n` +
    `- Teléfono: ${form.telefono}\n` +
    `- Dirección: ${form.direccion}\n` +
    `- Horarios disponibles: ${form.horarios}`;
  if (form.email) texto += `\n- Email: ${form.email}`;
  return `${WA_BASE}?text=${encodeURIComponent(texto)}`;
}

// ── Crear pelota de fútbol animada ───────────────────────────
export function spawnSoccerBall(): void {
  const ball = document.createElement('div');
  ball.className = 'soccer-ball';
  ball.textContent = '⚽';
  ball.style.left = window.innerWidth / 2 + 'px';
  ball.style.top  = window.innerHeight / 2 + 'px';
  const angle    = Math.random() * Math.PI * 2;
  const velocity = 100 + Math.random() * 300;
  ball.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
  ball.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');
  document.body.appendChild(ball);
  setTimeout(() => ball.remove(), 1000);
}
