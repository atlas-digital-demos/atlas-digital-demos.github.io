/* Atlas Kit · intro-fire v1
   Cinematic opening: the camera flies through a wood-fire tunnel, embers rise,
   the wordmark ignites, then the flame opens into the site.
   Zero dependencies (raw WebGL). Config via data-attributes on the script tag:
   data-word, data-sub, data-accent, data-font, data-once (session), data-dur */
(function(){
  var s=document.currentScript||{}; var d=(s.dataset)||{};
  var WORD=d.word||'Peperoncino', SUB=d.sub||'', FONT=d.font||'Fraunces, Georgia, serif';
  var DUR=+(d.dur||3.4), ONCE=d.once!=='false', KEY='atl-intro:'+location.pathname;
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{ if(ONCE&&sessionStorage.getItem(KEY)&&!/introT=/.test(location.search)) return; }catch(e){}
  if(rm) return;
  var root=document.documentElement;
  var el=document.createElement('div'); el.id='atl-intro';
  el.innerHTML='<canvas></canvas><div class="ai-word" aria-hidden="true"></div><div class="ai-sub"></div><button class="ai-skip" type="button">Überspringen</button>';
  var css=document.createElement('style');
  css.textContent='#atl-intro{position:fixed;inset:0;z-index:2147483000;background:#070302;overflow:hidden;will-change:opacity,transform}'+
  '#atl-intro canvas{position:absolute;inset:0;width:100%;height:100%;display:block}'+
  '#atl-intro .ai-word{position:absolute;left:0;right:0;top:50%;transform:translateY(-58%);text-align:center;font:400 clamp(50px,12vw,176px)/1 '+FONT+';letter-spacing:-.01em;font-variation-settings:"opsz" 72;color:#fff6e8;white-space:nowrap;pointer-events:none}'+
  '#atl-intro .ai-word span{display:inline-block;opacity:0;filter:blur(14px);transform:translateY(.25em) scale(1.25);text-shadow:0 0 28px rgba(255,140,40,.85),0 0 80px rgba(255,70,10,.55)}'+
  '#atl-intro .ai-sub{position:absolute;left:0;right:0;top:50%;margin-top:clamp(38px,7vw,110px);text-align:center;font:500 12px/1 system-ui,sans-serif;letter-spacing:.42em;text-transform:uppercase;color:#ffd9b0;opacity:0;pointer-events:none}'+
  '#atl-intro .ai-skip{position:absolute;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));background:none;border:1px solid rgba(255,230,200,.25);color:rgba(255,230,200,.7);font:500 11px/1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;padding:10px 14px;border-radius:99px;cursor:pointer}'+
  'html.atl-intro-on body{overflow:hidden}';
  document.head.appendChild(css);
  function mount(){ document.body.appendChild(el); root.classList.add('atl-intro-on'); start(); }
  if(document.body) mount(); else document.addEventListener('DOMContentLoaded',mount);

  var word=el.querySelector('.ai-word'), sub=el.querySelector('.ai-sub');
  word.innerHTML=WORD.split('').map(function(c){return '<span>'+(c===' '?'&nbsp;':c)+'</span>'}).join('');
  sub.textContent=SUB;
  var spans=word.querySelectorAll('span');

  var FS='precision highp float;uniform vec2 R;uniform float T,P,O;'+
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}'+
  'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}'+
  'vec3 ramp(float x){x=clamp(x,0.,1.);return mix(mix(vec3(.02,.005,0.),vec3(.55,.06,.01),smoothstep(0.,.35,x)),mix(vec3(1.,.38,.05),vec3(1.,.93,.7),smoothstep(.7,1.,x)),smoothstep(.3,.75,x));}'+
  'void main(){vec2 uv=(gl_FragCoord.xy-.5*R)/min(R.x,R.y);'+
  'float sp=1.+P*P*9.;float r=length(uv),a=atan(uv.y,uv.x);'+
  'float z=.35/(r+.04)+T*sp*.9;'+
  'vec2 q=vec2(a*2.387,z);float f=fbm(q*vec2(1.,1.4)+vec2(0.,-T*1.6));f+=.5*fbm(q*2.1-vec2(T*.7,T*2.3));'+
  'float wall=smoothstep(.05,.9,r)*(1.-smoothstep(1.1,1.9,r));'+
  'float core=1.-smoothstep(0.,.18+P*1.2,r);float heat=pow(f,1.6)*wall*(.28+.8*P)+core*(.2+P*1.1);heat=heat*(.55+.45*P);'+
  'heat*=smoothstep(0.,.35,T);'+
  'vec3 c=ramp(heat);'+
  /* embers */
  'vec2 g=uv*vec2(14.,9.)+vec2(0.,T*2.2);vec2 id=floor(g);vec2 fp=fract(g)-.5;float e=h(id);'+
  'vec2 off=vec2(h(id+3.)-.5,h(id+7.)-.5)*.6;float d=length(fp-off);'+
  'c+=vec3(1.,.55,.15)*smoothstep(.09,0.,d)*step(.82,e)*(.6+.4*sin(T*9.+e*40.));'+
  'c*=1.-.55*smoothstep(.6,1.6,length(uv*vec2(.8,1.)));'+
  'c=mix(c,vec3(1.,.72,.38),smoothstep(.9,1.,P)*.85);'+
  'gl_FragColor=vec4(c*O,1.);}';
  var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  function start(){
    var cv=el.querySelector('canvas'); var gl=cv.getContext('webgl',{antialias:false,alpha:false,powerPreference:'high-performance'});
    var t0=performance.now(), done=false;
    el.querySelector('.ai-skip').onclick=finish; el.addEventListener('click',function(e){ if(e.target.className!=='ai-skip') finish(); });
    var draw=function(){};
    if(gl){
      function sh(t,src){var o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return o;}
      var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
      var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
      var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      var uR=gl.getUniformLocation(pr,'R'),uT=gl.getUniformLocation(pr,'T'),uP=gl.getUniformLocation(pr,'P'),uO=gl.getUniformLocation(pr,'O');
      var dpr=Math.min(window.devicePixelRatio||1, innerWidth<700?1.25:1.5);
      function size(){cv.width=innerWidth*dpr*.75;cv.height=innerHeight*dpr*.75;gl.viewport(0,0,cv.width,cv.height);}
      size(); addEventListener('resize',size);
      draw=function(t,p,o){gl.uniform2f(uR,cv.width,cv.height);gl.uniform1f(uT,t);gl.uniform1f(uP,p);gl.uniform1f(uO,o);gl.drawArrays(gl.TRIANGLES,0,3);};
    }
    function ease(x){return x<0?0:x>1?1:x*x*(3-2*x);}
    function frame(now){
      if(done) return;
      var t=(now-t0)/1000; var fz=/introT=([\d.]+)/.exec(location.search); if(fz){t=+fz[1];}
      var travel=ease((t-.2)/(DUR-.5));
      draw(t, travel, ease(t/.5));
      for(var i=0;i<spans.length;i++){
        var k=ease((t-.75-i*.055)/.7), s=spans[i].style;
        var out=ease((t-(DUR-.75))/.5);
        s.opacity=(k*(1-out)).toFixed(3); s.filter='blur('+((1-k)*14+out*10).toFixed(1)+'px)';
        s.transform='translateY('+((1-k)*.25).toFixed(3)+'em) scale('+(1.25-.25*k+out*.35).toFixed(3)+')';
      }
      sub.style.opacity=(ease((t-1.5)/.6)*(1-ease((t-(DUR-.7))/.4))).toFixed(3);
      if(t>=DUR&&!fz) return finish();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function finish(){
    if(el.dataset.out) return; el.dataset.out=1;
    try{ sessionStorage.setItem(KEY,'1'); }catch(e){}
    el.style.transition='opacity .75s cubic-bezier(.4,0,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)';
    el.style.opacity='0'; el.style.transform='scale(1.35)';
    root.classList.remove('atl-intro-on');
    setTimeout(function(){ el.remove(); css.remove(); }, 950);
  }
})();
