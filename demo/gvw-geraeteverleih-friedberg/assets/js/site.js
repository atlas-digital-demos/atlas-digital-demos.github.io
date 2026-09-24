(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function(v){return v<0?0:v>1?1:v};
  var seg = function(p,a,b){return clamp((p-a)/(b-a))};
  var ease = function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var root = document.documentElement;
  var prog = function(el){var r=el.getBoundingClientRect(),d=r.height-innerHeight;return d>0?clamp(-r.top/d):(r.top<0?1:0)};

  $$('[data-split]').forEach(function(el){
    var i=0;
    el.innerHTML = el.innerHTML.split(/(<[^>]+>|\s+)/).map(function(tok){
      if(!tok) return '';
      if(tok.charAt(0)==='<') return tok;
      if(/^\s+$/.test(tok)) return ' ';
      return '<span class="w"><span class="ch" style="--i:'+(i++)+'">'+tok+'</span></span>';
    }).join('');
  });
  requestAnimationFrame(function(){requestAnimationFrame(function(){document.body.classList.add('ready')})});

  var words = $$('[data-words]').map(function(el){
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function(w){return '<span>'+w+'</span>'}).join(' ');
    return {sec: el.closest('[data-p]'), spans: $$('span', el)};
  });

  var masks = $$('.mask-sec'), horiz = $$('.horiz'), cards = $$('.stack .card'), splits = $$('.swap'), bas = $$('.ba'), paras = $$('.para'), counts = $$('.count');
  var fmt = new Intl.NumberFormat('de-DE');
  var mqs = $$('.mq-in'), mqx = mqs.map(function(){return 0}), lastY = scrollY, vel = 0;
  mqs.forEach(function(m){m.innerHTML = m.innerHTML + m.innerHTML});

  var seqs = $$('.seq').map(function(sec){
    var cv = sec.querySelector('canvas'), ctx = cv.getContext('2d');
    var mob = innerWidth/innerHeight < .9, n = +sec.dataset.n, base = sec.dataset[mob?'m':'d'];
    var imgs = [], cur = -1;
    for (var k=1;k<=n;k++){ var im = new Image(); im.decoding='async'; im.src = base + ('00'+k).slice(-3) + '.webp'; imgs.push(im); }
    function size(){ var dpr=Math.min(devicePixelRatio||1,2); cv.width=innerWidth*dpr; cv.height=innerHeight*dpr; cur=-1; }
    size(); addEventListener('resize', size);
    return {sec:sec, draw:function(p){
      var i = Math.min(n-1, Math.round(p*(n-1)));
      while (i>0 && !(imgs[i].complete && imgs[i].naturalWidth)) i--;
      if (i===cur) return; var im = imgs[i]; if(!im.naturalWidth) return; cur=i;
      var s = Math.max(cv.width/im.naturalWidth, cv.height/im.naturalHeight), w=im.naturalWidth*s, h=im.naturalHeight*s;
      ctx.drawImage(im,(cv.width-w)/2,(cv.height-h)/2,w,h);
    }};
  });

  function frame(){
    var y = scrollY, H = root.scrollHeight - innerHeight;
    root.style.setProperty('--sp', (y/H).toFixed(4));
    document.body.classList.toggle('scrolled', y > 40);

    words.forEach(function(o){var n=Math.round(seg(prog(o.sec),.05,.8)*o.spans.length); o.spans.forEach(function(s,i){s.classList.toggle('on',i<n)})});
    seqs.forEach(function(s){var p=prog(s.sec); s.draw(seg(p,0,.9)); s.sec.style.setProperty('--p',p.toFixed(4))});
    masks.forEach(function(m){var p=prog(m); m.style.setProperty('--m',ease(seg(p,.05,.7)).toFixed(4)); m.style.setProperty('--mt',seg(p,.6,.85).toFixed(3))});
    horiz.forEach(function(h){var t=h.querySelector('.track'), max=t.scrollWidth-innerWidth+Math.min(innerWidth*.06,96); t.style.transform='translateX('+(-ease(seg(prog(h),.04,.96))*max).toFixed(1)+'px)'});
    cards.forEach(function(c,i){var nx=cards[i+1]; if(!nx||nx.parentNode!==c.parentNode) return; var r=nx.getBoundingClientRect(), t=clamp(1-(r.top-innerHeight*.2)/(innerHeight*.7)); c.style.setProperty('--cs',(1-t*.06).toFixed(4)); c.style.setProperty('--cb',(1-t*.4).toFixed(3))});
    splits.forEach(function(s){var st=$$('.st',s), im=$$('.swap-media > *',s), k=Math.min(st.length-1,Math.floor(seg(prog(s),.02,.98)*st.length)); st.forEach(function(e,i){e.classList.toggle('on',i===k)}); im.forEach(function(e,i){e.classList.toggle('on',i<=k)})});
    bas.forEach(function(b){var p=ease(seg(prog(b),.12,.82)); b.style.setProperty('--ba',p.toFixed(4))});
    paras.forEach(function(p){p.style.setProperty('--p',prog(p).toFixed(4))});
    counts.forEach(function(c){var r=c.getBoundingClientRect(), t=ease(clamp((innerHeight*.95-r.top)/(innerHeight*.5))); $$('[data-to]',c).forEach(function(b){b.textContent=fmt.format(Math.round(+b.dataset.to*t))+(b.dataset.suf||'')}); c.style.setProperty('--f',t.toFixed(3))});

    vel = vel*.9 + (y-lastY)*.1; lastY = y;
    mqs.forEach(function(m,i){var dir=i%2?1:-1, w=m.scrollWidth/2||1; mqx[i]+=dir*(.5+Math.abs(vel)*.3); if(mqx[i]<-w) mqx[i]+=w; if(mqx[i]>0) mqx[i]-=w; m.style.transform='translateX('+mqx[i].toFixed(1)+'px) skewX('+Math.max(-10,Math.min(10,-vel*.35)).toFixed(2)+'deg)'});
    requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}})},{threshold:.2, rootMargin:'0px 0px -8% 0px'});
  $$('.rv, .up').forEach(function(r){io.observe(r)});

  $$('video[data-src-m]').forEach(function(v){
    var src = innerWidth/innerHeight < .9 ? v.dataset.srcM : v.dataset.srcD;
    v.src = src; v.muted = true; v.playsInline = true;
    var tryPlay = function(){var p=v.play(); if(p&&p.catch) p.catch(function(){})};
    tryPlay(); addEventListener('touchstart', tryPlay, {once:true, passive:true});
  });
  $$('video[data-loop]').forEach(function(v){
    v.muted = true; v.playsInline = true;
    new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){var p=v.play(); if(p&&p.catch)p.catch(function(){})} else v.pause() })}).observe(v);
  });

  var tg = document.querySelector('.menu-btn');
  if (tg) tg.addEventListener('click', function(){document.body.classList.toggle('nav-open')});
  $$('.nav a').forEach(function(a){a.addEventListener('click',function(){document.body.classList.remove('nav-open')})});

  var f = document.querySelector('form[data-mail]');
  if (f) f.addEventListener('submit', function(e){
    e.preventDefault();
    var d = new FormData(f), body = [];
    d.forEach(function(v,k){ if(v) body.push(k+': '+v) });
    location.href = 'mailto:'+f.dataset.mail+'?subject='+encodeURIComponent(f.dataset.subject||'Anfrage')+'&body='+encodeURIComponent(body.join('\n'));
  });

  if (RM) { document.body.classList.add('ready'); words.forEach(function(o){o.spans.forEach(function(s){s.classList.add('on')})}); }
  requestAnimationFrame(frame);
})();
