import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const host=document.getElementById('app');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xa9bfca);
scene.fog=new THREE.Fog(0xa9bfca,150,310);

const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,700);
camera.position.set(92,58,105);

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
host.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(28,5,0); controls.enableDamping=true;
controls.minDistance=18; controls.maxDistance=230; controls.maxPolarAngle=Math.PI*.49;

scene.add(new THREE.HemisphereLight(0xeaf7ff,0x465144,2.4));
const sun=new THREE.DirectionalLight(0xfff4df,3.1);
sun.position.set(-45,90,55); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048); scene.add(sun);

const mat=(c,m=.15,r=.62)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
const steel=mat(0x7f898c,.78,.38), galvanized=mat(0xa9b0b2,.72,.34);
const porcelain=mat(0xd8d2c4,.04,.26), darkPorcelain=mat(0x6f4938,.05,.32);
const transformerGreen=mat(0x526b5b,.38,.5), concrete=mat(0x8e918d,.02,.92);
const copper=mat(0xb36a3d,.65,.3), earthMat=mat(0x59655c,0,.98), oil=mat(0x302819,.1,.3);

const selectable=[];
function register(o,name,type,kv){o.userData={name,type,kv}; selectable.push(o); return o}
function box(s,p,m=steel,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);o.castShadow=o.receiveShadow=true;parent.add(o);return o}
function cyl(r,h,p,m=steel,parent=scene,segments=20){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),m);o.position.set(...p);o.castShadow=true;parent.add(o);return o}
function conductor(points,r=.075,m=copper){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
 const o=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(8,points.length*6),r,8,false),m);
 scene.add(o); return o;
}
function foundation(x,z,w=2.4,d=2.2){return box([w,.45,d],[x,.225,z],concrete)}
function postInsulator(x,z,h=4.8,material=porcelain,parent=scene){
 const g=new THREE.Group(); g.position.set(x,.45,z); parent.add(g);
 cyl(.12,h,[0,h/2,0],steel,g);
 for(let y=.35;y<h-.15;y+=.36)cyl(.38,.095,[0,y,0],material,g,18);
 cyl(.2,.24,[0,h+.08,0],galvanized,g); return g;
}
function latticeColumn(x,z,h=17){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 for(const dx of [-.35,.35])for(const dz of [-.35,.35])box([.12,h,.12],[dx,h/2,dz],galvanized,g);
 for(let y=1;y<h;y+=2){box([1,.1,.1],[0,y,-.35],galvanized,g);box([1,.1,.1],[0,y,.35],galvanized,g)}
 return g;
}
function labelSprite(text,pos){
 const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');
 x.fillStyle='rgba(5,18,27,.82)';x.roundRect(2,2,508,92,16);x.fill();
 x.fillStyle='#fff';x.font='600 30px Arial';x.textAlign='center';x.fillText(text,256,59);
 const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));
 s.position.set(...pos);s.scale.set(11,2.05,1);scene.add(s);return s;
}

// Yard + roads
const ground=new THREE.Mesh(new THREE.PlaneGeometry(250,125),earthMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
box([235,.08,1], [25,.04,-54],mat(0xb8b9b3,0,.95));
box([235,.08,1], [25,.04,54],mat(0xb8b9b3,0,.95));
box([1,.08,108],[-92,.04,0],mat(0xb8b9b3,0,.95));
box([1,.08,108],[142,.04,0],mat(0xb8b9b3,0,.95));
box([230,.06,8],[25,.03,43],mat(0x777b78,0,.96));

// Earthing grid (educational visible layer)
for(let x=-80;x<130;x+=10)box([.035,.03,96],[x,.018,-3],copper);
for(let z=-48;z<48;z+=10)box([210,.03,.035],[25,.018,z],copper);

// Incoming 132 kV gantry
latticeColumn(-76,-8,19);latticeColumn(-76,8,19);
box([1,1,19],[-76,17,0],galvanized);
[-6,0,6].forEach(z=>postInsulator(-76,z,4.2,darkPorcelain));
[-6,0,6].forEach(z=>conductor([[-112,19,z],[-92,18.5,z],[-76,21.5,z],[-68,9,z]],.09));
labelSprite('132 kV INCOMING LINE',[-83,25,0]);

// Surge arresters: shunt to earth, not series
[-6,0,6].forEach(z=>{
 foundation(-64,z,1.8,1.8);
 const g=new THREE.Group();g.position.set(-64,.45,z);scene.add(g);
 cyl(.16,4.8,[0,2.4,0],darkPorcelain,g);
 for(let y=.4;y<4.7;y+=.32)cyl(.33,.09,[0,y,0],darkPorcelain,g);
 conductor([[-68,9,z],[-64,5.4,z]],.055);
 conductor([[-64,.5,z],[-64,.1,z]],.055,copper);
 register(g,'132 kV Surge Arrester','Surge arrester',132);
});
labelSprite('SURGE ARRESTERS',[-64,8.4,-10]);

function disconnector(x,name){
 const g=new THREE.Group();scene.add(g);foundation(x,0,4.2,17);
 [-6,0,6].forEach(z=>{
  postInsulator(x-1.2,z,5,darkPorcelain,g);postInsulator(x+1.2,z,5,darkPorcelain,g);
  const blade=box([2.7,.11,.16],[0,5.65,z],galvanized,g);blade.rotation.z=.08;
 });
 register(g,name,'Disconnector / visible isolation',132);return g;
}
disconnector(-53,'132 kV Line Disconnector');
labelSprite('LINE DISCONNECTOR',[-53,9,-10]);

// CTs
const ctGroup=new THREE.Group();scene.add(ctGroup);
[-6,0,6].forEach(z=>{foundation(-39,z,2.3,2.3);const p=postInsulator(-39,z,4.7,darkPorcelain);cyl(.75,1.1,[-39,3,z],darkPorcelain);});
register(ctGroup,'132 kV Current Transformers','Instrument transformer',132);
labelSprite('CURRENT TRANSFORMERS',[-39,9,-10]);

// CVTs
const cvtGroup=new THREE.Group();scene.add(cvtGroup);
[-6,0,6].forEach(z=>{foundation(-28,z,2.2,2.2);postInsulator(-28,z,6,darkPorcelain);box([1.15,.9,1.15],[-28,.9,z],steel)});
register(cvtGroup,'132 kV CVT / VT','Voltage measurement',132);
labelSprite('CVT / VT',[-28,10,-10]);

// 132 kV breaker, three independent poles
const cb=new THREE.Group();scene.add(cb);
[-6,0,6].forEach(z=>{foundation(-14,z,2.6,2.6);box([1.3,2.1,1.3],[-14,1.5,z],galvanized);postInsulator(-14,z,4.6,darkPorcelain);});
register(cb,'132 kV Circuit Breaker','Fault-interrupting breaker',132);
labelSprite('132 kV CIRCUIT BREAKER',[-14,9,-10]);

disconnector(0,'132 kV Bus Disconnector');
labelSprite('BUS DISCONNECTOR',[0,9,-10]);

// Main 132 kV bus
for(const z of [-6,0,6]){postInsulator(11,z,6,darkPorcelain);postInsulator(31,z,6,darkPorcelain);conductor([[7,7,z],[38,7,z]],.11)}
labelSprite('132 kV BUSBAR',[22,11,-10]);

// Primary continuity, conceptual but physically connected
for(const z of [-6,0,6]){
 conductor([[-68,9,z],[-57,6.1,z]],.08);
 conductor([[-49,6.1,z],[-39,5.3,z],[-28,6.6,z],[-14,5.3,z],[-4,6.1,z]],.08);
 conductor([[4,6.1,z],[7,7,z]],.08);
}

// Transformer foundation and bund
box([29,.65,25],[55,.325,0],concrete);
box([32,.6,1],[55,.3,-14],concrete);box([32,.6,1],[55,.3,14],concrete);
box([1,.6,28],[39.5,.3,0],concrete);box([1,.6,28],[70.5,.3,0],concrete);
const tx=new THREE.Group();scene.add(tx);
const tank=box([17,9.5,12],[55,5.5,0],transformerGreen,tx);
for(let z=-4.5;z<=4.5;z+=1.5){box([2.2,7,.16],[-9.6,5,z],galvanized,tx);box([2.2,7,.16],[9.6,5,z],galvanized,tx)}
// top cover and conservator
box([18,.45,13],[55,10.4,0],transformerGreen);
const conservator=cyl(1.65,9,[55,15,0],transformerGreen);conservator.rotation.z=Math.PI/2;
box([.22,4,.22],[55,12.3,0],galvanized);
// bushings
[-5,0,5].forEach(z=>{postInsulator(47,z,7,darkPorcelain);postInsulator(63,z,4.5,porcelain)});
box([3.5,3,3],[65,3.2,8],transformerGreen); // cooler/control cabinet representation
register(tx,'132/33 kV Power Transformer','Power transformer',132);
labelSprite('132/33 kV POWER TRANSFORMER',[55,21,-12]);
for(const z of [-6,0,6])conductor([[38,7,z],[47,7.6,z]],.085);

// 33 kV transformer incomer breaker + CT/VT
const cb33=new THREE.Group();scene.add(cb33);
[-3.3,0,3.3].forEach(z=>{foundation(76,z,2,2);box([1.1,1.7,1.1],[76,1.3,z],galvanized);postInsulator(76,z,3.1,porcelain)});
register(cb33,'33 kV Transformer Incomer Circuit Breaker','Circuit breaker',33);
labelSprite('33 kV INCOMER CB',[76,7,-8]);
const inst33=new THREE.Group();scene.add(inst33);
[-3.3,0,3.3].forEach(z=>{foundation(86,z,1.7,1.7);postInsulator(86,z,3,porcelain)});
register(inst33,'33 kV CT / VT','Instrument transformers',33);
labelSprite('33 kV CT / VT',[86,7,-8]);

// 33 kV bus
for(const z of [-3.3,0,3.3]){postInsulator(94,z,3.5,porcelain);postInsulator(113,z,3.5,porcelain);conductor([[91,4.1,z],[120,4.1,z]],.075)}
labelSprite('33 kV BUSBAR',[105,8,-8]);
for(const z of [-3.3,0,3.3]){
 conductor([[63,5.1,z],[70,4.2,z],[76,3.8,z],[86,3.6,z],[91,4.1,z]],.07);
}

// Three outgoing feeder bays
[-28,0,28].forEach((z,i)=>{
 const x=128;foundation(x,z,4.5,11);
 [-3,0,3].forEach(d=>{postInsulator(x-1.5,z+d,3,porcelain);postInsulator(x+1.5,z+d,3,porcelain)});
 box([.45,11,.45],[138,5.5,z-5],galvanized);box([.45,11,.45],[138,5.5,z+5],galvanized);box([.45,.45,11],[138,9,z],galvanized);
 [-3,0,3].forEach(d=>conductor([[120,4.1,d],[128,4,z+d],[138,9,z+d],[155,10,z+d]],.065));
 labelSprite('33 kV FEEDER '+(i+1),[136,14,z]);
});

// Control building + cable trench
box([24,7,16],[45,3.5,38],mat(0xc7c2b4,0,.9));box([25,.45,17],[45,7.2,38],mat(0x59636a,.45,.5));
box([165,.18,2],[30,.09,24],mat(0x4c5150,.1,.85));
labelSprite('CONTROL & PROTECTION BUILDING',[45,11,38]);

// Selection interaction
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown',e=>{
 mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);
 const hit=ray.intersectObjects(scene.children,true)[0];if(!hit)return;
 let o=hit.object;while(o.parent&&(!o.userData||!o.userData.name))o=o.parent;
 if(o.userData?.name)document.getElementById('msg').textContent=`${o.userData.name} — ${o.userData.type} — ${o.userData.kv} kV`;
});

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
(function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)})();