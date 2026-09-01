import { useState, useEffect, useRef } from 'react';
import type { Zone, GeoFeature } from '../types';
import { detectZone, geocodeAddress } from '../utils';
import CoverageMap from './CoverageMap';
import styles from './CoverageChecker.module.css';

interface Props {
  onZoneDetected: (zone: Zone) => void;
  onAddressFound?: (addr: string) => void;
}

export default function CoverageChecker({ onZoneDetected, onAddressFound }: Props) {
  const [address, setAddress]   = useState('');
  const [zone, setZone]         = useState<Zone>(null);
  const [loading, setLoading]   = useState(false);
  const [markerLat, setLat]     = useState<number | null>(null);
  const [markerLng, setLng]     = useState<number | null>(null);
  const featuresRef             = useRef<GeoFeature[] | null>(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const AGENCIA = import.meta.env.VITE_AGENCIA_ID || 'sanjose';
    
    fetch(`${API_URL}/api/agencias/${AGENCIA}/coverage`)
      .then(res => res.json())
      .then(data => { featuresRef.current = data.features || []; })
      .catch(e => console.error('Error cargando zonas:', e));
  }, []);

  const run = async () => {
    if (!address.trim()) return;
    if (!featuresRef.current) { alert('Sistema de cobertura cargando, reintentá.'); return; }
    setLoading(true);
    setZone(null);
    setLat(null);
    setLng(null);
    try {
      const { lat, lng } = await geocodeAddress(address);
      const z = detectZone(lat, lng, featuresRef.current);
      setZone(z);
      onZoneDetected(z);
      setLat(lat);
      setLng(lng);
      if (z !== 'sin_cobertura' && z !== 'error') onAddressFound?.(address.trim());
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

        {/* Map — full width below */}
        <div className={styles.mapWrapper}>
          <CoverageMap markerLat={markerLat} markerLng={markerLng} />
        </div>
      </div>
    </section>
  );
}
