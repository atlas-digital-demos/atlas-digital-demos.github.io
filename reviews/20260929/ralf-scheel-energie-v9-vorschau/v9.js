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
