/* =========================================================
   La Chica del Péndulo — interacciones
   ========================================================= */

// ---------- Configuración editable ----------
const CONFIG = {
  whatsapp: '5493855972750',           // +54 9 3855 97-2750, sin espacios ni signos
  instagram: 'https://www.instagram.com/la.chica.del.pendulo/',
  saludo: 'Hola Daiana! 🌙 Te escribo desde tu página web.',
};

// Mensaje predeterminado por servicio. {modo} se reemplaza según el selector Virtual/Presencial.
const SERVICES = {
  general:   { modes: ['virtual', 'presencial'], msg: 'Quiero agendar un turno. ¿Me contás qué servicios y horarios tenés disponibles?' },
  lectura:   { modes: ['virtual', 'presencial'], msg: 'Quiero agendar una *Lectura de Registros Akáshicos* ({modo}). ¿Qué días y horarios tenés disponibles?' },
  sanacion:  { modes: ['virtual', 'presencial'], msg: 'Quiero agendar una *Sanación Akáshica* ({modo}). ¿Qué días y horarios tenés disponibles?' },
  pendulo:   { modes: ['virtual', 'presencial'], msg: 'Quiero agendar una sesión de *Péndulo y Armonización de Chakras* ({modo}). ¿Qué días y horarios tenés disponibles?' },
  lunanatal: { modes: ['virtual', 'presencial'], msg: 'Quiero agendar una *Lectura de Luna Natal* ({modo}). ¿Qué datos de nacimiento te tengo que pasar?' },
  circulo:   { modes: ['presencial'],            msg: 'Quiero reservar mi lugar en el próximo *Círculo de Luna* ({modo}). ¿Cuándo es el próximo encuentro?' },
  charla:    { modes: ['virtual'],               msg: 'Me gustaría tener la *primera charla gratuita de 15 minutos* para conocernos y ver qué encuentro me conviene.' },
};

const MODE_TEXT = {
  virtual: 'virtual, por videollamada',
  presencial: 'presencial, en Santiago del Estero',
};
const MODE_LABEL = { virtual: 'Virtual', presencial: 'Presencial' };

let currentMode = 'virtual';

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

function refreshCardModes() {
  document.querySelectorAll('.card[data-service]').forEach((card) => {
    const modes = card.dataset.modes.split(' ');
    const chip = card.querySelector('.card__modes');
    if (!chip) return;
    chip.textContent = modes.length > 1
      ? 'Virtual · Presencial'
      : `Solo ${MODE_LABEL[modes[0]].toLowerCase()}`;
  });
}

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

refreshCardModes();
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
  let d;
  if (p < 0.5) {
    const sweep = p < 0.25 ? 0 : 1;
    d = `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r} A${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}Z`;
  } else {
    const sweep = p < 0.75 ? 0 : 1;
    d = `M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} A${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}Z`;
  }
  const path = document.getElementById('moonphasePath');
  path.setAttribute('d', d);
  path.setAttribute('transform', `translate(${cx * 2} 0) scale(-1 1)`);
})();

// ---------- Cielo estrellado ----------
(function sky() {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars = [], shooting = null, w = 0, h = 0, dpr = 1, raf = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(220, Math.round((w * h) / 6500));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.6 + 0.2,
      s: Math.random() * 0.002 + 0.0006,
      o: Math.random() * Math.PI * 2,
      gold: Math.random() < 0.12,
    }));
    if (reduced) draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const st of stars) {
      const alpha = reduced ? st.a : st.a * (0.55 + 0.45 * Math.sin(t * st.s + st.o));
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fillStyle = st.gold ? `rgba(247,220,166,${alpha})` : `rgba(230,225,255,${alpha})`;
      ctx.fill();
    }
    if (reduced) return;

    if (!shooting && Math.random() < 0.0025) {
      shooting = { x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.35, life: 0 };
    }
    if (shooting) {
      const s = shooting;
      s.life += 1;
      const len = 90, k = s.life * 9;
      const x = s.x - k, y = s.y + k * 0.45;
      const g = ctx.createLinearGradient(x, y, x + len, y - len * 0.45);
      const fade = Math.max(0, 1 - s.life / 45);
      g.addColorStop(0, `rgba(255,240,210,${0.9 * fade})`);
      g.addColorStop(1, 'rgba(255,240,210,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y - len * 0.45); ctx.stroke();
      if (s.life > 45) shooting = null;
    }
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  if (!reduced) {
    raf = requestAnimationFrame(draw);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    });
  }
})();

// ---------- Botón flotante: mostrar el texto un momento ----------
const waFloat = document.querySelector('.wa-float');
setTimeout(() => {
  waFloat.classList.add('is-expanded');
  setTimeout(() => waFloat.classList.remove('is-expanded'), 4500);
}, 3500);

document.getElementById('year').textContent = new Date().getFullYear();
