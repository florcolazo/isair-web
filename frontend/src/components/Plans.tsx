import { useRef } from 'react';
import { PLANS } from '../data';
import type { SelectedPlan, Prices, Zone } from '../types';
import PlanCard from './PlanCard';
import styles from './Plans.module.css';

interface FibraProps { prices: Prices; onSelect: (s: SelectedPlan) => void; zone: Zone; }
interface WirelessProps { prices: Prices; onSelect: (s: SelectedPlan) => void; zone: Zone; }

export function FibraPlans({ prices, onSelect, zone }: FibraProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const scroll  = (dir: number) => gridRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  const hidden  = zone === 'inalambrica' || zone === 'sin_cobertura';
  const plans   = PLANS.filter(p => p.technology === 'fibra');

  return (
    <section className={`${styles.section} ${hidden ? styles.sectionHidden : ''}`} id="fibra">
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow">Fibra Óptica</p>
          <h2>¡LA BUENA FIBRA TE CONECTA AL MUNDO!</h2>
          <p>Instalación con fibra hasta tu domicilio. Elegí el plan que más se adapte a vos.</p>
        </div>
        <div className={styles.carouselWrap}>
          <button className={`${styles.arrow} ${styles.left}`} onClick={() => scroll(-1)} aria-label="Anterior">
            <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
          </button>
          <button className={`${styles.arrow} ${styles.right}`} onClick={() => scroll(1)} aria-label="Siguiente">
            <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </button>
          <div className={styles.grid} ref={gridRef}>
            {plans.map(p => (
              <PlanCard key={p.id} plan={p} prices={prices} onSelect={onSelect} />
            ))}
          </div>
        </div>
        <p className={styles.footNote}>IVA incluido. Servicios sujetos a ubicación y disponibilidad geográfica.</p>
      </div>
      {hidden && <div className={styles.overlay}>⚠ No disponible en tu zona</div>}
    </section>
  );
}

export function WirelessPlans({ prices, onSelect, zone }: WirelessProps) {
  const hidden = zone === 'fibra' || zone === 'sin_cobertura';
  const plans  = PLANS.filter(p => p.technology === 'inalambrica');

  return (
    <section className={`${styles.section} ${hidden ? styles.sectionHidden : ''}`} id="inalambrica">
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow">Inalámbrica</p>
          <h2>Cobertura sin cables, lista en días</h2>
          <p>La opción ideal donde todavía no llega la fibra óptica.</p>
        </div>
        <div className={`${styles.grid} ${styles.single}`}>
          {plans.map(p => (
            <PlanCard key={p.id} plan={p} prices={prices} onSelect={onSelect} />
          ))}
        </div>
      </div>
      {hidden && <div className={styles.overlay}>⚠ No disponible en tu zona</div>}
    </section>
  );
}
