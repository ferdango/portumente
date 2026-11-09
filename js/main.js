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

  /* ---------- Historia REC (sticky) ---------- */
  var stage = $('.rec-stage');
  var recCards = $$('.rec-card');
  var recDots = $$('.rec-dots li');
  function setStep(step) {
    if (stage) stage.setAttribute('data-active', step);
    recDots.forEach(function (li) { li.classList.toggle('is-active', li.getAttribute('data-step') === step); });
    recCards.forEach(function (c) { c.classList.toggle('is-active', c.getAttribute('data-step') === step); });
  }
  var currentStep = '';
  // Se calcula según la posición real (fiable aunque se salte de golpe con el menú o el teclado).
  function updateStep() {
    if (!recCards.length) return;
    var mid = window.innerHeight / 2, best = recCards[0], bestDist = Infinity;
    recCards.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var dist = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (dist < bestDist) { bestDist = dist; best = c; }
    });
    var step = best.getAttribute('data-step');
    if (step !== currentStep) { currentStep = step; setStep(step); }
  }

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
  var contact = $('#contacto');
  var contactVisible = false;
  var menuOpen = false;
  var lastY = window.scrollY, velocity = 0, direction = 1, ticking = false;

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
    var delta = y - lastY;
    velocity = delta;
    if (delta !== 0) direction = delta > 0 ? 1 : -1;
    lastY = y;

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
    updateStep();
    updateNav();
    updateFab();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Marquesina (reacciona a la velocidad del scroll) ---------- */
  var track = $('.marquee-track');
  if (track && !reduceMotion) {
    var mx = 0, half = 0, prev = performance.now(), running = false;
    var measure = function () { half = track.scrollWidth / 2; };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    var loop = function (t) {
      var dt = Math.min(0.05, (t - prev) / 1000); prev = t;
      var boost = Math.min(Math.abs(velocity) * 0.6, 14);
      velocity *= 0.9;
      mx -= direction * (60 * dt + boost);
      if (half > 0) {
        if (mx <= -half) mx += half;
        if (mx > 0) mx -= half;
      }
      track.style.transform = 'translate3d(' + mx.toFixed(2) + 'px,0,0)';
      if (running) requestAnimationFrame(loop);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !running) { running = true; prev = performance.now(); requestAnimationFrame(loop); }
        else if (!vis) running = false;
      }).observe(track.parentElement);
    }
  }

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
    window.addEventListener('resize', function () { if (window.innerWidth > 1100 && menuOpen) closeMenu(false); }, { passive: true });
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
    var ageSel = $('#f-edad', form);
    var msgIn = $('#f-msg', form);
    var hint = $('.age-hint', form);
    var counter = $('.char-count span', form);
    var nurseryChip = $('input[value^="Guardería"]', form);
    var submitBtn = $('button[type="submit"]', form);
    var ALLOWED_INTERESTS = $$('input[name="interes"]', form).map(function (i) { return i.value; });

    for (var age = 1; age <= 18; age++) {
      var opt = doc.createElement('option');
      opt.value = String(age);
      opt.textContent = age + (age === 1 ? ' año' : ' años');
      ageSel.appendChild(opt);
    }

    // Limpia caracteres de control y de dirección de texto (evita mensajes manipulados).
    var sanitize = function (value, max) {
      return String(value || '')
        .normalize('NFC')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩﻿]/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim()
        .slice(0, max);
    };
    var oneLine = function (value, max) { return sanitize(value, max).replace(/[\r\n]+/g, ' '); };

    var setError = function (input, text) {
      var field = input.closest('.field');
      var err = field && $('.field-error', field);
      if (field) field.classList.toggle('has-error', !!text);
      if (err) err.textContent = text || '';
      input.setAttribute('aria-invalid', text ? 'true' : 'false');
    };

    ageSel.addEventListener('change', function () {
      setError(ageSel, '');
      var a = parseInt(ageSel.value, 10);
      if (!a) { hint.hidden = true; return; }
      hint.hidden = false;
      if (a <= 3) {
        hint.textContent = 'Para niños de 1 a 3 años tenemos guardería + estimulación temprana por las mañanas. 🌱';
        if (nurseryChip && !nurseryChip.checked) nurseryChip.checked = true;
      } else {
        hint.textContent = '¡Genial! Verano REC es para niños y adolescentes de 4 a 18 años. ☀️';
        if (nurseryChip && nurseryChip.checked) nurseryChip.checked = false;
      }
    });
    nameIn.addEventListener('input', function () { if (nameIn.value.trim().length >= 2) setError(nameIn, ''); });
    msgIn.addEventListener('input', function () { if (counter) counter.textContent = String(msgIn.value.length); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = oneLine(nameIn.value, 60);
      var edad = parseInt(ageSel.value, 10);
      var mensaje = sanitize(msgIn.value, 500);
      var intereses = $$('input[name="interes"]:checked', form)
        .map(function (i) { return i.value; })
        .filter(function (v) { return ALLOWED_INTERESTS.indexOf(v) !== -1; });

      var firstInvalid = null;
      if (nombre.length < 2) { setError(nameIn, 'Cuéntanos tu nombre, por favor.'); firstInvalid = firstInvalid || nameIn; }
      else setError(nameIn, '');
      if (!(edad >= 1 && edad <= 18)) { setError(ageSel, 'Elige la edad de tu hijo(a).'); firstInvalid = firstInvalid || ageSel; }
      else setError(ageSel, '');
      if (firstInvalid) { firstInvalid.focus(); return; }

      var edadTxt = edad + (edad === 1 ? ' año' : ' años');
      var lines = ['Hola, deseo más información sobre el taller Verano REC.', 'Soy ' + nombre + '.'];
      lines.push('Mi hijo(a) tiene ' + edadTxt + '.');
      if (intereses.length) lines.push('Me interesa: ' + intereses.join(', ') + '.');
      if (mensaje) lines.push(mensaje);

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      var link = doc.createElement('a');
      link.href = url;
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
