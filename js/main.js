/* =========================================================
   Por tu mente · Verano REC — Interacciones
   Sin dependencias externas en tiempo de ejecución (Lenis se sirve localmente).
   No guarda ni envía datos personales: el formulario solo arma un enlace de WhatsApp.
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var WA_NUMBER = '51940399776';
  var MAP_ORIGIN = 'https://maps.google.com/';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /* ---------- Variables de animación (en vez de estilos en línea) ---------- */
  $$('[data-d]').forEach(function (el) {
    var v = parseFloat(el.getAttribute('data-d'));
    if (!isNaN(v)) el.style.setProperty('--d', v + 's');
  });
  $$('.sun .ray').forEach(function (ray, i) { ray.style.setProperty('--i', i); });
  var chatDelays = [0, 0.55, 1.1, 1.7, 2.95, 3.6];
  $$('.chat-body > *').forEach(function (el, i) { el.style.setProperty('--cd', (chatDelays[i] || i * 0.6) + 's'); });

  var yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Desplazamiento suave (Lenis) ---------- */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    try {
      lenis = new window.Lenis({
        duration: 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true
      });
      var lenisRaf = function (time) { lenis.raf(time); requestAnimationFrame(lenisRaf); };
      requestAnimationFrame(lenisRaf);
    } catch (e) { lenis = null; }
  }

  function scrollToTarget(target) {
    var isTop = target === 0;
    if (lenis) {
      lenis.scrollTo(isTop ? 0 : target, { offset: isTop ? 0 : -88 });
    } else if (isTop) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var hash = a.getAttribute('href');
    if (!hash || hash === '#') return;
    var id = hash.slice(1);
    var target = id === 'top' ? 0 : doc.getElementById(id);
    if (target === null) return;
    e.preventDefault();
    closeMenu(false);
    // En móvil, R/E/C del hero llevan a su tarjeta dentro del slider.
    if (target !== 0 && target.classList.contains('rec-card') && isSlider()) {
      scrollToStep(STEPS.indexOf(target.getAttribute('data-step')));
      return;
    }
    scrollToTarget(target);
    if (target !== 0) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    if (history.replaceState) history.replaceState(null, '', id === 'top' ? location.pathname : hash);
  });

  /* ---------- Revelado al entrar en pantalla ---------- */
  var revealEls = $$('.reveal, [data-steps]');
  function markIn(el) {
    el.classList.add('is-in');
    el.addEventListener('transitionend', function handler(ev) {
      if (ev.target === el && ev.propertyName === 'opacity') {
        el.style.setProperty('--d', '0s');
        el.removeEventListener('transitionend', handler);
      }
    });
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { markIn(entry.target); revealIO.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Cuenta regresiva ---------- */
  var cd = $('[data-countdown]');
  if (cd) {
    var start = new Date(cd.getAttribute('data-countdown'));
    var end = new Date(cd.getAttribute('data-end'));
    var now = new Date();
    var daysEl = $('.cd-days', cd), labelEl = $('.cd-label', cd), subEl = $('.cd-sub', cd);
    if (now < start) {
      var days = Math.ceil((start - now) / 864e5);
      daysEl.textContent = String(days);
      daysEl.setAttribute('data-count', String(days));
      labelEl.textContent = days === 1 ? 'día para empezar' : 'días para empezar';
    } else if (now <= end) {
      daysEl.textContent = '¡Ya!';
      labelEl.textContent = 'el taller está en curso';
      subEl.textContent = 'Escríbenos para consultar cupos';
    } else {
      daysEl.textContent = '✓';
      labelEl.textContent = 'edición 2027 finalizada';
      subEl.textContent = '¡Gracias por este verano!';
    }
  }

  /* ---------- Contadores animados ---------- */
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    counters.forEach(function (el) { el.textContent = '0'; });
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countIO.unobserve(entry.target);
        var el = entry.target;
        var to = parseInt(el.getAttribute('data-count'), 10) || 0;
        var t0 = performance.now(), dur = 1400;
        (function tick(t) {
          var p = clamp((t - t0) / dur, 0, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(to * eased));
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIO.observe(el); });
  }

  /* ---------- ¿Qué trabajamos? (REC) ----------
     Escritorio: letra fija a la izquierda y tarjetas que pasan al hacer scroll.
     Móvil: la sección se fija y el scroll avanza el slider de una tarjeta en una. */
  var stage = $('.rec-stage');
  var recStory = $('.rec-story');
  var recPin = $('.rec-pin');
  var recTrack = $('.rec-steps');
  var recCards = $$('.rec-card');
  var recDots = $$('.rec-dots li');
  var recNav = $$('.rec-nav button');
  var STEPS = recCards.map(function (c) { return c.getAttribute('data-step'); });
  var sliderMQ = window.matchMedia('(max-width: 900px)');
  // `top` real de .rec-pin en móvil (92 px, u 84 px en pantallas bajas).
  function pinTop() { return recPin ? parseFloat(getComputedStyle(recPin).top) || 92 : 92; }
  function isSlider() { return sliderMQ.matches && !!recStory && !!recPin; }

  function setStep(step) {
    if (stage) stage.setAttribute('data-active', step);
    if (recTrack) recTrack.style.setProperty('--i', String(Math.max(0, STEPS.indexOf(step))));
    recDots.forEach(function (li) { li.classList.toggle('is-active', li.getAttribute('data-step') === step); });
    recCards.forEach(function (c) { c.classList.toggle('is-active', c.getAttribute('data-step') === step); });
    recNav.forEach(function (b) {
      var on = b.getAttribute('data-step') === step;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  var currentStep = '';
  // Se calcula según la posición real (fiable aunque se salte de golpe con el menú o el teclado).
  function updateStep() {
    if (!recCards.length) return;
    var step;
    if (isSlider()) {
      var r = recStory.getBoundingClientRect();
      var dist = r.height - recPin.offsetHeight;
      var p = dist > 0 ? clamp((pinTop() - r.top) / dist, 0, 0.9999) : 0;
      step = STEPS[Math.floor(p * STEPS.length)];
    } else {
      var mid = window.innerHeight / 2, best = recCards[0], bestDist = Infinity;
      recCards.forEach(function (c) {
        var cr = c.getBoundingClientRect();
        var d = cr.top <= mid && cr.bottom >= mid ? 0 : Math.min(Math.abs(cr.top - mid), Math.abs(cr.bottom - mid));
        if (d < bestDist) { bestDist = d; best = c; }
      });
      step = best.getAttribute('data-step');
    }
    if (step !== currentStep) { currentStep = step; setStep(step); }
  }

  // Lleva el scroll al tramo que muestra la tarjeta `i` del slider móvil.
  function scrollToStep(i) {
    if (!isSlider() || i < 0 || i >= STEPS.length) return;
    var r = recStory.getBoundingClientRect();
    var dist = r.height - recPin.offsetHeight;
    var y = window.scrollY + r.top - pinTop() + dist * ((i + 0.5) / STEPS.length);
    if (lenis) lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  recNav.forEach(function (b) {
    b.addEventListener('click', function () { scrollToStep(STEPS.indexOf(b.getAttribute('data-step'))); });
  });
  // Deslizar con el dedo también avanza o retrocede una tarjeta.
  if (recPin) {
    var tx = 0, ty = 0;
    recPin.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    recPin.addEventListener('touchend', function (e) {
      if (!isSlider()) return;
      var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        scrollToStep(STEPS.indexOf(currentStep) + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }
  sliderMQ.addEventListener && sliderMQ.addEventListener('change', function () { currentStep = ''; updateStep(); });

  /* ---------- Enlace activo del menú ---------- */
  var navLinks = $$('.main-nav a');
  var navSections = navLinks.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); });
  var currentNav = null;
  function updateNav() {
    var line = window.innerHeight * 0.4, active = null;
    navSections.forEach(function (sec, i) {
      if (!sec) return;
      var r = sec.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) active = navLinks[i];
    });
    if (active !== currentNav) {
      currentNav = active;
      navLinks.forEach(function (a) { a.classList.toggle('is-current', a === active); });
    }
  }

  /* ---------- Efectos ligados al scroll ---------- */
  var header = $('.site-header');
  var progress = $('.scroll-progress span');
  var sunScroll = $('.sun-rays-scroll');
  var blobs = $$('[data-speed]');
  var fab = $('.fab');
  var hero = $('.hero');
  var focusStage = $('[data-focus]');
  var contact = $('#contacto');
  var contactVisible = false;
  var menuOpen = false;
  var ticking = false;

  if ('IntersectionObserver' in window && contact) {
    new IntersectionObserver(function (entries) {
      contactVisible = entries[0].isIntersecting;
      updateFab();
    }, { threshold: 0.25 }).observe(contact);
  }

  function updateFab() {
    if (!fab || !hero) return;
    var show = window.scrollY > hero.offsetHeight * 0.7 && !contactVisible && !menuOpen;
    fab.classList.toggle('is-visible', show);
  }

  function onScroll() {
    var y = window.scrollY;
    var max = Math.max(1, root.scrollHeight - window.innerHeight);

    if (progress) progress.style.transform = 'scaleX(' + (y / max).toFixed(4) + ')';
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (!reduceMotion) {
      if (sunScroll) sunScroll.style.transform = 'rotate(' + (y * 0.12).toFixed(2) + 'deg)';
      blobs.forEach(function (b) {
        var speed = parseFloat(b.getAttribute('data-speed')) || 0;
        var r = b.parentElement.getBoundingClientRect();
        var offset = (window.innerHeight / 2 - (r.top + r.height / 2)) * speed;
        b.style.translate = '0 ' + offset.toFixed(1) + 'px';
      });
    }
    // Reforzamiento: las cápsulas pasan de desordenadas («primero regulo») a ordenadas («luego enseño»).
    if (focusStage) {
      var fr = focusStage.getBoundingClientRect();
      var fp = reduceMotion ? 1 : clamp((window.innerHeight * 0.92 - fr.top) / (window.innerHeight * 0.55), 0, 1);
      focusStage.style.setProperty('--p', fp.toFixed(3));
      focusStage.classList.toggle('is-ordered', fp > 0.62);
    }
    updateStep();
    updateNav();
    updateFab();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Sol del hero: sigue suavemente al puntero ---------- */
  var sun = $('.sun');
  if (sun && hero && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      sun.style.translate = (dx * 18).toFixed(1) + 'px ' + (dy * 18).toFixed(1) + 'px';
    });
    hero.addEventListener('pointerleave', function () { sun.style.translate = '0 0'; });
    sun.style.transition = 'translate .8s cubic-bezier(.22,1,.36,1)';
  }

  /* ---------- Tarjetas con inclinación 3D ---------- */
  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        if (!card.classList.contains('is-in')) return;
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 10).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });

    $$('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.3).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Menú móvil ---------- */
  var toggle = $('.menu-toggle');
  var menu = $('#mobile-menu');
  function openMenu() {
    if (!menu || menuOpen) return;
    menuOpen = true;
    menu.hidden = false;
    void menu.offsetWidth; // fuerza el reflow para que la transición se ejecute
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    if (lenis) lenis.stop(); else root.style.overflow = 'hidden';
    updateFab();
    var first = $('a', menu);
    if (first) setTimeout(function () { first.focus(); }, 120);
  }
  function closeMenu(returnFocus) {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    if (lenis) lenis.start(); else root.style.overflow = '';
    setTimeout(function () { if (!menuOpen) menu.hidden = true; }, 360);
    if (returnFocus) toggle.focus();
    updateFab();
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { if (menuOpen) closeMenu(true); else openMenu(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) closeMenu(true); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1240 && menuOpen) closeMenu(false); }, { passive: true });
    $$('a:not([href^="#"])', menu).forEach(function (a) { a.addEventListener('click', function () { closeMenu(false); }); });
  }

  /* ---------- Preguntas frecuentes (apertura animada) ---------- */
  $$('.faq details').forEach(function (det) {
    var summary = $('summary', det);
    var panel = $('.faq-a', det);
    if (!summary || !panel || reduceMotion || !panel.animate) return;
    var anim = null;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (anim) anim.cancel();
      if (!det.open) {
        det.open = true;
        var h = panel.scrollHeight;
        anim = panel.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
        anim.onfinish = function () { anim = null; };
      } else {
        var h2 = panel.scrollHeight;
        anim = panel.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.4,0,.2,1)' });
        anim.onfinish = function () { det.open = false; anim = null; };
      }
    });
  });

  /* ---------- Mapa: se carga solo si la persona lo pide (privacidad) ---------- */
  $$('.map[data-map-src]').forEach(function (box) {
    var btn = $('.map-load', box);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var src = box.getAttribute('data-map-src') || '';
      if (src.indexOf(MAP_ORIGIN) !== 0) return; // solo se permite Google Maps
      var iframe = doc.createElement('iframe');
      iframe.title = 'Mapa: Av. Mariscal Castilla 263, Huacho';
      iframe.src = src;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
      box.replaceChildren(iframe);
    });
  });

  /* ---------- Formulario → WhatsApp ---------- */
  var form = $('#form-wa');
  if (form) {
    var nameIn = $('#f-nombre', form);
    var phoneIn = $('#f-cel', form);
    var ageSel = $('#f-edad', form);
    var intSel = $('#f-interes', form);
    var msgIn = $('#f-msg', form);
    var submitBtn = $('button[type="submit"]', form);
    // Opciones permitidas y cómo se nombran en el mensaje.
    var TOPICS = {
      'Terapias REC': 'las terapias de Verano REC',
      'Reforzamiento escolar': 'el reforzamiento escolar',
      'Estimulación temprana': 'la estimulación temprana'
    };

    // Rangos de edad permitidos (deben coincidir con las opciones del HTML).
    var AGES = {
      '1-3': 'entre 1 y 3 años',
      '4-8': 'entre 4 y 8 años',
      '9-12': 'entre 9 y 12 años',
      '13-18': 'entre 13 y 18 años'
    };

    // Limpia caracteres de control y de dirección de texto (evita mensajes manipulados).
    var CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
    var sanitize = function (value, max) {
      return String(value || '')
        .normalize('NFC')
        .replace(CONTROL_CHARS, '')
        .replace(/[ \t]+/g, ' ')
        .trim()
        .slice(0, max);
    };
    var oneLine = function (value, max) { return sanitize(value, max).replace(/[\r\n]+/g, ' '); };

    // Celular peruano: 9 dígitos que empiezan con 9 (acepta +51 y espacios).
    var normalizePhone = function (value) {
      var digits = String(value || '').replace(/\D/g, '');
      if (digits.length === 11 && digits.indexOf('51') === 0) digits = digits.slice(2);
      return /^9\d{8}$/.test(digits) ? digits : '';
    };

    var setError = function (input, text) {
      var field = input.closest('.field');
      var err = field && $('.field-error', field);
      if (field) field.classList.toggle('has-error', !!text);
      if (err) err.textContent = text || '';
      input.setAttribute('aria-invalid', text ? 'true' : 'false');
    };

    nameIn.addEventListener('input', function () { if (nameIn.value.trim().length >= 2) setError(nameIn, ''); });
    phoneIn.addEventListener('input', function () { if (normalizePhone(phoneIn.value)) setError(phoneIn, ''); });
    intSel.addEventListener('change', function () { setError(intSel, ''); });
    ageSel.addEventListener('change', function () {
      setError(ageSel, '');
      // Si es de 1 a 3 años y aún no eligió, sugerimos estimulación temprana.
      if (ageSel.value === '1-3' && !intSel.value) intSel.value = 'Estimulación temprana';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = oneLine(nameIn.value, 60);
      var celular = normalizePhone(phoneIn.value);
      var edad = ageSel.value;
      var validAge = Object.prototype.hasOwnProperty.call(AGES, edad);
      var interes = intSel.value;
      var mensaje = sanitize(msgIn.value, 500);

      var invalid = [];
      setError(nameIn, nombre.length < 2 ? 'Escribe tu nombre, por favor.' : '');
      if (nombre.length < 2) invalid.push(nameIn);
      setError(phoneIn, celular ? '' : 'Escribe un celular de 9 dígitos (ej.: 987 654 321).');
      if (!celular) invalid.push(phoneIn);
      setError(ageSel, validAge ? '' : 'Elige la edad de tu hijo(a).');
      if (!validAge) invalid.push(ageSel);
      var validTopic = Object.prototype.hasOwnProperty.call(TOPICS, interes);
      setError(intSel, validTopic ? '' : 'Elige qué te interesa.');
      if (!validTopic) invalid.push(intSel);
      if (invalid.length) { invalid[0].focus(); return; }

      var celTxt = celular.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
      var lines = [
        'Hola, deseo más información sobre ' + TOPICS[interes] + '.',
        'Soy ' + nombre + ' y mi celular es ' + celTxt + '.',
        'Mi hijo(a) tiene ' + AGES[edad] + '.'
      ];
      if (mensaje) lines.push(mensaje);

      var link = doc.createElement('a');
      link.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      doc.body.appendChild(link);
      link.click();
      link.remove();

      celebrate(submitBtn);
      var label = submitBtn.lastChild;
      var original = label.textContent;
      submitBtn.disabled = true;
      label.textContent = ' ¡Listo! Revisa tu WhatsApp';
      setTimeout(function () { label.textContent = original; submitBtn.disabled = false; }, 4000);
    });
  }

  /* ---------- Pequeña celebración con las cápsulas de la marca ---------- */
  function celebrate(el) {
    if (reduceMotion || !el || !el.animate) return;
    var colors = ['#4BA6F3', '#F0B3F7', '#F4D575', '#EBA06C', '#8099F3'];
    var r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 16; i++) {
      var s = doc.createElement('span');
      s.className = 'burst';
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      s.style.background = colors[i % colors.length];
      doc.body.appendChild(s);
      var ang = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
      var dist = 70 + Math.random() * 90;
      var rot = Math.random() * 360;
      var a = s.animate([
        { transform: 'translate(-50%,-50%) rotate(' + rot + 'deg) scale(.3)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + (Math.cos(ang) * dist).toFixed(0) + 'px), calc(-50% + ' + (Math.sin(ang) * dist - 30).toFixed(0) + 'px)) rotate(' + (rot + 200) + 'deg) scale(1)', opacity: 0 }
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.22,1,.36,1)' });
      a.onfinish = (function (node) { return function () { node.remove(); }; })(s);
    }
  }
})();
