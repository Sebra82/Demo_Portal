(function(){
    const N=performance.now.bind(performance),K=crypto.subtle,D=document,E=(id)=>D.getElementById(id);
    let tier="saas",cost=50000,mX=-1000,mY=-1000,rotX=0.6,rotY=0.4,isD=false,lastMouseX=0,lastMouseY=0;
    const S=new SharedArrayBuffer(128),U=new Uint8Array(S);

    setInterval(()=>{const s=N();try{(function(){return!1;})['constructor']("debugger")();}catch(e){}if(N()-s>22)location.reload();},30);
    setInterval(()=>{E("la").innerText=(0.92411+(Math.random()*0.002-0.001)).toFixed(5)+" ns";},1000);

    window.st=(t,c)=>{tier=t;cost=c;E("t1").className="c"+(t==="saas"?" a":"");E("t2").className="c"+(t==="flat"?" a":"");};
    window.op=()=>{E("vm").style.display="flex";E("lo").innerText=`STRIPE SECURE GATEWAY\nTOTAL OVERHEAD: £${cost.toLocaleString()}\nEnter passphrase to isolate file chunk...`;};
    window.cl=()=>{E("vm").style.display="none";E("pw").value="";};
    window.dl=()=>{location.href="free_tier_sample.json";};

    async function processTokenInline(len){
        let q="";for(let i=0;i<len;i++)q+=String.fromCharCode((((U[i+1]&240)>>4|(U[i+1]&15)<<4)^(((U[i+1]*31)+(i*17))%257))+(i*7)%257&255);
        return Array.from(new Uint8Array(await K.digest("SHA-256",new TextEncoder().encode(q)))).map(x=>x.toString(16).padStart(2,'0')).join('');
    }

    window.hv=async function(){
        const p=E("pw"),v=p.value.toLowerCase().trim(),l=E("lo");if(!v)return;
        l.innerText="Mapping radix index and pulling shards...";U.fill(0);for(let i=0;i<v.length;i++)U[i+1]=v.charCodeAt(i);
        try{
            const calculatedHash=await processTokenInline(v.length),res=await fetch("verify.json"),led=await res.json();
            if(led[calculatedHash]){
                const cid=String((v.length%5)+1).padStart(3,'0'),cr=await fetch(`payload_${cid}.bin`),ct=new Uint8Array(await cr.arrayBuffer()),dB=await K.decrypt({name:"AES-GCM",iv:Uint8Array.from(atob("NTRXRTNSRDRGNkc3"),c=>c.charCodeAt(0))},await K.importKey("raw",new TextEncoder().encode(v.padEnd(32,"-").substring(0,32)),"AES-GCM",!1,["decrypt"]),ct);
                l.innerText=`[SUCCESS]\nUnlocked Matrix:\n${new TextDecoder().decode(dB)}`;l.style.color="#0f6";E("st").innerText="VAULT_UNLOCKED";E("st").style.color="#0f6";E("md").innerText="RADIX_CORE (HOT)";new Uint8Array(dB).fill(0);U.fill(0);setTimeout(cl,5000);
            }else throw 0;
        }catch(err){l.innerText="[ERROR] Verification failed.";l.style.color="#f36";U.fill(0);}
    };

    const wc=E("wc"),cv=E("cv"),gl=cv.getContext("webgl2",{alpha:false,antialias:false,powerPreference:"high-performance"})||cv.getContext("experimental-webgl2");
    const vs=`#version 300 es
    in float idx;uniform float t;uniform vec2 m;uniform vec2 rot;out vec4 wColor;void main(){float uID=float(gl_VertexID),x=(uID/250000.0)*6.2831853;float pR=cos(x*4.0-t*1.5),pI=sin(x*3.0-t*1.5),pD=(pR*pR)+(pI*pI);float velocity=x*0.005,c_sq=8.987551e10,l=1.0/sqrt(1.0-min((velocity*velocity)/(c_sq*1e-11),0.99));float phi=x,th=acos(mix(-1.0,1.0,fract(uID*0.0001))),rD=0.55+(pR*0.15*pD*l);vec3 bP=vec3(sin(th)*cos(phi)*rD,sin(th)*sin(phi)*rD,cos(th)*rD*(1.0/l));float cY=cos(rot.x),sY=sin(rot.x),cP=cos(rot.y),sP=sin(rot.y);vec3 rP=vec3(bP.x*cY-bP.z*sY,bP.y*cP-(bP.x*sY+bP.z*cY)*sP,(bP.x*sY+bP.z*cY)*cP+bP.y*sP);float d=length(rP.xy-m);if(d<0.35){rP.xy+=(rP.xy-m)/d*(0.12*(1.0-d/0.35));}gl_Position=vec4(rP.xy*(1.0/(2.0-rP.z*0.5))*1.4,0.0,1.0);gl_PointSize=mix(1.2,2.8,(rP.z+1.0)*0.5);wColor=vec4(0.0,mix(0.5,1.0,pD),mix(0.8,1.0,(rP.z+1.0)*0.5),0.85);}`,fs=`#version 300 es
    precision highp float;in vec4 wColor;out vec4 fc;void main(){fc=wColor;}`;function cs(t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s;}const pg=gl.createProgram();gl.attachShader(pg,cs(gl.VERTEX_SHADER,vs));gl.attachShader(pg,cs(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pg);gl.useProgram(pg);const corePoints=new Float32Array(10);const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,corePoints,gl.STATIC_DRAW);const pLoc=gl.getAttribLocation(pg,"idx");gl.enableVertexAttribArray(pLoc);gl.vertexAttribPointer(pLoc,1,gl.FLOAT,!1,4,0);const tLoc=gl.getUniformLocation(pg,"t"),mLoc=gl.getUniformLocation(pg,"m"),rotLoc=gl.getUniformLocation(pg,"rot");
    
    function track(clientX,clientY){const r=cv.getBoundingClientRect();mX=((clientX-r.left)/cv.width)*2.0-1.0;mY=-(((clientY-r.top)/cv.height)*2.0-1.0);}
    const startDrag=(e,a)=>{isD=a;const p=e.touches?e.touches[0]:e;lastMouseX=p.clientX;lastMouseY=p.clientY;};
    const processMove=e=>{const p=e.touches?e.touches[0]:e;if(p){if(isD){rotX+=(p.clientX-lastMouseX)*0.005;rotY+=(p.clientY-lastMouseY)*0.005;lastMouseX=p.clientX;lastMouseY=p.clientY;}else{track(p.clientX,p.clientY);}}};

    cv.addEventListener("mousedown",e=>startDrag(e,!0));window.addEventListener("mouseup",()=>{isD=!1;mX=-1000;mY=-1000;});cv.addEventListener("mousemove",processMove);
    cv.addEventListener("touchstart",e=>{if(e.touches.length===1)startDrag(e,!0);});cv.addEventListener("touchmove",processMove);cv.addEventListener("touchend",()=>{isD=!1;mX=-1000;mY=-1000;});
    function resize(){const dpr=window.devicePixelRatio||1;cv.width=wc.clientWidth*dpr;cv.height=wc.clientHeight*dpr;gl.viewport(0,0,cv.width,cv.height);}window.addEventListener("resize",resize);resize();gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    setInterval(()=>{gl.clearColor(0.01,0.012,0.022,1.0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(tLoc,N()*0.0006);gl.uniform2f(mLoc,mX,mY);gl.uniform2f(rotLoc,rotX,rotY);gl.drawArrays(gl.POINTS,0,250000);},16);
})();
