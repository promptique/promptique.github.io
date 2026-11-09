function z(){const r=matchMedia("(prefers-reduced-motion: reduce)").matches,e=document.querySelectorAll(".rv");if(!("IntersectionObserver"in window)||r)e.forEach(a=>a.classList.add("in"));else{const a=new IntersectionObserver(c=>c.forEach(n=>{n.isIntersecting&&(n.target.classList.add("in"),a.unobserve(n.target))}),{rootMargin:"0px 0px -8% 0px"});e.forEach(c=>a.observe(c))}const s=document.querySelector(".nav"),o=()=>s?.classList.toggle("is-solid",scrollY>30);addEventListener("scroll",o,{passive:!0}),o()}const L=`#version 300 es
precision highp float;
uniform vec2 uR;uniform float uT;uniform vec2 uM;uniform int uShape;out vec4 o;
mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm3(vec3 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}
float sdRB(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float sdEl(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/k1;}
float sdCap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float OPEN(){return .5+.06*sin(uT*.9);}
vec3 rot(vec3 p){p.y-=sin(uT*.8)*.05;
  if(uShape==0){p.xz*=r2(-.62+sin(uT*.22)*.32+uM.x*.4);p.yz*=r2(-.36+uM.y*.22);}
  else{p.xz*=r2(uT*.28+uM.x*.5);p.yz*=r2(-.2+uM.y*.25);}
  return p;}
/* chest: lid in hinge space */
vec3 lidP(vec3 q){vec3 l=q-vec3(0,.1,-.58);l.yz*=r2(OPEN());return l;}
float lidD(vec3 l){vec2 c=vec2(l.y*1.25,l.z-.58);float d=(length(c)-.58)/1.25;d=max(d,-l.y+.0);d=max(d,abs(l.x)-.96);return d;}
float bodyD(vec3 q){return sdRB(q-vec3(0,-.27,0),vec3(.96,.36,.6),.05);}
float brainD(vec3 q){
  vec3 a=vec3(abs(q.x),q.y,q.z);
  float d=sdEl(a-vec3(.42,.12,.05),vec3(.58,.62,.98));
  float c=sdEl(a-vec3(.2,-.5,-.78),vec3(.42,.27,.3));
  d=smin(d,c,.18);
  d=smin(d,sdCap(a,vec3(.0,-.35,-.4),vec3(.0,-.95,-.3),.13),.2);
  float f=fbm3(q*2.5+vec3(0,0,3.));float g=abs(fract(f*4.6)-.5);
  d+=.075*(1.-smoothstep(.0,.2,g))-.03+.14*exp(-pow(q.x/.045,2.))*smoothstep(-.45,.1,q.y);
  return d*.8;}
vec2 map(vec3 p){
  vec3 q=rot(p);float bd=length(q)-1.55;if(bd>.3)return vec2(bd,1.);
  if(uShape==0){float b=bodyD(q);float l=lidD(lidP(q));return b<l?vec2(b,1.):vec2(l,2.);}
  return vec2(brainD(q),3.);}
vec3 nrm(vec3 p){vec2 e=vec2(.0015,0);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
vec3 env(vec3 r){
  vec3 c=mix(vec3(.01,.012,.03),vec3(.05,.08,.22),smoothstep(-.4,.7,r.y));
  float box=smoothstep(.45,.62,r.y)*(1.-smoothstep(.45,.7,abs(r.x)))*(1.-smoothstep(.5,.8,abs(r.z)));
  c+=vec3(1.,.93,.8)*box*3.;
  c+=vec3(.3,.45,1.)*exp(-pow((r.x-.78)/.14,2.))*smoothstep(-.5,.3,r.y)*1.8;
  c+=vec3(1.,.8,.4)*exp(-pow((r.x+.86)/.1,2.))*smoothstep(-.3,.4,r.y)*1.3;
  return c;}
vec3 envW(vec3 r){
  vec3 c=mix(vec3(.01,.01,.012),vec3(.09,.085,.08),smoothstep(-.5,.8,r.y));
  float box=smoothstep(.4,.62,r.y)*(1.-smoothstep(.4,.75,abs(r.x)))*(1.-smoothstep(.4,.8,abs(r.z)));
  c+=vec3(1.,.97,.9)*box*3.4;
  c+=vec3(1.,.78,.36)*exp(-pow((r.x+.82)/.12,2.))*smoothstep(-.4,.4,r.y)*2.2;
  c+=vec3(.9,.92,1.)*exp(-pow((r.x-.85)/.16,2.))*smoothstep(-.4,.4,r.y)*.9;
  return c;}
float spec(vec3 n,vec3 v,vec3 l,float rough){vec3 h=normalize(l+v);float a=rough*rough,nh=max(dot(n,h),0.),d=nh*nh*(a*a-1.)+1.;return a*a/(3.14*d*d);}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;
  vec3 ro=vec3(0,0,uShape==0?7.0:6.5),rd=normalize(vec3(uv,-1.75));
  float t=0.;vec2 h=vec2(1.);bool hit=false;
  for(int i=0;i<72;i++){h=map(ro+rd*t);if(h.x<.001){hit=true;break;}t+=h.x*.85;if(t>9.)break;}
  vec3 col=vec3(0);float a=0.;
  vec3 L1=normalize(vec3(-.6,.9,.7)),L2=normalize(vec3(.9,.2,-.6));
  if(hit){vec3 p=ro+rd*t,n=nrm(p),v=-rd,r=reflect(rd,n);float nv=max(dot(n,v),0.);vec3 q=rot(p);
    float F=.04+.96*pow(1.-nv,5.);
    if(uShape==0){
      vec3 l=lidP(q);bool lid=h.y>1.5;vec3 lp=lid?l:q;
      float grain=vn(vec3(lp.x*3.,lp.y*28.,lp.z*5.))*.5+vn(lp*9.)*.3;
      vec3 wood=vec3(.016,.035,.14)*(.7+grain*.9);
      float band=1.-smoothstep(.05,.075,abs(abs(lp.x)-.6));
      float trim=lid?(1.-smoothstep(.0,.03,abs(l.y)-.0))*0.:(1.-smoothstep(.0,.025,abs(q.y+.62)));
      float edge=lid?(1.-smoothstep(.04,.07,abs(l.z-1.1))):0.;
      float lockp=(1.-smoothstep(.12,.16,abs(q.x)))*(1.-smoothstep(.0,.04,abs(q.z-.6)-.0))*step(-.2,q.y)*step(q.y,.1)*(lid?0.:1.);
      float gold=clamp(band+trim+lockp,0.,1.);
      vec3 gcol=vec3(1.,.72,.22);
      vec3 base=mix(wood,gcol*.55,gold);
      float rough=mix(.34,.2,gold);
      col=base*(.3+.9*max(dot(n,L1),0.))+mix(env(r)*(.04+.96*pow(1.-nv,4.))*1.0,envW(r)*gcol*.9,gold)+spec(n,v,L1,rough)*mix(vec3(.5,.6,1.),gcol,gold)*.25+spec(n,v,L2,.4)*vec3(.3,.45,1.)*.1;
      /* treasure glow inside, visible through the gap */
      if(!lid&&q.y>.07){float k=1.-smoothstep(.5,.95,abs(q.x))*0.6;float c=vn(vec3(q.x*9.,q.z*9.,uT*.6));
        col=vec3(1.,.62,.15)*(1.2+c*1.6)*k+vec3(1.,.9,.5)*pow(c,6.)*2.;}
      if(lid&&l.y<.03&&l.z>.05){col=vec3(.35,.17,.03)+vec3(1.,.6,.2)*.35*pow(max(0.,1.-length(q.xz)/1.2),2.);}
    }else{
      vec3 qq=vec3(abs(q.x),q.y,q.z);
      float f=fbm3(q*2.5+vec3(0,0,3.));float g=abs(fract(f*4.6)-.5);
      float groove=1.-smoothstep(.0,.2,g);
      vec3 ivory=vec3(.95,.9,.8),gold=vec3(1.,.7,.2);
      vec3 base=mix(ivory,gold*.8,groove*.9);
      col=base*(.22+.85*max(dot(n,L1),0.)+.25*max(dot(n,L2),0.))*(1.-.5*groove)+envW(r)*(.03+.9*F)*mix(vec3(1.),gold,groove)+spec(n,v,L1,.28)*vec3(1.,.95,.85)*.35+gold*groove*.18*pow(nv,.5);
    }
    col=col/(1.+col);col=pow(col,vec3(.9));a=1.;
  }
  if(uShape==0){
    vec3 gp=ro;vec3 c0=vec3(0,0,0);
    vec3 m=rot(vec3(0));
    /* warm bloom and floating sparks above the open chest (in view space, follows rotation) */
    float s=0.;
    for(int i=0;i<9;i++){float fi=float(i);float ph=fract(uT*.16+fi*.113);
      vec3 mp=vec3(sin(fi*2.3+uT*.4)*.5,.15+ph*1.35,cos(fi*1.7+uT*.3)*.35);
      /* rotate mote by inverse of the object rotation so it stays above the chest */
      vec3 w=mp;w.yz*=r2(.36-uM.y*.22);w.xz*=r2(.62-sin(uT*.22)*.32-uM.x*.4);w.y+=sin(uT*.8)*.05;
      float d=length(cross(rd,w-ro));s+=(.0009/(d*d+.0006))*(1.-ph)*smoothstep(.0,.1,ph);}
    vec3 cen=vec3(0,.28,0);cen.yz*=r2(.36-uM.y*.22);cen.xz*=r2(.62-sin(uT*.22)*.32-uM.x*.4);
    float dg=length(cross(rd,cen-ro));float bloom=.1/(dg*dg+.22);
    vec3 gl=vec3(1.,.7,.25)*(s*.9+bloom*.55);
    if(a<.5)col+=gl;else col+=gl*.35;
    a=max(a,clamp(max(max(gl.r,gl.g),gl.b),0.,1.));
    col=col/(1.+col*.2);
  }
  o=vec4(col,a);}`,S=`#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0,1);}`;function A(){document.querySelectorAll("canvas[data-orb]").forEach(r=>{const e=r.getContext("webgl2",{premultipliedAlpha:!0,alpha:!0,antialias:!1});if(!e){r.closest(".orb")?.classList.add("orb--fallback");return}const s=(t,i)=>{const l=e.createShader(t);return e.shaderSource(l,i),e.compileShader(l),e.getShaderParameter(l,e.COMPILE_STATUS)||console.error(e.getShaderInfoLog(l)),l},o=e.createProgram();if(e.attachShader(o,s(e.VERTEX_SHADER,S)),e.attachShader(o,s(e.FRAGMENT_SHADER,L)),e.bindAttribLocation(o,0,"p"),e.linkProgram(o),!e.getProgramParameter(o,e.LINK_STATUS)){r.closest(".orb")?.classList.add("orb--fallback");return}e.useProgram(o);const a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const c=e.getUniformLocation(o,"uR"),n=e.getUniformLocation(o,"uT"),g=e.getUniformLocation(o,"uM"),y=e.getUniformLocation(o,"uShape");e.uniform1i(y,r.dataset.orb==="mind"?1:0);const q=matchMedia("(prefers-reduced-motion: reduce)").matches;let v=0,f=0,d=!0,p=0,m=0,h=0,u=0;const x=()=>{const t=r.getBoundingClientRect(),i=Math.min(innerWidth<760?1.15:1.3,devicePixelRatio||1);v=r.width=Math.max(2,Math.round(t.width*i)),f=r.height=Math.max(2,Math.round(t.height*i)),e.viewport(0,0,v,f)};x(),addEventListener("resize",x),new IntersectionObserver(t=>{d=t[0].isIntersecting}).observe(r),addEventListener("pointermove",t=>{h=(t.clientX/innerWidth-.5)*2,u=(t.clientY/innerHeight-.5)*2},{passive:!0});const w=performance.now(),b=t=>{requestAnimationFrame(b),d&&(p+=(h-p)*.05,m+=(u-m)*.05,e.uniform2f(c,v,f),e.uniform1f(n,q?6:(t-w)/1e3),e.uniform2f(g,p,m),e.drawArrays(e.TRIANGLES,0,3))};requestAnimationFrame(b)})}z();A();
