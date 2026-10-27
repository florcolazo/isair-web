/* ---------- Tarjetas de planes en el celular ----------
 * La letra chica de la promo (.plan-note) se muestra recortada a 2 líneas para
 * que la tarjeta entre en la pantalla; este botón la despliega completa.
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

  function iniciar() {
    agregarBotones(document);
    new MutationObserver(() => agregarBotones(document))
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
