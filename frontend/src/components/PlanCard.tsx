import type { Plan, SelectedPlan, Prices } from '../types';
import { formatPrice, spawnSoccerBall } from '../utils';
import styles from './PlanCard.module.css';

interface Props {
  plan: Plan;
  prices: Prices;
  onSelect: (sel: SelectedPlan) => void;
  dimmed?: boolean;
}

export default function PlanCard({ plan, prices, onSelect, dimmed }: Props) {
  const raw   = prices[plan.priceId] ?? 0;
  const price = formatPrice(raw);

  const handleSelect = (futbol = false) => {
    onSelect({ name: plan.name, price, futbol });
    if (futbol) for (let i = 0; i < 30; i++) spawnSoccerBall();
    setTimeout(() => {
      document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' });
    }, futbol ? 0 : 0);
  };

  const isWireless = plan.technology === 'inalambrica';

  return (
    <div className={`
      ${styles.card}
      ${plan.isFeatured ? styles.featured : ''}
      ${isWireless ? styles.wireless : ''}
      ${dimmed ? styles.dimmed : ''}
    `}>
      {plan.hasFutbol && (
        <button className={styles.badge} onClick={() => handleSelect(true)}>
          ⚽ Quiero fútbol
        </button>
      )}

      <p className={styles.name}>
        {plan.subtitle && (
          <span className={styles.subtitle}>{plan.subtitle}</span>
        )}
        {plan.subtitle
          ? plan.name.replace(plan.subtitle, '').replace('+ ', '+ ').trim()
          : plan.name}
      </p>

      <div className={styles.price}>
        <span className={styles.amount}>{price}</span>
        <span className={styles.per}>/ mes</span>
      </div>

      {plan.features.length > 0 && (
        <ul className={styles.features}>
          {plan.features.map(f => <li key={f}>{f}</li>)}
        </ul>
      )}

      <div className={styles.meta}>
        <div><span>Instalación</span><strong>{plan.installationLabel}</strong></div>
        <div><span>Promo</span><strong>{plan.promoLabel}</strong></div>
      </div>

      <p className={styles.note}>{plan.promoNote}</p>

      <button
        className={`btn ${isWireless ? 'btn-blue' : 'btn-red'} ${styles.cta}`}
        onClick={() => handleSelect(false)}
      >
        {isWireless ? 'Lo quiero!' : 'Yo quiero!'}
      </button>
    </div>
  );
}
