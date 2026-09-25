import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
try{
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb8ccd5);scene.fog=new THREE.Fog(0xb8ccd5,190,380);
const camera=new THREE.PerspectiveCamera(44,innerWidth/innerHeight,.1,700);camera.position.set(105,68,118);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;document.getElementById('app').appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(25,5,0);controls.enableDamping=true;controls.minDistance=0.01;controls.maxDistance=260;controls.maxPolarAngle=1.52;
// Mouse navigation: left = orbit, middle = pan/drag, right = pan
controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;
controls.mouseButtons.MIDDLE=THREE.MOUSE.PAN;
controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;
controls.screenSpacePanning=true;
// Faster, more responsive mouse navigation
// Tuned mouse feel: smoother precision near equipment, responsive across the full yard.
controls.enableDamping=true;
controls.dampingFactor=.055;
controls.panSpeed=2.35;
controls.rotateSpeed=1.55;
controls.zoomSpeed=9.0;
controls.zoomToCursor=true;
controls.minDistance=0.01;
// Desktop navigation should react immediately but coast only slightly.
controls.keyPanSpeed=18;
renderer.domElement.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault()});
renderer.domElement.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
renderer.domElement.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault()});
scene.add(new THREE.HemisphereLight(0xeaf7ff,0x556052,2.15));const sun=new THREE.DirectionalLight(0xfff2d8,3.4);sun.position.set(-70,110,65);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-150;sun.shadow.camera.right=150;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;scene.add(sun);
const M=(c,metal=.1,rough=.65)=>new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
const gal=M(0x9ca5a7,.72,.36),steel=M(0x59646a,.78,.38),porc=M(0xd7d0c1,.03,.24),brown=M(0x6d4434,.03,.28),txmat=M(0x435e4c,.42,.48),conc=M(0x9b9d98,.02,.9),gravel=M(0x777d75,0,.98),al=M(0x8e9696,.78,.3),copper=M(0x8c5b3d,.58,.35),black=M(0x22282b,.35,.5),coreMat=M(0x343b40,.8,.32),hvMat=M(0xb94736,.55,.3),lvMat=M(0xd8872c,.55,.3);
const pick=[];const labels=[];const earthObjects=[];const cutObjects=[];
function box(s,p,m=gal,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);o.castShadow=o.receiveShadow=true;parent.add(o);return o}
function cyl(r,h,p,m=gal,parent=scene,seg=24){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);o.position.set(...p);o.castShadow=o.receiveShadow=true;parent.add(o);return o}
function reg(g,name,kv,info){g.userData={name,kv,info};pick.push(g);return g}
function tube(points,r=.07,m=al,parent=scene){const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Mesh(new THREE.TubeGeometry(c,Math.max(12,points.length*8),r,8,false),m);o.castShadow=true;parent.add(o);return o}
function sagTube(a,b,sag=.7,r=.065,m=al,parent=scene){const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-sag*4*t*(1-t),a[2]+(b[2]-a[2])*t])}return tube(pts,r,m,parent)}
function pad(x,z,w=2.3,d=2.3){return box([w,.38,d],[x,.19,z],conc)}
function torus(R,r,p,m=steel,parent=scene,rx=Math.PI/2){const o=new THREE.Mesh(new THREE.TorusGeometry(R,r,10,28),m);o.position.set(...p);o.rotation.x=rx;o.castShadow=true;parent.add(o);return o}
function beamBetween(a,b,r=.07,m=gal,parent=scene){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),mid=A.clone().add(B).multiplyScalar(.5);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,A.distanceTo(B),8),m);o.position.copy(mid);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize());o.castShadow=true;parent.add(o);return o}
function ins(x,y,z,h=4.5,material=brown,parent=scene){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);cyl(.11,h,[0,h/2,0],steel,g);for(let a=.3;a<h;a+=.34)cyl(.36,.085,[0,a,0],material,g,18);cyl(.18,.18,[0,h+.05,0],gal,g);return g}
function lattice(x,z,h=18){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);for(const dx of [-.45,.45])for(const dz of [-.45,.45])box([.12,h,.12],[dx,h/2,dz],gal,g);for(let y=1;y<h;y+=1.8){for(const zz of [-.45,.45]){const b=box([1.15,.09,.09],[0,y,zz],gal,g);b.rotation.z=(y%3.6<1)?.55:-.55}}return g}
const labelRegistry=new Map();function label(t,p){if(labelRegistry.has(t))return labelRegistry.get(t);const c=document.createElement('canvas');c.width=512;c.height=84;const q=c.getContext('2d');q.fillStyle='#06131ddd';q.roundRect(2,2,508,80,13);q.fill();q.fillStyle='#fff';q.font='bold 25px Arial';q.textAlign='center';q.fillText(t,256,52);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.position.set(...p);s.scale.set(6.4,1.08,1);s.material.opacity=.86;s.renderOrder=20;scene.add(s);s.userData={isEquipmentLabel:true,labelText:t,target:new THREE.Vector3(...p)};labels.push(s);labelRegistry.set(t,s);return s}
// Civil works
// V7 crushed-rock yard: vertex-level tone variation avoids the flat CAD look
const gg=new THREE.PlaneGeometry(270,130,80,40);
const gc=[];for(let i=0;i<gg.attributes.position.count;i++){const n=.43+Math.random()*.09;gc.push(n,n*.99,n*.94)}
gg.setAttribute('color',new THREE.Float32BufferAttribute(gc,3));
const gmat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0});
const ground=new THREE.Mesh(gg,gmat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
box([250,.08,8],[25,.04,48],M(0x555b59,0,.96));box([250,.12,.5],[25,.06,53],conc);box([250,.12,.5],[25,.06,-55],conc);
for(const x of [-96,146])box([.22,2.3,110],[x,1.15,0],gal);
for(let z=-54;z<=54;z+=6){box([.16,2.3,.16],[-96,1.15,z],gal);box([.16,2.3,.16],[146,1.15,z],gal)}
// V7 perimeter security fence mesh, warning boards and yard lighting
const fenceMat=new THREE.MeshStandardMaterial({color:0x7e8789,metalness:.72,roughness:.5,wireframe:true});
for(const z of [-54,54]){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(240,2.4,80,2),fenceMat);mesh.position.set(25,1.2,z);scene.add(mesh)}
for(const x of [-94,144]){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(108,2.4,36,2),fenceMat);mesh.rotation.y=Math.PI/2;mesh.position.set(x,1.2,0);scene.add(mesh)}
for(const x of [-70,-25,20,65,110,135]){box([.18,8,.18],[x,4,50],gal);box([2.2,.12,.12],[x,8,50],gal);const lamp=box([1.1,.22,.5],[x+1,7.9,50],M(0xe5e1c7,.1,.3));lamp.rotation.z=-.18}
// buried earthing
for(let x=-85;x<135;x+=10){const e=box([.04,.035,98],[x,-.08,-2],copper);earthObjects.push(e)}
for(let z=-48;z<48;z+=10){const e=box([220,.035,.04],[25,-.08,z],copper);earthObjects.push(e)}
// ============================================================================
// 132_KV_SWITCHYARD — AUTHORITATIVE IMPLEMENTATION
// Complete rebuild per engineering acceptance brief. No legacy 132 kV geometry
// is retained in this section.
// ============================================================================

const PH132=[-6,0,6];

// 132_KV_TRANSMISSION_TOWER — clearly visible lattice tower outside the switchyard fence.
const tower132=new THREE.Group();scene.add(tower132);
const TX=-128, TZ=0, TH=34;

// Four tapered main legs.
for(const sx of [-1,1])for(const sz of [-1,1]){
 beamBetween([TX+sx*5.0,0,TZ+sz*4.0],[TX+sx*1.15,TH,TZ+sz*.95],.22,gal);
}
// Dense lattice body: horizontal ties plus crossed diagonals on front/back and sides.
for(let y=2;y<29;y+=3){
 const t=y/TH, wx=5.0-(3.75*t), wz=4.0-(3.0*t);
 box([wx*2,.16,.16],[TX,y,TZ-wz],gal);box([wx*2,.16,.16],[TX,y,TZ+wz],gal);
 box([.16,.16,wz*2],[TX-wx,y,TZ],gal);box([.16,.16,wz*2],[TX+wx,y,TZ],gal);
 if(y<27){
   const t2=(y+3)/TH, wx2=5.0-(3.75*t2), wz2=4.0-(3.0*t2);
   beamBetween([TX-wx,y,TZ-wz],[TX+wx2,y+3,TZ-wz2],.085,gal);
   beamBetween([TX+wx,y,TZ-wz],[TX-wx2,y+3,TZ-wz2],.085,gal);
   beamBetween([TX-wx,y,TZ+wz],[TX+wx2,y+3,TZ+wz2],.085,gal);
   beamBetween([TX+wx,y,TZ+wz],[TX-wx2,y+3,TZ+wz2],.085,gal);
 }
}
// Tower peak and earthwire peak.
beamBetween([TX-1.2,29,TZ],[TX,36,TZ],.18,gal);beamBetween([TX+1.2,29,TZ],[TX,36,TZ],.18,gal);

// Three large phase crossarms, vertically staggered and extending across the tower.
const towerPhaseZ=[-6,0,6];
const towerPhaseY=[25.0,29.0,25.0];
towerPhaseZ.forEach((z,i)=>{
 const y=towerPhaseY[i];
 // Outer phases use side arms; the centre phase gets its own clearly visible crossarm
 // through the tower so it is structurally supported instead of hanging from the peak/body.
 if(i===1){
   beamBetween([TX-4.2,y,TZ],[TX+4.2,y,TZ],.22,gal);
   beamBetween([TX-2.9,y-1.55,TZ],[TX,y,TZ],.11,gal);
   beamBetween([TX+2.9,y-1.55,TZ],[TX,y,TZ],.11,gal);
   box([.75,.20,.75],[TX,y,TZ],gal);
 }else{
   beamBetween([TX,y,TZ],[TX,y,z],.20,gal);
   beamBetween([TX,y-1.5,TZ],[TX,y,z],.10,gal);
 }
 const str=new THREE.Group();str.position.set(TX,y,z);scene.add(str);
 ins(0,-3.4,0,3.4,brown,str);
 // Each phase span runs from the actual tower insulator bottom to its gantry termination.
 sagTube([TX,y-3.4,z],[-84.9,20.0,z],1.35,.095,al);
});
// Tower footing blocks.
for(const sx of [-1,1])for(const sz of [-1,1])box([2.0,.55,2.0],[TX+sx*5,.275,TZ+sz*4],conc);
reg(tower132,'132 kV Transmission Tower',132,'Lattice transmission tower outside the switchyard feeding the incoming gantry with one three-phase 132 kV circuit.');
label('132 kV TRANSMISSION TOWER',[TX,39,-10]);

// 132_KV_INCOMING — one grounded steel termination gantry, three phase terminations.
const gantry132=new THREE.Group();scene.add(gantry132);
for(const z of [-9,9])box([.55,17.5,.55],[-82,8.75,z],gal,gantry132);
box([.55,.55,19],[-82,17.5,0],gal,gantry132);
PH132.forEach(z=>{
  // horizontal strain string keeps live termination away from grounded crossarm
  const string=new THREE.Group();string.position.set(-82,17.5,z);string.rotation.z=Math.PI/2;scene.add(string);
  ins(0,0,0,3.0,brown,string);
  tube([[-84.9,20.0,z],[-79.2,12.0,z],[-73.0,7.0,z]],.078);
});
label('132 kV INCOMING',[-88,23.0,-10]);

// 132_KV_SURGE_ARRESTERS — shunt only: phase -> LA -> earth.
const la=new THREE.Group();scene.add(la);
PH132.forEach(z=>{
  pad(-69,z,1.45,1.45);
  ins(-69,.3,z,4.1,brown);
  box([.38,.12,.28],[-69,4.7,z],al);
  tube([[-73,7,z],[-69,4.7,z]],.035);
  const eg=tube([[-69,.3,z],[-69,-.08,z]],.035,copper);earthObjects.push(eg);
});
reg(la,'132 kV Surge Arresters',132,'Three phase-to-earth surge arresters. They divert surge current to earth and are not in the normal load-current path.');
label('LA',[-69,7.0,-9]);

// 132 kV terminal map. Every fixed conductor is generated only between these coordinates.
const T132={
 lineIsoSrc:-60.5,lineIsoDst:-57.5,
 ct:-48.0,
 cbSrc:-34.8,cbDst:-32.2,
 busIsoSrc:-23.5,busIsoDst:-20.5,
 busRise:-15.0
};

// Reusable three-pole centre-break disconnector: exactly six posts + three moving blades.
function make132Disconnector(x,name){
 const g=new THREE.Group();scene.add(g);g.userData.blades=[];
 PH132.forEach(z=>{
   pad(x-1.5,z,1.25,1.25);pad(x+1.5,z,1.25,1.25);
   ins(x-1.5,.3,z,4.25,brown);ins(x+1.5,.3,z,4.25,brown);
   box([.34,.14,.30],[x-1.5,4.85,z],al);box([.34,.14,.30],[x+1.5,4.85,z],al);
   const blade=new THREE.Group();blade.position.set(x-1.5,4.85,z);scene.add(blade);
   box([3.0,.12,.17],[1.5,0,0],al,blade);
   g.add(blade);g.userData.blades.push(blade);
 });
 reg(g,name,132,'Three-pole visible isolation device. Fixed conductors stop at its terminals; only the moving blade bridges the air gap.');
 return g
}

// 132_KV_LINE_ISO
const lineDisc=make132Disconnector(-59,'132 kV Line Disconnector');
label('LINE ISO',[-59,7.2,-9]);

// 132_KV_CT — one clean series pole per phase, aligned directly below the primary conductor.
const ct=new THREE.Group();scene.add(ct);
PH132.forEach(z=>{
 pad(T132.ct,z,1.65,1.65);
 box([1.15,.55,1.15],[T132.ct,.62,z],steel);
 ins(T132.ct,.9,z,3.45,brown);
 torus(.72,.14,[T132.ct,4.45,z],brown,scene,Math.PI/2);
 box([.48,.12,.30],[T132.ct,4.85,z],al);
});
reg(ct,'132 kV Current Transformers',132,'Exactly one CT per phase in series with the primary conductor.');
label('CT',[T132.ct,7.2,-9]);

// 132_KV_CVT — shunt measurement branches, physically offset from the main path.
const cvt=new THREE.Group();scene.add(cvt);
PH132.forEach(z=>{
 pad(-42,z,1.45,1.45);
 box([1.15,.70,1.15],[-42,.68,z],steel);
 ins(-42,1.0,z,3.65,brown);
 box([.42,.12,.28],[-42,4.95,z],al);
 tube([[-44.2,4.85,z],[-42,4.95,z]],.030);
});
reg(cvt,'132 kV CVT / VT',132,'Shunt-connected voltage measurement branch. Main load current does not pass through it.');
label('CVT',[-42,7.3,-9]);

// 132_KV_CB — three poles with clearly separated source/load bushings.
// The moving contact object is the only visual/electrical bridge.
const breaker=new THREE.Group();scene.add(breaker);
const cb132Contacts=[];
PH132.forEach(z=>{
 pad(-33.5,z,3.6,2.0);
 box([2.8,.80,1.35],[-33.5,.62,z],steel);
 ins(T132.cbSrc,1.0,z,3.55,porc);
 ins(T132.cbDst,1.0,z,3.55,porc);
 box([.38,.14,.30],[T132.cbSrc,4.85,z],al);
 box([.38,.14,.30],[T132.cbDst,4.85,z],al);
 const contact=new THREE.Group();contact.position.set(T132.cbSrc,4.85,z);scene.add(contact);
 box([2.60,.14,.24],[1.30,0,0],al,contact);
 cb132Contacts.push(contact);
});
box([2.2,1.8,1.8],[-33.5,.9,9],steel);
reg(breaker,'132 kV Circuit Breaker',132,'Three-pole circuit breaker with distinct line and bus terminals. Opening/tripping removes the contact bridge.');
label('132 kV CB',[-33.5,7.4,-9]);

// 132_KV_BUS_ISO — directly between CB and elevated bus, no loose rings or floating hardware.
const busDisc=make132Disconnector(-22,'132 kV Bus Disconnector');
label('BUS ISO',[-22,7.2,-9]);

// Authoritative fixed primary conductor segments.
// No fixed conductor crosses an isolator or breaker gap.
PH132.forEach(z=>{
 tube([[-73,7.0,z],[T132.lineIsoSrc,4.85,z]],.075);
 tube([[T132.lineIsoDst,4.85,z],[T132.ct,4.85,z],[T132.cbSrc,4.85,z]],.075);
 tube([[T132.cbDst,4.85,z],[T132.busIsoSrc,4.85,z]],.075);
 tube([[T132.busIsoDst,4.85,z],[T132.busRise,7.2,z],[-10,10.5,z],[-7,11.70,z]],.075);
});

// 132_KV_BUS — elevated on the new steel support frames.
// The old ground-mounted brown bus-support insulators are intentionally removed.
for(const x of [-7,17,39]){
  for(const z of [-9,9])box([.40,9.0,.40],[x,4.5,z],gal);
  box([.55,.45,19],[x,9.0,0],gal);
  PH132.forEach(z=>{
    ins(x,9.15,z,2.4,porc);
    box([.80,.12,.35],[x,11.70,z],al);
  });
}
// Exactly three elevated phase conductors, each landed on the top terminal of its white post insulators.
PH132.forEach(z=>tube([[-7,11.70,z],[39,11.70,z]],.095));
label('132 kV BUS',[17,14.5,-9]);

// 132_KV_TRANSFORMER_CONNECTION is completed immediately after transformer
// construction so each jumper can land on the actual HV bushing terminal.
// transformer local group centered correctly
box([32,.55,28],[56,.275,0],conc);for(const [s,p] of [[[34,.7,1],[56,.35,-15]],[[34,.7,1],[56,.35,15]],[[1,.7,30],[39,.35,0]],[[1,.7,30],[73,.35,0]]])box(s,p,conc);
const tx=new THREE.Group();tx.position.set(56,.55,0);scene.add(tx);const tank=box([17,9,12],[0,5,0],txmat,tx);cutObjects.push(tank);box([18,.45,13],[0,9.9,0],txmat,tx);
// V7 transformer detail: radiator banks, headers, fans, pipework and accessory silhouettes
for(const side of [-1,1]){
  cyl(.22,7,[side*9.1,7.6,0],txmat,tx);
  cyl(.22,7,[side*9.1,2.2,0],txmat,tx);
}
// radiator banks
for(const side of [-1,1])for(let z=-4.8;z<=4.8;z+=1.2){box([2.8,6.6,.12],[side*9.7,4.9,z],gal,tx)}
// cooling fans on both radiator banks
for(const side of [-1,1])for(const z of [-3,0,3]){
 const fan=new THREE.Group();fan.position.set(side*11.15,4.7,z);fan.rotation.z=Math.PI/2;tx.add(fan);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.72,.08,8,24),black);fan.add(ring);
 for(let a=0;a<4;a++){const blade=box([.62,.08,.18],[.34,0,0],black,fan);blade.rotation.z=a*Math.PI/2}
}
// conservator horizontal along z
const cons=cyl(1.45,9,[0,14.1,0],txmat,tx,28);cons.rotation.x=Math.PI/2;box([.22,4,.22],[0,11.8,0],gal,tx);
box([3.2,3,2.4],[9.8,2.1,7.4],txmat,tx); // marshalling kiosk
// Buchholz relay / conservator pipe / breather / pressure relief
const buch=cyl(.32,.8,[2.2,11.25,0],M(0xb9a36d,.45,.4),tx);buch.rotation.z=Math.PI/2;
const cp=tube([[0,10.1,0],[1.8,11.25,0],[4.4,12.8,0]],.13,txmat,tx);
cyl(.18,2.2,[5.2,10.9,4.8],gal,tx);cyl(.42,.75,[5.2,9.7,4.8],M(0xc7b6a0,.05,.3),tx);
cyl(.42,.45,[-3.5,10.45,3.8],M(0xb5b9b6,.55,.35),tx);
// V8 transformer undercarriage, gauges and lifting details
for(const x of [-6,6])for(const z of [-4.7,4.7]){const w=cyl(.42,.5,[x,.2,z],black,tx,18);w.rotation.z=Math.PI/2}
for(const z of [-3,3])torus(.34,.055,[-8.2,8.1,z],gal,tx,0);
cyl(.38,.18,[6.2,8.8,5.8],M(0xe7e1d0,.05,.25),tx);box([.08,1.1,.08],[6.2,9.45,5.8],gal,tx);
// V10 Phase 3 — 33 kV yard engineering rebuild
// Main 33 kV bus support portals, post insulators and terminal clamps
for(const x of [84,96,108,120]){
  for(const z of [-5.2,5.2])box([.32,6.2,.32],[x,3.1,z],gal);
  box([.4,.35,11],[x,6.2,0],gal);
  for(const z of [-3.2,0,3.2]){ins(x,6.35,z,1.45,porc);box([.65,.10,.28],[x,7.9,z],al)}
}
// V10 feeder exit cleanup: duplicate secondary portal/strain geometry removed.
// 33 kV transformer-side flexible jumpers and bus droppers
// Duplicate V10 transformer-to-incomer jumpers removed: the primary 33 kV path above is the single source of geometry.
// Cable trench spine serving feeder mechanisms
box([63,.22,2.0],[113,.12,12],M(0x6d7475,.85,.25));
for(let x=83;x<=143;x+=3.5)box([3.1,.08,1.75],[x,.27,12],M(0x8b9291,.8,.25));
// Yard equipment IDs


// Legacy 132 kV Phase 2 geometry deleted. The authoritative 132_KV_SWITCHYARD above is the only 132 kV bay implementation.

// V10 Phase 1 — engineering-model realism pass: transformer bay + primary connections
// Transformer rail tracks, wheel stops and heavier plinth detailing
for(const z of [-4.8,4.8]){
  box([25,.16,.24],[56,.72,z],steel);
  for(const x of [45,67])box([.7,.55,.7],[x,.95,z],steel);
}
// Conservator saddle supports
for(const x of [-2.7,2.7]){box([.35,3.2,.35],[x,12.35,0],gal,tx);box([2.4,.25,.45],[x,13.75,0],gal,tx)}
// Radiator upper/lower manifolds and pipe stubs
for(const side of [-1,1]){
  for(const y of [2.0,8.0]){const mh=cyl(.28,9.5,[side*9.25,y,0],txmat,tx,20);mh.rotation.x=Math.PI/2}
  for(const z of [-4.8,-2.4,0,2.4,4.8])cyl(.16,1.25,[side*8.65,5,z],txmat,tx,16);
}
// HV/LV terminal pads and corona/clamp hardware
for(const z of [-5,0,5]){box([.9,.18,.55],[-7.2,16.55,z],al,tx);torus(.72,.06,[-7.2,16.35,z],al,tx,Math.PI/2)}
for(const z of [-3.25,0,3.25]){box([.9,.16,.5],[7.2,14.15,z],al,tx);torus(.52,.05,[7.2,13.95,z],al,tx,Math.PI/2)}
// Visible tank earth pads and bonds
for(const z of [-5.2,5.2]){box([.5,.5,.12],[-8.55,1.7,z],copper,tx);tube([[47.45,2.25,z],[46.8,.65,z],[46.3,.15,z]],.07,copper)}
// Marshalling kiosk face, handle and cable entries
box([.08,2.45,1.8],[9.84,2.2,7.4],M(0xb8c0c4,.65,.28),tx);
box([.08,.45,.08],[9.9,2.2,8.15],black,tx);
for(let z=6.8;z<=8.0;z+=.4)cyl(.055,.55,[9.7,.45,z],black,tx,10);
// Oil drain / inspection sump cover
cyl(.72,.12,[69.5,.12,10.5],M(0x4c555a,.75,.25),scene,24);
// V9 Phase 5B: transformer field accessories and civil containment details.
// OLTC drive/selector enclosure and local mechanism cabinet (generic external representation)
box([3.4,5.2,3.0],[-6.9,4.2,7.2],txmat,tx);box([1.8,2.2,.25],[-6.9,4.2,8.82],steel,tx);
label('OLTC COMPARTMENT',[49,7.5,9.5]);
// Neutral bushing and visible tank-to-earth bonds
ins(3.8,9.9,5.1,3.0,porc,tx);cyl(.18,.5,[3.8,13.15,5.1],copper,tx);
const txEarth1=tube([[48.2,1.0,-5.5],[47.2,.25,-6.5],[47.2,-.05,-6.5]],.055,copper);earthObjects.push(txEarth1);
const txEarth2=tube([[63.8,1.0,5.5],[64.8,.25,6.5],[64.8,-.05,6.5]],.055,copper);earthObjects.push(txEarth2);
// Oil level indicator on conservator and winding/oil temperature gauges
cyl(.48,.16,[4.55,14.1,0],M(0xe7e1d0,.05,.25),tx);cyl(.32,.12,[7.9,8.2,5.9],M(0xe7e1d0,.05,.25),tx);cyl(.32,.12,[7.2,7.3,5.9],M(0xe7e1d0,.05,.25),tx);
// Pressure relief device with discharge hood
cyl(.48,.55,[-3.5,10.55,3.8],M(0xb5b9b6,.55,.35),tx);cyl(.62,.14,[-3.5,10.9,3.8],M(0xc8c8c2,.4,.35),tx);
// Drain/sample valves low on tank
cyl(.16,.75,[-8.75,1.45,-3.8],copper,tx);cyl(.16,.75,[8.75,1.45,3.8],copper,tx);
// Transformer nameplate
box([.08,1.55,3.2],[8.55,5.4,-2.2],M(0xd4d7d5,.7,.25),tx);
// Oil containment bund wall and gravel-filled sump/drain point around transformer foundation
for(const z of [-14,14])box([36,.65,.35],[56,.325,z],conc);
for(const x of [38,74])box([.35,.65,28],[x,.325,0],conc);
cyl(.5,.12,[71,.08,11],black);tube([[71,.12,11],[73,.12,13]],.08,black);
// Extra radiator fan guards and manifold detail
for(const side of [-1,1])for(const z of [-3,0,3])torus(.88,.045,[side*11.2,4.7,z],gal,tx,0);
// bushings: HV taller, LV shorter
[-5,0,5].forEach(z=>{ins(-7.2,9.9,z,6.5,brown,tx);torus(.62,.055,[-7.2,16.1,z],al,tx,Math.PI/2);ins(7.2,9.9,z*.65,3.8,porc,tx);box([1.15,.12,.2],[7.2,14,z*.65],al,tx)});
// internal core/windings hidden until cutaway
const internals=new THREE.Group();tx.add(internals);internals.visible=false;
for(const z of [-3.5,0,3.5]){box([1.3,6.4,1.3],[0,5,z],coreMat,internals);const hv=cyl(1.65,4.8,[0,5,z],hvMat,internals,28);const lv=cyl(1.25,5.2,[0,5,z],lvMat,internals,28)}
box([1.3,1.1,9],[0,8.1,0],coreMat,internals);box([1.3,1.1,9],[0,1.9,0],coreMat,internals);
// V9 Phase 5 transformer education: separate winding indications and magnetic-flux visualization.
// These are conceptual training overlays; no primary current is shown jumping between windings.
const fluxLoops=[];
for(const z of [-3.5,0,3.5]){
 const loop=new THREE.Mesh(new THREE.TorusGeometry(2.05,.10,10,44),new THREE.MeshBasicMaterial({color:0x69b7ff,transparent:true,opacity:.0,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
 loop.rotation.x=Math.PI/2;loop.position.set(0,5,z);internals.add(loop);fluxLoops.push(loop);
}
const hvTag=label('132 kV HV WINDINGS',[51.5,8.2,-8.5]);hvTag.visible=false;cutObjects.push(hvTag);
const fluxTag=label('ALTERNATING MAGNETIC FLUX',[56,5,-8.5]);fluxTag.visible=false;cutObjects.push(fluxTag);
const lvTag=label('33 kV LV WINDINGS',[60.5,8.2,-8.5]);lvTag.visible=false;cutObjects.push(lvTag);
reg(tx,'132/33 kV Power Transformer',132,'Transfers energy from the 132 kV system to the 33 kV system by electromagnetic induction. The windings are electrically isolated; energy is coupled through magnetic flux in the core. V9 field detail includes conservator/Buchholz piping, breather, cooling radiators and fans, OLTC enclosure, marshalling kiosk, neutral bushing, gauges, pressure relief, tank earthing and oil containment.');label('132/33 kV POWER TRANSFORMER',[56,22,-11]);
// 132_KV_TRANSFORMER_CONNECTION — exactly three flexible jumpers, one per phase, terminated on actual HV bushing clamps.
PH132.forEach(z=>{tube([[39,11.70,z],[42,12.0,z],[45.5,14.2,z],[48.8,17.0,z]],.085);torus(.30,.040,[39,11.70,z],al,scene,Math.PI/2)});
// 33 kV yard
const cb33g=new THREE.Group();scene.add(cb33g);const cb33Contacts=[];[-3.2,0,3.2].forEach(z=>{pad(78,z,2.2,2);box([1.45,1.15,1.25],[78,.95,z],steel);ins(77.62,1.35,z,2.25,porc);ins(78.38,1.35,z,2.25,porc);const c33=new THREE.Group();c33.position.set(77.62,3.75,z);scene.add(c33);box([.76,.16,.28],[.38,0,0],al,c33);cb33Contacts.push(c33)});// 33 kV incomer receiving terminals
[-3.2,0,3.2].forEach(z=>box([.28,.20,.34],[78.38,3.75,z],al));
reg(cb33g,'33 kV Transformer Incomer Circuit Breaker',33,'Controls and protects the transformer connection to the 33 kV bus.');label('33 kV INCOMER CB',[78,7,-8]);
const inst33=new THREE.Group();scene.add(inst33);[-3.2,0,3.2].forEach(z=>{pad(88,z,1.8,1.8);box([.9,.55,.9],[88,.7,z],steel);ins(88,1,z,2.5,porc)});reg(inst33,'33 kV CT / VT',33,'Provides current and voltage measurements for 33 kV protection and metering.');label('33 kV CT / VT',[88,6.5,-8]);
[-3.2,0,3.2].forEach(z=>{
  // One physical phase conductor per 33 kV transformer bushing.
  // Keep this primary path single and continuous: LV bushing -> incomer CB -> CT/VT.
  // Transformer-side conductor terminates at the incomer CB source-side bushing.
  tube([[63.2,14,z],[68.5,8.0,z],[73.5,4.25,z],[77.62,3.75,z]],.07);
  // Bus-side conductor starts at the opposite CB bushing; no fixed conductor bridges the breaker.
  tube([[78.38,3.75,z],[88,4.0,z],[94,4.4,z]],.07);
  // Riser from instrument-transformer side to the elevated 33 kV bus.
  tube([[94,4.4,z],[96,7.9,z]],.07);
  // Main bus on the new post-insulator support line.
  tube([[96,7.9,z],[108,7.9,z],[120,7.9,z]],.08);
  tube([[120,7.9,z],[123,7.2,z]],.07);
});label('33 kV BUSBAR',[108,10.4,-7]);
// V9 Phase 2: three complete, visually distinct 33 kV feeder bays.
// Each bay has bus take-off, three-phase disconnector, breaker, CT, outgoing gantry and conductors.
const feederGroups=[],feederBreakerVisuals=[],feederDisconnectors=[],feederContacts=[[],[],[]];
[-28,0,28].forEach((fz,i)=>{
 const g=new THREE.Group();scene.add(g);feederGroups.push(g);
 const ds=new THREE.Group();scene.add(ds);
 [-3,0,3].forEach((d,j)=>{
   const z=fz+d, busz=[-3.2,0,3.2][j];
   // bus take-off and feeder disconnector
   tube([[123,7.2,busz],[124.5,6.0,z],[126,3.8,z]],.065,al,g);
   pad(127,z,2.2,1.6);ins(126.25,.4,z,3.15,porc,g);ins(127.75,.4,z,3.15,porc,g);
   const pivot=new THREE.Group();pivot.position.set(126.25,3.8,z);scene.add(pivot);
   box([1.55,.11,.14],[.78,0,0],al,pivot);ds.userData.blades=(ds.userData.blades||[]);ds.userData.blades.push(pivot);
   // feeder circuit breaker
   pad(132,z,2.3,1.8);box([1.25,.8,1.05],[132,.78,z],steel,g);
   ins(131.62,1.1,z,2.25,porc,g);ins(132.38,1.1,z,2.25,porc,g);
   const fc=new THREE.Group();fc.position.set(131.62,3.55,z);scene.add(fc);box([.76,.15,.24],[.38,0,0],al,fc);feederContacts[i].push(fc);
   box([.28,.18,.30],[132.38,3.55,z],al,g);
   // CT after breaker
   pad(136,z,1.55,1.55);box([.8,.45,.8],[136,.6,z],steel,g);ins(136,.8,z,2.25,porc,g);
   torus(.48,.11,[136,3.25,z],brown,g,Math.PI/2);
   // physically continuous phase conductor through bay
   tube([[127.8,3.8,z],[131.62,3.55,z]],.065,al,g);
   // Clean outgoing termination: conductor is seated on a dedicated 33 kV post insulator.
   // No floating strain string and no conductor passes through steelwork.
   tube([[132.38,3.55,z],[136,3.35,z],[139.6,7.0,z],[141.0,9.55,z]],.065,al,g);
   // Dedicated phase post insulator mounted on the earthed outgoing crossarm.
   ins(141.0,7.85,z,1.55,porc,g);
   box([.52,.12,.30],[141.0,9.48,z],al,g);
   // Outgoing 33 kV line starts at the same terminal clamp and leaves the substation.
   sagTube([141.0,9.55,z],[162,10.2,z],.42,.065,al,g);
 });
 g.userData.disconnector=ds;feederDisconnectors.push(ds);
 // outgoing steel gantry
 box([.35,8,.35],[141,4,fz-5],gal,g);box([.35,8,.35],[141,4,fz+5],gal,g);box([.4,.4,11],[141,7.75,fz],gal,g);
 // breaker mechanism cabinet
 box([2.2,1.8,1.6],[132,.9,fz+6.2],steel,g);
 reg(g,'33 kV Feeder '+(i+1),33,'Complete outgoing feeder bay: bus take-off, disconnector, circuit breaker, current transformer and outgoing gantry. The circuit breaker interrupts load/fault current; the disconnector provides visible isolation after the breaker is open.');
 reg(ds,'33 kV Feeder '+(i+1)+' Disconnector',33,'Provides visible isolation for feeder '+(i+1)+'. Open the feeder circuit breaker before operating this disconnector.');
 feederBreakerVisuals.push(g);
 label('33 kV FEEDER '+(i+1),[141,13.5,fz]);
});
// control building and trenches
box([25,7.5,17],[48,3.75,39],M(0xc8c5ba,0,.9));box([26,.5,18],[48,7.7,39],M(0x4c575d,.45,.5));box([175,.22,2],[25,.11,26],black);label('CONTROL & PROTECTION',[48,11.2,39]);
// V7 realistic terminal hardware: clamps and phase marker discs at major connection points
const phaseColors=[0xd94b42,0xe7c447,0x4f7fd7];
[[-69,9.5],[-56.1,5.75],[-49.9,5.75],[-40,5.55],[-15,6.2],[-5.1,5.75],[8,7.2],[39,7.2]].forEach(([x,y])=>{
 [-6,0,6].forEach((z,i)=>{const c=cyl(.16,.32,[x,y,z],gal);c.rotation.z=Math.PI/2;if(x===-69||x===39)cyl(.2,.08,[x,y+.35,z],M(phaseColors[i],.1,.45))})
});
// V7 cable trench covers
for(let x=-70;x<125;x+=3)box([2.75,.12,2.2],[x,.07,27],M(0x6e7371,.05,.82));
// training state
const state={power:false,lineIso:true,cb132:true,busIso:true,cb33:true,feeders:[true,true,true],feederIso:[true,true,true],feederFault:[false,false,false],fault:false,cut:false,earth:false,training:false,trainingStep:0,trainingErrors:0,protPulse:0,faultZone:''};
const flow33=[[],[],[]],flowFeeders=Array.from({length:3},()=>[[],[],[]]);
function particle(c){
 const g=new THREE.Group();
 const core=new THREE.Mesh(new THREE.SphereGeometry(.30,14,12),new THREE.MeshBasicMaterial({color:c,toneMapped:false}));
 const glow1=new THREE.Mesh(new THREE.SphereGeometry(.62,14,12),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.48,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
 const glow2=new THREE.Mesh(new THREE.SphereGeometry(1.05,14,12),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
 g.add(glow2,glow1,core);scene.add(g);return g
}
const phaseZ132=[-6,0,6], phaseZ33=[-3.2,0,3.2];
const phaseColorsFlow=[0xff3b30,0xffd21f,0x2677ff]; // R Y B
const p132Line=phaseZ132.map((z,i)=>new THREE.CatmullRomCurve3([[TX,towerPhaseY[i]-3.4,z],[-116,21.5,z],[-100,19.8,z],[-84.9,20,z],[-79.2,12,z],[-73,7,z],[T132.lineIsoSrc,4.85,z]].map(v=>new THREE.Vector3(...v))));
const p132AfterLineIso=phaseZ132.map(z=>new THREE.CatmullRomCurve3([[T132.lineIsoDst,4.85,z],[T132.ct,4.85,z],[T132.cbSrc,4.85,z]].map(v=>new THREE.Vector3(...v))));
const p132AfterCB=phaseZ132.map(z=>new THREE.CatmullRomCurve3([[T132.cbDst,4.85,z],[T132.busIsoSrc,4.85,z]].map(v=>new THREE.Vector3(...v))));
const p132Bus=phaseZ132.map(z=>new THREE.CatmullRomCurve3([[T132.busIsoDst,4.85,z],[T132.busRise,7.2,z],[-10,10.5,z],[-7,11.7,z],[17,11.7,z],[39,11.7,z],[42,12,z],[45.5,14.2,z],[48.8,17,z]].map(v=>new THREE.Vector3(...v))));
const flow132Line=[[],[],[]],flow132AfterLineIso=[[],[],[]],flow132AfterCB=[[],[],[]],flow132Bus=[[],[],[]];
const p33Up=phaseZ33.map(z=>new THREE.CatmullRomCurve3([[63.2,14,z],[68.5,8,z],[73.5,4.25,z],[77.62,3.75,z]].map(v=>new THREE.Vector3(...v))));
const p33=phaseZ33.map(z=>new THREE.CatmullRomCurve3([[78.38,3.75,z],[88,4,z],[94,4.4,z],[96,7.9,z],[108,7.9,z],[120,7.9,z],[123,7.2,z]].map(v=>new THREE.Vector3(...v))));
const flow33Up=[[],[],[]];
const feederZ=[-28,0,28];
const pFeeders=feederZ.map(fz=>phaseZ33.map((z,ph)=>new THREE.CatmullRomCurve3([[123,7.2,z],[126,3.8,fz+[-3,0,3][ph]],[132,3.55,fz+[-3,0,3][ph]],[136,3.35,fz+[-3,0,3][ph]],[139.6,7.0,fz+[-3,0,3][ph]],[141,9.55,fz+[-3,0,3][ph]],[150,9.55,fz+[-3,0,3][ph]],[162,10.2,fz+[-3,0,3][ph]]].map(v=>new THREE.Vector3(...v)))));
for(let ph=0;ph<3;ph++){
 for(const arr of [flow132Line[ph],flow132AfterLineIso[ph],flow132AfterCB[ph],flow132Bus[ph]])for(let i=0;i<7;i++){const o=particle(phaseColorsFlow[ph]);o.userData.t=i/7;arr.push(o)}
 for(let i=0;i<8;i++){const o=particle(phaseColorsFlow[ph]);o.userData.t=i/8;flow33Up[ph].push(o)}
 for(let i=0;i<12;i++){const o=particle(phaseColorsFlow[ph]);o.userData.t=i/12;flow33[ph].push(o)}
 for(let fd=0;fd<3;fd++)for(let i=0;i<16;i++){const o=particle(phaseColorsFlow[ph]);o.userData.t=(i/16+fd*.055)%1;flowFeeders[fd][ph].push(o)}
}
const live132Line=()=>state.power&&!state.fault;const live132AfterLineIso=()=>live132Line()&&state.lineIso;const live132AfterCB=()=>live132AfterLineIso()&&state.cb132;const e132=()=>live132AfterCB()&&state.busIso;const e33=()=>e132()&&state.cb33;const eFeeder=i=>e33()&&state.feeders[i]&&state.feederIso[i]&&!state.feederFault[i];
function blades(g,closed){(g.userData.blades||[]).forEach(b=>b.rotation.z=closed?0:-.7)}
function breakerVisual(arr,closed,openUp=false){arr.forEach(o=>{o.rotation.z=closed?0:(openUp?1.05:-1.05);o.rotation.y=0;o.position.y=o.userData.baseY??o.position.y;if(o.userData.baseY===undefined)o.userData.baseY=o.position.y})}
function setSldState(id,closed){const e=document.getElementById(id);if(!e)return;e.textContent=closed?'●':'○';e.classList.toggle('sldClosed',closed);e.classList.toggle('sldOpen',!closed)}
function sldClass(id,closed){const e=document.getElementById(id);if(!e)return;e.classList.toggle('closed',closed);e.classList.toggle('open',!closed)}
function syncGraphicalSLD(){
 const a=e132(),b=e33();
 ['w132a'].forEach(id=>document.getElementById(id)?.classList.toggle('live132',state.power));
 ['w132b','bus132','wTx132'].forEach(id=>document.getElementById(id)?.classList.toggle('live132',a));
 ['wTx33','w33inc','w33bus'].forEach(id=>document.getElementById(id)?.classList.toggle('live33',b));
 for(let i=0;i<3;i++)document.getElementById('wf'+(i+1))?.classList.toggle('live33',eFeeder(i));
 sldClass('symLineIso',state.lineIso);sldClass('sym132cb',state.cb132);sldClass('symBusIso',state.busIso);sldClass('sym33cb',state.cb33);
 for(let i=0;i<3;i++){sldClass('sf'+(i+1)+'cb',state.feeders[i]);sldClass('sf'+(i+1)+'iso',state.feederIso[i])}
}
function updateNextHighlight(){document.querySelectorAll('.nextOp').forEach(e=>e.classList.remove('nextOp'));if(!state.training)return;const s=currentScenario(),exp=s.seq[state.trainingStep];if(!exp)return;const map={cb33:'cb33',cb132:'cb132',busIso:'busIso',lineIso:'lineIso',f1:'f1',fd1:'fd1',ff1:'ff1'};const e=document.getElementById(map[exp[0]]);if(e)e.classList.add('nextOp')}
function ui(){blades(lineDisc,state.lineIso);blades(busDisc,state.busIso);breakerVisual(cb132Contacts,state.cb132,true);breakerVisual(cb33Contacts,state.cb33);for(let i=0;i<3;i++)breakerVisual(feederContacts[i],state.feeders[i],true);syncGraphicalSLD();for(const [id,key,n] of [['lineIso','lineIso','Line ISO'],['cb132','cb132','132 CB'],['busIso','busIso','Bus ISO'],['cb33','cb33','33 CB']])document.getElementById(id).textContent=n+' '+(state[key]?'CLOSED':'OPEN');document.getElementById('power').classList.toggle('active',state.power);document.getElementById('fault').classList.toggle('active',state.fault);document.getElementById('cut').classList.toggle('active',state.cut);document.getElementById('earth').classList.toggle('active',state.earth);document.getElementById('sLine').textContent=state.power?'ENERGIZED':'DE-ENERGIZED';document.getElementById('sBus').textContent=e132()?'ENERGIZED':'DE-ENERGIZED';document.getElementById('sTx').textContent=e132()?'IN SERVICE':'OUT';document.getElementById('s33').textContent=e33()?'ENERGIZED':'DE-ENERGIZED';for(let i=0;i<3;i++){const b=document.getElementById('f'+(i+1));b.textContent='F'+(i+1)+' CB '+(state.feeders[i]?'CLOSED':'OPEN');b.classList.toggle('active',!state.feeders[i]);const d=document.getElementById('fd'+(i+1));d.textContent='F'+(i+1)+' ISO '+(state.feederIso[i]?'CLOSED':'OPEN');d.classList.toggle('active',!state.feederIso[i]);document.getElementById('ff'+(i+1)).classList.toggle('active',state.feederFault[i]);blades(feederDisconnectors[i],state.feederIso[i]);if(feederBreakerVisuals[i])feederBreakerVisuals[i].traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive)o.material.emissiveIntensity=state.feeders[i]?0:.12})}document.getElementById('mode').textContent=state.training?'TRAINING • SWITCHING EXERCISE':state.fault?'PROTECTION • FAULT TRIPPED':state.cut?'TRANSFORMER • CUTAWAY':state.earth?'EARTHING • GRID VIEW':state.power?'POWER FLOW • LIVE':'EXPLORE • SYSTEM NORMAL'};document.querySelectorAll('.feederSld').forEach((n,i)=>{n.style.borderColor=state.feederFault[i]?'#ff7462':eFeeder(i)?'#70d58c':'#35566a';n.style.color=state.feederFault[i]?'#ff7462':eFeeder(i)?'#70d58c':'#eaf2f7'});updateNextHighlight()
const scenarios={
 txoff:{task:'Isolate the 132/33 kV transformer switching path for maintenance',initial:{power:true,cb33:true,cb132:true,busIso:true,lineIso:true},seq:[['cb33',false,'Open 33 kV transformer incomer CB'],['cb132',false,'Open 132 kV circuit breaker'],['busIso',false,'Open 132 kV bus disconnector'],['lineIso',false,'Open 132 kV line disconnector']]},
 txon:{task:'Return the transformer switching path to service',initial:{power:true,cb33:false,cb132:false,busIso:false,lineIso:false},seq:[['lineIso',true,'Close 132 kV line disconnector'],['busIso',true,'Close 132 kV bus disconnector'],['cb132',true,'Close 132 kV circuit breaker'],['cb33',true,'Close 33 kV transformer incomer CB']]},
 f1off:{task:'Isolate 33 kV Feeder 1',initial:{power:true,cb33:true,cb132:true,busIso:true,lineIso:true},seq:[['f1',false,'Open Feeder 1 circuit breaker'],['fd1',false,'Open Feeder 1 disconnector']]},
 fault:{task:'Respond to a Feeder 1 protection trip and establish isolation',initial:{power:true,cb33:true,cb132:true,busIso:true,lineIso:true},seq:[['ff1',true,'Initiate Feeder 1 fault/protection trip'],['fd1',false,'Open Feeder 1 disconnector after CB trip']]}
};
function currentScenario(){return scenarios[document.getElementById('scenario').value]||scenarios.txoff}
function trainingAction(key,newValue){if(!state.training)return;const exp=currentScenario().seq[state.trainingStep];if(exp&&key===exp[0]&&newValue===exp[1]){state.trainingStep++;trainLog('✓ '+exp[2]);if(state.trainingStep===currentScenario().seq.length){document.getElementById('trainStep').innerHTML='<b class="green">TASK COMPLETE</b> • '+state.trainingErrors+' unsafe/incorrect attempt(s)';trainLog('Assessment complete.')}}else{state.trainingErrors++;trainLog('✗ Incorrect sequence: '+key+' '+(newValue?'CLOSE/OPERATE':'OPEN/RESET'));}}
function trainLog(t){const l=document.getElementById('trainLog');l.innerHTML+=t+'<br>';l.scrollTop=l.scrollHeight;updateTraining()}
function updateTraining(){if(!state.training)return;const s=currentScenario();if(state.trainingStep<s.seq.length)document.getElementById('trainStep').textContent='Next operation: '+s.seq[state.trainingStep][2]}
function resetTraining(){const s=currentScenario();state.trainingStep=0;state.trainingErrors=0;Object.assign(state,s.initial);state.feeders=[true,true,true];state.feederIso=[true,true,true];state.feederFault=[false,false,false];if(document.getElementById('scenario').value==='txon'){state.cb33=false;state.cb132=false;state.busIso=false;state.lineIso=false}document.getElementById('trainLog').innerHTML='Assessment started.<br>';document.getElementById('trainTask').textContent='Task: '+s.task;updateTraining();ui()}
function toggle(id,key){document.getElementById(id).onclick=()=>{const nv=!state[key];if((key==='lineIso'||key==='busIso')&&state.power&&state.cb132&&state[key]){document.getElementById('eqName').textContent='SWITCHING WARNING';document.getElementById('eqInfo').textContent='Open the associated circuit breaker before opening a disconnector under load.';if(state.training){state.trainingErrors++;trainLog('✗ BLOCKED unsafe operation: '+key+' disconnector attempted under load')}return}trainingAction(key,nv);state[key]=nv;ui()}}
toggle('lineIso','lineIso');toggle('cb132','cb132');toggle('busIso','busIso');toggle('cb33','cb33');
for(let i=0;i<3;i++)document.getElementById('f'+(i+1)).onclick=()=>{const nv=!state.feeders[i];trainingAction('f'+(i+1),nv);state.feeders[i]=nv;document.getElementById('eqName').textContent='33 kV FEEDER '+(i+1);document.getElementById('eqInfo').textContent=state.feeders[i]?'Feeder breaker closed. Feeder is available to energize from the 33 kV bus.':'Feeder breaker open. Power flow is isolated on this feeder only.';ui()};
for(let i=0;i<3;i++){
 document.getElementById('fd'+(i+1)).onclick=()=>{if(state.feederIso[i]&&e33()&&state.feeders[i]){document.getElementById('eqName').textContent='SWITCHING INTERLOCK';document.getElementById('eqInfo').textContent='Blocked: open Feeder '+(i+1)+' circuit breaker before opening its disconnector. A disconnector must not interrupt load current.';return}const nv=!state.feederIso[i];trainingAction('fd'+(i+1),nv);state.feederIso[i]=nv;ui()};
 document.getElementById('ff'+(i+1)).onclick=()=>{const nv=!state.feederFault[i];trainingAction('ff'+(i+1),nv);state.feederFault[i]=nv;if(state.feederFault[i]){state.feeders[i]=false;runProtection(i)}document.getElementById('eqName').textContent='FEEDER '+(i+1)+' PROTECTION';document.getElementById('eqInfo').textContent=state.feederFault[i]?'Fault detected: CT sensed fault current, relay operated, station DC energized the trip coil and Feeder '+(i+1)+' CB opened. Other feeders remain in service.':'Feeder '+(i+1)+' fault reset. Breaker remains open until manually reclosed.';ui()};
}
function runProtection(i){
 const ids=['pCT','pRelay','pDC','pTrip'];state.protPulse++;
 const token=state.protPulse;document.getElementById('protMsg').textContent='Feeder '+(i+1)+' fault detected — protection operating';
 ids.forEach(x=>document.getElementById(x).classList.remove('live'));
 ids.forEach((id,k)=>setTimeout(()=>{if(token!==state.protPulse)return;document.getElementById(id).classList.add('live');document.getElementById('protMsg').textContent=['CT detects high fault current','Protection relay picks up and issues TRIP','Station DC supplies dependable trip energy','Trip coil opens Feeder '+(i+1)+' circuit breaker'][k]},k*420));
 setTimeout(()=>{if(token!==state.protPulse)return;document.getElementById('protMsg').textContent='Feeder '+(i+1)+' isolated • healthy feeders remain energized';ids.forEach(x=>document.getElementById(x).classList.remove('live'))},2200)
}
document.getElementById('power').onclick=()=>{state.power=!state.power;ui()};
document.getElementById('fault').onclick=()=>{state.fault=!state.fault;if(state.fault)state.cb132=false;else state.cb132=true;ui()};
function applyZoneFault(zone){
 state.faultZone=zone;state.fault=false;
 let title='PROTECTION EVENT',msg='';
 if(zone==='line132'){state.fault=true;state.cb132=false;msg='132 kV incoming-line fault: line protection operated and the 132 kV circuit breaker tripped. Transformer and 33 kV bus lost supply.';runProtectionZone('132 kV LINE');}
 else if(zone==='transformer'){state.cb132=false;state.cb33=false;msg='Transformer internal/differential fault: transformer protection issued trips to both the 132 kV and 33 kV breakers, isolating the transformer from both sides.';runProtectionZone('TRANSFORMER DIFFERENTIAL');}
 else if(zone==='bus33'){state.cb33=false;state.feeders=[false,false,false];msg='33 kV busbar fault: bus protection isolated the transformer incomer and all three outgoing feeder breakers in this training model.';runProtectionZone('33 kV BUS');}
 else if(/^f[123]$/.test(zone)){const i=Number(zone[1])-1;state.feederFault[i]=true;state.feeders[i]=false;msg='33 kV Feeder '+(i+1)+' fault: feeder protection tripped only the affected feeder breaker. Healthy feeders remain available from the 33 kV bus.';runProtection(i);}
 document.getElementById('eqName').textContent=title;document.getElementById('eqInfo').textContent=msg;ui();
}
function runProtectionZone(name){
 const ids=['pCT','pRelay','pDC','pTrip'];state.protPulse++;const token=state.protPulse;
 ids.forEach(x=>document.getElementById(x).classList.remove('live'));
 document.getElementById('protMsg').textContent=name+' fault detected';
 ids.forEach((id,k)=>setTimeout(()=>{if(token!==state.protPulse)return;document.getElementById(id).classList.add('live');document.getElementById('protMsg').textContent=[name+' CT/protection inputs detect abnormal condition','Protection relay operates','Station DC supplies trip energy','Required circuit breaker trip coil(s) operate'][k]},k*420));
 setTimeout(()=>{if(token!==state.protPulse)return;ids.forEach(x=>document.getElementById(x).classList.remove('live'));document.getElementById('protMsg').textContent=name+' isolated by protection'},2200);
}
document.getElementById('applyFault').onclick=()=>{const z=document.getElementById('faultZone').value;if(z)applyZoneFault(z)};
document.getElementById('resetFaults').onclick=()=>{state.fault=false;state.faultZone='';state.feederFault=[false,false,false];state.cb132=true;state.cb33=true;state.feeders=[true,true,true];document.getElementById('faultZone').value='';document.getElementById('eqName').textContent='PROTECTION RESET';document.getElementById('eqInfo').textContent='Fault flags cleared and breakers restored for simulator training. In field operation, protection reset and re-energization require the applicable investigation, authorization and switching procedure.';ui()};

document.getElementById('cut').onclick=()=>{state.cut=!state.cut;tank.material.transparent=true;tank.material.opacity=state.cut?.14:1;internals.visible=state.cut;[hvTag,fluxTag,lvTag].forEach(s=>s.visible=state.cut);document.getElementById('eqName').textContent=state.cut?'TRANSFORMER CUTAWAY — ENERGY TRANSFER':'132/33 kV POWER TRANSFORMER';document.getElementById('eqInfo').innerHTML=state.cut?'<b>132 kV AC → magnetic flux → induced 33 kV AC</b><br>The HV and LV windings are electrically isolated. Alternating current in the HV winding establishes alternating magnetic flux in the laminated core. That changing flux links the LV winding and induces voltage by electromagnetic induction. The animation intentionally does not show electricity jumping between windings.':'Transformer cutaway closed.';ui()};
document.getElementById('earth').onclick=()=>{state.earth=!state.earth;earthObjects.forEach(o=>{o.position.y=state.earth?.12:-.08;o.material=state.earth?M(0x2dcc66,.15,.35):copper});ui()};
function view(p,t){camera.position.set(...p);controls.target.set(...t);controls.update()}
document.getElementById('overview').onclick=()=>view([105,68,118],[25,5,0]);document.getElementById('incoming').onclick=()=>view([-48,25,46],[-48,5,0]);document.getElementById('transformer').onclick=()=>view([83,29,35],[56,8,0]);document.getElementById('yard33').onclick=()=>view([138,31,65],[110,4,0]);document.getElementById('top').onclick=()=>view([25,175,.1],[25,0,0]);
document.getElementById('sldView').onclick=()=>{document.getElementById('left').classList.remove('control-hidden');document.getElementById('eqName').textContent='LIVE SINGLE LINE DIAGRAM';document.getElementById('eqInfo').textContent='Click a device in the Live SLD to fly to the corresponding 3D equipment.'};
document.getElementById('training').onclick=()=>{state.training=!state.training;document.getElementById('training').classList.toggle('trainingOn',state.training);document.getElementById('trainingPanel').style.display=state.training?'block':'none';document.getElementById('eqName').textContent=state.training?'TRAINING TASK':'TRAINING MODE';document.getElementById('eqInfo').textContent=state.training?'Operate the actual switching controls in the required sequence. Unsafe disconnector operations are blocked and recorded.':'Training exercise stopped.';if(state.training)resetTraining();ui()};
document.getElementById('trainReset').onclick=resetTraining;
document.getElementById('scenario').onchange=()=>{if(state.training)resetTraining()};
function clickControl(id){document.getElementById(id)?.click()}
document.getElementById('symLineIso')?.addEventListener('click',()=>clickControl('lineIso'));
document.getElementById('sym132cb')?.addEventListener('click',()=>clickControl('cb132'));
document.getElementById('symBusIso')?.addEventListener('click',()=>clickControl('busIso'));
document.getElementById('sym33cb')?.addEventListener('click',()=>clickControl('cb33'));
for(let i=1;i<=3;i++){document.getElementById('sf'+i+'cb')?.addEventListener('click',()=>clickControl('f'+i));document.getElementById('sf'+i+'iso')?.addEventListener('click',()=>clickControl('fd'+i))}
document.querySelectorAll('.sldFocus').forEach(n=>n.addEventListener('click',()=>{const t=n.dataset.label;const s=labels.find(x=>x.userData.labelText===t);if(s)focusLabel(s)}));

// picking
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
let cameraFlight=null;
function easeInOutCubic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function focusLabel(s){
 const target=s.userData.target.clone();
 const approach=camera.position.clone().sub(controls.target);approach.y*=.45;
 if(approach.lengthSq()<.01)approach.set(1,.35,1);
 approach.normalize();
 const endPos=target.clone().add(approach.multiplyScalar(20)).add(new THREE.Vector3(0,5.5,0));
 cameraFlight={start:performance.now(),duration:1200,fromPos:camera.position.clone(),toPos:endPos,fromTarget:controls.target.clone(),toTarget:target.clone()};
 document.getElementById('eqName').textContent=s.userData.labelText;
 document.getElementById('eqInfo').textContent='Moving to equipment…';
}
document.querySelectorAll('.sldNode').forEach(b=>b.addEventListener('click',()=>{const s=labels.find(x=>x.userData.labelText===b.dataset.label);if(s)focusLabel(s)}));
document.querySelectorAll('.feederSld').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.feeder),s=labels.find(x=>x.userData.labelText==='33 kV FEEDER '+(i+1));if(s)focusLabel(s);document.getElementById('eqInfo').textContent='Feeder '+(i+1)+': CB '+(state.feeders[i]?'CLOSED':'OPEN')+', ISO '+(state.feederIso[i]?'CLOSED':'OPEN')+(state.feederFault[i]?' • FAULT TRIPPED':'')}));
// V9 navigation: hold left mouse button and drag to orbit continuously around the current target.
// OrbitControls already owns left-drag; these handlers make the interaction explicit and prevent
// equipment picking when the user intended to rotate the view.
let leftHold=false,leftDownX=0,leftDownY=0,leftDragged=false;
renderer.domElement.style.touchAction='none';
renderer.domElement.style.cursor='grab';
renderer.domElement.addEventListener('contextmenu',ev=>ev.preventDefault());
renderer.domElement.addEventListener('pointerdown',ev=>{
 if(ev.button===0)renderer.domElement.style.cursor='grabbing';
});
addEventListener('pointerup',()=>{renderer.domElement.style.cursor='grab'});
addEventListener('pointercancel',()=>{renderer.domElement.style.cursor='grab'});
renderer.domElement.addEventListener('pointerdown',ev=>{
 if(ev.button===0){leftHold=true;leftDownX=ev.clientX;leftDownY=ev.clientY;leftDragged=false}
});
renderer.domElement.addEventListener('pointermove',ev=>{
 // Small threshold keeps clicks reliable while making orbit respond almost immediately.
 if(leftHold&&Math.hypot(ev.clientX-leftDownX,ev.clientY-leftDownY)>3)leftDragged=true
});
addEventListener('pointerup',ev=>{if(ev.button===0)leftHold=false});
addEventListener('pointercancel',()=>{leftHold=false});
renderer.domElement.addEventListener('pointerdown',ev=>{if(ev.button!==0)return;setTimeout(()=>{if(leftDragged)return;mouse.x=ev.clientX/innerWidth*2-1;mouse.y=-(ev.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);
const lh=ray.intersectObjects(labels,false)[0];if(lh){focusLabel(lh.object);return}
const h=ray.intersectObjects(scene.children,true)[0];if(!h)return;let o=h.object;while(o.parent&&!o.userData?.name)o=o.parent;if(o.userData?.name){document.getElementById('eqName').textContent=o.userData.name;document.getElementById('eqInfo').innerHTML='<b>'+o.userData.kv+' kV</b><br>'+o.userData.info}},0)});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
let labelMode=1;
document.getElementById('labels').onclick=()=>{labelMode=(labelMode+1)%3;const b=document.getElementById('labels');b.textContent=labelMode===0?'Labels: OFF':labelMode===1?'Labels: NORMAL':'Labels: LARGE';labels.forEach(s=>{s.visible=labelMode!==0;s.scale.set(labelMode===2?10.8:7.2,labelMode===2?1.8:1.2,1)})};
document.getElementById('controls').onclick=()=>{const p=document.getElementById('left');p.classList.toggle('control-hidden');document.getElementById('controls').textContent=p.classList.contains('control-hidden')?'Show Controls':'Hide Controls'};
ui();let clock=0;renderer.setAnimationLoop(()=>{clock+=.0024;
 if(cameraFlight){const raw=Math.min(1,(performance.now()-cameraFlight.start)/cameraFlight.duration),k=easeInOutCubic(raw);camera.position.lerpVectors(cameraFlight.fromPos,cameraFlight.toPos,k);controls.target.lerpVectors(cameraFlight.fromTarget,cameraFlight.toTarget,k);if(raw>=1){document.getElementById('eqInfo').textContent='Equipment focused. Click the equipment itself for detailed training information.';cameraFlight=null}}
 controls.update();labels.forEach(s=>{if(labelMode!==0&&!cutObjects.includes(s))s.visible=true});if(state.cut){fluxLoops.forEach((o,i)=>{o.material.opacity=.28+.24*(.5+.5*Math.sin(clock*16+i*1.7));const s=1+.08*Math.sin(clock*16+i*1.7);o.scale.setScalar(s)})}flow132Line.forEach((arr,ph)=>arr.forEach(o=>{o.visible=live132Line();o.position.copy(p132Line[ph].getPoint((o.userData.t+clock)%1))}));
 flow132AfterLineIso.forEach((arr,ph)=>arr.forEach(o=>{o.visible=live132AfterLineIso();o.position.copy(p132AfterLineIso[ph].getPoint((o.userData.t+clock)%1))}));
 flow132AfterCB.forEach((arr,ph)=>arr.forEach(o=>{o.visible=live132AfterCB();o.position.copy(p132AfterCB[ph].getPoint((o.userData.t+clock)%1))}));
 flow132Bus.forEach((arr,ph)=>arr.forEach(o=>{o.visible=e132();o.position.copy(p132Bus[ph].getPoint((o.userData.t+clock)%1))}));flow33Up.forEach((arr,ph)=>arr.forEach(o=>{o.visible=e132();o.position.copy(p33Up[ph].getPoint((o.userData.t+clock*1.12)%1))}));flow33.forEach((arr,ph)=>arr.forEach(o=>{o.visible=e33();o.position.copy(p33[ph].getPoint((o.userData.t+clock*1.12)%1))}));flowFeeders.forEach((fd,fi)=>fd.forEach((arr,ph)=>arr.forEach(o=>{o.visible=eFeeder(fi);o.position.copy(pFeeders[fi][ph].getPoint((o.userData.t+clock*1.18)%1))})));renderer.render(scene,camera)});
}catch(err){const e=document.getElementById('err');e.style.display='block';e.textContent='3D simulator failed to initialize: '+err.message;console.error(err)}
