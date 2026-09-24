(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mobile = innerWidth < 700;

  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // header
  var top = document.querySelector('.top');
  var last = 0;
  function onScroll() {
    var y = scrollY;
    top.classList.toggle('is-solid', y > 40);
    top.classList.toggle('is-hidden', y > 400 && y > last && !root.classList.contains('menu-open'));
    last = y;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = root.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }

  // page transition
  var curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.innerHTML = '<i></i><i></i><i></i><i></i>';
  document.body.appendChild(curtain);
  var slats = curtain.children;

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.protocol.indexOf('http') !== 0) return;
    if (url.pathname === location.pathname) {
      if (url.hash) {
        var el = document.querySelector(url.hash);
        if (el) {
          e.preventDefault();
          if (root.classList.contains('menu-open')) burger.click();
          lenis ? lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }
    if (reduce) return;
    e.preventDefault();
    gsap.set(slats, { transformOrigin: 'bottom' });
    gsap.to(slats, { scaleY: 1, duration: .5, ease: 'power3.inOut', stagger: .05, onComplete: function () { location.href = url.href; } });
  });

  function curtainOut() {
    if (reduce) return;
    gsap.set(slats, { scaleY: 1, transformOrigin: 'top' });
    gsap.to(slats, { scaleY: 0, duration: .7, ease: 'power3.inOut', stagger: .05, delay: .05 });
  }
  addEventListener('pageshow', function (e) { if (e.persisted) gsap.set(slats, { scaleY: 0 }); });

  // hero
  var hero = document.querySelector('.hero');
  var media = hero && hero.querySelector('.hero__media');
  var video = media && media.querySelector('video');
  if (video && mobile && video.dataset.srcM) {
    video.poster = video.dataset.posterM;
    video.querySelector('source').src = video.dataset.srcM;
    video.load();
  }
  if (video) {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function heroIn() {
    if (!hero) return;
    var tl = gsap.timeline();
    if (media) tl.fromTo(media, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, 0);
    tl.from(hero.querySelectorAll('.h1 .ln > span'), { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: .1 }, .15)
      .from(hero.querySelectorAll('.eyebrow, .lead, .hero__cta, .hero__aside > div, .hero__scroll'), { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: .07 }, .45);
  }

  if (media && !reduce) {
    gsap.to(media, { yPercent: 14, scale: 1.06, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(hero.querySelector('.hero__body'), { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  // intro, once per session
  var LOGO = document.querySelector('.top__logo svg');
  function runIntro(done) {
    var el = document.createElement('div');
    el.className = 'intro';
    var d = 'M0 500 L180 492 L260 506 L390 488 L470 503 L600 494 L690 509 L820 490 L930 501 L1000 497';
    var crack = '<svg class="crack" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path d="' + d + '" fill="none" stroke="rgba(238,241,242,.55)" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>';
    el.innerHTML = '<div class="intro__half intro__half--top">' + crack + '</div><div class="intro__half intro__half--bot">' + crack + '</div>' +
      '<div class="intro__mark">' + LOGO.outerHTML + '</div><div class="intro__meta mono"><span>Oberflächen-Sanierungstechnik</span><span>Seit 2004</span></div>';
    document.body.appendChild(el);
    if (lenis) lenis.stop();
    var paths = el.querySelectorAll('.crack path');
    paths.forEach(function (p) { var l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    var mark = el.querySelector('.intro__mark');
    var tl = gsap.timeline({ onComplete: function () { el.remove(); if (lenis) lenis.start(); } });
    tl.fromTo(mark, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .9, ease: 'power2.out' }, .1)
      .from(el.querySelectorAll('.intro__meta span'), { opacity: 0, duration: .6, stagger: .1 }, .3)
      .to(paths, { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, .7)
      .to(mark, { opacity: 0, duration: .4 }, 1.55)
      .to(el.querySelector('.intro__meta'), { opacity: 0, duration: .3 }, 1.55)
      .to(el.querySelector('.intro__half--top'), { yPercent: -101, duration: 1.1, ease: 'power4.inOut' }, 1.75)
      .to(el.querySelector('.intro__half--bot'), { yPercent: 101, duration: 1.1, ease: 'power4.inOut' }, 1.75)
      .add(done, 1.95);
    el.addEventListener('click', function () { tl.progress(.9); });
  }

  var seen = false;
  try { seen = sessionStorage.getItem('sp-intro') === '1'; sessionStorage.setItem('sp-intro', '1'); } catch (e) {}
  if (document.body.hasAttribute('data-intro') && !seen && !reduce && LOGO) runIntro(heroIn);
  else { curtainOut(); heroIn(); }

  // reveals
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.utils.toArray('.h2').forEach(function (el) {
    if (el.closest('.reveal') || el.classList.contains('reveal')) return;
    gsap.from(el, { y: 30, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // statement word reveal
  gsap.utils.toArray('[data-split]').forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else walk(n);
      });
    };
    walk(el);
    gsap.to(el.querySelectorAll('.w'), { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: true } });
  });

  // counters
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var end = +el.dataset.count, from = +(el.dataset.from || 0), obj = { v: from };
    var fmt = end >= 1900 && end <= 2100 ? function (v) { return String(Math.round(v)); } : function (v) { return Math.round(v).toLocaleString('de-DE'); };
    el.textContent = fmt(from);
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(obj, { v: end, duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(obj.v); } });
    } });
  });

  // image parallax
  if (!reduce) {
    gsap.utils.toArray('.split__img img, .split__img video, .strip figure img, .pcard__img img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.utils.toArray('.strip figure').forEach(function (f, i) {
      gsap.from(f, { y: 60 + i * 20, opacity: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 92%' } });
    });
  }

  // 3D cards
  var tilts = document.querySelectorAll('.svc, .pcard, .tile, .loc');
  if (fine && !reduce) {
    tilts.forEach(function (card) {
      var deep = card.classList.contains('svc');
      var max = deep ? 7 : 4;
      var rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3.out' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3.out' });
      gsap.set(card, { transformPerspective: 1200 });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        rx((.5 - y) * max); ry((x - .5) * max);
        card.style.setProperty('--mx', x * 100 + '%');
        card.style.setProperty('--my', y * 100 + '%');
      });
      card.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
  }
  if (!reduce) {
    gsap.utils.toArray('.svc').forEach(function (card, i) {
      gsap.from(card, { y: 80, rotationX: 8, transformPerspective: 1200, transformOrigin: '50% 100%', opacity: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 92%' }, delay: (i % 2) * .08 });
    });
  }

  // lazy videos
  var lazy = document.querySelectorAll('video[data-lazy]');
  if (lazy.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.src) { v.src = v.dataset.lazy; }
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else if (v.src) v.pause();
      });
    }, { rootMargin: '300px 0px' });
    lazy.forEach(function (v) { io.observe(v); });
  }
  gsap.utils.toArray('.band').forEach(function (b) {
    if (reduce) return;
    gsap.fromTo(b.querySelector('video'), { yPercent: -6, scale: 1.08 }, { yPercent: 6, scale: 1, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // horizontal track
  var mq = gsap.matchMedia();
  document.querySelectorAll('.proc').forEach(function (proc) {
    var track = proc.querySelector('.proc__track');
    mq.add('(min-width: 701px)', function () {
      var dist = function () { return Math.max(0, track.scrollWidth - track.clientWidth); };
      gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: proc, pin: proc.querySelector('.proc__pin'), start: 'top top', end: function () { return '+=' + dist(); }, scrub: .6, invalidateOnRefresh: true }
      });
    });
  });

  // SpagoShot stage
  var shot = document.querySelector('.shot');
  if (shot) {
    var cv = shot.querySelector('canvas.surface');
    var surf = null;
    if (cv && window.Surface) {
      surf = new window.Surface(cv, { mode: +cv.dataset.mode, seed: +cv.dataset.seed, duration: +cv.dataset.duration });
      ScrollTrigger.create({ trigger: cv, start: 'top 80%', once: true, onEnter: function () { if (surf.play) surf.play(); } });
    }
    var steps = shot.querySelectorAll('.step');
    var xs = new CrossSection(shot.querySelector('.stage__x canvas'), shot.querySelector('.stage__cap'));
    steps.forEach(function (st, i) {
      ScrollTrigger.create({
        trigger: st, start: 'top 55%', end: 'bottom 55%',
        onToggle: function (self) { if (self.isActive) { steps.forEach(function (s) { s.classList.remove('on'); }); st.classList.add('on'); xs.set(i); } }
      });
    });
    if (!reduce) gsap.from(shot.querySelector('.stage'), { rotationX: 14, y: 60, scale: .94, transformPerspective: 1400, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: { trigger: shot, start: 'top bottom', end: 'top 20%', scrub: true } });
  }

  function CrossSection(cv, cap) {
    var ctx = cv.getContext('2d'), state = 0, since = 0, W, H, dpr = Math.min(devicePixelRatio || 1, 2), visible = true;
    var labels = [['Heute oft Standard', 'Glatte Naht', 'bad'], ['Ursache', 'Zu spät abgestreut', ''], ['SpagoShot', 'Griffig und dicht', 'ok']];
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
    cap.innerHTML = '<span>' + labels[0][0] + '</span><b class="bad">' + labels[0][1] + '</b>';

    function geo() {
      var surf = H * .52, cx = W * .5, bw = W * .34;
      return { surf: surf, cx: cx, bw: bw, top: surf - H * .018 };
    }

    function draw(now) {
      requestAnimationFrame(draw);
      if (!visible) return;
      var t = (now - since) / 1000, g = geo();
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#1a1e21';
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
      var r = Math.round(14 + heat * 150), gg = Math.round(16 + heat * 70), b = Math.round(18 + heat * 20);
      ctx.fillStyle = 'rgb(' + r + ',' + gg + ',' + b + ')';
      if (heat > .05) { ctx.shadowColor = 'rgba(190,110,50,' + heat * .5 + ')'; ctx.shadowBlur = 24 * heat; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,' + (.18 + (1 - heat) * .25) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(g.cx - g.bw / 2 + 10, g.top + .5); ctx.lineTo(g.cx + g.bw / 2 - 10, g.top + .5); ctx.stroke();

      if (state === 0) {
        ctx.fillStyle = 'rgba(170,190,205,.12)';
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
        ctx.fillStyle = state === 2 ? '#c3c7c4' : '#9da19b';
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * .8, i, 0, 7); ctx.fill();
        if (state === 2 && k < 1) {
          ctx.strokeStyle = 'rgba(210,216,219,.25)';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - (bx - W * .1) * .08, p.y - (embed - H * .12) * .08); ctx.stroke();
        }
      });

      if (state === 2) {
        ctx.save(); ctx.translate(W * .1, H * .12); ctx.rotate(Math.atan2(g.top - H * .12, g.cx - W * .1));
        ctx.fillStyle = '#2a2f2c'; ctx.fillRect(-40, -9, 52, 18);
        ctx.fillStyle = '#3aa655'; ctx.fillRect(8, -9, 3, 18);
        ctx.restore();
      }

      if (state !== 1) {
        ctx.save();
        ctx.translate(tireX, g.top - 2);
        ctx.fillStyle = '#060707';
        ctx.beginPath(); ctx.arc(0, -H * .2, H * .2, 0, 7); ctx.fill();
        ctx.fillStyle = '#1d2120';
        ctx.beginPath(); ctx.arc(0, -H * .2, H * .12, 0, 7); ctx.fill();
        ctx.fillStyle = state === 0 ? 'rgba(214,160,140,.95)' : 'rgba(150,205,160,.95)';
        ctx.font = '500 11px Mono, monospace'; ctx.letterSpacing = '1px';
        ctx.fillText(state === 0 ? 'HAFTUNG ↓' : 'HAFTUNG ✓', -34, -H * .43);
        ctx.restore();
      }

      if (state === 1) {
        var temp = Math.round(170 - Math.min(cycle, .6) / .6 * 110);
        ctx.fillStyle = heat > .1 ? '#c99a74' : '#8e9690';
        ctx.font = '500 12px Mono, monospace';
        ctx.fillText('VERGUSS ' + temp + ' °C', 20, H - 22);
      }
    }

    size();
    window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
    requestAnimationFrame(draw);
  }

  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
