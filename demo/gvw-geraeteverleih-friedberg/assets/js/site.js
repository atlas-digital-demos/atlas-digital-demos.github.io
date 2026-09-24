(()=>{
const d=document,b=d.body,$$=(s,r=d)=>[...r.querySelectorAll(s)];
const onScroll=()=>b.classList.toggle('scrolled',scrollY>40);onScroll();addEventListener('scroll',onScroll,{passive:true});
const mb=d.querySelector('.menu-btn');if(mb)mb.onclick=()=>b.classList.toggle('nav-open');
$$('.nav a').forEach(a=>a.addEventListener('click',()=>b.classList.remove('nav-open')));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
$$('.rv,.card').forEach(el=>io.observe(el));
const tabs=$$('.tab'),cards=$$('.card');
function filter(f){
  tabs.forEach(t=>t.classList.toggle('on',t.dataset.f===f));
  let i=0;cards.forEach(c=>{const show=f==='alle'||c.dataset.cat===f;c.classList.toggle('hide',!show);if(show){c.classList.remove('in');c.style.transitionDelay=(Math.min(i++,8)*45)+'ms';requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.add('in')))}});
  const on=d.querySelector('.tab.on');if(on)on.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
}
tabs.forEach(t=>t.onclick=()=>{filter(t.dataset.f);const m=d.getElementById('mietpark'),tw=d.querySelector('.tabs-wrap');if(tw.getBoundingClientRect().top>innerHeight*.5||tw.getBoundingClientRect().top<0)toGrid()});
const toGrid=()=>{const g=d.querySelector('.grid'),tw=d.querySelector('.tabs-wrap');const hh=d.querySelector('.top').offsetHeight;scrollTo({top:g.getBoundingClientRect().top+scrollY-hh-tw.offsetHeight-34,behavior:'smooth'})};
$$('[data-go]').forEach(a=>a.addEventListener('click',ev=>{ev.preventDefault();filter(a.dataset.go);toGrid()}));
const form=d.querySelector('.c-f');
$$('[data-ask]').forEach(bt=>bt.addEventListener('click',ev=>{ev.preventDefault();if(!form)return;
  const n=bt.dataset.ask.replace(/^Kauf: /,''),g=form.querySelector('[name="Gerät"]');g.value=n;
  const art=form.querySelector(`input[name="Art"][value="${bt.dataset.type||'Mieten'}"]`);if(art)art.checked=true;
  d.getElementById('kontakt').scrollIntoView({behavior:'smooth'});g.classList.remove('flash');void g.offsetWidth;g.classList.add('flash')}));
if(form)form.addEventListener('submit',ev=>{ev.preventDefault();const fd=new FormData(form);const art=fd.get('Art')||'Mieten';
  const body=[...fd.entries()].filter(([,v])=>v).map(([k,v])=>k+': '+v).join('\n');
  location.href='mailto:'+form.dataset.mail+'?subject='+encodeURIComponent((art==='Kaufen'?'Kaufanfrage':'Mietanfrage')+(fd.get('Gerät')?' - '+fd.get('Gerät'):''))+'&body='+encodeURIComponent(body)});
const secs=['mietpark','kaufen','stihl','jobs','kontakt'].map(id=>d.getElementById(id)).filter(Boolean),navs=$$('.nav a');
const par=$$('.kauf,.stihl');let tick=false;
function upd(){tick=false;const y=innerHeight;
  par.forEach(s=>{const r=s.getBoundingClientRect();const p=Math.min(1,Math.max(0,(y-r.top)/(y+r.height)));s.style.setProperty('--p',p.toFixed(3))});
  let cur='';secs.forEach(s=>{if(s.getBoundingClientRect().top<y*.4)cur=s.id});navs.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+cur))}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});upd();
})();
