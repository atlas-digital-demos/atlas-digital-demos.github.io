(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mobile = innerWidth < 900;
  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* 1 header */
  var top = document.querySelector('.top'), last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) {
    var y = scrollY;
    top.classList.toggle('is-solid', y > 40);
    top.classList.toggle('is-hidden', y > 500 && y > last && !root.classList.contains('menu-open'));
    last = y;
  } });
  var burger = document.querySelector('.burger');
  burger.addEventListener('click', function () {
    var o = root.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Menü schließen' : 'Menü öffnen');
    if (lenis) o ? lenis.stop() : lenis.start();
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var el = document.querySelector(a.getAttribute('href')); if (!el) return;
    e.preventDefault();
    if (root.classList.contains('menu-open')) burger.click();
    lenis ? lenis.scrollTo(el, { offset: -60 }) : el.scrollIntoView({ behavior: 'smooth' });
  });

  /* 2 progress bar */
  var prog = document.querySelector('.progress i');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { prog.style.transform = 'scaleX(' + s.progress + ')'; } });

  /* 3 cursor glow */
  var glow = document.querySelector('.glow');
  if (fine && !reduce) {
    var gx = gsap.quickTo(glow, 'x', { duration: .6 }), gy = gsap.quickTo(glow, 'y', { duration: .6 });
    addEventListener('pointermove', function (e) { gx(e.clientX); gy(e.clientY); }, { passive: true });
  } else glow.style.display = 'none';

  /* intro */
  var intro = document.querySelector('.intro');
  var seen = false; try { seen = sessionStorage.getItem('rr-intro'); } catch (e) {}
  var heroTl;
  function heroIn() {
    heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    heroTl.from('.hero .h1 .ln > span', { yPercent: 115, duration: 1.3, stagger: .1 }, 0)
      .from('.hero .eyebrow, .hero .lead, .hero__cta, .hero__aside span, .hero__scroll', { y: 24, duration: 1, stagger: .07, ease: 'power3.out', clearProps: 'transform' }, .3);
  }
  if (!seen && !reduce) {
    document.body.style.overflow = 'hidden'; if (lenis) lenis.stop();
    var num = intro.querySelector('.intro__n'), bar = intro.querySelector('.intro__line i'), o = { v: 0 };
    var tl = gsap.timeline({ onComplete: function () { intro.remove(); document.body.style.overflow = ''; if (lenis) lenis.start(); ScrollTrigger.refresh(); } });
    tl.from('.intro__name', { yPercent: 40, duration: .9, ease: 'power3.out' }, 0)
      .to(o, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: function () { num.textContent = Math.round(o.v); } }, 0)
      .to(bar, { scaleX: 1, duration: 1.7, ease: 'power2.inOut' }, 0)
      
      .to(intro, { yPercent: -101, duration: 1.1, ease: 'power4.inOut' }, 2.05)
      .add(heroIn, 2.35);
    try { sessionStorage.setItem('rr-intro', '1'); } catch (e) {}
  } else { intro.remove(); heroIn(); }

  /* 4-6 hero scroll scenes: text out, WebGL progress, scale */
  var hero = document.querySelector('.hero');
  gsap.to('.hero__body', { yPercent: -16, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', scrub: true, onUpdate: function (s) { if (window.RRHERO) window.RRHERO.p = s.progress; } });
  gsap.fromTo('.hero__media video', { scale: 1 }, { scale: 1.35, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero canvas.gl', { scale: 1.18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  /* line reveals for all headings */
  gsap.utils.toArray('.sec .h2 .ln > span, .hz__head .h2 .ln > span, .imp .h2 .ln > span, .cta .h1 .ln > span').forEach(function (el) {
    gsap.from(el, { yPercent: 115, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: el.parentNode, start: 'top 88%' } });
  });
  gsap.utils.toArray('.eyebrow').forEach(function (el) {
    if (el.closest('.hero')) return;
    gsap.from(el, { x: -24, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  gsap.utils.toArray('.lead').forEach(function (el) {
    if (el.closest('.hero')) return;
    gsap.from(el, { y: 36, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* word fill statements */
  gsap.utils.toArray('[data-split]').forEach(function (el) {
    var words = el.textContent.split(/(\s+)/), html = '';
    var gold = /(Impuls|Dubai|Deutschland|Atlas)/;
    words.forEach(function (w) { html += /^\s+$/.test(w) ? ' ' : '<span class="w' + '">' + w + '</span>'; });
    el.innerHTML = html;
    var ws = el.querySelectorAll('.w');
    gsap.to(ws, { color: '#f3eee4', stagger: .08, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: true } });
    gsap.from(el, { x: 40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 50%', scrub: true } });
  });

  /* marquees: velocity driven */
  document.querySelectorAll('.marq').forEach(function (m, idx) {
    var inner = m.querySelector('.marq__in'), x = 0, v = 1, dir = idx % 2 ? 1 : -1;
    var half = function () { return inner.scrollWidth / 2; };
    if (idx % 2) x = -half();
    ScrollTrigger.create({ trigger: m, start: 'top bottom', end: 'bottom top', onUpdate: function (s) { v = 1 + Math.min(6, Math.abs(s.getVelocity()) / 260); } });
    gsap.ticker.add(function () {
      v += (1 - v) * .05; x += dir * .6 * v;
      var h = half(); if (dir < 0 && x <= -h) x += h; if (dir > 0 && x >= 0) x -= h;
      inner.style.transform = 'translate3d(' + x + 'px,0,0)';
    });
  });

  /* impuls pin: phone tilts, messages slide in by scrub, steps toggle */
  var imp = document.querySelector('.imp');
  var msgs = gsap.utils.toArray('.msg'), steps = gsap.utils.toArray('.step');
  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function () {
    var tl = gsap.timeline({ scrollTrigger: { trigger: imp, start: 'top top', end: '+=2200', pin: '.imp__pin', scrub: .6 } });
    msgs.forEach(function (m, i) { tl.from(m, { y: 260, scale: .94, duration: 1, ease: 'power3.out' }, i * 1.15); });
    tl.fromTo('.iph', { rotationY: 32, rotationX: 8, rotationZ: -3, transformPerspective: 1600 }, { rotationY: -24, rotationX: 0, rotationZ: 2, duration: msgs.length * 1.15, ease: 'none' }, 0);
    var map = [0, 1, 1, 2, 3, 3];
    steps.forEach(function (st, k) {
      ScrollTrigger.create({ trigger: imp, start: 'top top-=' + (k * 500) , end: '+=500', onToggle: function (s) { if (s.isActive) { steps.forEach(function (x) { x.classList.remove('on'); }); st.classList.add('on'); } } });
    });
  });
  mm.add('(max-width: 900px)', function () {
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.iph', start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
    msgs.forEach(function (m, i) { tl.from(m, { y: 200, scale: .94, duration: 1, ease: 'power3.out' }, i * .9); });
  });
  

  /* flow canvas */
  (function () {
    var wrap = document.querySelector('.flow__stage'), cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d');
    var W, H, dpr, P = 0, T = 0;
    var labels = ['Nachricht', 'Angebot', 'Rechnung', 'Nachfassen', 'Akte'];
    function size() { dpr = Math.min(devicePixelRatio, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    function pts() {
      var m = W < 700, a = [];
      for (var i = 0; i < 5; i++) {
        var t = i / 4;
        if (m) a.push([W * (i % 2 ? .72 : .28), H * (.12 + t * .76)]);
        else a.push([W * (.1 + t * .8), H * (.5 + Math.sin(t * Math.PI * 2) * .2)]);
      }
      return a;
    }
    var vis = true;
    function frame() {
      requestAnimationFrame(frame);
      if (!vis) return;
      T += .016; ctx.clearRect(0, 0, W, H);
      var a = pts(), m = W < 700;
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(212,178,122,.18)';
      ctx.beginPath(); a.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
      var seg = P * 4, full = Math.floor(seg);
      ctx.strokeStyle = '#d4b27a'; ctx.lineWidth = 2; ctx.shadowColor = '#d4b27a'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.moveTo(a[0][0], a[0][1]);
      for (var i = 1; i <= Math.min(full, 4); i++) ctx.lineTo(a[i][0], a[i][1]);
      var hx = a[0][0], hy = a[0][1];
      if (full < 4) { var f = seg - full, p0 = a[full], p1 = a[full + 1]; hx = p0[0] + (p1[0] - p0[0]) * f; hy = p0[1] + (p1[1] - p0[1]) * f; ctx.lineTo(hx, hy); } else { hx = a[4][0]; hy = a[4][1]; }
      ctx.stroke(); ctx.shadowBlur = 0;
      a.forEach(function (p, i) {
        var on = seg >= i - .001, r = 9 + (on ? 3 * Math.sin(T * 3 + i) : 0);
        ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fillStyle = on ? '#d4b27a' : '#0d0c0a'; ctx.fill();
        ctx.strokeStyle = on ? '#f0d9a8' : 'rgba(212,178,122,.5)'; ctx.lineWidth = 1; ctx.stroke();
        if (on) { ctx.beginPath(); ctx.arc(p[0], p[1], r + 10 + (T * 20 + i * 7) % 26, 0, 7); ctx.strokeStyle = 'rgba(212,178,122,' + (.35 - ((T * 20 + i * 7) % 26) / 80) + ')'; ctx.stroke(); }
        ctx.font = '500 ' + (W < 700 ? 12 : 13) + 'px Mono, monospace'; ctx.fillStyle = on ? '#f3eee4' : '#a39b8b';
        ctx.textAlign = m ? (i % 2 ? 'right' : 'left') : 'center';
        var lx = m ? p[0] + (i % 2 ? -22 : 22) : p[0], ly = m ? p[1] + 4 : p[1] - 28;
        ctx.fillText(labels[i].toUpperCase(), lx, ly);
      });
      for (var k = 0; k < 14; k++) {
        var u = ((T * .12 + k / 14) % 1) * Math.min(1, P * 1.02) * 4, s2 = Math.min(3, Math.floor(u)), ff = u - s2;
        var q0 = a[s2], q1 = a[s2 + 1]; if (!q1 || u > seg) continue;
        ctx.beginPath(); ctx.arc(q0[0] + (q1[0] - q0[0]) * ff, q0[1] + (q1[1] - q0[1]) * ff, 2.4, 0, 7); ctx.fillStyle = '#f0d9a8'; ctx.fill();
      }
    }
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(wrap);
    frame();
    ScrollTrigger.create({ trigger: wrap, start: 'top 85%', end: 'bottom 35%', scrub: true, onUpdate: function (s) { P = s.progress; } });
    window.__flowCanvas = cv;
  })();

  /* horizontal scroller */
  var hz = document.querySelector('.hz'), track = hz.querySelector('.hz__track'), cards = gsap.utils.toArray('.card');
  mm.add('(min-width: 901px)', function () {
    var dist = function () { return track.scrollWidth - innerWidth + 40; };
    gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: hz, start: 'top top', end: function () { return '+=' + dist(); }, pin: '.hz__pin', scrub: .6, invalidateOnRefresh: true } });
    gsap.to('.hz__bar i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: hz, start: 'top top', end: function () { return '+=' + dist(); }, scrub: true } });
  });
  mm.add('(max-width: 900px)', function () {
    track.style.width = 'auto'; track.style.flexDirection = 'column'; track.style.paddingInline = 'var(--pad)';
    return function () { track.style.width = ''; track.style.flexDirection = ''; track.style.paddingInline = ''; };
  });
  cards.forEach(function (c, i) {
    var paths = c.querySelectorAll('.dr');
    paths.forEach(function (p) { var l = p.getTotalLength ? p.getTotalLength() : 600; p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    gsap.to(paths, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: .15, scrollTrigger: { trigger: c, start: mobile ? 'top 85%' : 'left 85%', horizontal: false, containerAnimation: null } });
    if (fine && !reduce) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(c, { rotationY: x * 10, rotationX: -y * 10, transformPerspective: 900, duration: .5, ease: 'power2.out' });
      });
      c.addEventListener('pointerleave', function () { gsap.to(c, { rotationY: 0, rotationX: 0, duration: .8, ease: 'power3.out' }); });
    }
  });

  /* stacked divisions */
  var dvs = gsap.utils.toArray('.dv');
  dvs.forEach(function (d, i) {
    gsap.from(d, { y: 80, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: d, start: 'top 92%' } });
    gsap.from(d.querySelector('.dv__n'), { yPercent: 30, ease: 'none', scrollTrigger: { trigger: d, start: 'top bottom', end: 'top 30%', scrub: true } });
    gsap.from(d.querySelectorAll('li'), { x: 40, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: d, start: 'top 75%' } });
    if (i < dvs.length - 1 && !mobile) gsap.to(d, { scale: .94, ease: 'none', scrollTrigger: { trigger: dvs[i + 1], start: 'top 85%', end: 'top 90px', scrub: true } });
  });

  /* gold principles: line grows, rows slide, background swell */
  gsap.utils.toArray('.pr').forEach(function (r) {
    gsap.to(r, { '--s': 1, duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: r, start: 'top 88%' } });
    gsap.from(r.querySelectorAll('h3, p'), { yPercent: 40, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: r, start: 'top 88%' } });
  });
  gsap.fromTo('.sec--gold', { clipPath: 'inset(0 8% 0 8%)' }, { clipPath: 'inset(0 0% 0 0%)', ease: 'none', scrollTrigger: { trigger: '.sec--gold', start: 'top bottom', end: 'top 30%', scrub: true } });


  /* counters */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '', o = { v: 0 };
    var fmt = function (v) { var s = dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toString(); if (el.dataset.fmt === 'int') s = Math.round(v).toLocaleString('de-DE'); return pre + s + suf; };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: function () { el.innerHTML = fmt(o.v); } }); } });
  });
  gsap.utils.toArray('.proto__l li, .cmp__r').forEach(function (r) {
    gsap.to(r, { '--s': 1, duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: r, start: 'top 90%' } });
  });
  gsap.utils.toArray('.quotes blockquote').forEach(function (q, i) {
    gsap.from(q, { y: 70, rotation: i ? 1.5 : -1.5, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: q, start: 'top 90%' } });
  });
  gsap.from('.tele__g > div', { y: 30, stagger: .1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.tele', start: 'top 92%' } });

  /* geo */
  var geo = document.querySelector('.geo__vis');
  gsap.from(geo, { scale: .9, ease: 'none', scrollTrigger: { trigger: geo, start: 'top bottom', end: 'top 40%', scrub: true } });
  var line = geo.querySelectorAll('.dr');
  line.forEach(function (p) { var l = p.getTotalLength(); p.style.strokeDasharray = p.getAttribute('stroke-dasharray') || l; if (!p.getAttribute('stroke-dasharray')) p.style.strokeDashoffset = l; });
  gsap.to(geo.querySelectorAll('circle.dr'), { strokeDashoffset: 0, duration: 1.6, scrollTrigger: { trigger: geo, start: 'top 75%' } });
  gsap.from(geo.querySelectorAll('.geo__dot, .geo__lab'), { scale: 0, duration: .8, stagger: .2, ease: 'back.out(2)', scrollTrigger: { trigger: geo, start: 'top 70%' } });

  /* founder */
  gsap.from('.founder__name span', { xPercent: -14, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.founder', start: 'top bottom', end: 'top 30%', scrub: true } });
  gsap.to('.founder__ring', { rotation: 360, ease: 'none', scrollTrigger: { trigger: '.founder', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.founder__mark b', { scale: .5, ease: 'none', scrollTrigger: { trigger: '.founder', start: 'top bottom', end: 'top 35%', scrub: true } });

  /* cta + footer */
  gsap.fromTo('.cta__glow', { scale: .5 }, { scale: 1.3, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.cta .btn, .cta p', { y: 40, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 55%' } });
  gsap.from('.foot__mega', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 40%', scrub: true } });
  gsap.from('.foot__grid > div', { y: 30, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.foot__grid', start: 'top 92%' } });

  /* magnetic buttons */
  if (fine && !reduce) document.querySelectorAll('.btn').forEach(function (b) {
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .3, duration: .4 }); });
    b.addEventListener('pointerleave', function () { gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.5)' }); });
  });

  addEventListener('load', function () {
    ScrollTrigger.refresh();
    var pv = document.querySelector('.pagebg video');
    setTimeout(function () { if (!pv || reduce) return; pv.src = pv.dataset.src; pv.play().then(function () { pv.classList.add('on'); }).catch(function () {}); }, 600);
    var hv = document.querySelector('.hero__media video'); if (hv) { var pp = hv.play(); if (pp && pp.catch) pp.catch(function () {}); }
  });
})();
