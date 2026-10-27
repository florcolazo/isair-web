/* ---------- Tarjetas de planes en el celular ----------
 * La letra chica de la promo (.plan-note) se muestra recortada a 2 líneas para
 * que la tarjeta entre en la pantalla; este botón la despliega completa.
 * A las tarjetas con TV (ISTV en el nombre) se les agrega "Ver grilla de canales",
 * que lleva a internet-tv.html y abre la grilla.
 * Las tarjetas se dibujan después de cargar planes.json, por eso se observa el DOM.
 */
(function () {
  function agregarBotones(raiz) {
    raiz.querySelectorAll('.plan-note:not([data-toggle])').forEach(nota => {
      if (!nota.textContent.trim()) return;
      nota.dataset.toggle = '1';
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'plan-note-toggle';
      boton.textContent = 'Ver condiciones';
      boton.setAttribute('aria-expanded', 'false');
      boton.addEventListener('click', () => {
        const abierta = nota.classList.toggle('abierta');
        boton.textContent = abierta ? 'Ocultar condiciones' : 'Ver condiciones';
        boton.setAttribute('aria-expanded', String(abierta));
      });
      nota.after(boton);
    });
  }

  const ICONO_GRILLA = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>';

  function agregarLinksGrilla(raiz) {
    raiz.querySelectorAll('.plan-card:not([data-grilla])').forEach(card => {
      card.dataset.grilla = '1';
      const nombre = card.querySelector('.plan-name')?.textContent || '';
      if (!/\bIS ?TV\b/i.test(nombre)) return;
      const link = document.createElement('a');
      link.href = 'internet-tv.html#grilla';
      link.className = 'plan-ver-grilla';
      link.innerHTML = ICONO_GRILLA + 'Ver grilla de canales';
      const lista = card.querySelector('.plan-features');
      if (lista) lista.after(link); else card.append(link);
    });
  }

  function iniciar() {
    agregarBotones(document);
    agregarLinksGrilla(document);
    new MutationObserver(() => { agregarBotones(document); agregarLinksGrilla(document); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
