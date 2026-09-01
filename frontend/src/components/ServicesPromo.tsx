import styles from './ServicesPromo.module.css';

export default function ServicesPromo() {
  const handleSelectService = (serviceName: string) => {
    const query = new URLSearchParams({ plan: serviceName, precio: 'Consultar' }).toString();
    window.location.href = `contactanos.html?${query}`;
  };

  return (
    <div className={styles.container}>
      {/* ── SECCIÓN IS CAM (CÁMARAS DE SEGURIDAD) ── */}
      <section id="iscam" className={styles.sectionWrap}>
        <div className="wrap">
          <div className={styles.camCardGrid}>
            {/* Tarjeta Izquierda Roja */}
            <div className={styles.camRedCard}>
              <span className={styles.newTag}>NUEVA</span>
              <h2>IS CAM</h2>
              <h3>AUTO VIGILANCIA</h3>
              
              <div className={styles.imgWrapper}>
                <img src="/is-cam.png" alt="Cámara de Seguridad IS CAM" className={styles.productImg} />
              </div>

              <div className={styles.featuresPills}>
                <span>• BOTÓN DE PÁNICO</span>
                <span>• CONTROL DE ZONAS DE VIGILANCIA</span>
                <span>• ALERTAS EN TIEMPO REAL</span>
              </div>
            </div>

            {/* Tarjeta Derecha Blanca */}
            <div className={styles.camWhiteCard}>
              <h2 className={styles.camTitle}>¡VISUALIZÁ TU CASA EN TIEMPO REAL!</h2>

              <ul className={styles.bulletList}>
                <li>
                  <span className={styles.bulletCheck}>✓</span>
                  <span><strong>IS CAM</strong> detecta personas, mascotas y vehículos</span>
                </li>
                <li>
                  <span className={styles.bulletCheck}>✓</span>
                  <span>Accedés a la aplicación desde cualquier dispositivo</span>
                </li>
                <li>
                  <span className={styles.bulletCheck}>✓</span>
                  <span>Registrá eventos con fotos y grabá hasta 48 hs</span>
                </li>
                <li>
                  <span className={styles.bulletCheck}>✓</span>
                  <span>Grupos y chat de usuarios integrados</span>
                </li>
              </ul>

              <button
                className={`btn btn-red ${styles.btnAction}`}
                onClick={() => handleSelectService('IS CAM Auto Vigilancia')}
              >
                QUIERO IS CAM
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN IS MESH (WIFI PREMIUM) ── */}
      <section id="ismesh" className={styles.sectionWrap}>
        <div className="wrap">
          <div className={styles.meshCardGrid}>
            {/* Tarjeta Izquierda Azul Oscuro */}
            <div className={styles.meshBlueCard}>
              <h2>CONTRATÁ IS MESH</h2>
              <span className={styles.meshBadge}>WIFI PREMIUM</span>
              
              <div className={styles.imgWrapper}>
                <img src="/is-mesh.png" alt="Router Huawei IS MESH Wi-Fi" className={styles.productImg} />
              </div>

              <p className={styles.meshDesc}>
                La mejor cobertura estable con la mayor conectividad. ¡Contactanos que te asesoramos!
              </p>
            </div>

            {/* Tarjeta Derecha Celeste / Blanca */}
            <div className={styles.meshSkyCard}>
              <h2 className={styles.meshTitle}>¡WIFI PREMIUM EN TODO TU HOGAR!</h2>

              <ul className={styles.bulletList}>
                <li>
                  <span className={styles.bulletCheckBlue}>✓</span>
                  <span><strong>Fácil instalación</strong> en tu domicilio</span>
                </li>
                <li>
                  <span className={styles.bulletCheckBlue}>✓</span>
                  <span><strong>Conexión ultrarrápida</strong> en todos los ambientes</span>
                </li>
                <li>
                  <span className={styles.bulletCheckBlue}>✓</span>
                  <span><strong>Mejor cobertura estable</strong> para streaming y gaming</span>
                </li>
                <li>
                  <span className={styles.bulletCheckBlue}>✓</span>
                  <span><strong>Amplía el alcance</strong> eliminando zonas ciegas</span>
                </li>
              </ul>

              <button
                className={`btn btn-blue ${styles.btnAction}`}
                onClick={() => handleSelectService('IS MESH Wi-Fi Premium')}
              >
                QUIERO IS MESH
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
