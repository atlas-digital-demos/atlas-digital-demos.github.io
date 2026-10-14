import * as THREE from './three.module.min.js';
const cv = document.querySelector('canvas.gl');
const state = window.RRHERO = { p: 0, mx: 0, my: 0, ok: false };
try {
  const mobile = innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.setClearColor(0x060606, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 100);
  camera.position.set(0, 2.2, 7.5);
  const NX = mobile ? 110 : 220, NZ = mobile ? 90 : 160;
  const n = NX * NZ, pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const k = i * NZ + j;
    pos[k * 3] = (i / (NX - 1) - .5) * 26;
    pos[k * 3 + 1] = 0;
    pos[k * 3 + 2] = (j / (NZ - 1) - .5) * 20;
    seed[k] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uP: { value: 0 }, uM: { value: new THREE.Vector2() }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float seed; uniform float uT,uP,uPx; uniform vec2 uM; varying float vH; varying float vS;
      float h(vec2 p){ return sin(p.x*.55+uT*.5)*.55+sin(p.y*.8-uT*.4)*.45+sin((p.x+p.y)*.35+uT*.3)*.6; }
      void main(){
        vec3 p=position;
        float d=length(p.xz-vec2(uM.x*9.,uM.y*-6.));
        float amp=mix(1.0,2.6,uP);
        float y=h(p.xz)*amp - exp(-d*d*.06)*1.1;
        p.y=y-1.6;
        p.z+=uP*6.;
        vH=y; vS=seed;
        vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=(1.2+seed*1.8)*uPx*(9./-mv.z);
      }`,
    fragmentShader: `
      varying float vH; varying float vS;
      void main(){
        vec2 c=gl_PointCoord-.5; float r=length(c); if(r>.5) discard;
        float a=smoothstep(.5,.0,r);
        vec3 lo=vec3(.56,.46,.27), hi=vec3(.98,.86,.62);
        vec3 col=mix(lo,hi,clamp(vH*.35+.45+vS*.2,0.,1.));
        gl_FragColor=vec4(col, a*(.35+vS*.5));
      }`
  });
  scene.add(new THREE.Points(g, mat));
  function size() { const w = cv.clientWidth, h = cv.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { state.mx = e.clientX / innerWidth * 2 - 1; state.my = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  let vis = true; new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(cv);
  const clock = new THREE.Clock(); let sx = 0, sy = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function loop() {
    requestAnimationFrame(loop);
    if (!vis) return;
    sx += (state.mx - sx) * .05; sy += (state.my - sy) * .05;
    mat.uniforms.uT.value = reduce ? 4 : clock.getElapsedTime();
    mat.uniforms.uP.value = state.p;
    mat.uniforms.uM.value.set(sx, sy);
    camera.position.x = sx * .6; camera.position.y = 2.2 - sy * .3 + state.p * 1.5;
    camera.lookAt(0, 0 + state.p * -1, 0);
    renderer.render(scene, camera);
  })();
  state.ok = true; state.gl = renderer.getContext() instanceof WebGLRenderingContext || true;
} catch (e) { console.warn('hero gl', e); document.querySelector('.hero').style.background = 'radial-gradient(80% 60% at 50% 100%,#2a2012,#060606)'; }
