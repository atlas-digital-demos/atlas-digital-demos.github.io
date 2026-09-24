/* Atlas scroll scenes: pinned stages whose children follow scroll keyframes.
   <section data-scene style="height:300vh"><div class="stage"> ... <el data-kf='[[0,{"x":0}],[1,{"x":40}]]'> </div></section>
   Keyframe props: x (vw), y (vh), s (scale), r (deg), o (opacity), b (blur px), c (clip from bottom 0-100).
   data-path="#pathId" data-range="0.1,0.9": element rides along an SVG path, rotated to its tangent.
   data-draw="0.1,0.9" on an SVG path: stroke is drawn with scroll.
   SVG children animate in viewBox units (x,y), pivot via data-o="cx,cy". svg[data-vb-portrait] swaps its viewBox on portrait screens.
   data-count="2500" data-dec="0" data-suffix="+": number counts up when visible. data-words: blur-in per word. */
(()=>{
const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const scenes=[...document.querySelectorAll('[data-scene]')].map(sc=>({sc,
  kf:[...sc.querySelectorAll('[data-kf]')].map(el=>({el,k:JSON.parse(el.dataset.kf)})),
  paths:[...sc.querySelectorAll('[data-path]')].map(el=>({el,p:document.querySelector(el.dataset.path),r:(el.dataset.range||'0,1').split(',').map(Number)})),
  draws:[...sc.querySelectorAll('[data-draw]')].map(el=>{const L=el.getTotalLength();el.style.strokeDasharray=L;return{el,L,r:el.dataset.draw.split(',').map(Number)}})}));
function val(k,p,prop,def){let a=null,b=null;for(const f of k){if(prop in f[1]){if(f[0]<=p)a=f;if(f[0]>=p&&!b)b=f}}
  if(!a&&!b)return def;if(!a)return b[1][prop];if(!b||a===b)return a[1][prop];const t=ease((p-a[0])/(b[0]-a[0]||1));return a[1][prop]+(b[1][prop]-a[1][prop])*t}
const cl=(v,a,b)=>Math.min(b,Math.max(a,v));
function frame(){const h=innerHeight;
  for(const s of scenes){const r=s.sc.getBoundingClientRect();if(r.bottom<-h||r.top>2*h)continue;
    const p=still?1:cl(-r.top/Math.max(1,r.height-h),0,1);s.sc.style.setProperty('--p',p.toFixed(4));
    for(const {el,k} of s.kf){const x=val(k,p,'x',0),y=val(k,p,'y',0),sc=val(k,p,'s',1),ro=val(k,p,'r',0),o=val(k,p,'o',1),bl=val(k,p,'b',0),c=val(k,p,'c',null);
      if(el instanceof SVGElement){const o2=(el.dataset.o||'0,0').split(',');el.setAttribute('transform',`translate(${x} ${y}) translate(${o2[0]} ${o2[1]}) rotate(${ro}) scale(${sc}) translate(${-o2[0]} ${-o2[1]})`)}
      else el.style.transform=`translate3d(${x}vw,${y}vh,0) rotate(${ro}deg) scale(${sc})`;el.style.opacity=o;el.style.filter=bl>.05?`blur(${bl}px)`:'';if(c!==null)el.style.clipPath=`inset(${c}% 0 0 0)`}
    for(const d of s.draws){const t=cl((p-d.r[0])/(d.r[1]-d.r[0]),0,1);d.el.style.strokeDashoffset=d.L*(1-ease(t))}
    for(const q of s.paths){const t=ease(cl((p-q.r[0])/(q.r[1]-q.r[0]),0,1)),L=q.p.getTotalLength(),a=q.p.getPointAtLength(L*t),b=q.p.getPointAtLength(Math.min(L,L*t+1));
      if(q.el instanceof SVGElement){q.el.setAttribute('transform',`translate(${a.x} ${a.y}) rotate(${Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI})`);continue}
      const m=q.p.getScreenCTM(),st=s.sc.querySelector('.stage').getBoundingClientRect();
      const P=new DOMPoint(a.x,a.y).matrixTransform(m),B=new DOMPoint(b.x,b.y).matrixTransform(m),ang=Math.atan2(B.y-P.y,B.x-P.x)*180/Math.PI;
      q.el.style.transform=`translate3d(${P.x-st.left}px,${P.y-st.top}px,0) translate(-50%,-50%) rotate(${ang}deg)`}}
  tick=false}
let tick=false;const req=()=>{if(!tick){tick=true;requestAnimationFrame(frame)}};
const vbs=[...document.querySelectorAll('svg[data-vb-portrait]')].map(v=>[v,v.getAttribute('viewBox')]);
function vb(){const port=innerHeight>innerWidth*1.1;vbs.forEach(([v,l])=>v.setAttribute('viewBox',port?v.dataset.vbPortrait:l));req()}
addEventListener('scroll',req,{passive:true});addEventListener('resize',vb);vb();frame();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;io.unobserve(el);el.classList.add('in');
  if(el.dataset.count){const to=+el.dataset.count,dec=+(el.dataset.dec||0),suf=el.dataset.suffix||'',t0=performance.now(),D=still?0:1800;
    const fmt=v=>v.toLocaleString('de-DE',{minimumFractionDigits:dec,maximumFractionDigits:dec})+suf;
    (function f(t){const k=D?Math.min(1,(t-t0)/D):1;el.textContent=fmt(to*(1-Math.pow(1-k,4)));if(k<1)requestAnimationFrame(f)})(t0)}}),{threshold:.4});
document.querySelectorAll('[data-count],[data-words]').forEach(el=>{if(el.dataset.words!==undefined){el.innerHTML=el.textContent.trim().split(/\s+/).map((w,i)=>`<span style="--i:${i}">${w}</span>`).join(' ')}io.observe(el)});
})();
