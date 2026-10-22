// ============================================================
//  ISAIR · Utilidades: geocodificación + WhatsApp URL
// ============================================================
import type { SelectedPlan, FormData } from './types';
import { WA_BASE } from './data';
import { GOOGLE_KEY, googleGeocode } from './googleMaps';

// ── Geocodificar ─────────────────────────────────────────────

// Recuadro que cubre San José (ER) con margen; fuera de esto la dirección no es de acá
const SAN_JOSE_BOUNDS = { north: -32.17, south: -32.25, east: -58.17, west: -58.27 };

function insideSanJose({ lat, lng }: { lat: number; lng: number }): boolean {
  const b = SAN_JOSE_BOUNDS;
  return lat < b.north && lat > b.south && lng < b.east && lng > b.west;
}

/**
 * Intento 1 — Google Geocoding
 * Solo acepta resultados a nivel casa o esquina; si Google solo encuentra la calle
 * o la ciudad, sigue con GeoRef.
 */
async function googleSearch(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_KEY) return null;
  try {
    const results = await googleGeocode(`${address}, San José, Entre Ríos, Argentina`, SAN_JOSE_BOUNDS);
    for (const r of results) {
      const precise =
        r.geometry.location_type === 'ROOFTOP' ||
        r.geometry.location_type === 'RANGE_INTERPOLATED' ||
        r.types.includes('intersection');
      const loc = r.geometry.location.toJSON();
      if (precise && insideSanJose(loc)) return loc;
    }
    return null;
  } catch (e) {
    console.warn('Google Geocoding falló, se usa GeoRef:', e);
    return null;
  }
}

/**
 * Intento 2 — GeoRef (API oficial de datos.gob.ar), limitado a la localidad San José
 */
async function georefSearch(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://apis.datos.gob.ar/georef/api/direcciones?` +
      `direccion=${encodeURIComponent(address)}` +
      `&provincia=entre+rios&departamento=colon&localidad_censal=san+jose&max=1&formato=json`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const d = data?.direcciones?.[0];
    if (!d?.ubicacion?.lat) return null;
    return { lat: d.ubicacion.lat, lng: d.ubicacion.lon };
  } catch { return null; }
}

/**
 * Intento 3 — Nominatim (OpenStreetMap), solo resultados con altura dentro de San José
 */
async function nominatimSearch(q: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const b = SAN_JOSE_BOUNDS;
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(q)}` +
      `&format=json&limit=3&countrycodes=ar&addressdetails=1` +
      `&viewbox=${b.west},${b.south},${b.east},${b.north}&bounded=1`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data: { lat: string; lon: string; address?: { house_number?: string } }[] = await resp.json();
    const best = data.find(d => d.address?.house_number);
    return best ? { lat: parseFloat(best.lat), lng: parseFloat(best.lon) } : null;
  } catch { return null; }
}

/**
 * Devuelve la ubicación exacta de la dirección en San José.
 * Si ningún servicio la encuentra con precisión, lanza un error en vez de
 * inventar una ubicación aproximada (que daría un resultado de cobertura falso).
 */
export async function geocodeAddress(rawAddress: string): Promise<{ lat: number; lng: number }> {
  const input = rawAddress.trim();

  const result =
    await googleSearch(input) ??
    await georefSearch(input) ??
    await nominatimSearch(`${input}, San José, Entre Ríos, Argentina`);

  if (!result) throw new Error(`No se encontró la dirección: ${input}`);
  return result;
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
