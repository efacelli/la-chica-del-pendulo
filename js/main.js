/* =========================================================
   La Chica del Péndulo — interacciones
   ========================================================= */

// ---------- Configuración editable ----------
const CONFIG = {
  whatsapp: '5493855972750',           // +54 9 3855 97-2750, sin espacios ni signos
  instagram: 'https://www.instagram.com/la.chica.del.pendulo/',
  saludo: 'Hola Dai! 🌙 Te escribo desde tu página web.',
};

// Mensaje predeterminado por servicio. {modo} se reemplaza según el selector Online/Presencial.
const SERVICES = {
  general:            { modes: ['online', 'presencial'], msg: 'Quiero agendar un turno. ¿Me contás qué terapias y horarios tenés disponibles?' },
  registros:          { modes: ['online', 'presencial'], msg: 'Quiero agendar una lectura de *Registros Akáshicos* ({modo}). ¿Qué días y horarios tenés disponibles?' },
  tameana:            { modes: ['online', 'presencial'], msg: 'Quiero agendar una sesión de *Tameana* ({modo}). ¿Qué días y horarios tenés disponibles?' },
  chakras:            { modes: ['online', 'presencial'], msg: 'Quiero agendar una *Armonización de chakras* ({modo}). ¿Qué días y horarios tenés disponibles?' },
  pendulo:            { modes: ['online', 'presencial'], msg: 'Quiero agendar una sesión de *Péndulo hebreo* ({modo}). ¿Qué días y horarios tenés disponibles?' },
  biodescodificacion: { modes: ['online', 'presencial'], msg: 'Quiero agendar una sesión de *Biodescodificación* ({modo}). ¿Qué días y horarios tenés disponibles?' },
  bitacora:           { modes: ['online', 'presencial'], msg: 'Me interesa crear mi *Bitácora personal* con un programa personalizado ({modo}). ¿Cómo funciona?' },
};

const MODE_TEXT = {
  online: 'online',
  presencial: 'presencial, en Santiago del Estero',
};
const MODE_LABEL = { online: 'Online', presencial: 'Presencial' };

let currentMode = 'online';

document.documentElement.classList.remove('no-js');

// ---------- WhatsApp ----------
function waUrl(key) {
  const s = SERVICES[key] || SERVICES.general;
  const mode = s.modes.includes(currentMode) ? currentMode : s.modes[0];
  const text = `${CONFIG.saludo} ${s.msg.replace('{modo}', MODE_TEXT[mode])}`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}

function refreshWaLinks() {
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = waUrl(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

document.querySelectorAll('.card[data-service]').forEach((card) => {
  const chip = card.querySelector('.card__modes');
  if (!chip) return;
  const modes = card.dataset.modes.split(' ');
  chip.textContent = modes.map((m) => MODE_LABEL[m]).join(' · ');
});

document.querySelectorAll('.toggle__opt').forEach((btn) => {
  btn.addEventListener('click', () => {
    currentMode = btn.dataset.mode;
    document.querySelectorAll('.toggle__opt').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', String(on));
    });
    refreshWaLinks();
  });
});

refreshWaLinks();

// ---------- Instagram ----------
if (CONFIG.instagram) {
  ['igLink', 'igLinkFooter'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) { el.href = CONFIG.instagram; el.hidden = false; }
  });
}

// ---------- Navegación ----------
const nav = document.querySelector('.nav');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

function setMenu(open) {
  links.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// ---------- Aparición al hacer scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  io.observe(el);
});

// ---------- Fase lunar de hoy (vista desde el hemisferio sur) ----------
(function moonPhase() {
  const SYNODIC = 29.530588853;
  const KNOWN_NEW = Date.UTC(2000, 0, 6, 18, 14) / 86400000; // luna nueva de referencia
  const now = Date.now() / 86400000;
  const age = ((now - KNOWN_NEW) % SYNODIC + SYNODIC) % SYNODIC;
  const p = age / SYNODIC; // 0 = nueva, 0.5 = llena
  const illum = Math.round(((1 - Math.cos(2 * Math.PI * p)) / 2) * 100);

  const phases = [
    [1.84566,  'Luna nueva',        'Ideal para sembrar intenciones.'],
    [5.53699,  'Luna creciente',    'Momento de impulsar lo que empezaste.'],
    [9.22831,  'Cuarto creciente',  'Tiempo de decidir y pasar a la acción.'],
    [12.91963, 'Gibosa creciente',  'Ajustá y confiá en el proceso.'],
    [16.61096, 'Luna llena',        'Celebrá, agradecé y soltá.'],
    [20.30228, 'Gibosa menguante',  'Compartí lo que aprendiste.'],
    [23.99361, 'Cuarto menguante',  'Tiempo de soltar lo que pesa.'],
    [27.68493, 'Luna menguante',    'Descansá y preparate para renacer.'],
    [Infinity, 'Luna nueva',        'Ideal para sembrar intenciones.'],
  ];
  const [, name, tip] = phases.find(([limit]) => age < limit);

  document.getElementById('moonphaseName').textContent = `${name} · ${illum}%`;
  document.getElementById('moonphaseTip').textContent = tip;

  // Dibujo: parte iluminada. Hemisferio norte: creciente iluminada a la derecha.
  // En el sur se ve espejada, así que reflejamos el dibujo horizontalmente.
  const r = 17, cx = 20, cy = 20;
  const rx = Math.abs(Math.cos(2 * Math.PI * p)) * r;
  const waxing = p < 0.5;
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = waxing ? (p < 0.25 ? 0 : 1) : (p < 0.75 ? 0 : 1);
  const d = `M${cx} ${cy - r} A${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r} A${rx} ${r} 0 0 ${innerSweep} ${cx} ${cy - r}Z`;
  const path = document.getElementById('moonphasePath');
  path.setAttribute('d', d);
  path.setAttribute('transform', `translate(${cx * 2} 0) scale(-1 1)`);
})();

// ---------- Botón flotante: mostrar el texto un momento ----------
const waFloat = document.querySelector('.wa-float');
setTimeout(() => {
  waFloat.classList.add('is-expanded');
  setTimeout(() => waFloat.classList.remove('is-expanded'), 4500);
}, 3500);

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Galería: ver foto ampliada ----------
const lightbox = document.getElementById('lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const lbImg = lightbox.querySelector('img');
  document.querySelectorAll('.gallery__item').forEach((item) => {
    item.addEventListener('click', () => {
      lbImg.src = item.dataset.full;
      lbImg.alt = item.querySelector('img').alt;
      lightbox.showModal();
    });
  });
  lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
}
