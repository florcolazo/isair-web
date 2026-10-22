// ============================================================
//  ISAIR · Carga compartida de la API de Google Maps
// ============================================================

export const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined;

declare global {
  interface Window {
    google?: { maps: { importLibrary: (name: string) => Promise<unknown> } };
    gm_authFailure?: () => void;
    __initGoogleMaps?: () => void;
  }
}

let googlePromise: Promise<void> | null = null;
export const authFailureHandlers = new Set<() => void>();

// Carga el script de Google Maps una sola vez para toda la página
export function loadGoogleMaps(): Promise<void> {
  if (!GOOGLE_KEY) return Promise.reject(new Error('Falta VITE_GOOGLE_MAPS_KEY'));
  if (googlePromise) return googlePromise;

  googlePromise = new Promise<void>((resolve, reject) => {
    // Google llama a esta función global cuando la key es inválida o el dominio no está permitido
    window.gm_authFailure = () => authFailureHandlers.forEach(fn => fn());

    window.__initGoogleMaps = () => {
      window.google!.maps.importLibrary('maps').then(() => resolve(), reject);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_KEY)}&loading=async&callback=__initGoogleMaps`;
    script.async = true;
    script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
    document.head.appendChild(script);
  });

  return googlePromise;
}

// ── Geocoder ─────────────────────────────────────────────────
interface LatLngLiteral { lat: number; lng: number }
interface GeocoderResult {
  formatted_address: string;
  types: string[];
  geometry: { location: { toJSON(): LatLngLiteral }; location_type: string };
}
interface GeocodingLib {
  Geocoder: new () => {
    geocode(req: {
      address: string;
      region?: string;
      bounds?: { north: number; south: number; east: number; west: number };
      componentRestrictions?: { country?: string };
    }): Promise<{ results: GeocoderResult[] }>;
  };
}

export async function googleGeocode(
  address: string,
  bounds: { north: number; south: number; east: number; west: number },
): Promise<GeocoderResult[]> {
  await loadGoogleMaps();
  const { Geocoder } = await window.google!.maps.importLibrary('geocoding') as GeocodingLib;
  const { results } = await new Geocoder().geocode({
    address,
    region: 'ar',
    bounds,
    componentRestrictions: { country: 'AR' },
  });
  return results;
}
