// ============================================================
//  ISAIR · Tipos TypeScript globales
// ============================================================

export type Zone = 'fibra' | 'inalambrica' | 'sin_cobertura' | 'error' | null;

export interface Plan {
  id: string;
  name: string;
  subtitle?: string;          // "Internet 300MB" (línea azul arriba del nombre)
  technology: 'fibra' | 'inalambrica';
  priceId: string;
  features: string[];
  hasFutbol?: boolean;        // muestra el badge "Quiero fútbol"
  isFeatured?: boolean;       // borde rojo
  installationLabel: string;
  promoLabel: string;
  promoNote: string;
}

export interface SelectedPlan {
  name: string;
  price: string;
  futbol: boolean;
}

export interface FormData {
  nombre: string;
  telefono: string;
  direccion: string;
  email: string;
  dni: string;
  horarios: string;
  acceptedTerms: boolean;
}

export interface GeoFeature {
  type: 'Feature';
  properties: { zona: string; nombre: string };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export type Prices = Record<string, number>;
