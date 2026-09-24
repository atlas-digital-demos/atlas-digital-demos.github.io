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
  function autoplay(v) {
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.removeAttribute('controls');
    var box = v.parentNode;
    if (v.poster) box.style.backgroundImage = 'url(' + v.poster + ')';
    var go = function () {
      var p = v.play();
      if (p && p.then) p.then(function () { box.classList.remove('is-still'); }).catch(function () { box.classList.add('is-still'); });
    };
    v.addEventListener('playing', function () { box.classList.remove('is-still'); });
    if (v.readyState >= 2) go(); else v.addEventListener('loadeddata', go, { once: true });
    go();
    ['touchstart', 'pointerdown', 'scroll'].forEach(function (ev) {
      addEventListener(ev, function once() { if (v.paused) go(); removeEventListener(ev, once); }, { passive: true });
    });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && v.paused) go(); });
  }
  document.querySelectorAll('video[autoplay]').forEach(autoplay);

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
  function maskWords(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'); o.className = 'mw';
            var i = document.createElement('span'); i.textContent = w; o.appendChild(i); frag.appendChild(o);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('tag')) walk(n);
      });
    };
    walk(el);
    return el.querySelectorAll('.mw > span');
  }
  if (!reduce) {
    gsap.utils.toArray('.h2, .pagehead .h1, .cta .h1, .band blockquote').forEach(function (el) {
      el.classList.remove('reveal');
      var words = maskWords(el);
      gsap.set(el, { opacity: 1, y: 0 });
      gsap.from(words, { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: .035, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    gsap.utils.toArray('.split__img, .strip figure').forEach(function (el) {
      el.classList.add('rv');
      var img = el.querySelector('img, video');
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: function () {
        gsap.to(el, { clipPath: 'inset(0% 0 0% 0)', duration: 1.4, ease: 'power4.inOut' });
        if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'power3.out' });
      } });
    });
  }

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
  }

  // 3D cards
  var tilts = document.querySelectorAll('.svc, .tile, .loc');
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
          if (!v.src) { v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.src = v.dataset.lazy; }
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else if (v.src) v.pause();
      });
    }, { rootMargin: '300px 0px' });
    lazy.forEach(function (v) { io.observe(v); });
  }
  gsap.utils.toArray('.next').forEach(function (n) {
    if (reduce) return;
    gsap.fromTo(n.querySelector('.next__img'), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: n, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(n.querySelector('.next__t'), { yPercent: 40, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 80%' } });
  });
  gsap.utils.toArray('.band').forEach(function (b) {
    if (reduce) return;
    gsap.fromTo(b.querySelector('video'), { yPercent: -6, scale: 1.08 }, { yPercent: 6, scale: 1, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // process: 3D coverflow along the pinned track
  var mq = gsap.matchMedia();
  document.querySelectorAll('.proc').forEach(function (proc) {
    var track = proc.querySelector('.proc__track');
    var cards = Array.prototype.slice.call(track.querySelectorAll('.pcard'));
    var bar = proc.querySelector('.proc__bar i');
    var count = proc.querySelector('.proc__count b');
    var sets = cards.map(function (c) {
      return {
        ry: gsap.quickSetter(c, 'rotationY', 'deg'), z: gsap.quickSetter(c, 'z', 'px'), rx: gsap.quickSetter(c, 'rotationX', 'deg'),
        img: c.querySelector('.pcard__img img') ? gsap.quickSetter(c.querySelector('.pcard__img img'), 'xPercent') : null
      };
    });
    function depth() {
      var mid = innerWidth / 2, best = 0, bestD = 1e9;
      cards.forEach(function (c, k) {
        var r = c.getBoundingClientRect();
        var d = (r.left + r.width / 2 - mid) / innerWidth;
        var a = Math.max(-1, Math.min(1, d * 1.6));
        sets[k].ry(-a * 28);
        sets[k].z(-Math.abs(a) * 160);
        sets[k].rx(Math.abs(a) * 3);
        if (sets[k].img) sets[k].img(a * -8);
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = k; }
      });
      if (count) count.textContent = String(best + 1).padStart(2, '0');
    }
    if (reduce) return;
    mq.add('(min-width: 701px)', function () {
      var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
      gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: proc, pin: proc.querySelector('.proc__pin'), start: 'top top', end: function () { return '+=' + dist() * 1.2; }, scrub: .8, invalidateOnRefresh: true,
          onUpdate: function (self) { if (bar) bar.style.transform = 'scaleX(' + self.progress + ')'; }
        }
      });
      gsap.ticker.add(depth);
      gsap.from(cards, { y: 120, rotationX: -18, opacity: 0, duration: 1.4, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: proc, start: 'top 75%' } });
      return function () { gsap.ticker.remove(depth); };
    });
    mq.add('(max-width: 700px)', function () {
      var onS = function () { depth(); if (bar) bar.style.transform = 'scaleX(' + (track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth)) + ')'; };
      track.addEventListener('scroll', onS, { passive: true });
      onS();
      return function () { track.removeEventListener('scroll', onS); };
    });
  });

  gsap.utils.toArray('.cert__card').forEach(function (c) {
    if (reduce) return;
    gsap.fromTo(c, { rotationY: -24, rotationX: 8 }, { rotationY: 18, rotationX: -4, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true,
      onUpdate: function (self) { c.style.setProperty('--sx', (-60 + self.progress * 120) + '%'); } } });
  });

  // stacked service cards
  mq.add('(min-width: 1101px)', function () {
    if (reduce) return;
    var stack = gsap.utils.toArray('.cards.stack .svc');
    stack.forEach(function (card, k) {
      var next = stack[k + 1];
      if (!next) return;
      gsap.to(card, { scale: .92 + k * .015, filter: 'brightness(.78)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top ' + (104 + (k + 1) * 16) + 'px', scrub: true } });
    });
  });

  // scroll progress
  var prog = document.querySelector('.progress i');
  if (prog) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) { prog.style.transform = 'scaleX(' + self.progress + ')'; } });

  // marquee, speed follows scroll velocity
  document.querySelectorAll('.marq__in').forEach(function (m) {
    m.innerHTML += m.innerHTML;
    if (reduce) return;
    var x = 0, v = 1;
    ScrollTrigger.create({ trigger: m, start: 'top bottom', end: 'bottom top', onUpdate: function (self) { v = 1 + Math.min(6, Math.abs(self.getVelocity()) / 300); } });
    gsap.ticker.add(function () {
      x -= .5 * v; v += (1 - v) * .05;
      var w = m.scrollWidth / 2;
      if (-x >= w) x += w;
      m.style.transform = 'translate3d(' + x + 'px,0,0)';
    });
  });

  // magnetic buttons
  if (fine && !reduce) {
    document.querySelectorAll('.btn').forEach(function (b) {
      var bx = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3.out' }), by = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3.out' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); bx((e.clientX - r.left - r.width / 2) * .25); by((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener('pointerleave', function () { bx(0); by(0); });
    });
  }

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
