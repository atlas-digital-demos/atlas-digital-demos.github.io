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
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xdfe6ea, 0x1a1e21, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 8, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb4c0, .8);
  rim.position.set(-6, 3, -4);
  scene.add(rim);

  function noiseTex(base, spread, n, scale) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = `rgb(${base},${base + 2},${base + 4})`;
    g.fillRect(0, 0, 256, 256);
    for (let k = 0; k < n; k++) {
      const v = base + (Math.random() - .3) * spread | 0, r = (Math.random() * .8 + .4) * scale;
      g.fillStyle = `rgb(${v},${v + 2},${v + 4})`;
      g.beginPath();
      g.ellipse(Math.random() * 256, Math.random() * 256, r, r * .75, Math.random() * 3, 0, 7);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const LEN = 4, HW = 2.6, NOTCH = [[-.18, 0], [-.06, -.45], [-.1, -.8], [0, -1.15], [.1, -.8], [.06, -.45], [.2, 0]];
  const layers = [
    { name: 'Deckschicht', y0: -.5, y1: 0, tex: noiseTex(58, 90, 1600, 3), notch: true },
    { name: 'Binderschicht', y0: -1.25, y1: -.5, tex: noiseTex(48, 80, 900, 5), notch: true },
    { name: 'Tragschicht', y0: -2.3, y1: -1.25, tex: noiseTex(62, 70, 500, 8), notch: false }
  ];
  const group = new THREE.Group();
  scene.add(group);
  layers.forEach(L => {
    const sh = new THREE.Shape();
    sh.moveTo(-HW, L.y0);
    sh.lineTo(HW, L.y0);
    sh.lineTo(HW, L.y1);
    if (L.notch) {
      sh.lineTo(.2, L.y1);
      NOTCH.slice().reverse().forEach(([x, y]) => { const yy = Math.max(y, L.y0 + .02); if (yy <= L.y1) sh.lineTo(x, yy); });
    }
    sh.lineTo(-HW, L.y1);
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: LEN, bevelEnabled: false });
    geo.translate(0, 0, -LEN / 2);
    L.tex.repeat.set(1.2, 1.2);
    const mat = new THREE.MeshStandardMaterial({ map: L.tex, roughness: .92, metalness: 0 });
    const m = new THREE.Mesh(geo, mat);
    L.mesh = m;
    L.label = root.querySelector(`[data-layer="${L.name}"]`);
    group.add(m);
  });

  const seamShape = new THREE.Shape();
  seamShape.moveTo(-.55, 0);
  seamShape.quadraticCurveTo(-.45, .06, -.2, .06);
  NOTCH.forEach(([x, y]) => seamShape.lineTo(x * .92, Math.max(y, -1.1)));
  seamShape.lineTo(.2, .06);
  seamShape.quadraticCurveTo(.45, .06, .55, 0);
  seamShape.closePath();
  const seamGeo = new THREE.ExtrudeGeometry(seamShape, { depth: LEN, bevelEnabled: false });
  seamGeo.translate(0, 0, -LEN / 2);
  const seamMat = new THREE.MeshStandardMaterial({ color: 0x0c0e10, roughness: .18, metalness: .1, transparent: true, opacity: 0 });
  const seam = new THREE.Mesh(seamGeo, seamMat);
  group.add(seam);

  const gritN = 260;
  const grit = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.035, 0), new THREE.MeshStandardMaterial({ color: 0xb9bdb9, roughness: .7 }), gritN);
  const gritData = [];
  const dummy = new THREE.Object3D();
  for (let k = 0; k < gritN; k++) gritData.push({ x: (Math.random() - .5) * .9, z: (Math.random() - .5) * LEN * .96, d: Math.random(), r: Math.random() * 6, s: .7 + Math.random() * .8 });
  group.add(grit);

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

  function render3d(p) {
    const e = ease(seg(p, .78, .95));
    const orbit = ease(seg(p, .7, .9));
    const far = mobile ? 11.5 : 8.6;
    camera.position.set(Math.sin(orbit * .9) * far * .7, 1.2 + (1 - orbit) * 7.4 + orbit * 2.4, .01 + Math.cos(orbit * .9) * far * orbit * .9 + (1 - orbit) * .01);
    camera.lookAt(0, -1 + (1 - orbit) * 1, 0);
    layers.forEach((L, i) => { L.mesh.position.y = -i * e * .55; });
    seam.position.y = 0;
    seamMat.opacity = ease(seg(p, .82, .9));
    const g = seg(p, .88, .98);
    for (let k = 0; k < gritN; k++) {
      const d = gritData[k], t = clamp(g * 1.6 - d.d * .6);
      dummy.position.set(d.x * .9, .08 + (1 - ease(t)) * 2.5 - t * .04, d.z);
      dummy.rotation.set(d.r, d.r * 2, 0);
      dummy.scale.setScalar(t > 0 ? d.s : 0);
      dummy.updateMatrix();
      grit.setMatrixAt(k, dummy.matrix);
    }
    grit.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
    const W = glCv.clientWidth, H = glCv.clientHeight;
    layers.forEach(L => {
      if (!L.label) return;
      v.set(HW, (L.y0 + L.y1) / 2 + L.mesh.position.y, LEN / 2);
      v.project(camera);
      L.label.style.transform = `translate(${(v.x * .5 + .5) * W + 18}px, ${(-v.y * .5 + .5) * H}px)`;
      L.label.style.opacity = e;
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
