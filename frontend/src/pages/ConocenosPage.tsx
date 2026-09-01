import styles from './ConocenosPage.module.css';


export default function ConocenosPage() {
  const localidades = [
    {
      provincia: 'Entre Ríos',
      icon: '🏛️',
      ciudades: [
        { nombre: 'San José', agencialocal: true },
        { nombre: 'Concepción del Uruguay', agencialocal: false },
        { nombre: 'Basavilbaso', agencialocal: false },
      ],
    },
    {
      provincia: 'Santa Fe',
      icon: '🌾',
      ciudades: [
        { nombre: 'Santa Fe Cap.', agencialocal: false },
        { nombre: 'Coronda', agencialocal: false },
        { nombre: 'Empalme', agencialocal: false },
        { nombre: 'Recreo', agencialocal: false },
        { nombre: 'Sauce Viejo', agencialocal: false },
        { nombre: 'Santo Tomé', agencialocal: false },
        { nombre: 'Villa Constitución', agencialocal: false },
        { nombre: 'San Cristóbal', agencialocal: false },
      ],
    },
    {
      provincia: 'Córdoba',
      icon: '⛰️',
      ciudades: [{ nombre: 'San Francisco', agencialocal: false }],
    },
    {
      provincia: 'Corrientes',
      icon: '🌿',
      ciudades: [{ nombre: 'Santo Tomé', agencialocal: false }],
    },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Sub-bar Ubicación */}
      {/* Sección Hero "¿POR QUÉ ELEGIRNOS?" idéntica al sitio original */}
      <section className={styles.heroSection}>
        <div className={styles.circleBgGlow1}></div>
        <div className={styles.circleBgGlow2}></div>

        <div className={`wrap ${styles.heroGrid}`}>
          {/* Columna Izquierda: Textos estilizados */}
          <div className={styles.textColumn}>
            <h1 className={styles.mainTitle}>¿POR QUÉ ELEGIRNOS?</h1>

            <p className={styles.textBlock}>
              Somos una empresa Argentina con la última tecnología del mercado, tenemos la mejor internet, estable, confiable y rápida. Con una completa variedad de productos y prestaciones adecuadas para cada necesidad de tu hogar, empresa o comercio.
            </p>

            <p className={styles.textBlock}>
              Ofrecemos un servicio de televisión con más de 100 canales locales e internacionales, más fútbol y las mejores plataformas de streaming con la más alta calidad de definición en imagen.
            </p>

            <p className={styles.textBlock}>
              Agencia oficial de Internet Services, ubicada en San José Entre Ríos, para brindar servicio en sus alrededores.
            </p>

            <div className={styles.badgeWrapper}>
              <span className={styles.taglineBadge}>
                ✨ ¡Tenemos buena fibra, y es buena para vos!
              </span>
            </div>
          </div>

          {/* Columna Derecha: Imagen Circular con borde Rojo */}
          <div className={styles.imageColumn}>
            <div className={styles.circleFrame}>
              <img
                src="/office-hero.png"
                alt="Agencia oficial de Internet Services San José"
                className={styles.heroImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Barra separadora azul */}
      <div className={styles.blueBar}></div>

      {/* Sección Red de Cobertura e Influencia */}
      <section className={styles.networkSection}>
        <div className="wrap">
          <div className={styles.networkBox}>
            <div className={styles.networkText}>
              <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>PRESENCIA NACIONAL</p>
              <h2>Red de Agentes Oficiales e Infraestructura</h2>
              <p>
                Con base en nuestra <strong>Oficina Central de Buenos Aires</strong> y en la <strong>Ciudad de Santa Fe</strong>, tenemos una red de Agentes donde ofrecemos nuestro servicio:
              </p>
            </div>

            <div className={styles.provinciasGrid}>
              {localidades.map((loc) => (
                <div key={loc.provincia} className={styles.provinciaCard}>
                  <div className={styles.provinciaTitle}>
                    <span>{loc.icon}</span>
                    <h4>{loc.provincia}</h4>
                  </div>
                  <ul>
                    {loc.ciudades.map((c) => (
                      <li key={c.nombre} className={c.agencialocal ? styles.highlightCity : ''}>
                        {c.agencialocal ? `⭐ ${c.nombre} (Agencia Oficial)` : `• ${c.nombre}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={styles.b2bNote}>
              <p>
                🌐 También Internet Services brinda a unos <strong>100 ISPs de nuestro país</strong> el servicio de consultoría técnica, soluciones tecnológicas, transporte de ancho de banda además de servicios administrativos y legales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.ctaSection}>
        <div className="wrap">
          <div className={styles.ctaBox}>
            <h2>¿Querés contratar la mejor fibra de San José?</h2>
            <p>Consultá tu cobertura al instante o elegí el plan que mejor se adapte a tu hogar.</p>
            <div className={styles.ctaButtons}>
              <a href="index.html#cobertura" className="btn btn-red">
                Verificar Cobertura
              </a>
              <a href="index.html#fibra" className="btn btn-blue">
                Ver Planes de Fibra
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
