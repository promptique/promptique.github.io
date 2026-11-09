function A(){const r=matchMedia("(prefers-reduced-motion: reduce)").matches,e=document.querySelectorAll(".rv");if(!("IntersectionObserver"in window)||r)e.forEach(a=>a.classList.add("in"));else{const a=new IntersectionObserver(c=>c.forEach(n=>{n.isIntersecting&&(n.target.classList.add("in"),a.unobserve(n.target))}),{rootMargin:"0px 0px -8% 0px"});e.forEach(c=>a.observe(c))}const s=document.querySelector(".nav"),t=()=>s?.classList.toggle("is-solid",scrollY>30);addEventListener("scroll",t,{passive:!0}),t()}const R=`#version 300 es
precision highp float;
uniform vec2 uR;uniform float uT;uniform vec2 uM;uniform int uShape;out vec4 o;
mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}
float sdRB(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
vec3 rot(vec3 p){p.y-=sin(uT*.8)*.06;p.xz*=r2(.5+sin(uT*.25)*.7+uM.x*.45);p.yz*=r2(-.42+uM.y*.3);p.xy*=r2(.18+.1*sin(uT*.3));return p;}
vec3 sat(){float a=uT*.6;return vec3(cos(a)*1.75,.35+sin(uT*.9)*.15,sin(a)*1.75);}
/* returns distance, material id in y */
vec2 map(vec3 p){
  if(uShape==0){vec3 q=rot(p);float d=sdRB(q,vec3(1.08,.6,.62),.54);vec3 s=p-sat();float d2=length(s)-.2;return d<d2?vec2(d,1.):vec2(d2,2.);}
  vec3 q=rot(p);float d=length(q)-1.05-.035*sin(uT*.9)-.025*fbm(q*2.2+uT*.12);return vec2(d,3.);}
vec3 nrm(vec3 p){vec2 e=vec2(.0012,0);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
vec3 env(vec3 r){
  vec3 c=mix(vec3(.006,.008,.03),vec3(.03,.06,.2),smoothstep(-.4,.7,r.y));
  float box=smoothstep(.45,.62,r.y)*(1.-smoothstep(.45,.7,abs(r.x)))*(1.-smoothstep(.5,.8,abs(r.z)));
  c+=vec3(.85,.9,1.)*box*3.2;                                                         /* top softbox */
  c+=vec3(.2,.38,1.)*exp(-pow((r.x-.78)/.14,2.))*smoothstep(-.5,.3,r.y)*2.4;           /* cobalt strip right */
  c+=vec3(.78,1.,.2)*exp(-pow((r.x+.86)/.1,2.))*smoothstep(-.3,.4,r.y)*1.1;           /* lime kicker left */
  c+=vec3(.5,.6,1.)*exp(-pow((r.z+.95)/.25,2.))*.35;                                    /* back fill */
  return c;}
float spec(vec3 n,vec3 v,vec3 l,float rough){vec3 h=normalize(l+v);float a=rough*rough,nh=max(dot(n,h),0.),d=nh*nh*(a*a-1.)+1.;return a*a/(3.14*d*d);}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;
  vec3 ro=vec3(0,0,4.6),rd=normalize(vec3(uv,-1.75));
  float t=0.;vec2 h;bool hit=false;
  for(int i=0;i<96;i++){h=map(ro+rd*t);if(h.x<.0008){hit=true;break;}t+=h.x*.9;if(t>9.)break;}
  vec3 col=vec3(0);float a=0.;
  if(hit){vec3 p=ro+rd*t,n=nrm(p),v=-rd,r=reflect(rd,n);float nv=max(dot(n,v),0.);
    vec3 L1=normalize(vec3(-.6,.9,.7)),L2=normalize(vec3(.9,.2,-.6));
    float F=.04+.96*pow(1.-nv,5.);
    if(h.y<1.5){ /* cobalt lacquer pebble */
      vec3 q=rot(p);vec3 base=vec3(.02,.05,.2);
      float Fc=.06+.94*pow(1.-nv,4.);col=base*(.35+.9*max(dot(n,L1),0.))+env(r)*Fc*1.05+env(reflect(rd,normalize(n+.0)))*.02+spec(n,v,L1,.32)*vec3(.9,.95,1.)*.12+spec(n,v,L2,.4)*vec3(.3,.45,1.)*.12;
      float seam=1.-smoothstep(.006,.02,abs(q.y-.02));col=mix(col,vec3(.03,.04,.06),seam*.6);
      float glow=(1.-smoothstep(.0,.012,abs(q.y-.02)))*smoothstep(.2,.9,abs(q.x)+abs(q.z));
      float slit=(1.-smoothstep(.0,.02,abs(q.y+.2)))*(1.-smoothstep(.16,.2,abs(q.x)))*step(.5,q.z);
      col+=vec3(.78,1.,.12)*(glow*1.4+slit*2.2);
    }else if(h.y<2.5){ /* lime satellite */
      col=vec3(.5,.75,.05)*(.2+.8*max(dot(n,L1),0.))+env(r)*F+spec(n,v,L1,.15)*.5;
    }else{ /* mind sphere: cobalt glass with thought-lines */
      vec3 q=rot(p);
      col=vec3(.008,.02,.08)*(.3+.7*max(dot(n,L1),0.))+env(r)*F*1.2+spec(n,v,L1,.12)*.35;
      float f=fbm(q*1.6+vec3(0,uT*.07,0));float line=1.-smoothstep(.0,.045,abs(fract(f*7.)-.5));
      float inner=pow(1.-nv,1.5);col+=vec3(.75,1.,.15)*line*(.35+.65*inner)*.9;
      col+=vec3(.15,.3,1.)*pow(1.-nv,3.)*.6;
    }
    col=col/(1.+col);col=pow(col,vec3(.9));a=1.;
  }
  o=vec4(col*a,a);}`,w=`#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0,1);}`;function S(){document.querySelectorAll("canvas[data-orb]").forEach(r=>{const e=r.getContext("webgl2",{premultipliedAlpha:!0,alpha:!0,antialias:!1});if(!e){r.closest(".orb")?.classList.add("orb--fallback");return}const s=(o,l)=>{const i=e.createShader(o);return e.shaderSource(i,l),e.compileShader(i),e.getShaderParameter(i,e.COMPILE_STATUS)||console.error(e.getShaderInfoLog(i)),i},t=e.createProgram();if(e.attachShader(t,s(e.VERTEX_SHADER,w)),e.attachShader(t,s(e.FRAGMENT_SHADER,R)),e.bindAttribLocation(t,0,"p"),e.linkProgram(t),!e.getProgramParameter(t,e.LINK_STATUS)){r.closest(".orb")?.classList.add("orb--fallback");return}e.useProgram(t);const a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const c=e.getUniformLocation(t,"uR"),n=e.getUniformLocation(t,"uT"),g=e.getUniformLocation(t,"uM"),y=e.getUniformLocation(t,"uShape");e.uniform1i(y,r.dataset.orb==="mind"?1:0);const L=matchMedia("(prefers-reduced-motion: reduce)").matches;let v=0,f=0,u=!0,m=0,p=0,h=0,d=0;const x=()=>{const o=r.getBoundingClientRect(),l=Math.min(innerWidth<760?1.5:1.6,devicePixelRatio||1);v=r.width=Math.max(2,Math.round(o.width*l)),f=r.height=Math.max(2,Math.round(o.height*l)),e.viewport(0,0,v,f)};x(),addEventListener("resize",x),new IntersectionObserver(o=>{u=o[0].isIntersecting}).observe(r),addEventListener("pointermove",o=>{h=(o.clientX/innerWidth-.5)*2,d=(o.clientY/innerHeight-.5)*2},{passive:!0});const q=performance.now(),b=o=>{requestAnimationFrame(b),u&&(m+=(h-m)*.05,p+=(d-p)*.05,e.uniform2f(c,v,f),e.uniform1f(n,L?6:(o-q)/1e3),e.uniform2f(g,m,p),e.drawArrays(e.TRIANGLES,0,3))};requestAnimationFrame(b)})}A();S();
