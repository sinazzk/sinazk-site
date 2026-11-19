/* sinazk.com · homepage: hero stage, "Human-Centred" tilt, TopTech dot field */
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

  /* ── TopTech card: a quiet dot field that swells toward the pointer; a tap sends out a ripple ── */
  (function () {
    var cover = document.querySelector('.tt-cover');
    var c = cover && cover.querySelector('canvas');
    if (!c) return;
    var T = { mx: -999, my: -999, px: -999, py: -999, on: 0, waves: [], raf: 0, dots: [], w: 0, h: 0, dpr: 1 };
    var GAP = 18, BASE = [16, 24, 31], HOT = [27, 156, 133];
    function setup() {
      var r = c.getBoundingClientRect(); T.dpr = Math.min(2, window.devicePixelRatio || 1);
      T.w = r.width; T.h = r.height; c.width = Math.round(r.width * T.dpr); c.height = Math.round(r.height * T.dpr);
      T.dots = [];
      var ox = (T.w % GAP) / 2 + GAP / 2, oy = (T.h % GAP) / 2 + GAP / 2;
      for (var y = oy; y < T.h; y += GAP) for (var x = ox; x < T.w; x += GAP) T.dots.push({ x: x, y: y, k: 0 });
    }
    function draw(now) {
      var ctx = c.getContext('2d'); ctx.setTransform(T.dpr, 0, 0, T.dpr, 0, 0); ctx.clearRect(0, 0, T.w, T.h);
      if (reduce) { T.px = T.mx; T.py = T.my; } else { T.px += (T.mx - T.px) * 0.18; T.py += (T.my - T.py) * 0.18; }
      T.waves = T.waves.filter(function (w) { return now - w.t < 1100; });
      var busy = T.waves.length > 0 || Math.abs(T.mx - T.px) + Math.abs(T.my - T.py) > 0.5;
      T.dots.forEach(function (d) {
        var goal = 0;
        if (T.on) { var dist = Math.hypot(d.x - T.px, d.y - T.py); goal = Math.max(0, 1 - dist / 110); goal *= goal; }
        T.waves.forEach(function (w) {
          var rad = (now - w.t) * 0.42, dist = Math.hypot(d.x - w.x, d.y - w.y);
          goal = Math.max(goal, Math.max(0, 1 - Math.abs(dist - rad) / 26) * (1 - (now - w.t) / 1100));
        });
        d.k += reduce ? goal - d.k : (goal - d.k) * 0.2;
        if (Math.abs(goal - d.k) > 0.01) busy = true;
        var k = d.k, col = BASE.map(function (b, j) { return Math.round(b + (HOT[j] - b) * k); });
        ctx.fillStyle = 'rgba(' + col.join(',') + ',' + (0.16 + k * 0.64).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.15 + k * 2.1, 0, Math.PI * 2); ctx.fill();
      });
      return busy;
    }
    function tick(now) { T.raf = draw(now) ? requestAnimationFrame(tick) : 0; }
    function wake() { if (!T.raf) T.raf = requestAnimationFrame(tick); }
    function local(e) { var r = cover.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    setup(); draw(performance.now());
    cover.addEventListener('pointermove', function (e) { var p = local(e); T.mx = p.x; T.my = p.y; if (!T.on) { T.px = T.mx; T.py = T.my; } T.on = 1; wake(); });
    cover.addEventListener('pointerleave', function () { T.on = 0; wake(); });
    cover.addEventListener('pointerdown', function (e) { var p = local(e); T.waves.push({ x: p.x, y: p.y, t: performance.now() }); wake(); });
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { T.waves.push({ x: T.w / 2, y: T.h / 2, t: performance.now() }); wake(); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(cover);
    }
    window.addEventListener('resize', function () { setup(); draw(performance.now()); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setup(); draw(performance.now()); });
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
