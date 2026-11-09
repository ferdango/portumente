/* Por tu mente · Verano REC — inicialización temprana.
   Archivo externo (no en línea) para cumplir la Content-Security-Policy. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  // Anti-clickjacking: GitHub Pages no permite enviar X-Frame-Options ni frame-ancestors,
  // así que la página se niega a mostrarse dentro de un iframe de otro sitio.
  if (window.top !== window.self) {
    root.classList.add('framed');
    try { window.top.location.replace(window.self.location.href); } catch (e) { /* bloqueado: queda oculta */ }
  }
})();
