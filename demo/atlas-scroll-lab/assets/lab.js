(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function(v){return v<0?0:v>1?1:v};
  var seg = function(p,a,b){return clamp((p-a)/(b-a))};
  var ease = function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var $ = function(s,r){return (r||document).querySelector(s)};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  // split headline into letters
  $$('.split').forEach(function(el){
    var i=0;
    el.innerHTML = el.textContent.split(' ').map(function(w){
      return '<span class="w">'+w.split('').map(function(c){return '<span class="ch" style="--i:'+(i++)+'">'+c+'</span>'}).join('')+'</span>';
    }).join(' ');
  });
  requestAnimationFrame(function(){document.body.classList.add('ready')});

  // words
  var words = $('.words');
  words.innerHTML = words.textContent.trim().split(/\s+/).map(function(w){return '<span>'+w+'</span>'}).join(' ');
  var wSpans = $$('span', words);

  var secs = $$('[data-p]');
  var prog = function(el){var r=el.getBoundingClientRect(),d=r.height-innerHeight;return d>0?clamp(-r.top/d):(r.top<0?1:0)};

  var mask=$('.p-mask'), zoom=$('.p-zoom'), horiz=$('.p-horiz'), track=$('.track'), split=$('.p-split'),
      path=$('#lp'), pathSec=$('.p-path'), count=$('.p-count'), para=$('.p-para'), wSec=$('.p-words');
  var plen = path.getTotalLength(); path.style.strokeDasharray=plen;
  var steps=$$('.st'), simgs=$$('.split-r img'), miles=$$('.miles div'), stats=$$('.stats div');
  var cards=$$('.card');
  var mqs=$$('.mq-in'), mqx=[0,0], lastY=scrollY, vel=0;
  var ths=$$('.th');
  var fmt=new Intl.NumberFormat('de-DE');

  function frame(){
    var y=scrollY, H=document.documentElement.scrollHeight-innerHeight;
    document.documentElement.style.setProperty('--sp', (y/H).toFixed(4));

    var p=prog(wSec), n=Math.round(seg(p,.05,.85)*wSpans.length);
    wSpans.forEach(function(s,i){s.classList.toggle('on',i<n)});

    p=prog(mask); mask.style.setProperty('--m', ease(seg(p,.05,.7)).toFixed(4)); mask.style.setProperty('--mt', seg(p,.65,.85).toFixed(3));

    p=prog(zoom); var z=seg(p,.05,.8); zoom.style.setProperty('--zs', (1+Math.pow(z,3)*30).toFixed(3)); zoom.style.setProperty('--zi', seg(p,.32,.6).toFixed(3));

    p=prog(horiz); var max=track.scrollWidth-innerWidth+Math.min(innerWidth*.06,96);
    track.style.setProperty('--hx', (-ease(seg(p,.05,.95))*max).toFixed(1)+'px');

    cards.forEach(function(c,i){
      var nx=cards[i+1]; if(!nx) return;
      var r=nx.getBoundingClientRect(), t=clamp(1-(r.top-innerHeight*.18)/(innerHeight*.7));
      c.style.setProperty('--cs',(1-t*.06).toFixed(4)); c.style.setProperty('--cb',(1-t*.35).toFixed(3));
    });

    p=prog(split); var k=Math.min(steps.length-1,Math.floor(seg(p,.02,.98)*steps.length));
    steps.forEach(function(s,i){s.classList.toggle('on',i===k)});
    simgs.forEach(function(s,i){s.classList.toggle('on',i<=k)});

    p=prog(pathSec); var d=ease(seg(p,.05,.85)); path.style.strokeDashoffset=(plen*(1-d)).toFixed(1);
    miles.forEach(function(m){m.classList.toggle('on', d>=parseFloat(m.style.getPropertyValue('--at'))-.02)});

    p=prog(count); var c=ease(seg(p,.05,.7));
    stats.forEach(function(s){var b=s.querySelector('b'); b.textContent=fmt.format(Math.round(+b.dataset.to*c)); s.style.setProperty('--f',c.toFixed(3))});

    para.style.setProperty('--p', prog(para).toFixed(4));

    vel = vel*.9 + (y-lastY)*.1; lastY=y;
    mqs.forEach(function(m,i){
      var dir=i?1:-1, w=m.scrollWidth/2||1;
      mqx[i]+= dir*(0.6+Math.abs(vel)*.35);
      if(mqx[i]<-w) mqx[i]+=w; if(mqx[i]>0) mqx[i]-=w;
      m.style.transform='translateX('+mqx[i].toFixed(1)+'px) skewX('+(Math.max(-12,Math.min(12,-vel*.4))).toFixed(2)+'deg)';
    });

    var mid=innerHeight*.5, act=null;
    ths.forEach(function(t){var r=t.getBoundingClientRect(); if(r.top<mid&&r.bottom>mid) act=t});
    document.body.style.backgroundColor = act?act.dataset.c:'';
    document.body.style.color = act?act.dataset.f:'';

    requestAnimationFrame(frame);
  }
  mqs.forEach(function(m){m.innerHTML=m.innerHTML+m.innerHTML});

  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}})},{threshold:.25});
  $$('.rv').forEach(function(r){io.observe(r)});

  if(RM){ document.body.classList.add('ready'); wSpans.forEach(function(s){s.classList.add('on')}); }
  requestAnimationFrame(frame);
})();
