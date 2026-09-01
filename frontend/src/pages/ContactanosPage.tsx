import { useMemo } from 'react';
import type { SelectedPlan } from '../types';
import ContactForm from '../components/ContactForm';
import styles from './ContactanosPage.module.css';

export default function ContactanosPage() {
  const selectedPlan: SelectedPlan | null = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const name = params.get('plan');
    const price = params.get('precio') || '';
    const futbol = params.get('futbol') === '1';

    if (!name) return null;
    return { name, price, futbol };
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.heroHeader}>
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>ATENCIÓN AL CLIENTE & REGISTRO</p>
          <h1>Formulario de Registro y Solicitud</h1>
          <p>
            {selectedPlan?.name
              ? `Completá tus datos para solicitar la instalación del plan ${selectedPlan.name}.`
              : 'Completá el formulario con tus datos para solicitar la instalación o información de nuestros servicios.'}
          </p>
        </div>
      </div>

      <div className="wrap" style={{ padding: '60px 24px 80px' }}>
        <ContactForm selected={selectedPlan} prefillAddress="" />
      </div>
    </div>
  );
}
