/* ============================================================
   INTERNET SERVICES · Agencia San José
   main.js — Lógica de interacción dinámica
   ============================================================ */

/* ---------- VARIABLES GLOBALES ---------- */
let globalSiteConfig = null;

/* ---------- AÑO EN EL FOOTER ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- CARGA DINÁMICA DE CONFIGURACIÓN Y PLANES ---------- */
fetch('data/planes.json?v=' + new Date().getTime())
  .then(response => response.json())
  .then(data => {
    globalSiteConfig = data.sitio;
    
    // 1. Actualizar textos de marca y contactos dinámicamente
    if (document.getElementById('brandName')) document.getElementById('brandName').textContent = data.sitio.nombre_marca;
    if (document.getElementById('brandSub')) document.getElementById('brandSub').textContent = "AGENCIA " + data.sitio.ciudad.toUpperCase();
    if (document.getElementById('ctaPhone')) document.getElementById('ctaPhone').textContent = data.sitio.whatsapp_formato;
    if (document.getElementById('ctaWaLink')) document.getElementById('ctaWaLink').href = "https://wa.me/" + data.sitio.whatsapp;
    
    // 2. Actualizar nuevo pie de página (Footer)
    if (document.getElementById('footerPhone')) document.getElementById('footerPhone').textContent = "+54 9 " + (data.sitio.whatsapp_formato || "");
    
    const hd = document.getElementById('footerHorarioDigital');
    if (hd) {
      if (data.sitio.horario_atencion_digital === "") {
        hd.style.display = 'none';
      } else {
        hd.textContent = data.sitio.horario_atencion_digital || "Lunes a Viernes de 08:30 a 19:00 hs y Sábados de 08:00 a 12:00 hs.";
        hd.style.display = 'block';
      }
    }
    
    if (document.getElementById('footerAddress')) document.getElementById('footerAddress').textContent = data.sitio.direccion_oficina || "Churruarin 2207. Paraná, Entre Ríos, Argentina.";
    
    const ho = document.getElementById('footerHorarioOficina');
    if (ho) {
      if (data.sitio.horario_oficina === "") {
        ho.style.display = 'none';
      } else {
        ho.textContent = data.sitio.horario_oficina || "Lunes a Viernes de 08:30 a 17:00 hs.";
        ho.style.display = 'block';
      }
    }
    
    document.getElementById('footerTelefonos').textContent = data.sitio.telefonos_contacto || "0810-444-0414 / 0343 4140080";
    
    // Redes Sociales en Footer
    document.getElementById('socialWa').href = "https://wa.me/" + (data.sitio.whatsapp || "");
    document.getElementById('socialIg').href = "https://www.instagram.com/" + (data.sitio.instagram || "");
    
    document.getElementById('footerCopyBrand').textContent = data.sitio.nombre_marca;
    document.getElementById('floatWaLink').href = "https://wa.me/" + (data.sitio.whatsapp || "");

    // Precios de Packs Premium
    const precioFutbol = document.getElementById('precioPackFutbol');
    if (precioFutbol) precioFutbol.textContent = "$" + (data.sitio.precio_pack_futbol || "23.350");

    const precioHbo = document.getElementById('precioPackHbo');
    if (precioHbo) precioHbo.textContent = "$" + (data.sitio.precio_pack_hbo || "18.500");

    // 1.2. Actualizar banner promocional dinámicamente
    const bannerBtn = document.getElementById('promoBannerBtn');
    const bannerImg = document.getElementById('promoBannerImg');
    if (bannerBtn && bannerImg) {
      if (data.sitio.banner_mostrar !== false && data.sitio.banner_imagen) {
        bannerBtn.style.display = "block";
        bannerImg.src = data.sitio.banner_imagen;
        bannerImg.alt = data.sitio.banner_alt || "Promoción";
        bannerBtn.href = data.sitio.banner_link || "#formulario";
      } else {
        bannerBtn.style.display = "none";
      }
    }

    // 2. Renderizar planes en pantalla
    renderPlanes(data.planes);
  })
  .catch(err => console.error('Error al cargar configuración y planes:', err));

/* ---------- FUNCIÓN PARA RENDERIZAR TARJETAS ---------- */
function renderPlanes(planes) {
  const fibraGrid = document.getElementById('plansGrid');
  const inalGrid = document.getElementById('inalGrid');

  if (!fibraGrid || !inalGrid) return;

  fibraGrid.innerHTML = '';
  inalGrid.innerHTML = '';

  planes.forEach(plan => {
    // Crear contenedor de tarjeta
    const card = document.createElement('div');
    
    // Asignar clases correspondientes
    let cardClasses = ['plan-card'];
    if (plan.destacado) cardClasses.push('featured');
    if (plan.tipo === 'inalambrica') cardClasses.push('wireless');
    card.className = cardClasses.join(' ');

    // Formatear el nombre del plan para combos (ej: Internet 300MB + ISTV Full)
    let planNameHtml = '';
    if (plan.nombre.includes(' + ')) {
      const parts = plan.nombre.split(' + ');
      planNameHtml = `<span style="font-size:22px; color:var(--blue); display:block; margin-bottom:4px;">${parts[0]}</span> + ${parts[1]}`;
    } else {
      planNameHtml = plan.nombre;
    }

    const priceFormatted = '$' + plan.precio.toLocaleString('es-AR');
    const btnClass = plan.tipo === 'inalambrica' ? 'btn-blue' : 'btn-red';
    const btnText = plan.tipo === 'inalambrica' ? 'Lo quiero!' : 'Yo quiero!';
    const planCategoryText = plan.tipo === 'fibra' ? 'Fibra Óptica' : 'Inalámbrico';

    // Construir estructura HTML de la tarjeta
    let htmlContent = '';

    // Botón insignia de fútbol
    if (plan.pack_futbol) {
      htmlContent += `
        <button class="badge add-futbol-btn" style="cursor:pointer; border:none; outline:none;"
          data-name="${plan.nombre} (${planCategoryText})" data-price="${priceFormatted}">
          ⚽ Quiero fútbol
        </button>
      `;
    }

    // Nombre y precio
    htmlContent += `
      <p class="plan-name" style="${!plan.nombre.includes(' + ') ? 'font-size:24px; color:var(--blue);' : ''}">${planNameHtml}</p>
      <div class="plan-price">
        <span class="amount">${priceFormatted}</span>
        <span class="per">/ mes</span>
      </div>
    `;

    // Características / Beneficios
    htmlContent += `
      <ul class="plan-features">
        ${plan.beneficios.map(b => `<li>${b}</li>`).join('')}
      </ul>
    `;

    // Metadata de instalación
    htmlContent += `
      <div class="plan-meta">
        <div><span>Instalación</span><strong>${plan.instalacion}</strong></div>
        <div><span>Promo</span><strong>${plan.promo_duracion}</strong></div>
      </div>
    `;

    // Nota legal y botón de contratación
    htmlContent += `
      <p class="plan-note">${plan.nota}</p>
      <button class="btn ${btnClass} select-plan" data-name="${plan.nombre} (${planCategoryText})" data-price="${priceFormatted}">${btnText}</button>
    `;

    card.innerHTML = htmlContent;

    // Inyectar en la sección adecuada
    if (plan.tipo === 'fibra') {
      fibraGrid.appendChild(card);
    } else {
      inalGrid.appendChild(card);
    }
  });

  // Vincular eventos a los nuevos elementos renderizados
  bindEvents();
}

/* ---------- VINCULACIÓN DE EVENTOS (Carruseles, selección, fútbol) ---------- */
function bindEvents() {
  // 1. Selección de Plan ordinario
  document.querySelectorAll('.select-plan').forEach(btn => {
    btn.addEventListener('click', function () {
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');

      document.getElementById('selectedPlanName').textContent = name;
      document.getElementById('selectedPlanPrice').textContent = price;
      document.getElementById('planInput').value = name + ' - ' + price;

      const fCheckbox = document.getElementById('futbol');
      if (fCheckbox) fCheckbox.checked = false;

      document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // 2. Botón "Quiero Fútbol"
  document.querySelectorAll('.add-futbol-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');

      document.getElementById('selectedPlanName').textContent = name;
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
}

/* ---------- ENVÍO DEL FORMULARIO (WhatsApp) ---------- */
const form = document.getElementById('contactForm');
const msg = document.getElementById('formMsg');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const plan = document.getElementById('planInput').value;
    if (!plan) {
      msg.textContent = 'Por favor, elegí un plan antes de enviar la solicitud.';
      msg.className = 'form-msg err';
      return;
    }

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const email = document.getElementById('email').value;
    const dni = document.getElementById('dni').value;
    const horarios = document.getElementById('horarios').value;
    const fCheckbox = document.getElementById('futbol');
    const futbol = (fCheckbox && fCheckbox.checked) ? 'Sí' : 'No';

    let texto =
      '👋 Hola Internet Services, quiero solicitar un plan:\n\n' +
      '📌 *Plan:* ' + plan + '\n' +
      '⚽ *Pack Fútbol:* ' + futbol + '\n\n' +
      '👤 *Mis datos:*\n' +
      '- Nombre: ' + nombre + '\n' +
      '- DNI: ' + dni + '\n' +
      '- Teléfono: ' + telefono + '\n' +
      '- Dirección: ' + direccion + '\n' +
      '- Horarios disponibles: ' + horarios;

    if (email) {
      texto += '\n- Email: ' + email;
    }

    const waNum = globalSiteConfig ? globalSiteConfig.whatsapp : '5493442578899';
    const waUrl = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(texto);
    window.open(waUrl, '_blank');

    msg.textContent = '¡Abriendo WhatsApp para enviar tu solicitud!';
    msg.className = 'form-msg';
  });
}

/* ---------- BANNER PROMO → FÚTBOL + FORMULARIO ---------- */
const promoBtn = document.getElementById('promoBannerBtn');
if (promoBtn) {
  promoBtn.addEventListener('click', function (e) {
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
}

/* ---------- CARRUSEL DE PLANES ---------- */
const scrollR = document.getElementById('scrollRight');
const scrollL = document.getElementById('scrollLeft');

if (scrollR) {
  scrollR.addEventListener('click', function () {
    document.getElementById('plansGrid').scrollBy({ left: 340, behavior: 'smooth' });
  });
}
if (scrollL) {
  scrollL.addEventListener('click', function () {
    document.getElementById('plansGrid').scrollBy({ left: -340, behavior: 'smooth' });
  });
}

/* ---------- HAMBURGER MENU ---------- */
const hambBtn = document.getElementById('hamburgerBtn');
if (hambBtn) {
  hambBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('hamburgerMenu').classList.toggle('open');
  });
}

document.querySelectorAll('.dropdown-submenu span').forEach(function (span) {
  span.addEventListener('click', function (e) {
    e.stopPropagation();
    this.parentElement.classList.toggle('open');
  });
});

document.addEventListener('click', function (e) {
  const menu = document.getElementById('hamburgerMenu');
  if (menu && !menu.contains(e.target)) {
    menu.classList.remove('open');
  }
});

/* ---------- EFECTO PELOTA DE FÚTBOL ---------- */
function createSoccerBall() {
  const ball = document.createElement('div');
  ball.className = 'soccer-ball';
  ball.textContent = '⚽';

  ball.style.left = (window.innerWidth / 2) + 'px';
  ball.style.top = (window.innerHeight / 2) + 'px';

  const angle = Math.random() * Math.PI * 2;
  const velocity = 100 + Math.random() * 300;
  ball.style.setProperty('--tx', (Math.cos(angle) * velocity) + 'px');
  ball.style.setProperty('--ty', (Math.sin(angle) * velocity) + 'px');

  document.body.appendChild(ball);
  setTimeout(() => ball.remove(), 1000);
}
