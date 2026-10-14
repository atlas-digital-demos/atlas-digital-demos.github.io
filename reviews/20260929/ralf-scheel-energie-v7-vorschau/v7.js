(()=>{
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(art){const o=new IntersectionObserver(e=>{if(e[0].isIntersecting){art.classList.add('in');o.disconnect()}},{threshold:.25});o.observe(art)}
document.querySelectorAll('.step,.service-info,.contact-left').forEach(el=>{el.classList.add('v7-fade')});
const fo=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');fo.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.v7-fade').forEach(el=>fo.observe(el));
if(rm)return;
const imgs=[...document.querySelectorAll('.service-photo .ph')];
let busy=false;
function tick(){busy=false;const vh=innerHeight;imgs.forEach(im=>{const r=im.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;const p=(r.top+r.height/2-vh/2)/vh;im.style.translate='0 '+(Math.max(-1,Math.min(1,p))*-22)+'px'});}
addEventListener('scroll',()=>{if(!busy){busy=true;requestAnimationFrame(tick)}},{passive:true});tick();
})();
