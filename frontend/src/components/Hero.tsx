import type { Banner } from '../types';
import styles from './Hero.module.css';

interface Props {
  banners?: Banner[];
}

export default function Hero({ banners = [] }: Props) {
  const sliderBanners: Banner[] = [
    { id: 'is-tv-mothers-month', imagen: '/banner-istv.png', enlace: '#formulario' },
    ...banners,
  ];

  return (
    <section className={styles.hero}>
      {/* Banners */}
      {banners.length > 0 ? (
        <div className={styles.slider}>
          {sliderBanners.map(b => {
            const image = <img src={b.imagen} alt={b.id === 'is-tv-mothers-month' ? 'Promoción IS TV' : 'Banner Promocional'} />;
            return (
              <div key={b.id} className={styles.slide}>
                {b.enlace ? <a href={b.enlace} className={styles.slideLink}>{image}</a> : image}
              </div>
            );
          })}
        </div>
      ) : (
        <a href="#formulario" className={styles.bannerLink}>
          <img src="/banner-istv.png" alt="Promoción IS TV" className={styles.banner} />
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
