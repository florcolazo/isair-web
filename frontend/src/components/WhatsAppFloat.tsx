import { WA_NUMBER } from '../data';
import styles from './WhatsAppFloat.module.css';

export default function WhatsAppFloat() {
  return (
    <a
      className={styles.float}
      href={`https://wa.me/${WA_NUMBER}`}
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.6 5.9L0 24l6.3-1.6C8 23.4 10 24 12 24c6.6 0 12-5.4 12-12S18.6 0 12 0zm6.9 17c-.3.8-1.6 1.5-2.4 1.6-.6.1-1.4.2-4.1-.9-3.5-1.4-5.7-4.9-5.9-5.2-.2-.2-1.4-1.9-1.4-3.6s.9-2.5 1.2-2.9c.3-.3.7-.4 1-.4h.7c.2 0 .5 0 .7.6.3.7.9 2.5 1 2.7.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.5-.6.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.1.8-.1.2-.2.9-1 1.1-1.4.2-.4.5-.3.8-.2.3.1 2 1 2.4 1.1.4.2.6.3.7.4.1.3.1.9-.2 1.7z"/>
      </svg>
    </a>
  );
}
