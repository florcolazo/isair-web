import { useEffect } from 'react';
import styles from './TermsModal.module.css';

interface Props {
  onAccept: () => void;
  onClose: () => void;
}

export default function TermsModal({ onAccept, onClose }: Props) {
  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Términos y Condiciones">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2>Términos y Condiciones</h2>
            <p>Internet Services · Agencia San José</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          <p className={styles.updated}>Última actualización: agosto de 2026</p>

          <section>
            <h3>1. Aceptación de los Términos</h3>
            <p>Al completar el formulario de contratación en este sitio web, el usuario declara haber leído, comprendido y aceptado en su totalidad los presentes Términos y Condiciones del servicio ofrecido por <strong>Internet Services — Agencia San José</strong> (en adelante "ISAIR"), agencia autorizada de IS (Internet Services), con sede en San José, Entre Ríos, Argentina.</p>
          </section>

          <section>
            <h3>2. Protección de Datos Personales — Ley 25.326</h3>
            <p>Los datos personales suministrados (nombre, DNI, teléfono, dirección, email) serán incorporados a una base de datos de titularidad de ISAIR, con la finalidad exclusiva de gestionar la solicitud de contratación del servicio de internet.</p>
            <p>De conformidad con la <strong>Ley N.º 25.326 de Protección de Datos Personales</strong> y sus disposiciones reglamentarias, el titular de los datos tiene derecho de acceso, rectificación, actualización y supresión de sus datos en cualquier momento, escribiendo a <a href="mailto:isaircolon1@gmail.com">isaircolon1@gmail.com</a> o a través del número de WhatsApp disponible en el sitio.</p>
            <p>Los datos no serán cedidos ni transferidos a terceros sin el consentimiento del titular, salvo obligación legal.</p>
          </section>

          <section>
            <h3>3. Descripción del Servicio</h3>
            <p>ISAIR ofrece servicios de acceso a internet mediante tecnología de <strong>Fibra Óptica</strong> e <strong>Internet Inalámbrica</strong>, en la ciudad de San José y zonas aledañas de la provincia de Entre Ríos.</p>
            <p>La disponibilidad del servicio está sujeta a la cobertura geográfica existente en la dirección indicada por el solicitante. La empresa se reserva el derecho de verificar la viabilidad técnica antes de confirmar la contratación.</p>
          </section>

          <section>
            <h3>4. Promociones y Precios</h3>
            <p>Los precios y promociones publicados en este sitio están expresados en <strong>pesos argentinos (ARS)</strong> e incluyen IVA, salvo indicación en contrario.</p>
            <p>Las promociones tienen <strong>vigencia limitada</strong> y están sujetas a disponibilidad. Los descuentos cuatrimestrales indicados (60%, 55%, 50%) aplican sobre el precio de lista del período correspondiente y son exclusivos para nuevas contrataciones durante el período promocional.</p>
            <p>ISAIR se reserva el derecho de modificar los precios de lista conforme a la normativa vigente y la inflación, notificando al cliente con un mínimo de 30 días de anticipación.</p>
          </section>

          <section>
            <h3>5. Condiciones de Instalación</h3>
            <p>La instalación del servicio será coordinada entre ISAIR y el cliente según los horarios disponibles declarados en el formulario. El costo de instalación queda especificado en cada plan.</p>
            <p>El cliente deberá garantizar el acceso al domicilio en la fecha y hora acordadas. En caso de no cumplirse, podrá reprogramarse con 24 horas de anticipación.</p>
          </section>

          <section>
            <h3>6. Política de Uso Aceptable</h3>
            <p>El servicio de internet provisto por ISAIR es de uso personal y/o familiar. Queda expresamente prohibido:</p>
            <ul>
              <li>Revender o redistribuir el servicio a terceros sin autorización expresa.</li>
              <li>Utilizar el servicio para actividades ilícitas o que infrinjan derechos de terceros.</li>
              <li>Realizar acciones que comprometan la estabilidad o seguridad de la red.</li>
            </ul>
          </section>

          <section>
            <h3>7. Suspensión y Baja del Servicio</h3>
            <p>ISAIR podrá suspender el servicio ante falta de pago, incumplimiento de los presentes términos o por causas de fuerza mayor. La baja voluntaria del servicio deberá solicitarse con al menos <strong>15 días corridos</strong> de anticipación a través de los canales de contacto habilitados.</p>
          </section>

          <section>
            <h3>8. Limitación de Responsabilidad</h3>
            <p>ISAIR no se responsabiliza por interrupciones del servicio causadas por cortes de energía eléctrica, fenómenos meteorológicos extremos, obras públicas, o cualquier otro evento de fuerza mayor ajeno a su control operativo.</p>
          </section>

          <section>
            <h3>9. Modificaciones</h3>
            <p>ISAIR se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán publicadas en este sitio web y entrarán en vigencia a partir de su publicación.</p>
          </section>

          <section>
            <h3>10. Contacto</h3>
            <p>Para consultas, reclamos o ejercicio de derechos sobre datos personales:</p>
            <ul>
              <li>📧 Email: <a href="mailto:isaircolon1@gmail.com">isaircolon1@gmail.com</a></li>
              <li>📲 WhatsApp: <a href="https://wa.me/5493447524550" target="_blank" rel="noopener">+54 9 3447 52-4550</a></li>
              <li>📍 San José, Entre Ríos, Argentina</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={`btn btn-ghost ${styles.closeFooter}`} onClick={onClose}>
            Cerrar
          </button>
          <button className={`btn btn-red`} onClick={onAccept}>
            ✓ Acepto los Términos y Condiciones
          </button>
        </div>
      </div>
    </div>
  );
}
