/* sinazk.com · homepage: hero stage and the "Human-Centred" tilt */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero stage: mount the interactive blueprint stage, then fade out the still drawing ── */
  (function () {
    var wrap = document.querySelector('.hero-stage-wrap');
    var el = wrap && wrap.querySelector('.hero-stage');
    if (!el) return;
    var links = { superreach: '/work/superreach/', ocdj: '/work/office-culture-dj/', soksok: '/work/sok-sok/' };
    if (!window.SinazkHeroStage) return; // keep the still drawing
    try {
      window.SinazkHeroStage.mount(el, { links: links, start: 0 });
      requestAnimationFrame(function () { requestAnimationFrame(function () { wrap.classList.add('is-live'); }); });
    } catch (err) { /* keep the still drawing */ }
  })();

  /* ── "Human-Centred" turns slightly in 3D to face the cursor ── */
  (function () {
    var fl = document.querySelector('.flourish');
    if (!fl || reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var tx = 0, ty = 0, rx = 0, ry = 0, raf = 0, MAX_Y = 14, MAX_X = 10;
    function tick() {
      rx += (tx - rx) * 0.08; ry += (ty - ry) * 0.08;
      fl.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      fl.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      raf = Math.abs(tx - rx) + Math.abs(ty - ry) > 0.02 ? requestAnimationFrame(tick) : 0;
    }
    function wake() { if (!raf) raf = requestAnimationFrame(tick); }
    window.addEventListener('mousemove', function (e) {
      var r = fl.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      var dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      ty = Math.max(-1, Math.min(1, dx)) * MAX_Y;
      tx = -Math.max(-1, Math.min(1, dy)) * MAX_X;
      wake();
    }, { passive: true });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) { tx = 0; ty = 0; wake(); } });
  })();
})();
