(()=>{
const d=document,b=d.body,$$=(s,r=d)=>[...r.querySelectorAll(s)];
const still=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
const bar=d.createElement('div');bar.className='fx-bar';bar.innerHTML='<i></i>';b.appendChild(bar);
const cur=d.createElement('div');cur.className='fx-curtain';cur.innerHTML='<b>GVW</b>';b.appendChild(cur);
if(!still){let first=false;try{first=!sessionStorage.getItem('fx');sessionStorage.setItem('fx','1')}catch(e){}
  b.classList.add(first?'fx-pre':'fx-enter');}
addEventListener('pageshow',ev=>{if(ev.persisted){b.classList.remove('fx-leave','fx-pre');b.classList.add('fx-enter')}});
d.addEventListener('click',ev=>{const a=ev.target.closest('a');if(!a||still||ev.metaKey||ev.ctrlKey||ev.shiftKey||a.target==='_blank')return;
  const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname===location.pathname||!/^https?:/.test(u.protocol))return;
  ev.preventDefault();b.classList.remove('fx-pre','fx-enter');b.classList.add('fx-leave');setTimeout(()=>{location.href=a.href},430)});
const hl=d.querySelector('.facts');let hlIn=null;
if(hl&&b.classList.contains('home')){const s=d.createElement('div');s.className='fx-hl';s.setAttribute('aria-hidden','true');
  const w=['Mieten','Kaufen','Anpacken','Yanmar','Stihl','Friedberg'];s.innerHTML='<div class="fx-hl-in">'+[...w,...w,...w].map(x=>'<span>'+x+'</span>').join('')+'</div>';hl.after(s);hlIn=s.firstChild}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px'});
if(!still){
  $$('h1,h2').forEach(h=>{h.classList.add('fx-split');let i=0;
    const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(d.createTextNode(' '));return}const w=d.createElement('span');w.className='w';const s=d.createElement('span');s.textContent=t;s.style.setProperty('--i',i++);w.appendChild(s);f.appendChild(w)});c.replaceWith(f)}else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})};
    walk(h);if(h.closest('.hero,.sh'))h.style.setProperty('--d',b.classList.contains('fx-pre')?'1500ms':'500ms');io.observe(h)});
  $$('.cat-img,.c-img,.j-img,.k-card>img').forEach(el=>{if(el.tagName==='IMG'){const w=d.createElement('div');w.style.cssText='overflow:hidden;background:#fff';el.replaceWith(w);w.appendChild(el);el.style.height='100%';el=w}
    el.classList.add('fx-img');io.observe(el)});
}
if(fine&&!still){
  const c=d.createElement('div');c.className='fx-cur';b.appendChild(c);let mx=0,my=0,cx=0,cy=0;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;c.classList.add('on')},{passive:true});
  d.addEventListener('mouseover',e=>c.classList.toggle('big',!!e.target.closest('a,button,.cat,.card')));
  (function loop(){cx+=(mx-cx)*.2;cy+=(my-cy)*.2;c.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(loop)})();
  $$('.btn,.cta-s,.fab').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`});el.addEventListener('mouseleave',()=>el.style.transform='')});
  $$('.cat,.card,.k-card').forEach(el=>{el.classList.add('fx-tilt');el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*7+'deg');el.style.setProperty('--rx',(.5-(e.clientY-r.top)/r.height)*7+'deg')});el.addEventListener('mouseleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')})});
}
b.classList.add('fx-ready');
const hero=d.querySelector('.hero,.sh'),par=$$('.kauf,.stihl');let last=scrollY,vel=0,off=0,tick=false;
function frame(){tick=false;const y=scrollY,h=innerHeight;
  bar.style.setProperty('--sp',(y/Math.max(1,d.documentElement.scrollHeight-h)).toFixed(4));
  if(hero&&!still)hero.style.setProperty('--hp',Math.min(1,y/h).toFixed(4));
  par.forEach(s=>{const r=s.getBoundingClientRect();s.style.setProperty('--p',Math.min(1,Math.max(0,(h-r.top)/(h+r.height))).toFixed(4))});
  if(hlIn&&!still){vel=vel*.8+(y-last)*.2;off-=1+Math.abs(vel)*.35;const w=hlIn.scrollWidth/3;if(off<-w)off+=w;hlIn.style.transform=`translateX(${off}px) skewX(${Math.max(-12,Math.min(12,-vel*.4))}deg)`;requestTick()}
  last=y}
function requestTick(){if(!tick){tick=true;requestAnimationFrame(frame)}}
addEventListener('scroll',requestTick,{passive:true});addEventListener('resize',requestTick);frame();
})();
