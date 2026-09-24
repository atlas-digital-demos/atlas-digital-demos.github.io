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
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    media.style.backgroundImage = 'url(' + video.poster + ')';
    var tryPlay = function () {
      var p = video.play();
      if (p && p.then) p.then(function () { media.classList.remove('is-still'); }).catch(function () { media.classList.add('is-still'); });
    };
    video.addEventListener('playing', function () { media.classList.remove('is-still'); });
    if (video.readyState >= 2) tryPlay(); else video.addEventListener('loadeddata', tryPlay, { once: true });
    tryPlay();
    ['touchstart', 'pointerdown', 'scroll'].forEach(function (ev) {
      addEventListener(ev, function once() { if (video.paused) tryPlay(); removeEventListener(ev, once); }, { passive: true });
    });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && video.paused) tryPlay(); });
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
    var xs = new CrossSection(shot.querySelector('.xsec'), shot.querySelector('.stage__cap'));
    steps.forEach(function (st, i) {
      ScrollTrigger.create({
        trigger: st, start: 'top 55%', end: 'bottom 55%',
        onToggle: function (self) { if (self.isActive) { steps.forEach(function (s) { s.classList.remove('on'); }); st.classList.add('on'); xs.set(i); } }
      });
    });
    if (!reduce) gsap.from(shot.querySelector('.stage'), { rotationX: 14, y: 60, scale: .94, transformPerspective: 1400, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: { trigger: shot, start: 'top bottom', end: 'top 20%', scrub: true } });
  }

  function CrossSection(svg, cap) {
    var labels = [['Heute oft Standard', 'Glatte Naht', 'bad'], ['Ursache', 'Zu spät abgestreut', ''], ['SpagoShot', 'Griffig und dicht', 'ok']];
    var grit = svg.querySelectorAll('.xs-g');
    var nozzle = svg.querySelector('.xs-nozzle');
    var state = -1, loop = null;
    function xy(el, key) { var v = el.dataset[key].split(','); return { x: +v[0], y: +v[1], rotation: +v[2] }; }
    function caption(i) { cap.innerHTML = '<span>' + labels[i][0] + '</span><b class="' + labels[i][2] + '">' + labels[i][1] + '</b>'; }
    gsap.set(grit, { transformOrigin: '50% 50%' });

    this.set = function (i) {
      if (i === state) return;
      state = i;
      svg.dataset.state = i;
      caption(i);
      if (loop) loop.kill();
      gsap.killTweensOf(grit);
      if (i === 0) {
        loop = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
        loop.set(grit, { x: 0, y: function (k, el) { return xy(el, 'late').y; }, rotation: 0, opacity: 1 })
          .to(grit, { x: function (k, el) { return xy(el, 'loose').x; }, y: function (k, el) { return xy(el, 'loose').y; }, rotation: function (k, el) { return xy(el, 'loose').rotation; }, opacity: .45, duration: 1.6, ease: 'power2.out', stagger: { each: .05, from: 'start' } }, .8);
      } else if (i === 1) {
        loop = gsap.timeline({ repeat: -1 });
        loop.set(grit, { x: 0, y: -150, rotation: 0, opacity: 0 })
          .to(grit, { y: function (k, el) { return xy(el, 'late').y; }, opacity: 1, duration: .7, ease: 'bounce.out', stagger: .03 }, 2.3)
          .to({}, { duration: 1.2 });
      } else {
        gsap.set(grit, { opacity: 0 });
        loop = gsap.timeline({ repeat: -1, repeatDelay: 2.2 });
        loop.set(grit, { x: -200, y: -120, rotation: 0, opacity: 0 })
          .fromTo(nozzle, { x: 300, y: 72, opacity: 0 }, { x: 330, opacity: 1, duration: .6, ease: 'power2.out' }, 0)
          .to(nozzle, { x: 480, duration: 1.8, ease: 'none' }, .6)
          .to(grit, { x: 0, y: 0, opacity: 1, duration: .45, ease: 'power3.in', stagger: .075 }, .6)
          .to(nozzle, { opacity: 0, duration: .4 }, 2.4);
      }
    };
    this.set(0);
  }

  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
