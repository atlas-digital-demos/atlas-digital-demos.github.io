import{a as e,n as t,t as n}from"./jsx-runtime-D3jfb0Ew.js";import{K as r,Lt as i,Ot as a,Ut as o,X as s,d as c,gt as l,h as u,kt as d,n as f,rt as p}from"./three.module-BJhgrbK8.js";var m=e(t(),1),h=n(),g=`
precision highp float;
uniform sampler2D uTex; uniform vec2 uRes; uniform vec2 uImg; uniform vec2 uMouse;
uniform float uTime; uniform float uVel; uniform float uScroll;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec2 ratio = vec2(min((uRes.x/uRes.y)/(uImg.x/uImg.y),1.0), min((uRes.y/uRes.x)/(uImg.y/uImg.x),1.0));
  vec2 uv = vUv*ratio + (1.0-ratio)*0.5;
  uv = (uv-0.5)/(1.04 + uScroll*0.16) + 0.5;
  // slow liquid drift
  uv += vec2(sin(uv.y*5.0 + uTime*0.35), cos(uv.x*4.0 - uTime*0.28)) * 0.0035;
  // cursor lens + ripple
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 dv = (vUv - uMouse) * asp;
  float d = length(dv);
  float lens = smoothstep(0.42, 0.0, d);
  uv -= normalize(dv + 1e-5) * lens * lens * (0.018 + uVel*0.05) / asp;
  uv += normalize(dv + 1e-5) * sin(d*38.0 - uTime*5.0) * 0.0035 * lens * clamp(uVel*6.0, 0.0, 1.0) / asp;
  float split = 0.0004 + lens*uVel*0.006 + uScroll*0.0025;
  vec2 dir = normalize(vUv - 0.5 + 1e-5);
  vec3 col;
  col.r = texture2D(uTex, uv + dir*split).r;
  col.g = texture2D(uTex, uv).g;
  col.b = texture2D(uTex, uv - dir*split).b;
  // light bloom where the cursor is
  col += lens * uVel * 0.04;
  // vignette + grain
  float vig = smoothstep(1.15, 0.35, length((vUv-0.5)*vec2(1.2,1.0)));
  col *= mix(0.9, 1.0, vig);
  col += (hash(vUv*uRes + fract(uTime)*100.0) - 0.5) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}`,_=`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;function v({src:e}){let t=(0,m.useRef)(null);return(0,m.useEffect)(()=>{let n=t.current;if(!n)return;let m;try{m=new f({antialias:!1,alpha:!1,powerPreference:`high-performance`})}catch{return}let h=window.matchMedia(`(max-width: 767px)`).matches;m.outputColorSpace=s,m.setPixelRatio(Math.min(window.devicePixelRatio,h?1.5:2));let v=m.domElement;v.className=`hero-gl`,n.appendChild(v);let y=new a,b=new c,x={uTex:{value:null},uRes:{value:new o(1,1)},uImg:{value:new o(3,2)},uMouse:{value:new o(.5,.5)},uTime:{value:0},uVel:{value:0},uScroll:{value:0}},S=new p(new l(2,2),new d({uniforms:x,vertexShader:_,fragmentShader:g}));y.add(S);let C=()=>{let e=n.getBoundingClientRect();m.setSize(e.width,e.height,!1),x.uRes.value.set(e.width,e.height)};C(),window.addEventListener(`resize`,C);let w=new o(.5,.5),T=0,E={x:.5,y:.5},D=e=>{let t=n.getBoundingClientRect();w.set((e.clientX-t.left)/t.width,1-(e.clientY-t.top)/t.height)};window.addEventListener(`pointermove`,D,{passive:!0});let O=performance.now(),k=()=>{O=performance.now()};[`pointermove`,`scroll`,`touchstart`,`wheel`].forEach(e=>window.addEventListener(e,k,{passive:!0}));let A=0,j=!0,M=new u,N=new IntersectionObserver(([e])=>{j=!!e?.isIntersecting});N.observe(n),new i().load(e,e=>{e.colorSpace=``,e.minFilter=r,e.generateMipmaps=!1,x.uTex.value=e,x.uImg.value.set(e.image.width,e.image.height),v.classList.add(`is-ready`)});let P=()=>{if(A=requestAnimationFrame(P),!j||!x.uTex.value||performance.now()-O>6e3)return;let e=M.getElapsedTime();x.uTime.value=e,h&&w.set(.5+Math.sin(e*.4)*.25,.55+Math.cos(e*.3)*.15);let t=x.uMouse.value;t.lerp(w,.08),T=T*.92+Math.hypot(t.x-E.x,t.y-E.y)*.9,E={x:t.x,y:t.y},x.uVel.value=Math.min(T*(h?.5:4),1),x.uScroll.value=Math.min(window.scrollY/window.innerHeight,1.2),m.render(y,b)};return P(),()=>{cancelAnimationFrame(A),N.disconnect(),window.removeEventListener(`resize`,C),window.removeEventListener(`pointermove`,D),[`pointermove`,`scroll`,`touchstart`,`wheel`].forEach(e=>window.removeEventListener(e,k)),m.dispose(),v.remove()}},[e]),(0,h.jsx)(`div`,{ref:t,className:`hero-gl-host`,"aria-hidden":`true`})}export{v as default};