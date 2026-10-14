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
// Dienste: Bilder atmen, Karten versetzt
q('.service').forEach((c,i)=>{
 const im=c.querySelector('.ph');
 if(im)gsap.fromTo(im,{scale:1.32},{scale:1.08,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'bottom top',scrub:true}});
 
});
// Ansatz: Rahmen driften, Ueberschrift laeuft ein
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
if(fine){document.querySelectorAll('.button,.nav-cta,.sticky-cta,.text-button').forEach(b=>{b.addEventListener('mousemove',e=>{const k=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-k.left-k.width/2)*.22}px,${(e.clientY-k.top-k.height/2)*.3}px)`});b.addEventListener('mouseleave',()=>{b.style.transition='transform .5s cubic-bezier(.2,.7,.2,1)';b.style.transform='';setTimeout(()=>b.style.transition='',520)})})}
// 4 Text-Split (Wort fuer Wort mit Maske)
function split(el){const w=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(' '))}else{const s=document.createElement('span');s.className='v9w';s.innerHTML='<span>'+t.replace(/</g,'&lt;')+'</span>';f.appendChild(s)}});c.replaceWith(f)}else if(c.nodeType===1&&c.tagName!=='BR')w(c)})};w(el);return el.querySelectorAll('.v9w>span')}
function init(){if(!window.gsap||!window.ScrollTrigger)return;
document.querySelectorAll('.intro h2,.statement h2,.steps h2,.contact h2').forEach(h=>{const ws=split(h);gsap.fromTo(ws,{yPercent:115,rotate:4},{yPercent:0,rotate:0,duration:1.05,ease:'power4.out',stagger:.07,scrollTrigger:{trigger:h,start:'top 88%',once:true}})});
// 12 Bild-Reveals: Maske + Zoom
document.querySelectorAll('.statement-art span img,.service-photo').forEach((el,i)=>{gsap.fromTo(el,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.3,ease:'power3.inOut',delay:(i%3)*.12,scrollTrigger:{trigger:el,start:'top 92%',once:true},onComplete:()=>{el.style.clipPath=''}})});
// 3 Sticky Storytelling: Ansatz bleibt stehen, Rahmen fahren nacheinander vor
const st=document.querySelector('.statement'),panes=[...document.querySelectorAll('.statement-art span')];
const sg=document.querySelectorAll('.v10-strip>div');if(sg.length){gsap.fromTo(sg,{y:50,opacity:0},{y:0,opacity:1,duration:1,ease:'power3.out',stagger:.15,scrollTrigger:{trigger:'.v10-strip',start:'top 85%',once:true}});sg.forEach(d=>gsap.fromTo(d,{'--ln':0},{'--ln':1,duration:1.4,ease:'power3.inOut',scrollTrigger:{trigger:'.v10-strip',start:'top 85%',once:true}}))}
if(st&&panes.length&&innerWidth>900){st.classList.add('v10-pin');const caps=[...st.querySelectorAll('.v10-caps p')];gsap.set(caps,{opacity:0,y:28});gsap.set(panes,{scale:.9,opacity:.55});const tl=gsap.timeline({scrollTrigger:{trigger:st,start:'top top',end:'+=170%',scrub:.8,pin:true,anticipatePin:1}});
panes.forEach((p,i)=>{tl.to(p,{scale:1.06,opacity:1,zIndex:5,duration:1,ease:'power2.inOut'},i*1.2);if(caps[i])tl.to(caps[i],{opacity:1,y:0,duration:.5,ease:'power2.out'},i*1.2+.2);if(i<panes.length-1){tl.to(p,{scale:.94,opacity:.5,zIndex:1,duration:.6,ease:'power2.inOut'},i*1.2+1.1);if(caps[i])tl.to(caps[i],{opacity:0,y:-22,duration:.4,ease:'power2.in'},i*1.2+1.0)}})}
}
if(document.readyState==='complete')setTimeout(init,350);else addEventListener('load',()=>setTimeout(init,350));
})();

// ===== V11 =====
(()=>{
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
function go(){
if(!window.gsap||!window.ScrollTrigger)return;
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({limitCallbacks:true});
const hero=document.querySelector('.hero'),cv=document.getElementById('v12-seq');
const mobile=innerWidth<700;
if(hero&&cv){
 const N=36,dir=mobile?'seqm/':'seq/',imgs=new Array(N),ctx=cv.getContext('2d');let last=0,drawn=-1;
 const load=i=>{if(imgs[i])return;const im=new Image();im.decoding='async';im.src=dir+'f'+String(i+1).padStart(3,'0')+'.webp';imgs[i]=im};
 for(let i=0;i<6;i++)load(i);let k=6;const more=()=>{for(let n=0;n<4&&k<N;n++)load(k++);if(k<N)setTimeout(more,120)};setTimeout(more,600);
 function fit(){const d=Math.min(devicePixelRatio||1,1.5);cv.width=Math.round(cv.clientWidth*d);cv.height=Math.round(cv.clientHeight*d);drawn=-1;draw(last)}
 function draw(f){const i=Math.max(0,Math.min(N-1,Math.round(f)));last=f;if(i===drawn)return;let im=imgs[i];if(!(im&&im.complete&&im.naturalWidth)){im=null;for(let d=1;d<N&&!im;d++){for(const j of [i-d,i+d]){const c=imgs[j];if(c&&c.complete&&c.naturalWidth){im=c;break}}}}
  if(!im)return;drawn=i;const cw=cv.width,ch=cv.height,s=Math.max(cw/im.naturalWidth,ch/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;ctx.drawImage(im,(cw-w)/2,(ch-h)/2,w,h)}
 fit();addEventListener('resize',fit);imgs[0].onload=()=>{drawn=-1;draw(0)};
 const copy=hero.querySelector('.hero-inner'),veil=hero.querySelector('.v12-veil');
 const tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:hero,start:'top top',end:'+='+(mobile?200:260)+'%',scrub:.5,pin:true,anticipatePin:1}});
 const st={f:0};
 tl.to(st,{f:N-1,duration:.7,onUpdate:()=>draw(st.f)},0)
   .fromTo(cv,{scale:1},{scale:mobile?1.1:1.14,duration:.5,ease:'none'},.3)
   .to(copy,{opacity:0,y:-60,duration:.16},0)
   .fromTo(veil,{opacity:0},{opacity:1,duration:.12},.9);
}
// Schritte: Sticky-Links, Karten fahren nacheinander ein
const cards=[...document.querySelectorAll('.v12-card')],cur=document.getElementById('v12-cur'),fill=document.getElementById('v12-fill');
if(cards.length){cards.forEach((c,i)=>{const im=c.querySelector('img');gsap.fromTo(c,{y:90,opacity:0},{y:0,opacity:1,ease:'power3.out',scrollTrigger:{trigger:c,start:'top 92%',end:'top 55%',scrub:.6}});if(im)gsap.fromTo(im,{scale:1.25},{scale:1,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'bottom top',scrub:true}});
 ScrollTrigger.create({trigger:c,start:'top 55%',end:'bottom 55%',onToggle:s=>{if(s.isActive){cards.forEach(x=>x.classList.toggle('on',x===c));if(cur)cur.textContent='0'+(i+1)}}})});
 if(fill)ScrollTrigger.create({trigger:'.v12-steps-right',start:'top 70%',end:'bottom 60%',scrub:true,onUpdate:s=>{fill.style.transform='scaleX('+s.progress.toFixed(3)+')'}})}
// Header blendet beim Runterscrollen aus
const hd=document.querySelector('header');if(hd){let ly=0,hid=false;ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{const y=s.scroll();const d=y-ly;if(Math.abs(d)<6)return;const hide=d>0&&y>400;if(hide!==hid){hid=hide;hd.style.transform=hide?'translateY(-110%)':'';}ly=y}});hd.style.transition='transform .45s cubic-bezier(.2,.7,.2,1)'}
// Anker laufen ueber Lenis
if(window.__scheelLenis)document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(!t)return;e.preventDefault();window.__scheelLenis.scrollTo(t,{offset:-10,duration:1.6})}));
setTimeout(()=>{ScrollTrigger.sort();ScrollTrigger.refresh()},900);
}
if(rm)return;
if(document.readyState==='complete')setTimeout(go,300);else addEventListener('load',()=>setTimeout(go,300));
})();
