/* sinazk.com · case studies: drawing title block and image viewer */
(function () {
  'use strict';

  /* ── Title block: shows which sheet (section) is in view ── */
  (function () {
    var tb = document.querySelector('.tblock');
    var secs = document.querySelectorAll('[data-sheet]');
    if (!tb || !secs.length) return;
    var no = tb.querySelector('[data-tb-no]'), name = tb.querySelector('[data-tb-name]'), bars = tb.querySelectorAll('.tb-bar');
    var cur = -1, raf = 0;
    function update() {
      raf = 0;
      var mid = window.innerHeight * 0.45, i = 0;
      secs.forEach(function (el, k) { if (el.getBoundingClientRect().top < mid) i = k; });
      tb.classList.toggle('on', window.scrollY > 900);
      if (i === cur) return;
      cur = i;
      no.textContent = String(i + 1).padStart(2, '0');
      name.textContent = secs[i].getAttribute('data-sheet');
      bars.forEach(function (b, k) { b.classList.toggle('done', k < i); b.classList.toggle('cur', k === i); });
    }
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  })();

  /* ── Image viewer: click any figure image; arrows and Escape work ── */
  (function () {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('main figure img'));
    if (!imgs.length) return;
    var icon = function (d) { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    var lb = document.createElement('div');
    lb.className = 'lb'; lb.hidden = true; lb.tabIndex = -1;
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<span class="lb-count"></span>' +
      '<button type="button" class="lb-btn lb-close" aria-label="Close image viewer">' + icon('M6 6l12 12M18 6L6 18') + '</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous image">' + icon('M15 6l-6 6 6 6') + '</button>' +
      '<figure class="lb-fig"><img alt=""><figcaption class="lb-cap"></figcaption></figure>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Next image">' + icon('M9 6l6 6-6 6') + '</button>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img'), cap = lb.querySelector('.lb-cap'), count = lb.querySelector('.lb-count');
    var at = 0, back = null;
    function pad(n) { return String(n).padStart(2, '0'); }
    function show(i) {
      at = (i + imgs.length) % imgs.length;
      var src = imgs[at], fc = src.closest('figure').querySelector('figcaption');
      img.src = src.currentSrc || src.src; img.alt = src.alt;
      cap.textContent = fc ? fc.textContent.trim() : src.alt;
      count.textContent = pad(at + 1) + ' / ' + pad(imgs.length);
    }
    function open(i) { back = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.focus(); }
    function close() { lb.hidden = true; document.body.style.overflow = ''; if (back && back.focus) back.focus(); }
    imgs.forEach(function (el, i) {
      el.tabIndex = 0; el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Enlarge image: ' + el.alt);
      el.addEventListener('click', function () { open(i); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(at - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(at + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(at + 1);
      else if (e.key === 'ArrowLeft') show(at - 1);
      else if (e.key === 'Tab') { // keep focus inside the viewer
        var b = lb.querySelectorAll('button'), first = b[0], last = b[b.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();
})();
