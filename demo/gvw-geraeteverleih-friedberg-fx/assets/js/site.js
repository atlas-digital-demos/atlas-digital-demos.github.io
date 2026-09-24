(()=>{
const d=document,b=d.body,$$=(s,r=d)=>[...r.querySelectorAll(s)];
const onScroll=()=>b.classList.toggle('scrolled',scrollY>40);onScroll();addEventListener('scroll',onScroll,{passive:true});
const mb=d.querySelector('.menu-btn');if(mb)mb.onclick=()=>b.classList.toggle('nav-open');
$$('.nav a').forEach(a=>a.addEventListener('click',()=>b.classList.remove('nav-open')));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
$$('.rv,.card').forEach(el=>io.observe(el));
const on=d.querySelector('.tab.on');if(on){const t=on.parentNode;t.scrollLeft=on.offsetLeft-(t.clientWidth-on.offsetWidth)/2}
const form=d.querySelector('.c-f');
if(form){const q=new URLSearchParams(location.search),g=q.get('geraet');if(g){const f=form.querySelector('[name="Gerät"]');f.value=g;f.classList.add('flash')}const art=form.querySelector(`input[name="Art"][value="${q.get('art')==='Kaufen'?'Kaufen':'Mieten'}"]`);if(art)art.checked=true}
if(form)form.addEventListener('submit',ev=>{ev.preventDefault();const fd=new FormData(form);const art=fd.get('Art')||'Mieten';
  const body=[...fd.entries()].filter(([,v])=>v).map(([k,v])=>k+': '+v).join('\n');
  location.href='mailto:'+form.dataset.mail+'?subject='+encodeURIComponent((art==='Kaufen'?'Kaufanfrage':'Mietanfrage')+(fd.get('Gerät')?' - '+fd.get('Gerät'):''))+'&body='+encodeURIComponent(body)});
const par=$$('.kauf,.stihl');let tick=false;
function upd(){tick=false;const y=innerHeight;
  par.forEach(s=>{const r=s.getBoundingClientRect();const p=Math.min(1,Math.max(0,(y-r.top)/(y+r.height)));s.style.setProperty('--p',p.toFixed(3))});}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});upd();
})();
