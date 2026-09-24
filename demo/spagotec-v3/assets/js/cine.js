import * as THREE from './three.module.min.js';

const root = document.querySelector('.cine');
if (root) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = innerWidth < 700;
  const seqCv = root.querySelector('.cine__seq');
  const ctx = seqCv.getContext('2d');
  const base = root.dataset.seq + (mobile ? 'm/' : 'd/');
  const count = +root.dataset.frames;
  const frames = new Array(count);
  let current = -1;

  const load = i => new Promise(res => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { frames[i] = im; res(); };
    im.onerror = res;
    im.src = base + String(i + 1).padStart(3, '0') + '.webp';
  });
  const order = [];
  for (let step = 8; step >= 1; step = step / 2 | 0) {
    for (let i = 0; i < count; i += step) if (!order.includes(i)) order.push(i);
    if (step === 1) break;
  }
  (async () => { for (let k = 0; k < order.length; k += 6) await Promise.all(order.slice(k, k + 6).map(load)); })();

  function sizeSeq() {
    const d = Math.min(devicePixelRatio || 1, 2);
    seqCv.width = seqCv.clientWidth * d;
    seqCv.height = seqCv.clientHeight * d;
    current = -1;
  }
  function nearest(i) {
    for (let r = 0; r < count; r++) {
      if (frames[i - r]) return frames[i - r];
      if (frames[i + r]) return frames[i + r];
    }
    return null;
  }
  function drawSeq(p) {
    const i = Math.min(count - 1, Math.round(p * (count - 1)));
    if (i === current && frames[i]) return;
    const im = nearest(i);
    if (!im) return;
    if (frames[i]) current = i;
    const W = seqCv.width, H = seqCv.height, s = Math.max(W / im.width, H / im.height);
    const w = im.width * s, h = im.height * s;
    ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
  }
  sizeSeq();
  addEventListener('resize', sizeSeq);

  const surfCv = root.querySelector('.cine__surface');
  let surf = null;
  if (window.Surface) { surf = new window.Surface(surfCv, { mode: 0, seed: 5.3, duration: 8 }); if (surf.setFill) surf.setFill(0); }

  // three.js cross-section
  const glCv = root.querySelector('.cine__3d');
  const renderer = new THREE.WebGLRenderer({ canvas: glCv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xdde5ea, 0x15191c, .95));
  const key = new THREE.DirectionalLight(0xfff0dc, 2.6);
  key.position.set(5, 9, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb6c4, 1.1);
  rim.position.set(-7, 2, -5);
  scene.add(rim);

  function noiseTex(base, spread, n, scale) {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = `rgb(${base},${base + 2},${base + 4})`;
    g.fillRect(0, 0, 512, 512);
    for (let k = 0; k < n; k++) {
      const v = base + (Math.random() - .25) * spread | 0, r = (Math.random() * .8 + .4) * scale;
      g.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
      g.beginPath();
      g.ellipse(Math.random() * 512, Math.random() * 512, r, r * .75, Math.random() * 3, 0, 7);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  const LEN = 4, HW = 2.4, DEPTH = 1.1;
  const cw = y => Math.max(.012, .17 * (1 + y / (DEPTH * 1.05)));
  const group = new THREE.Group();
  scene.add(group);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xa9b3b8, transparent: true, opacity: .32 });

  function slab(points, mat, parent) {
    const sh = new THREE.Shape();
    points.forEach(([x, y], k) => k ? sh.lineTo(x, y) : sh.moveTo(x, y));
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: LEN, bevelEnabled: false, curveSegments: 12 });
    geo.translate(0, 0, -LEN / 2);
    const m = new THREE.Mesh(geo, mat);
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edgeMat));
    parent.add(m);
    return m;
  }
  const crackSide = (y0, y1, side, steps = 6) => {
    const out = [];
    for (let k = 0; k <= steps; k++) { const y = y0 + (y1 - y0) * k / steps; out.push([side * cw(y), y]); }
    return out;
  };

  const L = [
    { name: 'Deckschicht', y0: -.5, y1: 0, tex: noiseTex(60, 95, 5200, 3.2) },
    { name: 'Binderschicht', y0: -1.25, y1: -.5, tex: noiseTex(50, 85, 2600, 5) },
    { name: 'Tragschicht', y0: -2.3, y1: -1.25, tex: noiseTex(64, 75, 1200, 9) }
  ];
  L.forEach(l => {
    l.group = new THREE.Group();
    group.add(l.group);
    l.tex.repeat.set(.6, .6);
    const mat = new THREE.MeshStandardMaterial({ map: l.tex, roughness: .93, metalness: 0 });
    if (l.y0 > -DEPTH) {
      slab([[-HW, l.y0], ...crackSide(l.y0, l.y1, -1).map(([x, y]) => [x, y]), [-HW, l.y1]].reverse().concat([]), mat, l.group);
      slab([[HW, l.y0], [HW, l.y1], ...crackSide(l.y1, l.y0, 1)], mat, l.group);
    } else if (l.y1 > -DEPTH) {
      slab([[-HW, l.y0], [HW, l.y0], [HW, l.y1], ...crackSide(l.y1, -DEPTH, 1), ...crackSide(-DEPTH, l.y1, -1), [-HW, l.y1]], mat, l.group);
    } else {
      slab([[-HW, l.y0], [HW, l.y0], [HW, l.y1], [-HW, l.y1]], mat, l.group);
    }
    l.label = root.querySelector(`[data-layer="${l.name}"]`);
  });

  const seamMat = new THREE.MeshStandardMaterial({ color: 0x101316, roughness: .16, metalness: .05, transparent: true, opacity: 0 });
  const topSeam = [[-.52, .004]];
  for (let k = 0; k <= 10; k++) { const t = k / 10; topSeam.push([-.52 + t * .34, .004 + Math.sin(t * Math.PI / 2) * .05]); }
  topSeam.push([.18, .054]);
  for (let k = 0; k <= 10; k++) { const t = k / 10; topSeam.push([.18 + t * .34, .054 - (1 - Math.cos(t * Math.PI / 2)) * .05]); }
  const seamA = slab([...topSeam, ...crackSide(0, -.5, 1).slice(1).map(([x, y]) => [x * .96, y]), ...crackSide(-.5, 0, -1).slice(0, -1).map(([x, y]) => [x * .96, y])], seamMat, L[0].group);
  const seamB = slab([...crackSide(-.5, -DEPTH, 1).map(([x, y]) => [x * .96, y]), ...crackSide(-DEPTH, -.5, -1).map(([x, y]) => [x * .96, y])], seamMat, L[1].group);
  [seamA, seamB].forEach(m => { m.children[0].material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }); });

  const shadowC = document.createElement('canvas');
  shadowC.width = shadowC.height = 128;
  const sg = shadowC.getContext('2d');
  const grd = sg.createRadialGradient(64, 64, 4, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,.55)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = grd;
  sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(9, 8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowC), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  group.add(shadow);

  const gritN = 320;
  const grit = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.036, 0), new THREE.MeshStandardMaterial({ color: 0xc2c6c2, roughness: .62 }), gritN);
  const gritData = [];
  const dummy = new THREE.Object3D();
  for (let k = 0; k < gritN; k++) gritData.push({ x: (Math.random() - .5) * .78, z: (Math.random() - .5) * LEN * .97, d: Math.random(), r: Math.random() * 6, s: .7 + Math.random() * .7 });
  L[0].group.add(grit);

  function resize3d() {
    const w = glCv.clientWidth, h = glCv.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize3d();
  addEventListener('resize', resize3d);

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const v = new THREE.Vector3();
  const camA = new THREE.Vector3(0, 6.2, .01), lookA = new THREE.Vector3(0, 0, 0);
  const camB = new THREE.Vector3(), lookB = new THREE.Vector3(), look = new THREE.Vector3();

  function frameFor() {
    const portrait = innerWidth / innerHeight < 1;
    const k = portrait ? 2.1 : innerWidth < 1100 ? 1.55 : 1.38;
    camB.set(5.4 * k, 3.9 * k, 7.2 * k);
    if (portrait) lookB.set(0, -2.1, 0);
    else lookB.set(-1.9, -1.1, .9);
  }
  frameFor();
  addEventListener('resize', frameFor);

  function render3d(p) {
    const o = ease(seg(p, .7, .9));
    const e = ease(seg(p, .8, .95));
    camera.position.lerpVectors(camA, camB, o);
    look.lerpVectors(lookA, lookB, o);
    camera.lookAt(look);
    L[0].group.position.y = e * .5;
    L[1].group.position.y = 0;
    L[2].group.position.y = -e * .5;
    shadow.position.y = -2.32 - e * .5;
    const s = ease(seg(p, .83, .9));
    seamMat.opacity = s;
    seamA.children[0].material.opacity = s * .35;
    seamB.children[0].material.opacity = s * .35;
    const g = seg(p, .88, .985);
    for (let k = 0; k < gritN; k++) {
      const d = gritData[k], t = clamp(g * 1.5 - d.d * .5), fall = clamp(t / .75), sink = clamp((t - .75) / .25);
      const surf = .054 - Math.abs(d.x) * .02;
      dummy.position.set(d.x * .66, surf + (1 - ease(fall)) * 2.2 - sink * .022, d.z);
      dummy.rotation.set(d.r, d.r * 2, 0);
      dummy.scale.setScalar(t > 0 ? d.s : 0);
      dummy.updateMatrix();
      grit.setMatrixAt(k, dummy.matrix);
    }
    grit.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
    const W = glCv.clientWidth, H = glCv.clientHeight;
    L.forEach(l => {
      if (!l.label) return;
      v.set(HW, (l.y0 + l.y1) / 2 + l.group.position.y, LEN / 2);
      v.project(camera);
      l.label.style.transform = `translate(${(v.x * .5 + .5) * W + 14}px, ${(-v.y * .5 + .5) * H - 8}px)`;
      l.label.style.opacity = e;
    });
  }

  const els = {
    seq: root.querySelector('.cine__layer--seq'),
    surf: root.querySelector('.cine__layer--surface'),
    three: root.querySelector('.cine__layer--3d'),
    texts: root.querySelectorAll('.cine__text'),
    bar: root.querySelector('.cine__bar i')
  };

  function update(p) {
    drawSeq(clamp(p / .42));
    const zoom = ease(seg(p, .36, .52));
    els.seq.style.transform = `scale(${1 + zoom * 2.6})`;
    els.seq.style.opacity = 1 - seg(p, .46, .54);
    els.surf.style.opacity = seg(p, .46, .54) * (1 - seg(p, .7, .78));
    els.surf.style.transform = `scale(${1.35 - seg(p, .46, .62) * .35})`;
    if (surf && surf.setFill) surf.setFill(seg(p, .54, .7) * 1.05);
    els.three.style.opacity = seg(p, .68, .76);
    if (p > .64) render3d(p);
    els.texts.forEach(t => {
      const a = +t.dataset.in, b = +t.dataset.out;
      const o = Math.min(seg(p, a, a + .04), 1 - seg(p, b - .04, b));
      t.style.opacity = o;
      t.style.transform = `translateY(${(1 - o) * (p < a + .04 ? 30 : -30)}px)`;
    });
    if (els.bar) els.bar.style.transform = `scaleX(${p})`;
  }

  const start = () => {
    if (!window.ScrollTrigger || reduce) { update(.2); return; }
    ScrollTrigger.create({
      trigger: root, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: self => update(self.progress)
    });
    update(0);
  };
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
  setTimeout(() => update(0), 300);
}
