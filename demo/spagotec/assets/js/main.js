(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  root.classList.remove('no-js');

  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (!reduced) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* header */
  var top = document.querySelector('.top');
  var lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    top.classList.toggle('is-scrolled', y > 40);
    top.classList.toggle('is-hidden', y > 400 && y > lastY && !body.classList.contains('menu-open'));
    lastY = y;
  }, { passive: true });

  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }

  /* page curtain */
  var curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
  body.appendChild(curtain);
  var slats = curtain.children;

  if (sessionStorage.getItem('sp-curtain')) {
    sessionStorage.removeItem('sp-curtain');
    gsap.set(slats, { scaleY: 1, transformOrigin: 'top' });
    gsap.to(slats, { scaleY: 0, duration: .75, ease: 'expo.inOut', stagger: .06, delay: .05 });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || e.metaKey || e.ctrlKey || a.target === '_blank') return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname.indexOf('/demo/spagotec') !== 0) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    sessionStorage.setItem('sp-curtain', '1');
    gsap.set(slats, { transformOrigin: 'bottom' });
    gsap.to(slats, {
      scaleY: 1, duration: .6, ease: 'expo.inOut', stagger: .05,
      onComplete: function () { location.href = url.href; }
    });
  });

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) gsap.set(slats, { scaleY: 0 });
  });

  /* hero surface */
  var canvas = document.querySelector('.hero canvas');
  var surface = null;
  if (canvas && window.Surface) {
    surface = new window.Surface(canvas, {
      mode: +(canvas.dataset.mode || 0),
      seed: +(canvas.dataset.seed || 3.1),
      duration: +(canvas.dataset.duration || 6.5)
    });
  }

  function heroIn() {
    if (surface && surface.gl) surface.play();
    var lines = document.querySelectorAll('.hero h1 .line > span');
    gsap.from(lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .09 });
    gsap.from('.hero__kicker, .hero__sub, .hero__cta, .hud', { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: .08, delay: .35 });
  }

  /* intro: a crack opens the page */
  function runIntro(done) {
    var key = 'sp-intro';
    if (reduced || sessionStorage.getItem(key) || !body.hasAttribute('data-intro')) return done();
    sessionStorage.setItem(key, '1');

    var pts = [], y = 500;
    for (var x = -20; x <= 1020; x += 18 + Math.random() * 22) {
      y += (Math.random() - .5) * 36;
      y = Math.max(462, Math.min(538, y));
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    var path = 'M' + pts.join(' L');
    var svg = function (id) {
      return '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">' +
        '<path d="' + path + '" fill="none" stroke="#ff6a13" stroke-width="9" vector-effect="non-scaling-stroke" opacity=".3" stroke-linejoin="round" class="glow"/>' +
        '<path d="' + path + '" fill="none" stroke="#fff3e0" stroke-width="2" vector-effect="non-scaling-stroke" class="core"/></svg>';
    };

    var el = document.createElement('div');
    el.className = 'intro';
    el.innerHTML =
      '<div class="intro__half intro__half--top">' + svg() + '</div>' +
      '<div class="intro__half intro__half--bot"><div style="position:absolute;left:0;right:0;bottom:0;height:199.2%">' + svg() + '</div></div>' +
      '<div class="intro__mark"><img src="/demo/spagotec/assets/img/wordmark.png" alt="" width="720" height="96"><div class="mono">... wir haben was gegen Risse</div></div>' +
      '<div class="intro__skip mono">Tippen zum Überspringen</div>' +
      '<div class="intro__count mono">Verguss <b>000</b> °C</div>';
    el.querySelector('.intro__half--top svg').style.height = '199.2%';
    body.appendChild(el);
    if (lenis) lenis.stop();

    var paths = el.querySelectorAll('path');
    var len = 1400;
    paths.forEach(function (p) { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
    var count = el.querySelector('.intro__count b');
    var temp = { v: 0 };

    var tl = gsap.timeline({
      onComplete: function () { el.remove(); if (lenis) lenis.start(); }
    });
    tl.to(paths, { strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut' })
      .to(temp, { v: 165, duration: 1.05, ease: 'power2.out', onUpdate: function () { count.textContent = String(Math.round(temp.v)).padStart(3, '0'); } }, 0)
      .to(el.querySelectorAll('.core'), { stroke: '#02fc20', duration: .45 }, 1.0)
      .to(el.querySelectorAll('.glow'), { stroke: '#02fc20', opacity: .6, duration: .45 }, 1.0)
      .to('.intro__mark', { opacity: 1, duration: .5, ease: 'power2.out' }, .75)
      .to('.intro__mark', { opacity: 0, scale: .96, duration: .35, ease: 'power2.in' }, 1.75)
      .to('.intro__skip, .intro__count', { opacity: 0, duration: .3 }, 1.75)
      .to('.intro__half--top', { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, 2.0)
      .to('.intro__half--bot', { yPercent: 100, duration: 1.05, ease: 'expo.inOut' }, 2.0)
      .add(done, 2.35);

    el.addEventListener('click', function () { tl.progress(.93); });
  }

  if (document.querySelector('.hero')) runIntro(heroIn);

  /* hero readout */
  var hud = document.querySelector('.hud');
  if (hud && surface && surface.gl) {
    var tEl = hud.querySelector('[data-temp]'), sEl = hud.querySelector('[data-state]'), bar = hud.querySelector('.hud__bar i'), mEl = hud.querySelector('[data-m]');
    (function tick() {
      var f = Math.min(surface.fill || 0, 1);
      bar.style.width = (f * 100).toFixed(1) + '%';
      mEl.textContent = (f * 14.8).toFixed(1).replace('.', ',') + ' m';
      if (f <= 0) { tEl.textContent = '---'; sEl.textContent = 'Riss erkannt'; sEl.className = ''; }
      else if (f < 1) { tEl.textContent = (158 + Math.round(Math.sin(performance.now() / 300) * 4 + 4)) + ' °C'; tEl.className = 'hot'; sEl.textContent = 'Verguss läuft'; sEl.className = 'hot'; }
      else { tEl.textContent = '165 °C'; sEl.textContent = 'Versiegelt'; sEl.className = 'ok'; }
      requestAnimationFrame(tick);
    })();
  }

  /* reveals */
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  gsap.utils.toArray('[data-split]').forEach(function (el) {
    el.innerHTML = el.innerHTML.replace(/(<em>.*?<\/em>|[^\s<]+)/g, '<span class="w">$1</span>');
    gsap.to(el.querySelectorAll('.w'), {
      opacity: 1, stagger: .05, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  });

  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var end = +el.dataset.count, obj = { v: +(el.dataset.from || 0) };
    var fmt = function (v) { return Math.round(v).toLocaleString('de-DE'); };
    el.textContent = fmt(obj.v);
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: function () { gsap.to(obj, { v: end, duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(obj.v); } }); }
    });
  });

  gsap.utils.toArray('.card__img img, .gal figure img, .split__img img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  gsap.utils.toArray('.seam').forEach(function (el) {
    gsap.to(el, { scaleX: 1, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%' } });
  });

  /* service rows: image follows the cursor */
  var peek = document.querySelector('.peek');
  if (peek && fine) {
    var px = 0, py = 0, cx = 0, cy = 0, imgs = peek.querySelectorAll('img');
    document.querySelectorAll('.svc__row').forEach(function (row, i) {
      row.addEventListener('mouseenter', function () {
        peek.classList.add('on');
        imgs.forEach(function (im, j) { im.classList.toggle('on', j === i); });
      });
      row.addEventListener('mouseleave', function () { peek.classList.remove('on'); });
      row.addEventListener('click', function (e) {
        if (!e.target.closest('a')) row.querySelector('a').click();
      });
    });
    window.addEventListener('mousemove', function (e) { px = e.clientX; py = e.clientY; });
    gsap.ticker.add(function () {
      cx += (px - cx) * .12; cy += (py - cy) * .12;
      peek.style.left = cx + 'px'; peek.style.top = cy + 'px';
    });
  } else {
    document.querySelectorAll('.svc__row').forEach(function (row) {
      row.addEventListener('click', function (e) { if (!e.target.closest('a')) row.querySelector('a').click(); });
    });
  }

  /* horizontal process track */
  var proc = document.querySelector('.proc');
  if (proc) {
    var track = proc.querySelector('.proc__track');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: proc, pin: proc.querySelector('.proc__pin'), start: 'top top', end: function () { return '+=' + dist(); }, scrub: .6, invalidateOnRefresh: true }
    });
  }

  /* spagoshot cross-section */
  var story = document.querySelector('.story');
  if (story) {
    var steps = story.querySelectorAll('.story__step');
    var xs = new CrossSection(story.querySelector('.xsec canvas'), story.querySelector('.xsec__cap'));
    steps.forEach(function (st, i) {
      ScrollTrigger.create({
        trigger: st, start: 'top 60%', end: 'bottom 60%',
        onToggle: function (self) { if (self.isActive) { steps.forEach(function (s) { s.classList.remove('on'); }); st.classList.add('on'); xs.set(i); } }
      });
    });
    steps[0].classList.add('on');
  }

  function CrossSection(cv, cap) {
    var ctx = cv.getContext('2d'), state = 0, since = 0, W, H, dpr = Math.min(devicePixelRatio || 1, 2), visible = true;
    var labels = [['Heute oft Standard', 'Rutschig', 'red'], ['Ursache', 'Zu spät abgestreut', ''], ['SpagoShot', 'Griffig', 'ok']];
    var stones = [], grit = [];
    function rnd(a, b) { return a + Math.random() * (b - a); }

    function size() {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stones = [];
      for (var i = 0; i < 90; i++) stones.push({ x: rnd(0, W), y: rnd(H * .56, H), r: rnd(W * .012, W * .034), c: rnd(.18, .42) });
      grit = [];
      for (var k = 0; k < 26; k++) grit.push({ u: k / 25, r: rnd(W * .006, W * .011), y: 0, vy: 0, x: 0, vx: 0, s: rnd(0, 1) });
      reset();
    }

    function reset() {
      since = performance.now();
      grit.forEach(function (g) { g.x = null; g.flung = false; });
    }

    this.set = function (i) {
      if (i === state) return;
      state = i; reset();
      cap.innerHTML = '<span>' + labels[i][0] + '</span><b class="' + labels[i][2] + '">' + labels[i][1] + '</b>';
    };
    cap.innerHTML = '<span>' + labels[0][0] + '</span><b class="red">' + labels[0][1] + '</b>';

    function geo() {
      var surf = H * .52, cx = W * .5, bw = W * .34;
      return { surf: surf, cx: cx, bw: bw, top: surf - H * .018 };
    }

    function draw(now) {
      requestAnimationFrame(draw);
      if (!visible) return;
      var t = (now - since) / 1000, g = geo();
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#16191a';
      ctx.fillRect(0, g.surf, W, H - g.surf);
      stones.forEach(function (s) {
        if (Math.abs(s.x - g.cx) < W * .05 && s.y < g.surf + H * .3) return;
        var c = Math.round(s.c * 255);
        ctx.fillStyle = 'rgb(' + c + ',' + c + ',' + (c + 4) + ')';
        ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * .78, s.x, 0, 7); ctx.fill();
      });

      var cycle = state === 1 ? (t % 4.2) / 4.2 : Math.min(t / 1.4, 1);
      var heat = state === 0 ? 0 : state === 1 ? Math.max(0, 1 - cycle * 2.2) : Math.max(0, 1 - Math.max(0, t - 1.6) / 1.8);

      ctx.beginPath();
      ctx.moveTo(g.cx - W * .045, g.surf);
      ctx.lineTo(g.cx - W * .008, g.surf + H * .3);
      ctx.lineTo(g.cx + W * .01, g.surf + H * .3);
      ctx.lineTo(g.cx + W * .045, g.surf);
      ctx.lineTo(g.cx + g.bw / 2, g.surf);
      ctx.quadraticCurveTo(g.cx + g.bw / 2 + 6, g.top + 3, g.cx + g.bw / 2 - 10, g.top);
      ctx.lineTo(g.cx - g.bw / 2 + 10, g.top);
      ctx.quadraticCurveTo(g.cx - g.bw / 2 - 6, g.top + 3, g.cx - g.bw / 2, g.surf);
      ctx.closePath();
      var r = Math.round(12 + heat * 243), gg = Math.round(13 + heat * 93), b = Math.round(14 + heat * 5);
      ctx.fillStyle = 'rgb(' + r + ',' + gg + ',' + b + ')';
      if (heat > .05) { ctx.shadowColor = 'rgba(255,106,19,' + heat + ')'; ctx.shadowBlur = 40 * heat; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,' + (.18 + (1 - heat) * .25) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(g.cx - g.bw / 2 + 10, g.top + .5); ctx.lineTo(g.cx + g.bw / 2 - 10, g.top + .5); ctx.stroke();

      if (state === 0) {
        ctx.fillStyle = 'rgba(120,170,220,.16)';
        ctx.fillRect(0, g.top - 5, W, 5);
      }

      var tireX = ((t * .32) % 1.6 - .3) * W;
      grit.forEach(function (p, i) {
        var bx = g.cx - g.bw / 2 + 18 + p.u * (g.bw - 36);
        var rest = g.top - p.r * .85, embed = g.top + p.r * .15;
        if (state === 0) {
          if (p.x === null) { p.x = bx; p.y = rest; p.vx = 0; p.vy = 0; }
          if (!p.flung && Math.abs(tireX - p.x) < W * .06) { p.flung = true; p.vx = rnd(3, 7); p.vy = rnd(-6, -2); }
          if (p.flung) { p.x += p.vx; p.y += p.vy; p.vy += .5; if (p.y > H + 20) { p.flung = false; p.x = bx; p.y = rest; } if (p.y > rest && p.x > g.cx + g.bw / 2) { p.y = g.top + 50; } }
        } else if (state === 1) {
          var drop = Math.max(0, cycle - .55 - p.s * .15) * 4;
          p.x = bx; p.y = Math.min(rest, -20 + drop * drop * H);
        } else {
          var lt = Math.max(0, t - .2 - p.s * .9);
          var k = Math.min(lt / .35, 1);
          p.x = W * .1 + (bx - W * .1) * k;
          p.y = H * .12 + (embed - H * .12) * k;
          if (k === 0) return;
        }
        ctx.fillStyle = state === 2 ? '#b9bdb6' : '#9da19b';
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * .8, i, 0, 7); ctx.fill();
        if (state === 2 && k < 1) {
          ctx.strokeStyle = 'rgba(2,252,32,.35)';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - (bx - W * .1) * .08, p.y - (embed - H * .12) * .08); ctx.stroke();
        }
      });

      if (state === 2) {
        ctx.save(); ctx.translate(W * .1, H * .12); ctx.rotate(Math.atan2(g.top - H * .12, g.cx - W * .1));
        ctx.fillStyle = '#2a2f2c'; ctx.fillRect(-40, -9, 52, 18);
        ctx.fillStyle = '#02fc20'; ctx.fillRect(8, -9, 4, 18);
        ctx.restore();
      }

      if (state !== 1) {
        ctx.save();
        ctx.translate(tireX, g.top - 2);
        ctx.fillStyle = '#060707';
        ctx.beginPath(); ctx.arc(0, -H * .2, H * .2, 0, 7); ctx.fill();
        ctx.fillStyle = '#1d2120';
        ctx.beginPath(); ctx.arc(0, -H * .2, H * .12, 0, 7); ctx.fill();
        ctx.fillStyle = state === 0 ? 'rgba(255,30,30,.9)' : 'rgba(2,252,32,.9)';
        ctx.font = '500 11px Mono, monospace';
        ctx.fillText(state === 0 ? 'HAFTUNG ↓' : 'HAFTUNG ✓', -34, -H * .43);
        ctx.restore();
      }

      if (state === 1) {
        var temp = Math.round(170 - Math.min(cycle, .6) / .6 * 110);
        ctx.fillStyle = heat > .1 ? '#ff6a13' : '#8e9690';
        ctx.font = '500 12px Mono, monospace';
        ctx.fillText('VERGUSS ' + temp + ' °C', 20, H - 22);
      }
    }

    size();
    window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
    requestAnimationFrame(draw);
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
