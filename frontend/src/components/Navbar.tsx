import React, { useState } from 'react';
import styles from './Navbar.module.css';
import logoUrl from '/logo.png';
import { WA_NUMBER } from '../data';

interface Props {
  currentPage?: 'home' | 'conocenos' | 'contactanos';
}

export default function Navbar({ currentPage }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servDropdown, setServDropdown] = useState(false);

  const close = () => { setMenuOpen(false); setServDropdown(false); };

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const menu = document.getElementById('hamburgerMenu');
      const dropdown = document.getElementById('serviciosDropdown');
      if (menu && !menu.contains(e.target as Node)) setMenuOpen(false);
      if (dropdown && !dropdown.contains(e.target as Node)) setServDropdown(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <header className={styles.header}>
      <div className={`${styles.nav} wrap`}>
        {/* Brand */}
        <a href="index.html" className={styles.brand}>
          <img src={logoUrl} alt="Internet Services – Agencia San José" className={styles.logo} />
          <div className={styles.brandText}>
            <strong>Internet Services</strong>
            <span>Agencia San José</span>
          </div>
        </a>

        {/* Links desktop */}
        <nav className={styles.navLinks}>
          <a
            href="index.html"
            style={currentPage === 'home' ? { color: '#fff', fontWeight: 800, textDecoration: 'underline' } : {}}
          >
            Inicio
          </a>

          {/* Dropdown Servicios */}
          <div
            id="serviciosDropdown"
            className={styles.dropdownWrap}
            onMouseEnter={() => setServDropdown(true)}
            onMouseLeave={() => setServDropdown(false)}
          >
            <button
              className={styles.dropdownToggle}
              onClick={() => setServDropdown(prev => !prev)}
            >
              Servicios <span className={styles.arrow}>▾</span>
            </button>
            {servDropdown && (
              <div className={styles.dropdownMenu}>
                <a href="index.html#ismesh" onClick={close} className={styles.dropdownItem}>
                  <span className={styles.itemBadge} style={{ background: '#0072ff' }}>IS MESH</span>
                  <div>
                    <strong>Wi-Fi Mesh Premium</strong>
                    <span>Conexión y cobertura en todo tu hogar</span>
                  </div>
                </a>
                <a href="index.html#iscam" onClick={close} className={styles.dropdownItem}>
                  <span className={styles.itemBadge} style={{ background: '#e60000' }}>IS CAM</span>
                  <div>
                    <strong>Cámaras de Seguridad</strong>
                    <span>Auto vigilancia en tiempo real</span>
                  </div>
                </a>
                <a href="conocenos.html" onClick={close} className={styles.dropdownItem}>
                  <span className={styles.itemBadge} style={{ background: '#00aaff' }}>ISTV</span>
                  <div>
                    <strong>Servicio TV & Streaming</strong>
                    <span>100+ canales en alta definición</span>
                  </div>
                </a>
              </div>
            )}
          </div>

          <a
            href="conocenos.html"
            style={currentPage === 'conocenos' ? { color: '#fff', fontWeight: 800, textDecoration: 'underline' } : {}}
          >
            Conocenos
          </a>
          <a
            href="contactanos.html"
            style={currentPage === 'contactanos' ? { color: '#fff', fontWeight: 800, textDecoration: 'underline' } : {}}
          >
            Contactar
          </a>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <a href="https://tv.is.com.ar/login" target="_blank" rel="noopener" className={styles.btnLogin}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
              <polyline points="17 2 12 7 7 2"/>
            </svg>
            <span>Acceso ISTV</span>
          </a>
          <a href="https://clientes.is.com.ar/#/login" target="_blank" rel="noopener" className={`${styles.btnLogin} ${styles.white}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Acceso Clientes</span>
          </a>

          {/* Hamburger */}
          <div id="hamburgerMenu" className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}>
            <button className={styles.hamburgerBtn} aria-label="Menu" onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            {menuOpen && (
              <div className={styles.dropdown}>
                <a href="index.html" onClick={close}>Inicio</a>
                <div className={styles.mobileSubheader}>Servicios:</div>
                <a href="index.html#ismesh" onClick={close}>• IS MESH (Wi-Fi Premium)</a>
                <a href="index.html#iscam" onClick={close}>• IS CAM (Cámaras de Seguridad)</a>
                <a href="conocenos.html" onClick={close}>• ISTV (Televisión)</a>
                <a href="conocenos.html" onClick={close}>Conocenos</a>
                <a href="contactanos.html" onClick={close}>Contactar</a>
              </div>
            )}
          </div>

          {/* Instagram */}
          <a className={styles.navCta} href="https://www.instagram.com/issanjose" target="_blank" rel="noopener" title="Seguinos en Instagram">
            <svg viewBox="0 0 24 24" fill="#E4405F" width="18" height="18">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.08 4.08 0 011.47.957c.45.45.77.89.957 1.47.163.46.349 1.26.404 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.241 1.97-.404 2.43a4.08 4.08 0 01-.957 1.47 4.08 4.08 0 01-1.47.957c-.46.163-1.26.349-2.43.404-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.241-2.43-.404a4.08 4.08 0 01-1.47-.957 4.08 4.08 0 01-.957-1.47c-.163-.46-.349-1.26-.404-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.055-1.17.241-1.97.404-2.43a4.08 4.08 0 01.957-1.47A4.08 4.08 0 015.064 2.293c.46-.163 1.26-.349 2.43-.404C8.76 1.831 9.14 1.82 12 1.82zM12 0C8.741 0 8.333.014 7.053.072 5.775.131 4.902.333 4.14.63a5.88 5.88 0 00-2.126 1.384A5.88 5.88 0 00.63 4.14C.333 4.902.131 5.775.072 7.053.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.059 1.278.261 2.15.558 2.913a5.88 5.88 0 001.384 2.126A5.88 5.88 0 004.14 23.37c.763.297 1.636.499 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.278-.059 2.15-.261 2.913-.558a5.88 5.88 0 002.126-1.384 5.88 5.88 0 001.384-2.126c.297-.763.499-1.636.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.059-1.278-.261-2.15-.558-2.913a5.88 5.88 0 00-1.384-2.126A5.88 5.88 0 0019.86.63C19.097.333 18.224.131 16.947.072 15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>

          {/* WhatsApp */}
          <a className={styles.navCta} href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="#fff" width="18" height="18">
              <path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.6 5.9L0 24l6.3-1.6C8 23.4 10 24 12 24c6.6 0 12-5.4 12-12S18.6 0 12 0zm6.9 17c-.3.8-1.6 1.5-2.4 1.6-.6.1-1.4.2-4.1-.9-3.5-1.4-5.7-4.9-5.9-5.2-.2-.2-1.4-1.9-1.4-3.6s.9-2.5 1.2-2.9c.3-.3.7-.4 1-.4h.7c.2 0 .5 0 .7.6.3.7.9 2.5 1 2.7.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.5-.6.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.1.8-.1.2-.2.9-1 1.1-1.4.2-.4.5-.3.8-.2.3.1 2 1 2.4 1.1.4.2.6.3.7.4.1.3.1.9-.2 1.7z"/>
            </svg>
            <span className={styles.ctaText}>3447 524550</span>
          </a>
        </div>
      </div>
    </header>
  );
}
