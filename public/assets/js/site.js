/* sinazk.com · shared behaviour: blueprint spotlight, hatch dividers, cursor crosshair.
   Everything idles when nothing is moving and respects prefers-reduced-motion. */
(function () {
  'use strict';
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var finePointer = !mq('(hover: none), (pointer: coarse)');

  /* ── Spotlight: a soft glow and lit grid follow the cursor over .spot sections ── */
  document.querySelectorAll('.spot').forEach(function (el) {
    var raf = 0, x = 0, y = 0;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      x = e.clientX - r.left; y = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        el.style.setProperty('--mx', Math.round(x) + 'px');
        el.style.setProperty('--my', Math.round(y) + 'px');
        el.classList.add('on');
      });
    });
    el.addEventListener('mouseleave', function () { el.classList.remove('on'); });
  });

  /* ── Hatch dividers: flat hairlines that break into leaning ticks near the cursor, then spring back ── */
  (function () {
    var lines = [], mx = -9999, my = -9999, vx = 0, lx = null, dir = 1, raf = 0;
    var GAP = 4, MAXA = 1.05, BASE = [214, 212, 204], HOT = [27, 156, 133];
    function setup() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      lines = Array.prototype.map.call(document.querySelectorAll('canvas.hline'), function (c) {
        var r = c.getBoundingClientRect();
        c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.round(r.height * dpr);
        var n = Math.ceil(r.width / GAP) + 1;
        return { c: c, ctx: c.getContext('2d'), dpr: dpr, w: r.width, h: r.height, a: new Float32Array(n), v: new Float32Array(n), n: n, dirty: true };
      });
    }
    function draw(L) {
      var ctx = L.ctx, a = L.a, n = L.n, cy = L.h / 2, i, open = false;
      ctx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
      ctx.clearRect(0, 0, L.w, L.h);
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgb(' + BASE.join(',') + ')';
      for (i = 0; i < n; i++) {
        var x = i * GAP;
        if (Math.abs(a[i]) < 0.03) { if (!open) { ctx.moveTo(x, cy + 0.5); open = true; } ctx.lineTo(Math.min(L.w, x + GAP), cy + 0.5); }
        else open = false;
      }
      ctx.stroke();
      for (i = 0; i < n; i++) {
        var t = a[i], k = Math.min(1, Math.abs(t) / MAXA);
        if (k < 0.028) continue;
        var len = GAP + k * 9, dx = Math.cos(t) * len / 2, dy = Math.sin(t) * len / 2, px = i * GAP + GAP / 2;
        var col = BASE.map(function (b, j) { return Math.round(b + (HOT[j] - b) * k); });
        ctx.beginPath(); ctx.lineWidth = 1 + k * 0.4; ctx.strokeStyle = 'rgb(' + col.join(',') + ')';
        ctx.moveTo(px - dx, cy + 0.5 + dy); ctx.lineTo(px + dx, cy + 0.5 - dy); ctx.stroke();
      }
    }
    function tick() {
      var vh = window.innerHeight, busy = false;
      lines.forEach(function (L) {
        var r = L.c.getBoundingClientRect();
        if (r.bottom < -40 || r.top > vh + 40) return;
        var px = mx - r.left, dyc = Math.abs(my - (r.top + r.height / 2));
        var prox = reduce ? 0 : Math.max(0, 1 - dyc / 90), energy = 0;
        for (var i = 0; i < L.n; i++) {
          var d = (i * GAP - px) / 80;
          var f = prox > 0 ? Math.exp(-d * d) * prox : 0;
          var target = MAXA * f * dir * (0.75 + Math.min(0.25, Math.abs(vx) / 40));
          L.v[i] = (L.v[i] + (target - L.a[i]) * 0.16) * 0.8;
          L.a[i] += L.v[i];
          energy += Math.abs(L.v[i]) + Math.abs(L.a[i]);
        }
        if (energy > 0.01 || L.dirty) { draw(L); L.dirty = energy > 0.01; }
        if (energy > 0.01 || prox > 0) busy = true;
      });
      raf = busy ? requestAnimationFrame(tick) : 0;
    }
    function wake() { if (!raf) raf = requestAnimationFrame(tick); }
    if (!document.querySelector('canvas.hline')) return;
    setup(); wake();
    window.addEventListener('mousemove', function (e) {
      if (lx != null) vx = vx * 0.8 + (e.clientX - lx) * 0.2;
      lx = e.clientX; mx = e.clientX; my = e.clientY;
      if (Math.abs(vx) > 0.6) dir = vx > 0 ? 1 : -1;
      wake();
    }, { passive: true });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) { mx = -9999; my = -9999; wake(); } });
    window.addEventListener('resize', function () { setup(); wake(); });
    window.addEventListener('scroll', wake, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setup(); wake(); });
  })();

  /* ── Cursor crosshair: trails the pointer on a slightly underdamped spring, turns over links ── */
  (function () {
    var x = document.querySelector('.xhair');
    if (!x || !finePointer) return;
    var xi = x.querySelector('.xhair-in'), xr = x.querySelector('.xh-rot');
    document.documentElement.classList.add('xh-on'); // the zoom cursor replaces the system one over images
    var t = { x: -100, y: -100 }, p = { x: -100, y: -100 }, v = { x: 0, y: 0 }, ang = 0, av = 0, seen = false, raf = 0;
    function tick() {
      if (reduce) { p.x = t.x; p.y = t.y; }
      else {
        v.x = (v.x + (t.x - p.x) * 0.004) * 0.92; v.y = (v.y + (t.y - p.y) * 0.004) * 0.92;
        p.x += v.x; p.y += v.y;
        var lagX = t.x - p.x, lagY = t.y - p.y;
        var target = Math.max(-200, Math.min(200, lagX * 1.5 + lagY * 0.6));
        av = (av + (target - ang) * 0.12) * 0.9; ang += av;
      }
      x.style.transform = 'translate3d(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px,0)';
      if (xr) xr.style.transform = 'rotate(' + ang.toFixed(2) + 'deg)'; // the zoom cursor stays upright
      var settled = Math.abs(v.x) + Math.abs(v.y) < 0.02 && Math.abs(t.x - p.x) + Math.abs(t.y - p.y) < 0.3 && Math.abs(av) < 0.02 && Math.abs(ang) < 0.05;
      raf = settled ? 0 : requestAnimationFrame(tick);
    }
    window.addEventListener('mousemove', function (e) {
      t.x = e.clientX - 26; t.y = e.clientY - 26;
      if (!seen) { p.x = t.x; p.y = t.y; seen = true; }
      x.style.opacity = '1';
      var hot = e.target && e.target.closest && e.target.closest('a,button');
      if (xi) xi.classList.toggle('on', !!hot);
      x.classList.toggle('view', !!(e.target && e.target.closest && e.target.closest('.has-lb main figure img')));
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) x.style.opacity = '0'; });
    // scrolling carries the crosshair along with the page for a moment, then the spring pulls it back
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var d = window.scrollY - lastY; lastY = window.scrollY;
      if (!seen || reduce) return;
      p.y = Math.max(t.y - 220, Math.min(t.y + 220, p.y - Math.max(-120, Math.min(120, d))));
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  })();

  /* ── Contact: the email address leans gently toward the cursor ── */
  (function () {
    var sec = document.querySelector('.contact');
    var wrap = sec && sec.querySelector('.mailwrap');
    if (!wrap || reduce) return;
    var raf = 0, tx = 0, ty = 0;
    function apply() { raf = 0; wrap.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; }
    sec.addEventListener('mousemove', function (e) {
      var r = wrap.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var k = Math.max(0, 1 - Math.hypot(dx / Math.max(r.width, 400), dy / 260));
      tx = Math.round(dx * 0.05 * k); ty = Math.round(dy * 0.12 * k);
      if (!raf) raf = requestAnimationFrame(apply);
    });
    sec.addEventListener('mouseleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
  })();
})();
