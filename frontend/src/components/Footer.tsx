import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div>
            <strong>Internet Services · Agencia San José</strong>
            <p>Internet Fibra Óptica e Inalámbrica en San José y alrededores.</p>
          </div>
          <div>
            <strong>Contacto</strong>
            <p>WhatsApp: +54 9 3447 52-4550<br/>Email: isaircolon1@gmail.com</p>
          </div>
          <div>
            <strong>Seguinos</strong>
            <p>
              <a href="https://www.instagram.com/issanjose" target="_blank" rel="noopener" className={styles.igLink}>
                <img src="/Instagram_logo_2022.svg" alt="Instagram" />
                @issanjose en Instagram
              </a>
            </p>
          </div>
        </div>

        {/* Contador de visitas */}
        <p className={styles.visits}>
          <a href="https://hits.sh/issanjose.com.ar/" target="_blank" rel="noopener" title="Contador de visitas">
            <img
              src="https://hits.sh/issanjose.com.ar.svg?style=flat-square&label=Visitas&color=0072ff&labelColor=051b44"
              alt="Contador de visitas"
            />
          </a>
        </p>

        <p className={styles.copy}>
          © {new Date().getFullYear()} Internet Services · Agencia San José. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
