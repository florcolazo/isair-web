import type { SelectedPlan } from '../types';
import { spawnSoccerBall } from '../utils';
import styles from './Hero.module.css';

interface Props {
  onSelectPlan: (plan: SelectedPlan) => void;
  banners?: {id: string, imagen: string}[];
}

export default function Hero({ onSelectPlan, banners = [] }: Props) {
  const handleBannerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelectPlan({ name: '', price: '', futbol: true });
    for (let i = 0; i < 30; i++) spawnSoccerBall();
    document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero}>
      {/* Banners */}
      {banners.length > 0 ? (
        <div className={styles.slider}>
          {banners.map(b => (
            <div key={b.id} className={styles.slide}>
              <img src={b.imagen} alt="Banner Promocional" />
            </div>
          ))}
        </div>
      ) : (
        <a href="#formulario" onClick={handleBannerClick} className={styles.bannerLink}>
          <img src="/banner-promo.png" alt="Promoción Fútbol" className={styles.banner} />
        </a>
      )}

      {/* Cards: Fibra Óptica / Inalámbrica */}
      <div className={styles.techGrid}>
        <a href="#fibra" className={`${styles.techCard} ${styles.fibra}`}>
          <div className={styles.fiberLine} aria-hidden="true">
            <svg viewBox="0 0 900 500" preserveAspectRatio="none">
              <path d="M -50 250 C 250 60, 500 380, 900 120" stroke="rgba(120,150,255,.35)" strokeWidth="2" fill="none"/>
              <circle className={styles.pulse} r="5" fill="#8fb2ff"/>
            </svg>
          </div>
          <div className={styles.inner}>
            <h3>Tecnología Fibra Óptica</h3>
            <span className="btn btn-red">Ver planes</span>
          </div>
        </a>

        <a href="#inalambrica" className={`${styles.techCard} ${styles.inal}`}>
          <div className={styles.wifiRings} aria-hidden="true">
            <span/><span/><span/>
          </div>
          <div className={styles.inner}>
            <h3>Tecnología Inalámbrica</h3>
            <span className="btn btn-blue">Ver planes</span>
          </div>
        </a>
      </div>
    </section>
  );
}
