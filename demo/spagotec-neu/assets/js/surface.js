/* Asphalt surface renderer: baked aggregate + crack field, lit in real time. */
(function () {
  'use strict';

  var BAKE = [
    'precision highp float;',
    'varying vec2 v;',
    'uniform vec2 R;',
    'uniform float P, S;',
    'vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}',
    'float h1(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+17.;a*=.5;}return s;}',
    'vec3 vor(vec2 p){vec2 i=floor(p),f=fract(p);float a=8.,b=8.;vec2 id=i;',
    ' for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 r=g+h2(i+g)*.9-f;',
    '  float d=dot(r,r);if(d<a){b=a;a=d;id=i+g;}else if(d<b)b=d;}',
    ' return vec3(sqrt(a),sqrt(b)-sqrt(a),h1(id+S));}',
    'float cy(float x){return .52+.13*sin(x*1.1+S)+(fbm(vec2(x*1.7,S))-.5)*.34+(n(vec2(x*9.,2.))-.5)*.025;}',
    'vec2 crack(vec2 w,float asp){',
    ' float y=cy(w.x),dy=(cy(w.x+.01)-y)/.01;',
    ' float d=abs(w.y-y)/sqrt(1.+dy*dy);',
    ' float bx=asp*.64;float by=cy(bx);',
    ' float t=clamp((by-w.y)/.42,0.,1.);',
    ' float bxx=bx+t*.22+(fbm(vec2(t*3.,S+4.))-.5)*.12;',
    ' float d2=abs(w.x-bxx)*1.1+step(w.y,by-.42)*9.+step(by,w.y)*9.;',
    ' return d2<d?vec2(d2,.64+t*.2):vec2(d,w.x/asp);}',
    'void main(){',
    ' float asp=R.x/R.y;vec2 w=vec2(v.x*asp,v.y);',
    ' vec2 q=w+vec2(fbm(w*7.),fbm(w*7.+5.))*.05;',
    ' vec3 a=vor(q*15.);vec3 b=vor(q*44.+7.);',
    ' float ra=.4+.16*a.z,rb=.3+.2*b.z;',
    ' float big=smoothstep(ra,ra*.35,a.x)*(.55+.45*a.z);',
    ' float fin=smoothstep(rb,rb*.3,b.x)*(.22+.2*b.z);',
    ' float hgt=max(big,fin)+fbm(w*120.)*.07;',
    ' vec2 c=crack(w,asp);',
    ' float wid=.006+.008*fbm(vec2(c.y*20.,S));',
    ' float groove=smoothstep(wid,wid*.35,c.x);',
    ' hgt*=1.-.55*smoothstep(wid*4.,wid,c.x);',
    ' hgt=mix(hgt,.0,groove);',
    ' if(P<.5){',
    '  float k=fract(a.z*17.);',
    '  vec3 st=mix(vec3(.13,.13,.14),vec3(.38,.37,.35),k*k);',
    '  st=mix(st,vec3(.36,.29,.25),step(.9,fract(a.z*31.))*.6);',
    '  st*=.75+.5*n(w*220.);',
    '  vec3 fn=mix(vec3(.1),vec3(.3),fract(b.z*13.));',
    '  vec3 col=mix(vec3(.028,.029,.03),big>fin?st:fn,smoothstep(.04,.2,hgt));',
    '  col*=1.-groove*.8;',
    '  gl_FragColor=vec4(col,clamp(hgt,0.,1.));',
    ' }else{',
    '  vec3 g=vor(w*62.+3.);',
    '  float peb=smoothstep(.42,.15,g.x)*step(.15,g.z);',
    '  gl_FragColor=vec4(clamp(c.x/.1,0.,1.),c.y,peb*(.55+.45*g.z),1.);',
    ' }',
    '}'
  ].join('\n');

  var DRAW = [
    'precision highp float;',
    'varying vec2 v;',
    'uniform sampler2D A, C;',
    'uniform vec2 R, L, K;',
    'uniform float T, F, Z, M;',
    'float h1(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}',
    'void main(){',
    ' vec2 uv=(v-.5)/(1.+Z*.08)+.5;',
    ' vec2 off=K*.012;vec2 cur=uv;float lay=0.;',
    ' for(int i=0;i<8;i++){float d=texture2D(A,cur).a;if(d>=1.-lay)break;lay+=.125;cur=uv+off*(lay-.5)*2.;}',
    ' vec4 al=texture2D(A,cur);vec4 cr=texture2D(C,cur);',
    ' vec2 px=1.5/R;',
    ' float hl=texture2D(A,cur-vec2(px.x,0.)).a,hr=texture2D(A,cur+vec2(px.x,0.)).a;',
    ' float hd=texture2D(A,cur-vec2(0.,px.y)).a,hu=texture2D(A,cur+vec2(0.,px.y)).a;',
    ' vec3 nr=normalize(vec3((hl-hr)*2.2,(hd-hu)*2.2,1.));',
    ' vec3 col=al.rgb;float gloss=.12,shin=18.;',
    ' float along=cr.g,dist=cr.r*.1;',
    ' float band=.034+.008*n(vec2(along*60.,1.));',
    ' vec3 emi=vec3(0.);',
    ' if(M<.5||M>2.5){',
    '  float on=step(along,F)*smoothstep(band,band*.85,dist);',
    '  float age=max(F-along,0.);',
    '  float heat=on*exp(-age*7.);',
    '  float grit=on*smoothstep(.1,.35,age)*smoothstep(.2,.5,cr.b);',
    '  vec3 sn=normalize(vec3((n(cur*R*.08)-.5)*.25,(n(cur*R*.08+9.)-.5)*.25,1.));',
    '  nr=normalize(mix(nr,sn,on));',
    '  col=mix(col,vec3(.015,.016,.017),on);',
    '  col=mix(col,vec3(.42,.41,.38)*(.6+.6*cr.b),grit);',
    '  gloss=mix(gloss,.95,on*(1.-grit));shin=mix(shin,70.,on);',
    '  emi=vec3(.7,.4,.2)*heat*heat*.45+vec3(.8,.66,.48)*pow(heat,6.)*.25;',
    '  emi+=vec3(.8,.5,.25)*smoothstep(band*1.8,band,dist)*step(along,F)*exp(-age*18.)*.15;',
    ' }',
    ' if(M>.5&&M<1.5){',
    '  float fx=F*1.25-.12+(n(vec2(uv.y*6.,T*.2))-.5)*.08;',
    '  float on=smoothstep(fx,fx-.015,uv.x);',
    '  nr=normalize(mix(nr,vec3(0.,0.,1.),on*.85));',
    '  col=mix(col,col*.35+vec3(.02,.025,.03),on);',
    '  gloss=mix(gloss,.8,on);shin=mix(shin,90.,on);',
    '  emi+=vec3(.2,.75,1.)*exp(-abs(uv.x-fx)*140.)*.5;',
    ' }',
    ' if(M>1.5&&M<2.5){',
    '  float line=smoothstep(.07,.065,abs(uv.y-.42))*(1.-step(.5,fract(uv.x*R.x/R.y*1.6)))*1.;',
    '  float fx=F*1.3-.15;',
    '  float gone=smoothstep(fx+.01,fx-.02,uv.x);',
    '  col=mix(col,vec3(.9,.9,.86)*(.85+.15*n(cur*R*.3)),line*(1.-gone)*step(.12,al.a));',
    '  float mist=exp(-abs(uv.x-fx)*18.)*(n(vec2(uv.x*40.-T*6.,uv.y*30.+T*9.))*.7+.3);',
    '  emi+=vec3(.75,.85,.9)*mist*smoothstep(.3,.0,abs(uv.y-.42))*.55;',
    '  nr=normalize(mix(nr,vec3(0.,0.,1.),gone*.2));gloss=mix(gloss,.55,gone*smoothstep(.25,0.,uv.x-fx+.25));',
    ' }',
    ' vec2 asp=vec2(R.x/R.y,1.);',
    ' vec3 ld=normalize(vec3((L-cur)*asp,.32));',
    ' float att=1./(1.+dot((L-cur)*asp,(L-cur)*asp)*1.6);',
    ' float dif=max(dot(nr,ld),0.);',
    ' float spc=pow(max(dot(reflect(-ld,nr),vec3(0.,0.,1.)),0.),shin)*gloss;',
    ' spc+=step(.97,fract(al.r*97.))*pow(dif,6.)*.35;',
    ' vec3 c=col*(.26+dif*1.4*att)+vec3(spc*att*1.4)+emi;',
    ' c*=1.-.55*pow(length((v-.5)*vec2(1.,1.2)),2.);',
    ' c+=(h1(v*R+fract(T))-.5)*.025;',
    ' gl_FragColor=vec4(pow(c,vec3(.95)),1.);',
    '}'
  ].join('\n');

  var VERT = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';

  function Surface(canvas, opts) {
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) { canvas.parentNode.classList.add('no-gl'); return; }
    this.gl = gl;
    var self = this;
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); self.lost = true; canvas.parentNode.classList.add('no-gl'); });
    this.canvas = canvas;
    this.mode = opts.mode || 0;
    this.seed = opts.seed || 3.1;
    this.duration = opts.duration || 6.5;
    this.delay = opts.delay || 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 1.25);
    var px = canvas.clientWidth * canvas.clientHeight * this.dpr * this.dpr;
    if (px > 2.4e6) this.dpr *= Math.sqrt(2.4e6 / px);
    this.light = [0.62, 0.66];
    this.target = [0.62, 0.66];
    this.tilt = [0, 0];
    this.pointer = null;
    this.scroll = 0;
    this.start = null;
    this.running = true;

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    this.bake = program(gl, BAKE);
    this.draw = program(gl, DRAW);
    this.texA = texture(gl);
    this.texC = texture(gl);
    this.fbo = gl.createFramebuffer();

    this.resize();
    this.bind();
    requestAnimationFrame(this.frame.bind(this));
  }

  Surface.prototype.resize = function () {
    var gl = this.gl, w = Math.round(this.canvas.clientWidth * this.dpr), h = Math.round(this.canvas.clientHeight * this.dpr);
    if (w === this.canvas.width && h === this.canvas.height) return;
    this.canvas.width = w;
    this.canvas.height = h;
    [this.texA, this.texC].forEach(function (t, i) {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.viewport(0, 0, w, h);
      gl.useProgram(this.bake);
      attrib(gl, this.bake);
      gl.uniform2f(gl.getUniformLocation(this.bake, 'R'), w, h);
      gl.uniform1f(gl.getUniformLocation(this.bake, 'P'), i);
      gl.uniform1f(gl.getUniformLocation(this.bake, 'S'), this.seed);
      gl.enable(gl.SCISSOR_TEST);
      for (var y = 0; y < h; y += 96) {
        gl.scissor(0, y, w, 96);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();
      }
      gl.disable(gl.SCISSOR_TEST);
    }, this);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  Surface.prototype.bind = function () {
    var self = this, timer;
    window.addEventListener('pointermove', function (e) {
      var r = self.canvas.getBoundingClientRect();
      self.pointer = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
      self.idle = 0;
    }, { passive: true });
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { self.resize(); }, 180);
    });
    window.addEventListener('scroll', function () {
      self.scroll = Math.min(window.scrollY / window.innerHeight, 1.2);
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
      }).observe(this.canvas);
    }
    this.visible = true;
  };

  Surface.prototype.play = function () { this.start = performance.now() + this.delay * 1000; };

  Surface.prototype.frame = function (now) {
    if (this.lost) return;
    requestAnimationFrame(this.frame.bind(this));
    if (!this.visible || document.hidden || this.start === null) return;
    var gl = this.gl, t = now / 1000;
    this.idle = (this.idle || 0) + 1;

    if (this.pointer && this.idle < 240) {
      this.target = [this.pointer[0], this.pointer[1]];
    } else {
      this.target = [0.55 + Math.cos(t * 0.23) * 0.28, 0.58 + Math.sin(t * 0.31) * 0.22];
    }
    this.light[0] += (this.target[0] - this.light[0]) * 0.05;
    this.light[1] += (this.target[1] - this.light[1]) * 0.05;
    this.tilt[0] += ((this.light[0] - 0.5) - this.tilt[0]) * 0.06;
    this.tilt[1] += ((this.light[1] - 0.5) - this.tilt[1]) * 0.06;

    var fill = this.start === null ? 0 : Math.max(0, (now - this.start) / 1000 / this.duration);
    fill = Math.min(fill, 1.08);
    this.fill = fill;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.draw);
    attrib(gl, this.draw);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texA);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texC);
    var u = function (n) { return gl.getUniformLocation(this.draw, n); }.bind(this);
    gl.uniform1i(u('A'), 0);
    gl.uniform1i(u('C'), 1);
    gl.uniform2f(u('R'), this.canvas.width, this.canvas.height);
    gl.uniform2f(u('L'), this.light[0], this.light[1]);
    gl.uniform2f(u('K'), this.tilt[0], this.tilt[1]);
    gl.uniform1f(u('T'), t);
    gl.uniform1f(u('F'), easeFill(fill));
    gl.uniform1f(u('Z'), this.scroll);
    gl.uniform1f(u('M'), this.mode);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  function easeFill(x) { return x < 1 ? 1 - Math.pow(1 - x, 1.6) : x; }

  function program(gl, fs) {
    var p = gl.createProgram();
    [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, fs]].forEach(function (s) {
      var sh = gl.createShader(s[0]);
      gl.shaderSource(sh, s[1]);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
      gl.attachShader(p, sh);
    });
    gl.linkProgram(p);
    return p;
  }

  function attrib(gl, p) {
    var loc = gl.getAttribLocation(p, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  function texture(gl) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  window.Surface = Surface;
})();
