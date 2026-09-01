import { useState } from 'react';
import type { SelectedPlan, FormData } from '../types';
import { buildWhatsAppUrl } from '../utils';
import TermsModal from './TermsModal';
import styles from './ContactForm.module.css';

interface Props {
  selected: SelectedPlan | null;
  prefillAddress?: string;
}

const EMPTY: FormData = {
  nombre: '', telefono: '', direccion: '',
  email: '', dni: '', horarios: '', acceptedTerms: false,
};

export default function ContactForm({ selected, prefillAddress }: Props) {
  const [form, setForm]         = useState<FormData>({ ...EMPTY, direccion: prefillAddress ?? '' });
  const [showTerms, setShowTerms] = useState(false);
  const [msg, setMsg]           = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  // Sync prefillAddress when it arrives from CoverageChecker
  const lastPrefill = prefillAddress ?? '';

  const set = (field: keyof FormData, val: string | boolean) =>
    setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.acceptedTerms) {
      setMsg({ text: 'Debés aceptar los Términos y Condiciones para continuar.', type: 'err' });
      return;
    }

    const url = buildWhatsAppUrl(selected, {
      nombre:   form.nombre,
      telefono: form.telefono,
      direccion: form.direccion || lastPrefill,
      email:    form.email,
      dni:      form.dni,
      horarios: form.horarios,
    });
    window.open(url, '_blank');
    setMsg({ text: '¡Abriendo WhatsApp para enviar tu solicitud!', type: 'ok' });
  };

  return (
    <>
      <section className={styles.section} id="formulario">
        <div className="wrap">
          <div className={styles.card}>
            <h2>Completá tus datos</h2>
            <p>Te contactamos a la brevedad para coordinar la instalación o responder tu consulta.</p>

            {/* Plan seleccionado o consulta general */}
            <div className={styles.selectedPlan}>
              <div>
                <span>{selected?.name ? 'Plan seleccionado' : 'Solicitud'}</span>
                <strong>{selected?.name || 'Consulta General / Solicitud de Información'}</strong>
              </div>
              {selected?.price && <span className={styles.price}>{selected.price}</span>}
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="nombre">Nombre y apellido</label>
                <input id="nombre" type="text" required value={form.nombre}
                  onChange={e => set('nombre', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" type="tel" required value={form.telefono}
                  onChange={e => set('telefono', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="direccion">Dirección de instalación</label>
                <input id="direccion" type="text" required
                  value={form.direccion || lastPrefill}
                  onChange={e => set('direccion', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="email">Email <span className={styles.optional}>(opcional)</span></label>
                <input id="email" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="dni">DNI</label>
                <input id="dni" type="text" required value={form.dni}
                  onChange={e => set('dni', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="horarios">Horarios disponibles</label>
                <input id="horarios" type="text" required placeholder="Ej: Mañana de 9 a 12hs"
                  value={form.horarios}
                  onChange={e => set('horarios', e.target.value)} />
              </div>

              {/* ── TÉRMINOS Y CONDICIONES ── */}
              <div className={styles.termsRow}>
                <input
                  id="acceptedTerms"
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={e => set('acceptedTerms', e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor="acceptedTerms" className={styles.termsLabel}>
                  Acepto los{' '}
                  <button
                    type="button"
                    className={styles.termsLink}
                    onClick={() => setShowTerms(true)}
                  >
                    Términos y Condiciones
                  </button>
                  {' '}y la política de privacidad de datos personales (Ley 25.326)
                </label>
              </div>

              <button
                type="submit"
                className={`btn btn-red ${styles.submit}`}
                disabled={!form.acceptedTerms}
                title={!form.acceptedTerms ? 'Debés aceptar los Términos y Condiciones' : ''}
              >
                Enviar solicitud
              </button>

              {msg && (
                <p className={`${styles.msg} ${msg.type === 'err' ? styles.err : styles.ok}`}>
                  {msg.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {showTerms && (
        <TermsModal
          onAccept={() => { set('acceptedTerms', true); setShowTerms(false); }}
          onClose={() => setShowTerms(false)}
        />
      )}
    </>
  );
}
