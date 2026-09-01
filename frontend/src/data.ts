// ============================================================
//  ISAIR · Datos de planes
// ============================================================
import type { Plan } from './types';

export const PLANS: Plan[] = [
  // ── FIBRA ÓPTICA ─────────────────────────────────────────
  {
    id: 'fibra_300',
    name: 'Internet 300MB',
    technology: 'fibra',
    priceId: 'fibra_300',
    features: [
      'Streaming sin cortes',
      'WiFi para toda la casa',
      'Instalación rápida',
      'Atención personalizada',
    ],
    hasFutbol: false,
    isFeatured: false,
    installationLabel: 'Sin costo',
    promoLabel: '12 meses',
    promoNote:
      'Promoción válida para nuevas contrataciones del servicio de Internet Fibra Óptica 300 MB. ' +
      'Válida entre el 01/12/2026 al 31/12/2026 en San José. Corresponde a una promoción de 12 meses ' +
      'con descuentos cuatrimestrales de 60%, 55% y 50% sobre el precio de lista de cada mes.',
  },
  {
    id: 'fibra_istv_move',
    name: 'Internet 300MB + ISTV Move',
    subtitle: 'Internet 300MB',
    technology: 'fibra',
    priceId: 'fibra_istv_move',
    features: [
      'TV online sin deco extra',
      'Más de 100 canales',
      '4 dispositivos en simultáneo',
      'Ideal para Smart TV con Android',
    ],
    hasFutbol: true,
    isFeatured: true,
    installationLabel: 'Sin costo',
    promoLabel: '12 meses',
    promoNote:
      'Promoción válida para nuevas contrataciones del servicio Internet + ISTV Move. ' +
      'Válida entre el 01/12/2026 al 31/12/2026 en San José. Corresponde a una promoción de 12 meses ' +
      'con descuentos cuatrimestrales de 60%, 55% y 50% sobre el precio de lista de cada mes.',
  },
  {
    id: 'fibra_istv_full',
    name: 'Internet 300MB + ISTV Full',
    subtitle: 'Internet 300MB',
    technology: 'fibra',
    priceId: 'fibra_istv_full',
    features: [
      'Convertidor Android incluido',
      'Más de 100 canales',
      '4 dispositivos en simultáneo',
      'Convierte tu TV en Smart',
    ],
    hasFutbol: true,
    isFeatured: true,
    installationLabel: 'Sin costo',
    promoLabel: '12 meses',
    promoNote:
      'Promoción válida para nuevas contrataciones del servicio Internet + ISTV Full. ' +
      'Válida entre el 01/12/2026 al 31/12/2026 en San José. Corresponde a una promoción de 12 meses ' +
      'con descuentos cuatrimestrales de 60%, 55% y 50% sobre el precio de lista de cada mes.',
  },
  {
    id: 'fibra_iscam',
    name: 'Internet 300MB + IS CAM',
    subtitle: 'Internet 300MB',
    technology: 'fibra',
    priceId: 'fibra_iscam',
    features: [
      'Cámaras de seguridad',
      'Monitoreo desde el celular',
      'Instalación profesional',
      'Asesoramiento personalizado',
    ],
    hasFutbol: true,
    isFeatured: true,
    installationLabel: 'Con costo — Consultar',
    promoLabel: '12 meses',
    promoNote:
      'Promoción válida para nuevas contrataciones del servicio Internet + IS CAM. ' +
      'Válida entre el 01/12/2026 al 31/12/2026 en San José. Corresponde a una promoción de 12 meses ' +
      'con descuentos cuatrimestrales de 60%, 55% y 50% sobre el precio de lista de cada mes.',
  },

  // ── INALÁMBRICA ───────────────────────────────────────────
  {
    id: 'inalambrica_15',
    name: 'Internet Inalámbrica 15MB',
    technology: 'inalambrica',
    priceId: 'inalambrica_15',
    features: [],
    hasFutbol: false,
    isFeatured: false,
    installationLabel: 'Sin Costo',
    promoLabel: '12 meses',
    promoNote: 'IVA incluido. Servicios sujetos a ubicación y disponibilidad geográfica.',
  },
];

export const WA_NUMBER = '5493447524550';
export const WA_BASE   = `https://wa.me/${WA_NUMBER}`;
