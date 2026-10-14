(()=>{
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const art=document.querySelector('.statement-art');if(art){const o=new IntersectionObserver(e=>{if(e[0].isIntersecting){art.classList.add('in');o.disconnect()}},{threshold:.25});o.observe(art)}
document.querySelectorAll('.step,.service-info,.contact-left').forEach(el=>{el.classList.add('v7-fade')});
const fo=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');fo.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.v7-fade').forEach(el=>fo.observe(el));
if(rm)return;
const imgs=[...document.querySelectorAll('.service-photo .ph')];
let busy=false;
function tick(){busy=false;const vh=innerHeight;imgs.forEach(im=>{const r=im.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;const p=(r.top+r.height/2-vh/2)/vh;im.style.translate='0 '+(Math.max(-1,Math.min(1,p))*-22)+'px'});}
addEventListener('scroll',()=>{if(!busy){busy=true;requestAnimationFrame(tick)}},{passive:true});tick();
})();
;(()=>{
function go(){
if(!window.gsap||!window.ScrollTrigger||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
gsap.registerPlugin(ScrollTrigger);
const q=s=>[...document.querySelectorAll(s)];
// Band: laeuft mit dem Scrollen
const tr=document.querySelector('.v9-track');
if(tr){gsap.fromTo(tr,{x:0},{x:()=>-(tr.scrollWidth/2),ease:'none',scrollTrigger:{trigger:'.v9-band',start:'top bottom',end:'bottom top',scrub:.6}})}
// Dienste: Bilder atmen, Karten versetzt
q('.service').forEach((c,i)=>{
 const im=c.querySelector('.ph');
 if(im)gsap.fromTo(im,{scale:1.32},{scale:1.08,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'bottom top',scrub:true}});
 gsap.fromTo(c,{y:[0,70,20][i]||0},{y:[-30,-70,-20][i]||0,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'bottom top',scrub:true}});
});
const ih=document.querySelector('.intro h2');
if(ih)gsap.fromTo(ih,{letterSpacing:'-0.01em'},{letterSpacing:'-0.055em',ease:'none',scrollTrigger:{trigger:ih,start:'top 90%',end:'bottom 30%',scrub:true}});
// Ansatz: Rahmen driften, Ueberschrift laeuft ein
const sh=document.querySelector('.statement-copy h2');
if(sh)gsap.fromTo(sh,{xPercent:6},{xPercent:-2,ease:'none',scrollTrigger:{trigger:'.statement',start:'top bottom',end:'center center',scrub:true}});
const art=document.querySelector('.statement-art');
if(art)gsap.fromTo(art,{scale:.88,rotate:-2},{scale:1.04,rotate:0,ease:'none',scrollTrigger:{trigger:'.statement',start:'top 85%',end:'bottom 25%',scrub:true}});
// Schritte
q('.step').forEach((s,i)=>{gsap.fromTo(s,{x:i%2?60:-60},{x:0,ease:'none',scrollTrigger:{trigger:s,start:'top 95%',end:'top 55%',scrub:true}})});
const sl=document.querySelector('.steps h2');
if(sl)gsap.fromTo(sl,{yPercent:30},{yPercent:-10,ease:'none',scrollTrigger:{trigger:'.steps',start:'top bottom',end:'top 20%',scrub:true}});
// Kontakt
const fp=document.querySelector('.form-panel');
if(fp)gsap.fromTo(fp,{y:70},{y:0,ease:'none',scrollTrigger:{trigger:'.contact',start:'top bottom',end:'top 30%',scrub:true}});
const cl=document.querySelector('.contact-left');
if(cl)gsap.fromTo(cl,{yPercent:12},{yPercent:-6,ease:'none',scrollTrigger:{trigger:'.contact',start:'top bottom',end:'bottom bottom',scrub:true}});
}
if(document.readyState==='complete')setTimeout(go,300);else addEventListener('load',()=>setTimeout(go,300));
})();
;(()=>{
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;if(rm)return;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
// 7 Preloader (max 1.6 s, blockiert nichts dauerhaft)
const pre=document.createElement('div');pre.className='v9-pre';pre.innerHTML='<div><b>RS<span> / ENERGIE</span></b><i></i><small>ENERGIEKONZEPTE NRW</small></div>';document.body.appendChild(pre);
const bar=pre.querySelector('i');requestAnimationFrame(()=>{bar.style.transition='width 1.1s cubic-bezier(.2,.7,.2,1)';bar.style.width='100%'});
let gone=false;const hide=()=>{if(gone)return;gone=true;pre.classList.add('out');setTimeout(()=>pre.remove(),1000)};
setTimeout(hide,1300);setTimeout(hide,2500);
// 5 Seitenwechsel
const pt=document.createElement('div');pt.className='v9-pt';document.body.appendChild(pt);
addEventListener('pageshow',e=>{if(e.persisted)pt.classList.remove('on')});
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||a.target)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname===location.pathname)return;e.preventDefault();pt.classList.add('on');setTimeout(()=>{location.href=a.href},560)});
// 6 Cursor + magnetische Buttons
if(fine){document.body.classList.add('v9-cursor');const c=document.createElement('div'),r=document.createElement('div');c.className='v9-cur';r.className='v9-ring';document.body.append(c,r);let x=-100,y=-100,rx=-100,ry=-100;
addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;c.style.transform=`translate(${x}px,${y}px)`},{passive:true});
(function loop(){rx+=(x-rx)*.16;ry+=(y-ry)*.16;r.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(loop)})();
document.addEventListener('mouseover',e=>{r.classList.toggle('big',!!e.target.closest('a,button,.service,.step,input,select,textarea,label'))});
document.querySelectorAll('.button,.nav-cta,.sticky-cta,.text-button').forEach(b=>{b.addEventListener('mousemove',e=>{const k=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-k.left-k.width/2)*.22}px,${(e.clientY-k.top-k.height/2)*.3}px)`});b.addEventListener('mouseleave',()=>{b.style.transition='transform .5s cubic-bezier(.2,.7,.2,1)';b.style.transform='';setTimeout(()=>b.style.transition='',520)})})}
// 9 leichte 3D-Neigung (CSS) statt Three.js
if(fine)document.querySelectorAll('.service,.statement-art').forEach(el=>{el.addEventListener('mousemove',e=>{const k=el.getBoundingClientRect(),px=(e.clientX-k.left)/k.width-.5,py=(e.clientY-k.top)/k.height-.5;el.style.transition='transform .12s';el.style.transform=`perspective(1100px) rotateY(${px*7}deg) rotateX(${-py*7}deg)`});el.addEventListener('mouseleave',()=>{el.style.transition='transform .7s cubic-bezier(.2,.7,.2,1)';el.style.transform=''})});
// 12 Verzerrung (SVG) beim Hover ueber Kachelbilder
const disp=document.getElementById('v9disp');
if(disp&&window.gsap){document.querySelectorAll('.service').forEach(s=>{const im=s.querySelector('.ph');if(!im)return;const o={v:0};const set=()=>disp.setAttribute('scale',o.v);s.addEventListener('mouseenter',()=>{im.style.filter='url(#v9warp)';gsap.to(o,{v:38,duration:.5,ease:'power2.out',onUpdate:set})});s.addEventListener('mouseleave',()=>{gsap.to(o,{v:0,duration:.7,ease:'power2.out',onUpdate:set,onComplete:()=>{im.style.filter=''}})})})}
// 4 Text-Split (Wort fuer Wort mit Maske)
function split(el){const w=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(' '))}else{const s=document.createElement('span');s.className='v9w';s.innerHTML='<span>'+t.replace(/</g,'&lt;')+'</span>';f.appendChild(s)}});c.replaceWith(f)}else if(c.nodeType===1&&c.tagName!=='BR')w(c)})};w(el);return el.querySelectorAll('.v9w>span')}
function init(){if(!window.gsap||!window.ScrollTrigger)return;
document.querySelectorAll('.intro h2,.statement h2,.steps h2,.contact h2').forEach(h=>{const ws=split(h);gsap.fromTo(ws,{yPercent:115,rotate:4},{yPercent:0,rotate:0,duration:1.05,ease:'power4.out',stagger:.07,scrollTrigger:{trigger:h,start:'top 88%',once:true}})});
// 12 Bild-Reveals: Maske + Zoom
document.querySelectorAll('.statement-art span img,.service-photo').forEach((el,i)=>{gsap.fromTo(el,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.3,ease:'power3.inOut',delay:(i%3)*.12,scrollTrigger:{trigger:el,start:'top 92%',once:true},onComplete:()=>{el.style.clipPath=''}})});
// 3 Sticky Storytelling: Ansatz bleibt stehen, Rahmen fahren nacheinander vor
const st=document.querySelector('.statement'),panes=[...document.querySelectorAll('.statement-art span')];
if(st&&panes.length&&innerWidth>900){const tl=gsap.timeline({scrollTrigger:{trigger:st,start:'top top',end:'+=130%',scrub:.8,pin:true,anticipatePin:1}});
panes.forEach((p,i)=>{tl.fromTo(p,{scale:.92},{scale:1.1,zIndex:5,duration:1,ease:'power2.inOut'},i*1).to(p,{scale:.98,zIndex:1,duration:.6,ease:'power2.inOut'},i*1+1)})}
}
if(document.readyState==='complete')setTimeout(init,350);else addEventListener('load',()=>setTimeout(init,350));
})();
