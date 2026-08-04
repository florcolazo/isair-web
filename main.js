/* ============================================================
   ISAIR · Internet Services Agencia San José
   main.js — Lógica de interacción del sitio
   ============================================================ */

/* ---------- AÑO EN EL FOOTER ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- PRECIOS DINÁMICOS ---------- */
fetch('precios.json')
  .then(response => response.json())
  .then(prices => {
    document.querySelectorAll('[data-price-id]').forEach(el => {
      const id = el.getAttribute('data-price-id');
      if (prices[id]) {
        const formattedPrice = '$' + prices[id].toLocaleString('es-AR');
        el.textContent = formattedPrice;

        // Actualizar también el data-price del botón en la misma card
        const card = el.closest('.plan-card');
        if (card) {
          const selectBtn = card.querySelector('.select-plan');
          if (selectBtn) selectBtn.setAttribute('data-price', formattedPrice);

          const futbolBtn = card.querySelector('.add-futbol-btn');
          if (futbolBtn) futbolBtn.setAttribute('data-price', formattedPrice);
        }
      }
    });
  })
  .catch(err => console.error('Error al cargar precios:', err));

/* ---------- SELECCIÓN DE PLAN ---------- */
document.querySelectorAll('.select-plan').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const name  = btn.getAttribute('data-name');
    const price = btn.getAttribute('data-price');

    document.getElementById('selectedPlanName').textContent  = name;
    document.getElementById('selectedPlanPrice').textContent = price;
    document.getElementById('planInput').value = name + ' - ' + price;

    const fCheckbox = document.getElementById('futbol');
    if (fCheckbox) fCheckbox.checked = false;

    document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ---------- BOTÓN "QUIERO FÚTBOL" ---------- */
document.querySelectorAll('.add-futbol-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const name  = btn.getAttribute('data-name');
    const price = btn.getAttribute('data-price');

    document.getElementById('selectedPlanName').textContent  = name;
    document.getElementById('selectedPlanPrice').textContent = price;
    document.getElementById('planInput').value = name + ' - ' + price;

    const fCheckbox = document.getElementById('futbol');
    if (fCheckbox) fCheckbox.checked = true;

    const formSection = document.getElementById('formulario');
    formSection.scrollIntoView({ behavior: 'smooth' });

    // Efecto flash en el formulario
    const formCard = formSection.querySelector('.form-card');
    formCard.classList.remove('form-flash');
    void formCard.offsetWidth; // forzar reflow
    formCard.classList.add('form-flash');

    // Efecto de pelotas de fútbol
    for (let i = 0; i < 30; i++) {
      createSoccerBall();
    }
  });
});

/* ---------- ENVÍO DEL FORMULARIO (WhatsApp) ---------- */
const form = document.getElementById('contactForm');
const msg  = document.getElementById('formMsg');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const plan = document.getElementById('planInput').value;
  if (!plan) {
    msg.textContent = 'Por favor, elegí un plan antes de enviar la solicitud.';
    msg.className   = 'form-msg err';
    return;
  }

  const nombre    = document.getElementById('nombre').value;
  const telefono  = document.getElementById('telefono').value;
  const direccion = document.getElementById('direccion').value;
  const email     = document.getElementById('email').value;
  const dni       = document.getElementById('dni').value;
  const horarios  = document.getElementById('horarios').value;
  const fCheckbox = document.getElementById('futbol');
  const futbol    = (fCheckbox && fCheckbox.checked) ? 'Sí' : 'No';

  let texto =
    '👋 Hola ISAIR, quiero solicitar un plan:\n\n' +
    '📌 *Plan:* '          + plan      + '\n' +
    '⚽ *Pack Fútbol:* '   + futbol    + '\n\n' +
    '👤 *Mis datos:*\n'                         +
    '- Nombre: '           + nombre    + '\n' +
    '- DNI: '              + dni       + '\n' +
    '- Teléfono: '         + telefono  + '\n' +
    '- Dirección: '        + direccion + '\n' +
    '- Horarios disponibles: ' + horarios;

  if (email) {
    texto += '\n- Email: ' + email;
  }

  const waUrl = 'https://wa.me/5493447524550?text=' + encodeURIComponent(texto);
  window.open(waUrl, '_blank');

  msg.textContent = '¡Abriendo WhatsApp para enviar tu solicitud!';
  msg.className   = 'form-msg';
});

/* ---------- BANNER PROMO → FÚTBOL + FORMULARIO ---------- */
document.getElementById('promoBannerBtn').addEventListener('click', function (e) {
  e.preventDefault();

  const fCheckbox = document.getElementById('futbol');
  if (fCheckbox) fCheckbox.checked = true;

  const formSection = document.getElementById('formulario');
  formSection.scrollIntoView({ behavior: 'smooth' });

  const formCard = formSection.querySelector('.form-card');
  formCard.classList.remove('form-flash');
  void formCard.offsetWidth;
  formCard.classList.add('form-flash');

  for (let i = 0; i < 30; i++) {
    createSoccerBall();
  }
});

/* ---------- CARRUSEL DE PLANES ---------- */
document.getElementById('scrollRight').addEventListener('click', function () {
  document.getElementById('plansGrid').scrollBy({ left: 340, behavior: 'smooth' });
});
document.getElementById('scrollLeft').addEventListener('click', function () {
  document.getElementById('plansGrid').scrollBy({ left: -340, behavior: 'smooth' });
});

/* ---------- HAMBURGER MENU ---------- */
document.getElementById('hamburgerBtn').addEventListener('click', function (e) {
  e.stopPropagation();
  document.getElementById('hamburgerMenu').classList.toggle('open');
});

document.querySelectorAll('.dropdown-submenu span').forEach(function (span) {
  span.addEventListener('click', function (e) {
    e.stopPropagation();
    this.parentElement.classList.toggle('open');
  });
});

// Cerrar menú al hacer click fuera
document.addEventListener('click', function (e) {
  const menu = document.getElementById('hamburgerMenu');
  if (menu && !menu.contains(e.target)) {
    menu.classList.remove('open');
  }
});

/* ---------- EFECTO PELOTA DE FÚTBOL ---------- */
function createSoccerBall() {
  const ball = document.createElement('div');
  ball.className   = 'soccer-ball';
  ball.textContent = '⚽';

  ball.style.left = (window.innerWidth  / 2) + 'px';
  ball.style.top  = (window.innerHeight / 2) + 'px';

  const angle    = Math.random() * Math.PI * 2;
  const velocity = 100 + Math.random() * 300;
  ball.style.setProperty('--tx', (Math.cos(angle) * velocity) + 'px');
  ball.style.setProperty('--ty', (Math.sin(angle) * velocity) + 'px');

  document.body.appendChild(ball);
  setTimeout(() => ball.remove(), 1000);
}
