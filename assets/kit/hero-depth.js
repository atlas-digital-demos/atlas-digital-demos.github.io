/* Atlas Kit · hero-depth v1
   Turns a hero photo into a living 3D scene: AI depth map -> parallax camera
   (pointer, gyro, idle drift, scroll dolly), flickering fire light, heat haze,
   embers floating at real depths. Zero dependencies (raw WebGL).
   <script src="/assets/kit/hero-depth.js" data-hero=".pc-hero" data-img="/sites/x/hero.webp"
     data-depth="/sites/x/hero-depth.png" data-strength="0.035" data-fire="1" defer></script> */
(function(){
  var s=document.currentScript||{}, d=s.dataset||{};
  var SEL=d.hero||'.pc-hero', IMG=d.img, DEP=d.depth, STR=+(d.strength||0.035), FIRE=d.fire!=='0';
  if(!IMG||!DEP) return;
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var VS='attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  var FS='precision highp float;varying vec2 v;uniform sampler2D I,D;uniform vec2 R,S;uniform vec3 C;uniform float T,F;'+
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}'+
  'vec2 cover(vec2 u){vec2 r=vec2(min((R.x/R.y)/(S.x/S.y),1.),min((R.y/R.x)/(S.y/S.x),1.));return u*r+(1.-r)*.5;}'+
  'void main(){vec2 uv=cover(vec2(v.x,1.-v.y));'+
  'float z=C.z;uv=(uv-.5)/(1.06+z*.10)+.5;'+
  /* steep parallax: march toward the viewer until depth matches */
  'vec2 off=C.xy*'+STR.toFixed(4)+';vec2 cur=uv;float lay=0.;'+
  'for(int i=0;i<14;i++){float dd=texture2D(D,cur).r;float target=1.-lay;if(dd>=target)break;lay+=1./14.;cur=uv+off*(lay-.5)*2.;}'+
  'float dep=texture2D(D,cur).r;'+
  /* scroll dolly: near things grow faster */
  'cur=(cur-.5)/(1.+z*.12*dep)+.5;'+
  'vec3 col=texture2D(I,cur).rgb;'+
  (FIRE?
  'float lum=dot(col,vec3(.3,.59,.11));float fire=smoothstep(.45,.85,col.r)*smoothstep(.05,.35,col.r-col.b)*(1.-dep);'+
  'float fl=n(vec2(T*3.1,cur.y*6.))*.6+n(vec2(T*7.3,cur.x*9.))*.4;'+
  'col*=1.+fire*(fl-.35)*.9;'+
  /* warm light spill that breathes with the fire */
  'col+=vec3(.10,.035,.0)*(n(vec2(T*1.7,1.))-.4)*smoothstep(.9,.2,length((cur-vec2(.38,.82))*vec2(1.,1.6)));'+
  /* heat haze above flames */
  'vec2 hz=vec2(n(vec2(cur.x*30.,cur.y*20.-T*4.))-.5,0.)*.004*fire;col=mix(col,texture2D(I,cur+hz+vec2(0.,.004)).rgb*1.08,fire*.5);'
  :'')+
  /* embers at three depths, parallaxed by their depth */
  'for(int k=0;k<3;k++){float L=float(k);float pz=.3+L*.3;vec2 q=(vec2(v.x,1.-v.y)+C.xy*'+STR.toFixed(4)+'*pz*2.)*vec2(R.x/R.y,1.)*(7.+L*5.);'+
  'q.y+=T*(.25+L*.18);q.x+=sin(q.y*.7+L)*.3;vec2 id=floor(q);vec2 f=fract(q)-.5;float e=h(id+L*17.);'+
  'vec2 o=vec2(h(id+3.)-.5,h(id+9.)-.5)*.7;float dd=length(f-o);float tw=.5+.5*sin(T*(3.+e*5.)+e*50.);'+
  'col+=vec3(1.,.5,.15)*smoothstep(.07-L*.015,0.,dd)*step(.9,e)*tw*(.7-L*.15)*smoothstep(.0,.35,1.-v.y+.1);}'+
  'col*=mix(.82,1.,smoothstep(1.2,.3,length((v-.5)*vec2(1.2,1.))));'+
  'col+=(h(v*R+fract(T)*91.)-.5)*.03;'+
  'gl_FragColor=vec4(col*F,1.);}';

  function init(hero){
    if(!hero||hero.__atlDepth) return; hero.__atlDepth=1;
    var cv=document.createElement('canvas'); cv.className='atl-hero-depth';
    cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0;transition:opacity .8s';
    var gl=cv.getContext('webgl',{antialias:false,alpha:false,powerPreference:'high-performance'}); if(!gl) return;
    function sh(t,src){var o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.warn(gl.getShaderInfoLog(o));return o;}
    var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
    var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    var U={};['I','D','R','S','C','T','F'].forEach(function(k){U[k]=gl.getUniformLocation(pr,k);});
    function tex(unit,img){var t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);}
    var im=new Image(), dm=new Image(), got=0; im.decoding=dm.decoding='async';
    function ready(){ if(++got<2) return;
      tex(0,im);tex(1,dm);gl.uniform1i(U.I,0);gl.uniform1i(U.D,1);gl.uniform2f(U.S,im.naturalWidth,im.naturalHeight);
      var ref=hero.querySelector('.pc-hero-img'); (ref&&ref.nextSibling)?hero.insertBefore(cv,ref.nextSibling):hero.prepend(cv);
      [].forEach.call(hero.querySelectorAll('canvas'),function(c){ if(c!==cv && !c.closest('.pep-chili,.pc-chili')) c.style.visibility='hidden'; });
      size(); addEventListener('resize',size); requestAnimationFrame(loop); setTimeout(function(){cv.style.opacity=1;},30);
    }
    im.onload=dm.onload=ready; im.src=IMG; dm.src=DEP;
    var dpr=Math.min(devicePixelRatio||1,innerWidth<700?1.5:1.25);
    function size(){var r=hero.getBoundingClientRect();cv.width=Math.max(2,r.width*dpr|0);cv.height=Math.max(2,r.height*dpr|0);gl.viewport(0,0,cv.width,cv.height);}
    var tx=0,ty=0,cx=0,cy=0,vis=true,t0=performance.now(),last=t0,gyro=false;
    addEventListener('pointermove',function(e){tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2;last=performance.now();},{passive:true});
    addEventListener('deviceorientation',function(e){if(e.gamma==null)return;gyro=true;tx=Math.max(-1,Math.min(1,e.gamma/25));ty=Math.max(-1,Math.min(1,(e.beta-45)/25));},{passive:true});
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){vis=es[0].isIntersecting; if(vis) requestAnimationFrame(loop);}).observe(hero);
    var running=false;
    function loop(now){ if(!cv.isConnected&&got>=2){return;} if(!vis){running=false;return;} running=true;
      var t=(now-t0)/1000, idle=(now-last)>2500&&!gyro;
      var ax=idle?Math.sin(t*.31)*.55:tx, ay=idle?Math.sin(t*.23+1.3)*.35:ty;
      if(rm){ax=ay=0;}
      cx+=(ax-cx)*.05; cy+=(ay-cy)*.05;
      var sc=Math.min(1,Math.max(0,scrollY/(hero.offsetHeight||1)));
      gl.uniform2f(U.R,cv.width,cv.height);gl.uniform3f(U.C,cx,-cy,sc);gl.uniform1f(U.T,rm?0:t);gl.uniform1f(U.F,1);
      gl.drawArrays(gl.TRIANGLES,0,3);
      requestAnimationFrame(loop);
    }
  }
  function scan(){ var h=document.querySelector(SEL); if(h) init(h); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(scan,50);}); else setTimeout(scan,50);
  new MutationObserver(function(){ var h=document.querySelector(SEL); if(h&&!h.__atlDepth) setTimeout(scan,60); }).observe(document.documentElement,{childList:true,subtree:true});
})();
