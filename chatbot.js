/* ============================================================
   INTERNET SERVICES · Agencia San José
   chatbot.js — Asistente con respuestas armadas (sin servidor)

   Burbuja abajo a la derecha. Responde con opciones y
   reconoce palabras clave de lo que se escribe. Precios, horarios y
   contacto salen de data/planes.json; lo que no sabe resolver lo
   pasa a WhatsApp con el mensaje ya escrito.
   Trae sus propios estilos: funciona aunque la página no cargue styles.css.
   ============================================================ */
(function () {
  // Valores por si no carga planes.json
  let sitio = {
    whatsapp: '5493447524550',
    horario_oficina: 'Lunes a Viernes de 8 a 15 hs',
    horario_atencion_digital: 'Atención virtual: Lunes a Viernes de 8 a 18 hs',
    direccion_oficina: 'San Martín 1278, San José',
    telefonos_contacto: '0800 888 4772',
    email: 'isaircolon@gmail.com',
    instagram: 'issanjose',
  };
  let planes = [];
  const datos = fetch('data/planes.json', { cache: 'no-cache' })
    .then(r => r.json())
    .then(d => { sitio = { ...sitio, ...d.sitio }; planes = d.planes || []; })
    .catch(() => {});

  const precio = n => '$' + Number(n).toLocaleString('es-AR');
  const wa = texto => `https://wa.me/${sitio.whatsapp}?text=${encodeURIComponent(texto)}`;
  const linkWa = (texto, etiqueta = 'Escribinos por WhatsApp') =>
    `<a class="isbot-cta" href="${wa(texto)}" target="_blank" rel="noopener">💬 ${etiqueta}</a>`;
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Estilos ---------- */
  const css = document.createElement('style');
  css.textContent = `
  /* Botón: color liso, ícono relleno y sombra corta para que se vea nítido */
  .isbot-btn {
    position: fixed; right: 22px; bottom: 22px; z-index: 61;
    width: 60px; height: 60px; padding: 0; border: 3px solid #fff; border-radius: 50%;
    background: #0062e0; color: #fff;
    display: grid; place-items: center; cursor: pointer;
    box-shadow: 0 2px 4px rgba(5, 27, 68, .18), 0 6px 16px rgba(0, 98, 224, .35);
    transition: background .15s ease, box-shadow .15s ease;
  }
  .isbot-btn:hover { background: #0052bd; box-shadow: 0 2px 4px rgba(5, 27, 68, .2), 0 8px 20px rgba(0, 98, 224, .45); }
  .isbot-btn svg { width: 34px; height: 34px; display: block; }
  .isbot-btn::after {
    content: ''; position: absolute; top: 1px; right: 1px;
    width: 12px; height: 12px; border-radius: 50%; background: #22c55e; border: 2px solid #fff;
  }
  .isbot-btn:focus-visible { outline: 3px solid #9cc2ff; outline-offset: 3px; }
  .isbot-globo {
    position: fixed; right: 92px; bottom: 32px; z-index: 61;
    background: #fff; color: #0a1f44; font: 600 14px/1.3 Inter, system-ui, sans-serif;
    padding: 10px 14px; border-radius: 14px 14px 4px 14px;
    box-shadow: 0 8px 24px rgba(5, 27, 68, .18); cursor: pointer;
    animation: isbotAparecer .3s ease both;
  }
  .isbot-globo button { margin-left: 8px; border: 0; background: none; color: #8a93a3; font-size: 16px; cursor: pointer; padding: 0 2px; }
  .isbot-panel {
    position: fixed; right: 22px; bottom: 22px; z-index: 10000;
    width: 380px; height: min(620px, calc(100vh - 44px));
    display: flex; flex-direction: column; overflow: hidden;
    background: #f4f6fb; border-radius: 20px;
    box-shadow: 0 24px 60px rgba(5, 27, 68, .35);
    font: 14.5px/1.45 Inter, system-ui, sans-serif; color: #1c2533;
    animation: isbotAparecer .22s ease both;
  }
  .isbot-panel[hidden], .isbot-globo[hidden], .isbot-btn[hidden] { display: none; }
  @keyframes isbotAparecer { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  .isbot-head {
    display: flex; align-items: center; gap: 12px; padding: 14px 14px 14px 18px;
    background: linear-gradient(135deg, #0055cc, #0072ff); color: #fff;
  }
  .isbot-avatar { width: 42px; height: 42px; border-radius: 50%; background: #fff; display: grid; place-items: center; flex-shrink: 0; overflow: hidden; }
  .isbot-avatar img { width: 36px; height: auto; display: block; }
  .isbot-head strong { display: block; font: 700 15.5px/1.2 Sora, Inter, sans-serif; }
  .isbot-head small { display: flex; align-items: center; gap: 6px; font-size: 12.5px; opacity: .9; }
  .isbot-head small::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }
  .isbot-cerrar { margin-left: auto; width: 36px; height: 36px; border: 0; border-radius: 50%; background: rgba(255,255,255,.15); color: #fff; font-size: 22px; line-height: 1; cursor: pointer; }
  .isbot-cerrar:hover { background: rgba(255,255,255,.28); }
  .isbot-msgs { flex: 1; overflow-y: auto; padding: 16px 14px 8px; display: flex; flex-direction: column; gap: 10px; overscroll-behavior: contain; }
  .isbot-msg { max-width: 88%; padding: 10px 14px; border-radius: 16px; word-wrap: break-word; }
  .isbot-msg p { margin: 0 0 6px; } .isbot-msg p:last-child { margin: 0; }
  .isbot-msg ul, .isbot-msg ol { margin: 4px 0 6px; padding-left: 20px; }
  .isbot-msg li { margin: 2px 0; }
  .isbot-msg a { color: #0062e0; font-weight: 600; }
  .isbot-bot { align-self: flex-start; background: #fff; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(5,27,68,.08); }
  .isbot-yo { align-self: flex-end; background: #0062e0; color: #fff; border-bottom-right-radius: 4px; }
  .isbot-plan { display: flex; justify-content: space-between; gap: 10px; padding: 7px 0; border-bottom: 1px solid #eceff4; }
  .isbot-plan:last-of-type { border-bottom: 0; }
  .isbot-plan b { color: #e62a22; white-space: nowrap; }
  .isbot-msg a.isbot-cta {
    display: inline-block; margin-top: 8px; padding: 8px 14px; border-radius: 999px;
    background: #149a46; color: #fff; text-decoration: none; font-weight: 700; font-size: 13.5px;
  }
  .isbot-msg a.isbot-cta:hover { background: #11883d; }
  .isbot-escribiendo { display: flex; gap: 4px; padding: 14px; }
  .isbot-escribiendo span { width: 7px; height: 7px; border-radius: 50%; background: #9aa5b8; animation: isbotPunto 1s infinite; }
  .isbot-escribiendo span:nth-child(2) { animation-delay: .15s; } .isbot-escribiendo span:nth-child(3) { animation-delay: .3s; }
  @keyframes isbotPunto { 0%, 60%, 100% { opacity: .35; transform: none; } 30% { opacity: 1; transform: translateY(-3px); } }
  .isbot-opciones { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 14px 10px; }
  .isbot-opciones button {
    border: 1.5px solid #c7d8f5; background: #fff; color: #0055cc; border-radius: 999px;
    padding: 7px 13px; font: 600 13.5px/1.2 Inter, system-ui, sans-serif; cursor: pointer;
  }
  .isbot-opciones button:hover { background: #eaf2ff; border-color: #0072ff; }
  /* !important / medidas explícitas: los estilos de formularios de cada página no lo deforman */
  .isbot-form { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center; gap: 8px; margin: 0 !important; padding: 10px 12px 12px; background: #fff; border-top: 1px solid #e6eaf1; box-shadow: none; max-width: none; }
  .isbot-form input {
    flex: 1 1 auto; width: auto !important; min-width: 0; height: 44px; margin: 0 !important; box-sizing: border-box; border: 1.5px solid #dfe5ee; border-radius: 999px; padding: 10px 16px;
    font: 15px Inter, system-ui, sans-serif; color: #1c2533; background: #f8f9fc;
  }
  .isbot-form input:focus { outline: none; border-color: #0072ff; background: #fff; }
  .isbot-form button { width: 44px !important; height: 44px; margin: 0 !important; padding: 0; flex-shrink: 0; border: 0; border-radius: 50%; background: #0062e0; color: #fff; cursor: pointer; display: grid; place-items: center; }
  .isbot-form button svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
  @media (max-width: 600px) {
    .isbot-btn { right: 16px; bottom: 16px; width: 56px; height: 56px; }
    .isbot-btn svg { width: 31px; height: 31px; }
    .isbot-globo { right: 82px; bottom: 26px; font-size: 13.5px; }
    .isbot-panel { right: 0; bottom: 0; width: 100%; height: 88vh; height: 88dvh; border-radius: 20px 20px 0 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .isbot-panel, .isbot-globo { animation: none; }
    .isbot-escribiendo span { animation: none; }
  }`;
  document.head.appendChild(css);

  /* ---------- Respuestas ---------- */
  const MENU = [
    ['contratar_menu', '🆕 Quiero contratar'],
    ['cliente', '👤 Ya soy cliente'],
    ['horarios', '🕘 Horarios y contacto'],
    ['humano', '💬 Hablar con una persona'],
  ];
  const MENU_CONTRATAR = [
    ['planes', '📶 Planes y precios'],
    ['cobertura', '📍 ¿Llega a mi casa?'],
    ['tv', '📺 TV y packs'],
    ['contratar', '📝 Qué necesito'],
  ];
  const MENU_CLIENTE = [
    ['factura', '🧾 Factura o saldo'],
    ['reclamo', '📣 Hacer un reclamo'],
    ['soporte', '🛠️ No tengo internet'],
    ['pagos', '💳 Formas de pago'],
    ['domicilio', '🏠 Cambio de domicilio'],
    ['baja', '👋 Dar de baja'],
  ];
  const VOLVER = [['menu', '↩️ Volver al menú'], ['humano', '💬 Hablar con una persona']];
  const VOLVER_CLIENTE = [['cliente', '↩️ Otra consulta'], ['menu', '🏠 Menú principal']];

  function listaPlanes(filtro) {
    const lista = planes.filter(filtro).sort((a, b) => a.precio - b.precio);
    if (!lista.length) return '<p>Ahora no pude cargar los precios. Miralos en la página de planes o consultanos.</p>';
    return lista.map(p =>
      `<div class="isbot-plan"><span>${esc(p.nombre)}</span><b>${precio(p.precio)}</b></div>`).join('') +
      '<p><small>Precios por mes, con la promo vigente.</small></p>';
  }
  const tieneTv = p => /IS ?TV/i.test(p.nombre);

  // Dónde llega cada servicio
  const ZONA_INALAMBRICO = 'todo el <strong>Departamento Colón</strong>, incluyendo Primero de Mayo y San Cipriano';
  const ZONA_FIBRA = '<strong>San José</strong>, <strong>El Brillante</strong> y los barrios San Miguel, El Perucho, Santa Teresita y El Colorado';
  const SUMAR_OPCIONES = '<p>➕ Podés contratar <strong>solo internet</strong> y sumarle lo que quieras: TV (ISTV Move o Full), Pack Fútbol, Pack HBO, cámaras IS CAM o WiFi Mesh.</p>';
  const tieneCam = p => /IS CAM/i.test(p.nombre);

  const RESPUESTAS = {
    menu: () => ({ html: '<p>¿En qué más te puedo ayudar?</p>', opciones: MENU }),
    contratar_menu: () => ({
      html: '<p>¡Genial! 🙌 ¿Qué querés saber?</p>',
      opciones: [...MENU_CONTRATAR, ['menu', '↩️ Volver al menú']],
    }),
    cliente: () => ({
      html: '<p>¿Qué necesitás hacer?</p>',
      opciones: [...MENU_CLIENTE, ['menu', '↩️ Volver al menú']],
    }),

    // ── Clientes: estas consultas piden el DNI del titular y lo suman al WhatsApp ──
    factura: () => ({
      html: '<p>🧾 Tu factura te llega todos los meses al mail registrado. También la ves y la descargás en <a href="https://app.is.com.ar" target="_blank" rel="noopener">app.is.com.ar</a> con tu usuario y clave.</p>' +
        '<p>Para consultar tu <strong>saldo</strong> (o si no tenés usuario), escribí el <strong>DNI del titular</strong> y te armo el mensaje:</p>',
      pedirDni: dni => `Hola! Quiero consultar mi factura / saldo. DNI del titular: ${dni}`,
    }),
    reclamo: () => ({
      html: '<p>📣 ¿Sobre qué es el reclamo?</p>',
      opciones: [['soporte', '🛠️ Sin servicio o anda lento'], ['reclamo_fact', '💲 Facturación o cobro'], ['reclamo_otro', '📝 Otro motivo'], ['cliente', '↩️ Volver']],
    }),
    reclamo_fact: () => ({
      html: '<p>Lo revisamos. Escribí el <strong>DNI del titular</strong>, y en WhatsApp contanos qué pasó con la factura o el cobro:</p>',
      pedirDni: dni => `Hola! Quiero hacer un reclamo por facturación. DNI del titular: ${dni}. Detalle: `,
    }),
    reclamo_otro: () => ({
      html: '<p>Escribí el <strong>DNI del titular</strong>, y en WhatsApp contanos el motivo del reclamo:</p>',
      pedirDni: dni => `Hola! Quiero hacer un reclamo. DNI del titular: ${dni}. Motivo: `,
    }),
    baja: () => ({
      html: '<p>Lamentamos que te quieras ir 😢</p>' +
        '<p>La baja la tiene que pedir el <strong>titular</strong> del servicio. <strong>Tené a mano el DNI del titular.</strong></p>' +
        '<p>Escribí el DNI del titular y te armo el mensaje:</p>',
      pedirDni: dni => `Hola! Soy el titular del servicio y quiero solicitar la baja. DNI del titular: ${dni}`,
      extra: [['soporte', '🛠️ Es por un problema técnico']],
    }),

    planes: () => ({
      html: '<p>Tenemos planes de <strong>Fibra Óptica</strong> (300 MB) y de <strong>Internet Inalámbrico</strong>, solos o combinados con TV y cámaras.</p>' +
        SUMAR_OPCIONES + '<p>¿Qué te interesa?</p>',
      opciones: [['p_fibra', '⚡ Fibra Óptica'], ['p_inal', '📡 Inalámbrico'], ['p_tv', '📺 Internet + TV'], ['p_cam', '📹 Internet + Cámaras'], ['menu', '↩️ Volver al menú']],
    }),
    p_fibra: () => ({
      html: '<p><strong>Planes de Fibra Óptica:</strong></p>' + listaPlanes(p => p.tipo === 'fibra' && !tieneTv(p) && !tieneCam(p)) +
        `<p>📍 Fibra disponible en ${ZONA_FIBRA}.</p>` + SUMAR_OPCIONES +
        '<p><a href="internet.html">Ver todos los planes</a></p>' +
        linkWa('Hola! Quiero contratar Internet por Fibra Óptica', 'Lo quiero'),
      opciones: [['cobertura', '📍 ¿Llega a mi casa?'], ['p_tv', '📺 Con TV'], ...VOLVER],
    }),
    p_inal: () => ({
      html: `<p><strong>Internet Inalámbrico</strong> (llega a ${ZONA_INALAMBRICO}):</p>` + listaPlanes(p => p.tipo === 'inalambrica') +
        SUMAR_OPCIONES + '<p><a href="internet.html">Ver detalles</a></p>' +
        linkWa('Hola! Quiero contratar Internet Inalámbrico', 'Lo quiero'),
      opciones: [['p_fibra', '⚡ Ver Fibra Óptica'], ...VOLVER],
    }),
    p_tv: () => ({
      html: '<p><strong>Internet + TV:</strong></p>' + listaPlanes(p => tieneTv(p) && !tieneCam(p)) +
        '<p><a href="internet-tv.html">Ver planes de TV</a> · <a href="internet-tv.html#grilla">Grilla de canales</a></p>',
      opciones: [['tv', 'ℹ️ Move o Full?'], ['packs', '⚽ Pack Fútbol y HBO'], ...VOLVER],
    }),
    p_cam: () => ({
      html: '<p><strong>Internet + cámaras de seguridad (IS CAM):</strong></p>' + listaPlanes(tieneCam) +
        '<p>Mirás tus cámaras en vivo desde el celular, con grabación y alertas de movimiento. <a href="internet-cam.html">Ver planes con cámaras</a></p>',
      opciones: VOLVER,
    }),

    cobertura: () => ({
      html: `<p>📡 <strong>Internet Inalámbrico:</strong> llega a ${ZONA_INALAMBRICO}. 🙌</p>` +
        `<p>⚡ <strong>Fibra Óptica:</strong> en ${ZONA_FIBRA}.</p>` +
        '<p>Para confirmar si tenés fibra en tu casa, buscá tu dirección:</p>' +
        '<p><a href="index.html#verificar">📍 Verificar mi dirección</a></p>' +
        linkWa('Hola! Quiero saber si tienen cobertura en mi dirección: ', 'Consultar mi dirección'),
      opciones: [['planes', '📶 Ver planes'], ...VOLVER],
    }),

    tv: () => ({
      html: '<p>Con <strong>IS TV</strong> tenés más de 130 canales, en hasta 4 pantallas a la vez (TV con Android, celulares, tablets y computadoras).</p>' +
        '<ul><li><strong>ISTV Move:</strong> la app para ver en tus dispositivos.</li>' +
        '<li><strong>ISTV Full:</strong> lo mismo, más un convertidor Android para la tele que no es smart.</li></ul>' +
        (sitio.precio_convertidor_adicional ? `<p>Convertidor adicional: $${esc(sitio.precio_convertidor_adicional)}/mes.</p>` : '') +
        '<p><a href="internet-tv.html#grilla">📋 Ver grilla de canales</a></p>',
      opciones: [['p_tv', '💲 Precios con TV'], ['packs', '⚽ Pack Fútbol y HBO'], ...VOLVER],
    }),
    packs: () => ({
      html: '<p>Podés sumar a tu plan de TV:</p><ul>' +
        (sitio.precio_pack_futbol ? `<li>⚽ <strong>Pack Fútbol:</strong> $${esc(sitio.precio_pack_futbol)}/mes — <a href="pack-futbol.html">ver más</a></li>` : '') +
        (sitio.precio_pack_hbo ? `<li>🎬 <strong>Pack HBO:</strong> $${esc(sitio.precio_pack_hbo)}/mes — <a href="pack-hbo.html">ver más</a></li>` : '') +
        '</ul><p>Al elegir un plan en <a href="internet-tv.html">Internet + TV</a> marcás los packs que quieras y se suman al mensaje.</p>' +
        linkWa('Hola! Quiero sumar un pack a mi TV', 'Sumar un pack'),
      opciones: VOLVER,
    }),

    soporte: () => ({
      html: '<p>Probemos esto primero:</p><ol>' +
        '<li>Revisá que los cables del equipo estén bien conectados.</li>' +
        '<li>Desenchufá el router (o el convertidor de TV) <strong>5 minutos</strong> y volvé a enchufarlo.</li>' +
        '<li>Esperá 2 o 3 minutos a que prendan todas las luces.</li></ol>' +
        '<p>¿Se solucionó?</p>',
      opciones: [['soporte_ok', '✅ Sí, ya anda'], ['soporte_no', '❌ No, sigue igual'], ['soporte_pago', '💳 ¿Puede ser por falta de pago?']],
    }),
    soporte_ok: () => ({ html: '<p>¡Genial! 🎉 Cualquier cosa, acá estoy.</p>', opciones: MENU }),
    soporte_no: () => ({
      html: '<p>Te ayuda el equipo técnico por WhatsApp. Escribí el <strong>DNI del titular</strong> y te armo el mensaje:</p>',
      pedirDni: dni => `Hola! Soy cliente y tengo un problema con el servicio. DNI del titular: ${dni}`,
    }),
    soporte_pago: () => ({
      html: '<p>Si tenías facturas vencidas, una vez que pagás el pago tarda <strong>24 a 48 hs hábiles</strong> en ingresar al sistema y el servicio se restablece solo.</p>',
      opciones: [['pagos', '💳 Formas de pago'], ['soporte_no', '🛠️ Pedir soporte'], ...VOLVER_CLIENTE],
    }),

    pagos: () => ({
      html: '<p><strong>Tu factura:</strong> te llega todos los meses al mail que registraste. También la descargás en <a href="https://app.is.com.ar" target="_blank" rel="noopener">app.is.com.ar</a> con tu usuario y clave (si no los tenés, pedilos por WhatsApp).</p>' +
        '<p><strong>Formas de pago:</strong></p><ul>' +
        '<li>Débito automático con tarjeta o CBU</li>' +
        '<li>Rapipago, Pago Fácil o Mercado Pago</li>' +
        '<li>Pago Mis Cuentas y Home Banking (código Link/Banelco de la factura)</li>' +
        '<li>Santa Fe Servicios</li></ul>',
      opciones: [['factura', '🧾 Factura o saldo'], ['facturacion', '❓ ¿Cómo me facturan?'], ['soporte_pago', '⏱️ Pagué, ¿cuándo vuelve?'], ...VOLVER_CLIENTE],
    }),
    facturacion: () => ({
      html: '<p>Se factura al mes siguiente de la conexión: ese mes pagás el mes completo por adelantado más los días que usaste el servicio el mes en que te conectamos.</p>',
      opciones: [['pagos', '💳 Formas de pago'], ...VOLVER_CLIENTE],
    }),

    contratar: () => ({
      html: '<p>¡Es muy fácil! Solo necesitamos:</p><ul>' +
        '<li>DNI, nombre y apellido</li><li>Domicilio, teléfono y email</li>' +
        '<li>📍 La <strong>ubicación actual</strong> por WhatsApp desde el lugar de la instalación</li></ul>' +
        '<p>Elegí tu plan y te contactamos para coordinar la instalación.</p>' +
        linkWa('Hola! Quiero contratar el servicio. Mis datos son: ', 'Contratar por WhatsApp'),
      opciones: [['planes', '📶 Ver planes'], ['cobertura', '📍 ¿Llega a mi casa?'], ['menu', '↩️ Volver al menú']],
    }),

    horarios: () => ({
      html: `<p>🏢 <strong>Oficina:</strong> ${esc(sitio.direccion_oficina)}<br>${esc(sitio.horario_oficina)}</p>` +
        `<p>💻 ${esc(sitio.horario_atencion_digital)}</p>` +
        (sitio.telefonos_contacto ? `<p>📞 Teléfono: <a href="tel:${esc(sitio.telefonos_contacto.replace(/\D/g, ''))}">${esc(sitio.telefonos_contacto)}</a></p>` : '') +
        `<p>📱 WhatsApp: <a href="${wa('Hola! Quiero hacer una consulta')}" target="_blank" rel="noopener">${esc(sitio.whatsapp_formato || sitio.whatsapp)}</a></p>` +
        `<p>✉️ <a href="mailto:${esc(sitio.email)}">${esc(sitio.email)}</a></p>` +
        (sitio.instagram ? `<p>📷 <a href="https://instagram.com/${esc(sitio.instagram)}" target="_blank" rel="noopener">@${esc(sitio.instagram)}</a></p>` : ''),
      opciones: VOLVER,
    }),
    domicilio: () => ({
      html: '<p>El <strong>titular</strong> del servicio tiene que avisarnos el nuevo domicilio por mensaje o en la oficina. Ahí revisamos con el área técnica si llega el mismo servicio u otro.</p>' +
        '<p>Escribí el <strong>DNI del titular</strong> y te armo el mensaje:</p>',
      pedirDni: dni => `Hola! Soy el titular del servicio y quiero hacer un cambio de domicilio. DNI del titular: ${dni}. Nueva dirección: `,
    }),

    humano: () => ({
      html: '<p>¡Claro! Escribinos por WhatsApp y te responde alguien del equipo.</p>' +
        `<p><small>${esc(sitio.horario_atencion_digital)}</small></p>` +
        linkWa('Hola! Quiero hacer una consulta'),
      opciones: [['menu', '↩️ Volver al menú']],
    }),

    no_entiendo: () => ({
      html: '<p>Perdón, no te entendí bien 🙈. Elegí una opción o escribilo de otra forma. Si preferís, te atiende una persona por WhatsApp.</p>',
      opciones: MENU,
    }),
  };

  // Palabras clave → respuesta (se prueba en orden: lo más específico primero)
  const CLAVES = [
    ['baja', /\bbaja\b|dar de baja|darme de baja|cancelar (el |mi )?servicio|rescind|desconect/],
    ['reclamo_fact', /cobraron (mal|de m[aá]s|dos veces)|me cobraron|cobro (mal|de m[aá]s|indebido)|error en (la |mi )?factura|mal facturad|factura (mal|equivocada)/],
    ['reclamo', /reclam|queja|denuncia/],
    ['soporte_pago', /(pag[ueé]|pagu[eé]).*(vuelv|restable|cort)|cortaron|corte por/],
    ['soporte', /no (me )?(anda|funciona|tengo (internet|se[nñ]al|servicio))|sin (internet|se[nñ]al|servicio)|se cort|\blent[oa]\b|falla|soporte|t[eé]cnic|router|modem|no carga/],
    ['packs', /f[uú]tbol|futbol|hbo|pack|tyc|espn|max\b/],
    ['tv', /\btv\b|\btele\b|televisi|canal|grilla|istv|move|full|convertidor|deco/],
    ['p_cam', /c[aá]mara|cam\b|iscam|seguridad|monitore/],
    ['facturacion', /c[oó]mo (me )?factur|proporcional/],
    ['pagos', /c[oó]mo (pago|abono|puedo pagar)|formas? de pago|medios? de pago|d[oó]nde pago|debito|d[eé]bito|cbu|rapipago|pago f[aá]cil|mercado ?pago|home ?banking|pagar/],
    ['factura', /factura|saldo|cu[aá]nto debo|\bdebo\b|deuda|vencid|boleta|resumen/],
    ['domicilio', /mud|cambio de (domicilio|direcci)|nueva direcci/],
    ['cobertura', /cobertura|llega|zona|barrio|mi (casa|calle|direcci)|col[oó]n|alrededor|disponib|primero de mayo|1.? ?de mayo|san cipriano|brillante|perucho|santa teresita|colorado|san miguel|departamento/],
    ['p_fibra', /fibra|300|800|mega|velocidad/],
    ['p_inal', /inal[aá]mbric|wireless|antena|campo|rural/],
    ['contratar', /instal|\balta\b|requisit|necesito para|dni|quiero (el|un) (plan|servicio)/],
    ['planes', /plan|precio|solo internet|internet solo|quiero internet|sumar|agregar|opciones|cu[aá]nto (sale|cuesta|est[aá])|valor|costo|promo/],
    ['cliente', /soy cliente|ya soy|mi cuenta|mi servicio/],
    ['contratar_menu', /quiero contratar|nuevo cliente|contratar/],
    ['horarios', /horario|\bhoras?\b|abren|abierto|oficina|direcci[oó]n|d[oó]nde (est[aá]n|queda)|mail|email|correo|instagram|tel[eé]fono/],
    ['humano', /persona|humano|asesor|operador|whats|hablar|llam/],
    ['saludo', /^(hola|buenas|buen d[ií]a|buenas tardes|buenas noches|hey|holi)\b/],
    ['gracias', /gracias|genial|perfecto|listo|ok\b|dale/],
  ];
  RESPUESTAS.saludo = () => ({ html: '<p>¡Hola! 👋 ¿Querés contratar o ya sos cliente?</p>', opciones: MENU });
  RESPUESTAS.gracias = () => ({ html: '<p>¡De nada! 😊 Si necesitás algo más, acá estoy.</p>', opciones: MENU });

  function interpretar(texto) {
    const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const t2 = texto.toLowerCase();
    for (const [clave, re] of CLAVES) if (re.test(t) || re.test(t2)) return clave;
    return 'no_entiendo';
  }

  /* ---------- Interfaz ---------- */
  // Globo de chat relleno con tres puntos (formas rellenas: se ven nítidas en cualquier pantalla)
  const ICONO_CHAT = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#fff" d="M16 4C8.82 4 3 8.92 3 15c0 3.13 1.55 5.95 4.03 7.95-.2 1.78-.95 3.5-2.23 4.86a.6.6 0 0 0 .47 1c2.9-.12 5.33-1.17 7.02-2.4 1.18.27 2.43.42 3.71.42 7.18 0 13-4.92 13-11S23.18 4 16 4z"/><circle cx="10.5" cy="15" r="1.9" fill="#0062e0"/><circle cx="16" cy="15" r="1.9" fill="#0062e0"/><circle cx="21.5" cy="15" r="1.9" fill="#0062e0"/></svg>';
  const ICONO_ENVIAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

  function iniciar() {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'isbot-btn';
    boton.setAttribute('aria-label', 'Abrir asistente virtual');
    boton.setAttribute('aria-expanded', 'false');
    boton.innerHTML = ICONO_CHAT;

    const globo = document.createElement('div');
    globo.className = 'isbot-globo';
    globo.hidden = true;
    globo.innerHTML = '¿Te ayudo? 👋<button type="button" aria-label="Cerrar aviso">×</button>';

    const panel = document.createElement('section');
    panel.className = 'isbot-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Asistente virtual de Internet Services');
    panel.innerHTML = `
      <div class="isbot-head">
        <div class="isbot-avatar" aria-hidden="true"><img src="logo.png" alt=""></div>
        <div><strong>Asistente IS</strong><small>Respuesta al instante</small></div>
        <button type="button" class="isbot-cerrar" aria-label="Cerrar asistente">×</button>
      </div>
      <div class="isbot-msgs" aria-live="polite"></div>
      <div class="isbot-opciones"></div>
      <form class="isbot-form" autocomplete="off">
        <input type="text" maxlength="200" placeholder="Escribí tu consulta…" aria-label="Escribí tu consulta">
        <button type="submit" aria-label="Enviar">${ICONO_ENVIAR}</button>
      </form>`;

    document.body.append(boton, globo, panel);
    const msgs = panel.querySelector('.isbot-msgs');
    const opciones = panel.querySelector('.isbot-opciones');
    const form = panel.querySelector('.isbot-form');
    const input = form.querySelector('input');
    let empezado = false;
    let ocupado = false;
    let esperandoDni = null;   // función que arma el mensaje de WhatsApp con el DNI
    const PLACEHOLDER = 'Escribí tu consulta…';

    function esperarDni(armar) {
      esperandoDni = armar;
      input.placeholder = 'DNI del titular (sin puntos)';
      input.inputMode = 'numeric';
    }
    function dejarDeEsperar() {
      esperandoDni = null;
      input.placeholder = PLACEHOLDER;
      input.inputMode = 'text';
    }

    // Con el DNI (o sin él) se muestra el botón de WhatsApp con el mensaje armado
    function enviarConDni(dni) {
      const armar = esperandoDni;
      dejarDeEsperar();
      const html = dni
        ? '<p>¡Listo! ✅ Tocá el botón: se abre WhatsApp con tu consulta y el DNI ya escritos. Solo tenés que enviarlo.</p>'
        : '<p>Ningún problema. Tocá el botón y escribí el DNI del titular en WhatsApp.</p>';
      agregar(html + `<p><small>${esc(sitio.horario_atencion_digital)}</small></p>` + linkWa(armar(dni), 'Enviar por WhatsApp'), 'bot');
      mostrarOpciones(VOLVER_CLIENTE);
    }

    const bajar = () => { msgs.scrollTop = msgs.scrollHeight; };

    function agregar(html, quien) {
      const div = document.createElement('div');
      div.className = 'isbot-msg ' + (quien === 'yo' ? 'isbot-yo' : 'isbot-bot');
      div.innerHTML = html;
      msgs.appendChild(div);
      bajar();
      return div;
    }

    function mostrarOpciones(lista) {
      opciones.innerHTML = '';
      lista.forEach(([clave, etiqueta]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = etiqueta;
        b.addEventListener('click', () => elegir(clave, etiqueta));
        opciones.appendChild(b);
      });
    }

    // Respuesta con "escribiendo…" corto, para que se lea como chat
    async function responder(clave) {
      ocupado = true;
      opciones.innerHTML = '';
      const puntos = agregar('<span></span><span></span><span></span>', 'bot');
      puntos.classList.add('isbot-escribiendo');
      await Promise.all([datos, new Promise(r => setTimeout(r, 450))]);
      puntos.remove();
      const r = (RESPUESTAS[clave] || RESPUESTAS.no_entiendo)();
      agregar(r.html, 'bot');
      if (r.pedirDni) {
        esperarDni(r.pedirDni);
        mostrarOpciones([['__sin_dni', '🙅 Prefiero no escribirlo'], ...(r.extra || []), ['cliente', '↩️ Volver']]);
        if (window.matchMedia('(min-width: 601px)').matches) input.focus();
      } else {
        mostrarOpciones(r.opciones || MENU);
      }
      ocupado = false;
    }

    function elegir(clave, etiqueta) {
      if (ocupado) return;
      agregar(esc(etiqueta.replace(/^\S+\s/, '')), 'yo');
      if (clave === '__sin_dni') return enviarConDni('');
      dejarDeEsperar();
      responder(clave);
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const texto = input.value.trim();
      if (!texto || ocupado) return;
      input.value = '';
      agregar(esc(texto), 'yo');
      if (esperandoDni) {
        const dni = texto.replace(/[.\s-]/g, '');
        if (/^\d{7,8}$/.test(dni)) return enviarConDni(dni);
        if (/^\d+$/.test(dni)) {
          agregar('<p>El DNI tiene que tener 7 u 8 números, sin puntos. Probá de nuevo 🙂</p>', 'bot');
          return;
        }
        dejarDeEsperar();   // escribió otra consulta: se responde normal
      }
      responder(interpretar(texto));
    });

    function abrir() {
      globo.hidden = true;
      panel.hidden = false;
      boton.hidden = true;
      boton.setAttribute('aria-expanded', 'true');
      if (!empezado) {
        empezado = true;
        agregar('<p>¡Hola! 👋 Soy el asistente de <strong>Internet Services</strong>.</p><p>¿Querés contratar o ya sos cliente? Elegí una opción o escribí tu consulta.</p>', 'bot');
        mostrarOpciones(MENU);
      }
      bajar();
      // En el celular no se abre el teclado solo: tapa las opciones
      if (window.matchMedia('(min-width: 601px)').matches) input.focus();
    }
    function cerrar() {
      panel.hidden = true;
      boton.hidden = false;
      boton.setAttribute('aria-expanded', 'false');
      boton.focus();
    }

    boton.addEventListener('click', abrir);
    panel.querySelector('.isbot-cerrar').addEventListener('click', cerrar);
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

    // Globito "¿Te ayudo?" una vez por visita, a los pocos segundos
    globo.addEventListener('click', e => {
      if (e.target.closest('button')) { globo.hidden = true; return; }
      abrir();
    });
    let visto = false;
    try { visto = sessionStorage.getItem('isbot_globo') === '1'; } catch (e) {}
    if (!visto) {
      setTimeout(() => {
        if (!panel.hidden || empezado) return;
        globo.hidden = false;
        try { sessionStorage.setItem('isbot_globo', '1'); } catch (e) {}
        setTimeout(() => { globo.hidden = true; }, 9000);
      }, 6000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
