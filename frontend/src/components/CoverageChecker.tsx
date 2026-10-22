import { useState } from 'react';
import type { Zone } from '../types';
import { geocodeAddress } from '../utils';
import styles from './CoverageChecker.module.css';

interface Props {
  onZoneDetected: (zone: Zone) => void;
  onAddressFound?: (addr: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const AGENCIA = import.meta.env.VITE_AGENCIA_ID || 'sanjose';

export default function CoverageChecker({ onZoneDetected, onAddressFound }: Props) {
  const [address, setAddress]   = useState('');
  const [zone, setZone]         = useState<Zone>(null);
  const [loading, setLoading]   = useState(false);

  const run = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setZone(null);
    try {
      const { lat, lng } = await geocodeAddress(address);
      // El servidor tiene las zonas y solo responde cuál corresponde a este punto
      const res = await fetch(`${API_URL}/api/agencias/${AGENCIA}/coverage/check?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { zona } = await res.json() as { zona: Zone };
      setZone(zona);
      onZoneDetected(zona);
      if (zona !== 'sin_cobertura' && zona !== 'error') onAddressFound?.(address.trim());
    } catch {
      setZone('error');
      onZoneDetected('error');
    } finally {
      setLoading(false);
    }
  };

  const CONFIGS = {
    fibra:         { icon: '🟢', title: '¡Fibra Óptica disponible en tu zona!',    desc: 'Tenés acceso a todos nuestros planes de Fibra Óptica con velocidades de hasta 300 MB.',                cta: 'Ver planes de Fibra Óptica →', target: '#fibra',      ctaCls: styles.ctaGreen },
    inalambrica:   { icon: '🔵', title: 'Cobertura Inalámbrica disponible',         desc: 'En tu zona tenemos Internet Inalámbrica. Rápida instalación y sin cables.',                              cta: 'Ver plan Inalámbrico →',       target: '#inalambrica', ctaCls: styles.ctaBlue  },
    sin_cobertura: { icon: '⚠️', title: 'Por ahora no llegamos a esa dirección',    desc: 'Estamos en expansión. Escribinos por WhatsApp y te avisamos cuando tu zona tenga cobertura.',            cta: '📲 Escribinos por WhatsApp',    target: null,           ctaCls: styles.ctaRed   },
    error:         { icon: '❓', title: 'No pudimos verificar la dirección',          desc: 'Revisá que sea correcta o escribinos directamente.',                                                     cta: '📲 Contactar por WhatsApp',    target: null,           ctaCls: styles.ctaRed   },
  } as const;

  const cfg = zone ? CONFIGS[zone] : null;

  return (
    <section className={styles.section} id="cobertura">
      <div className="wrap">
        {/* Top row: copy + widget */}
        <div className={styles.inner}>
          {/* Copy */}
          <div className={styles.copy}>
            <p className="eyebrow" style={{ color: 'rgba(255,255,255,.55)' }}>📡 Cobertura</p>
            <h2>¿Llegamos a tu dirección?</h2>
            <p>Ingresá tu domicilio y te decimos al instante qué tecnología tenés disponible — Fibra Óptica o Inalámbrica — y qué planes podés contratar.</p>
          </div>

          {/* Widget */}
          <div className={styles.widget}>
            <label htmlFor="coverageAddress">Tu dirección en San José</label>
            <div className={styles.inputRow}>
              <input
                id="coverageAddress"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && run()}
                placeholder="Ej: Rivadavia 450, San José"
                autoComplete="off"
              />
              <button id="coverageBtn" onClick={run} disabled={loading} className={styles.btn}>
                {loading && <div className={styles.spinner}/>}
                {loading ? 'Verificando…' : 'Verificar'}
              </button>
            </div>

            {/* Result */}
            {cfg && (
              <div className={`${styles.result} ${styles[zone!]}`}>
                <span className={styles.icon}>{cfg.icon}</span>
                <div className={styles.resultText}>
                  <strong>{cfg.title}</strong>
                  <p>{cfg.desc}</p>
                  {cfg.target ? (
                    <button className={`${styles.cta} ${cfg.ctaCls}`}
                      onClick={() => document.querySelector(cfg.target!)?.scrollIntoView({ behavior: 'smooth' })}>
                      {cfg.cta}
                    </button>
                  ) : (
                    <a className={`${styles.cta} ${cfg.ctaCls}`}
                      href="https://wa.me/5493447524550?text=%C2%A1Hola%21+Consulto+sobre+cobertura." target="_blank" rel="noopener">
                      {cfg.cta}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
