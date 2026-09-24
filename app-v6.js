import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
try{
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb8ccd5);scene.fog=new THREE.Fog(0xb8ccd5,190,380);
const camera=new THREE.PerspectiveCamera(44,innerWidth/innerHeight,.1,700);camera.position.set(105,68,118);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;document.getElementById('app').appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(25,5,0);controls.enableDamping=true;controls.minDistance=0.35;controls.maxDistance=260;controls.maxPolarAngle=1.52;
// Mouse navigation: left = orbit, middle = pan/drag, right = pan
controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;
controls.mouseButtons.MIDDLE=THREE.MOUSE.PAN;
controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;
controls.screenSpacePanning=true;
// Faster, more responsive mouse navigation
controls.panSpeed=2.2;
controls.rotateSpeed=1.35;
controls.zoomSpeed=1.5;
renderer.domElement.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault()});
renderer.domElement.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault()});
scene.add(new THREE.HemisphereLight(0xeaf7ff,0x556052,2.15));const sun=new THREE.DirectionalLight(0xfff2d8,3.4);sun.position.set(-70,110,65);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-150;sun.shadow.camera.right=150;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;scene.add(sun);
const M=(c,metal=.1,rough=.65)=>new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
const gal=M(0x9ca5a7,.72,.36),steel=M(0x59646a,.78,.38),porc=M(0xd7d0c1,.03,.24),brown=M(0x6d4434,.03,.28),txmat=M(0x435e4c,.42,.48),conc=M(0x9b9d98,.02,.9),gravel=M(0x777d75,0,.98),al=M(0x8e9696,.78,.3),copper=M(0x8c5b3d,.58,.35),black=M(0x22282b,.35,.5),coreMat=M(0x343b40,.8,.32),hvMat=M(0xb94736,.55,.3),lvMat=M(0xd8872c,.55,.3);
const pick=[];const labels=[];const earthObjects=[];const cutObjects=[];
function box(s,p,m=gal,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);o.castShadow=o.receiveShadow=true;parent.add(o);return o}
function cyl(r,h,p,m=gal,parent=scene,seg=24){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);o.position.set(...p);o.castShadow=o.receiveShadow=true;parent.add(o);return o}
function reg(g,name,kv,info){g.userData={name,kv,info};pick.push(g);return g}
function tube(points,r=.07,m=al,parent=scene){const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Mesh(new THREE.TubeGeometry(c,Math.max(12,points.length*8),r,8,false),m);o.castShadow=true;parent.add(o);return o}
function pad(x,z,w=2.3,d=2.3){return box([w,.38,d],[x,.19,z],conc)}
function torus(R,r,p,m=steel,parent=scene,rx=Math.PI/2){const o=new THREE.Mesh(new THREE.TorusGeometry(R,r,10,28),m);o.position.set(...p);o.rotation.x=rx;o.castShadow=true;parent.add(o);return o}
function beamBetween(a,b,r=.07,m=gal,parent=scene){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),mid=A.clone().add(B).multiplyScalar(.5);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,A.distanceTo(B),8),m);o.position.copy(mid);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize());o.castShadow=true;parent.add(o);return o}
function ins(x,y,z,h=4.5,material=brown,parent=scene){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);cyl(.11,h,[0,h/2,0],steel,g);for(let a=.3;a<h;a+=.34)cyl(.36,.085,[0,a,0],material,g,18);cyl(.18,.18,[0,h+.05,0],gal,g);return g}
function lattice(x,z,h=18){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);for(const dx of [-.45,.45])for(const dz of [-.45,.45])box([.12,h,.12],[dx,h/2,dz],gal,g);for(let y=1;y<h;y+=1.8){for(const zz of [-.45,.45]){const b=box([1.15,.09,.09],[0,y,zz],gal,g);b.rotation.z=(y%3.6<1)?.55:-.55}}return g}
function label(t,p){const c=document.createElement('canvas');c.width=512;c.height=84;const q=c.getContext('2d');q.fillStyle='#06131ddd';q.roundRect(2,2,508,80,13);q.fill();q.fillStyle='#fff';q.font='bold 25px Arial';q.textAlign='center';q.fillText(t,256,52);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.position.set(...p);s.scale.set(10.8,1.8,1);s.material.opacity=.96;s.material.depthTest=false;s.renderOrder=20;scene.add(s);s.userData={isEquipmentLabel:true,labelText:t,target:new THREE.Vector3(...p)};labels.push(s);return s}
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
// 132 gantry + sagging incoming
lattice(-78,-9,20);lattice(-78,9,20);box([1.2,.8,20],[-78,18,0],gal);
[-6,0,6].forEach(z=>{ins(-78,18,z,3.6,brown);tube([[-125,21,z],[-108,19.4,z],[-94,19.1,z],[-78,21.7,z],[-69,9.5,z]],.095)});
label('132 kV INCOMING',[-88,26,-11]);
// arresters shunt
const la=new THREE.Group();scene.add(la);[-6,0,6].forEach(z=>{pad(-65,z,1.8,1.8);ins(-65,.4,z,4.7,brown);tube([[-69,9.5,z],[-65,5.3,z]],.05);const e=tube([[-65,.45,z],[-65,-.05,z]],.04,copper);earthObjects.push(e)});reg(la,'132 kV Surge Arresters',132,'Limits overvoltage by diverting surge current to earth. It is connected phase-to-earth, not in series with normal load current.');label('SURGE ARRESTERS',[-65,8.5,-10]);
// disconnectors with real blades
function disconnector(x,name){const g=new THREE.Group();scene.add(g);[-6,0,6].forEach(z=>{pad(x,z,4.4,2.4);ins(x-1.45,.4,z,4.7,brown);ins(x+1.45,.4,z,4.7,brown);const pivot=new THREE.Group();pivot.position.set(x-1.45,5.3,z);scene.add(pivot);const blade=box([3,.13,.18],[1.5,0,0],al,pivot);cyl(.18,.28,[2.92,0,0],copper,pivot);g.add(pivot);
 box([3.8,.16,.16],[x,.62,z],gal);cyl(.12,4.5,[x,.62,z+.75],gal);beamBetween([x,.75,z+.75],[x-1.35,5.15,z],.06,gal);g.userData.blades=(g.userData.blades||[]);g.userData.blades.push(pivot)});reg(g,name,132,'Provides a visible isolation gap. It is not intended to interrupt fault current or normal load current.');return g}
const lineDisc=disconnector(-53,'132 kV Line Disconnector');label('LINE DISCONNECTOR',[-53,8.8,-10]);
// CT
const ct=new THREE.Group();scene.add(ct);[-6,0,6].forEach(z=>{pad(-40,z);box([1.25,.7,1.25],[-40,.75,z],steel);ins(-40,1.05,z,3.7,brown);cyl(.82,1.05,[-40,4.25,z],brown);torus(.78,.16,[-40,4.8,z],brown,scene,Math.PI/2);box([1.35,.16,.28],[-40,5.35,z],al)});reg(ct,'132 kV Current Transformers',132,'Measures primary current for metering and protection. Secondary circuits are separate from the primary power conductor.');label('CURRENT TRANSFORMERS',[-40,8.8,-10]);
// CVT shunt measurement
const cvt=new THREE.Group();scene.add(cvt);[-6,0,6].forEach(z=>{pad(-29,z);box([1.65,1.15,1.55],[-29,.95,z],steel);ins(-29,1.45,z,5.35,brown);cyl(.42,.6,[-29,6.95,z],steel);box([1.15,.12,.22],[-29,7.28,z],al)});reg(cvt,'132 kV CVT / VT',132,'Provides scaled voltage signals for metering, protection and synchronization; it does not carry the main load current.');label('CVT / VT',[-29,9.6,-10]);
// breaker
const breaker=new THREE.Group();scene.add(breaker);[-6,0,6].forEach(z=>{pad(-15,z,2.8,2.6);box([1.8,1.25,1.5],[-15,1,z],steel);ins(-15.42,1.55,z,3.35,porc);ins(-14.58,1.55,z,3.35,porc);cyl(.52,1.55,[-15,5.15,z],steel);box([1.9,.18,.35],[-15,5.95,z],al)});box([3.2,2.4,2.2],[-15,1.2,10],steel);reg(breaker,'132 kV Circuit Breaker',132,'Interrupts load and fault current when commanded by protection or control systems.');label('132 kV CIRCUIT BREAKER',[-15,9.3,-10]);
const busDisc=disconnector(-2,'132 kV Bus Disconnector');label('BUS DISCONNECTOR',[-2,8.8,-10]);
// primary conductor continuity; CVT taps are separate
[-6,0,6].forEach(z=>{tube([[-69,9.5,z],[-56.1,5.75,z]],.085);tube([[-49.9,5.75,z],[-40,5.55,z],[-15,6.2,z],[-5.1,5.75,z]],.085);tube([[1.1,5.75,z],[8,7.2,z]],.085);tube([[-40,5.55,z],[-29,6.7,z]],.045)});
// V8 bus support steel portals
for(const x of [9,31]){for(const z of [-8,8])box([.22,7,.22],[x,3.5,z],gal);box([.28,.28,17],[x,6.7,0],gal)}
// bus
[-6,0,6].forEach(z=>{ins(10,.3,z,6.2,brown);ins(31,.3,z,6.2,brown);tube([[8,7.2,z],[39,7.2,z]],.115)});label('132 kV BUSBAR',[22,11,-10]);
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
// bushings: HV taller, LV shorter
[-5,0,5].forEach(z=>{ins(-7.2,9.9,z,6.5,brown,tx);torus(.62,.055,[-7.2,16.1,z],al,tx,Math.PI/2);ins(7.2,9.9,z*.65,3.8,porc,tx);box([1.15,.12,.2],[7.2,14,z*.65],al,tx)});
// internal core/windings hidden until cutaway
const internals=new THREE.Group();tx.add(internals);internals.visible=false;
for(const z of [-3.5,0,3.5]){box([1.3,6.4,1.3],[0,5,z],coreMat,internals);const hv=cyl(1.65,4.8,[0,5,z],hvMat,internals,28);const lv=cyl(1.25,5.2,[0,5,z],lvMat,internals,28)}
box([1.3,1.1,9],[0,8.1,0],coreMat,internals);box([1.3,1.1,9],[0,1.9,0],coreMat,internals);
reg(tx,'132/33 kV Power Transformer',132,'Transfers energy from the 132 kV system to the 33 kV system by electromagnetic induction. The windings are electrically isolated; energy is coupled through magnetic flux in the core.');label('132/33 kV POWER TRANSFORMER',[56,22,-11]);
[-6,0,6].forEach((z,i)=>tube([[39,7.2,z],[48.8,17,z]],.085)); // to HV bushings
// 33 kV yard
const cb33g=new THREE.Group();scene.add(cb33g);[-3.2,0,3.2].forEach(z=>{pad(78,z,2.2,2);box([1.45,1.15,1.25],[78,.95,z],steel);ins(77.62,1.35,z,2.25,porc);ins(78.38,1.35,z,2.25,porc);box([1.25,.16,.28],[78,3.75,z],al)});reg(cb33g,'33 kV Transformer Incomer Circuit Breaker',33,'Controls and protects the transformer connection to the 33 kV bus.');label('33 kV INCOMER CB',[78,7,-8]);
const inst33=new THREE.Group();scene.add(inst33);[-3.2,0,3.2].forEach(z=>{pad(88,z,1.8,1.8);box([.9,.55,.9],[88,.7,z],steel);ins(88,1,z,2.5,porc)});reg(inst33,'33 kV CT / VT',33,'Provides current and voltage measurements for 33 kV protection and metering.');label('33 kV CT / VT',[88,6.5,-8]);
[-3.2,0,3.2].forEach((z,i)=>{tube([[63.2,14,z],[70,4.4,z],[78,4.25,z],[88,4,z],[94,4.5,z]],.07);ins(96,.3,z,3.7,porc);ins(116,.3,z,3.7,porc);tube([[94,4.5,z],[123,4.5,z]],.08)});label('33 kV BUSBAR',[106,8.2,-8]);
// feeders with breaker-like poles
[-28,0,28].forEach((fz,i)=>{const g=new THREE.Group();scene.add(g);[-3,0,3].forEach(d=>{pad(131,fz+d,1.8,1.8);box([1,1.2,1],[131,.9,fz+d],steel);ins(131,1.3,fz+d,2.5,porc)});box([.35,11,.35],[141,5.5,fz-5],gal);box([.35,11,.35],[141,5.5,fz+5],gal);box([.4,.4,11],[141,9,fz],gal);[-3,0,3].forEach((d,j)=>tube([[123,4.5,[-3.2,0,3.2][j]],[131,4,fz+d],[141,9,fz+d],[162,10,fz+d]],.065));reg(g,'33 kV Feeder '+(i+1),33,'Outgoing 33 kV feeder bay supplying the downstream sub-transmission/distribution network.');label('33 kV FEEDER '+(i+1),[141,13.5,fz])});
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
const state={power:false,lineIso:true,cb132:true,busIso:true,cb33:true,fault:false,cut:false,earth:false};
const flow132=[[],[],[]],flow33=[[],[],[]],flowFeeders=Array.from({length:3},()=>[[],[],[]]);
function particle(c){
 const g=new THREE.Group();
 const core=new THREE.Mesh(new THREE.SphereGeometry(.30,14,12),new THREE.MeshBasicMaterial({color:c,toneMapped:false}));
 const glow1=new THREE.Mesh(new THREE.SphereGeometry(.62,14,12),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.48,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
 const glow2=new THREE.Mesh(new THREE.SphereGeometry(1.05,14,12),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
 g.add(glow2,glow1,core);scene.add(g);return g
}
const phaseZ132=[-6,0,6], phaseZ33=[-3.2,0,3.2];
const phaseColorsFlow=[0xff3b30,0xffd21f,0x2677ff]; // R Y B
const p132=phaseZ132.map(z=>new THREE.CatmullRomCurve3([[-122,21,z],[-78,21.7,z],[-69,9.5,z],[-53,5.8,z],[-40,5.55,z],[-15,6.2,z],[-2,5.75,z],[22,7.2,z],[39,7.2,z],[48.8,17,z]].map(v=>new THREE.Vector3(...v))));
// 33 kV main path stops at the bus; each outgoing feeder branches cleanly from the bus.
const p33=phaseZ33.map(z=>new THREE.CatmullRomCurve3([[63.2,14,z],[70,4.4,z],[78,4.25,z],[88,4,z],[94,4.5,z],[106,4.5,z],[123,4.5,z]].map(v=>new THREE.Vector3(...v))));
const feederZ=[-28,0,28];
const pFeeders=feederZ.map(fz=>phaseZ33.map((z,ph)=>new THREE.CatmullRomCurve3([[123,4.5,z],[131,4,fz+[-3,0,3][ph]],[141,9,fz+[-3,0,3][ph]],[162,10,fz+[-3,0,3][ph]]].map(v=>new THREE.Vector3(...v)))));
for(let ph=0;ph<3;ph++){
 for(let i=0;i<22;i++){const o=particle(phaseColorsFlow[ph]);o.userData.t=i/22;flow132[ph].push(o)}
 for(let i=0;i<12;i++){const o=particle(phaseColorsFlow[ph]);o.userData.t=i/12;flow33[ph].push(o)}
 for(let fd=0;fd<3;fd++)for(let i=0;i<16;i++){const o=particle(phaseColorsFlow[ph]);o.userData.t=(i/16+fd*.055)%1;flowFeeders[fd][ph].push(o)}
}
const e132=()=>state.power&&state.lineIso&&state.cb132&&state.busIso&&!state.fault;const e33=()=>e132()&&state.cb33;
function blades(g,closed){(g.userData.blades||[]).forEach(b=>b.rotation.z=closed?0:-.7)}
function ui(){blades(lineDisc,state.lineIso);blades(busDisc,state.busIso);for(const [id,key,n] of [['lineIso','lineIso','Line ISO'],['cb132','cb132','132 CB'],['busIso','busIso','Bus ISO'],['cb33','cb33','33 CB']])document.getElementById(id).textContent=n+' '+(state[key]?'CLOSED':'OPEN');document.getElementById('power').classList.toggle('active',state.power);document.getElementById('fault').classList.toggle('active',state.fault);document.getElementById('cut').classList.toggle('active',state.cut);document.getElementById('earth').classList.toggle('active',state.earth);document.getElementById('sLine').textContent=state.power?'ENERGIZED':'DE-ENERGIZED';document.getElementById('sBus').textContent=e132()?'ENERGIZED':'DE-ENERGIZED';document.getElementById('sTx').textContent=e132()?'IN SERVICE':'OUT';document.getElementById('s33').textContent=e33()?'ENERGIZED':'DE-ENERGIZED';document.getElementById('mode').textContent=state.fault?'PROTECTION • FAULT TRIPPED':state.cut?'TRANSFORMER • CUTAWAY':state.earth?'EARTHING • GRID VIEW':state.power?'POWER FLOW • LIVE':'EXPLORE • SYSTEM NORMAL'}
function toggle(id,key){document.getElementById(id).onclick=()=>{if((key==='lineIso'||key==='busIso')&&state.power&&state.cb132&&state[key]){document.getElementById('eqName').textContent='SWITCHING WARNING';document.getElementById('eqInfo').textContent='Open the associated circuit breaker before opening a disconnector under load.';return}state[key]=!state[key];ui()}}
toggle('lineIso','lineIso');toggle('cb132','cb132');toggle('busIso','busIso');toggle('cb33','cb33');
document.getElementById('power').onclick=()=>{state.power=!state.power;ui()};
document.getElementById('fault').onclick=()=>{state.fault=!state.fault;if(state.fault)state.cb132=false;else state.cb132=true;ui()};
document.getElementById('cut').onclick=()=>{state.cut=!state.cut;tank.material.transparent=true;tank.material.opacity=state.cut?.18:1;internals.visible=state.cut;ui()};
document.getElementById('earth').onclick=()=>{state.earth=!state.earth;earthObjects.forEach(o=>{o.position.y=state.earth?.12:-.08;o.material=state.earth?M(0x2dcc66,.15,.35):copper});ui()};
function view(p,t){camera.position.set(...p);controls.target.set(...t);controls.update()}
document.getElementById('overview').onclick=()=>view([105,68,118],[25,5,0]);document.getElementById('incoming').onclick=()=>view([-48,25,46],[-48,5,0]);document.getElementById('transformer').onclick=()=>view([83,29,35],[56,8,0]);document.getElementById('yard33').onclick=()=>view([138,31,65],[110,4,0]);document.getElementById('top').onclick=()=>view([25,175,.1],[25,0,0]);
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
renderer.domElement.addEventListener('pointerdown',ev=>{mouse.x=ev.clientX/innerWidth*2-1;mouse.y=-(ev.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);
const lh=ray.intersectObjects(labels,false)[0];if(lh){focusLabel(lh.object);return}
const h=ray.intersectObjects(scene.children,true)[0];if(!h)return;let o=h.object;while(o.parent&&!o.userData?.name)o=o.parent;if(o.userData?.name){document.getElementById('eqName').textContent=o.userData.name;document.getElementById('eqInfo').innerHTML='<b>'+o.userData.kv+' kV</b><br>'+o.userData.info}});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
let labelMode=2;
document.getElementById('labels').onclick=()=>{labelMode=(labelMode+1)%3;const b=document.getElementById('labels');b.textContent=labelMode===0?'Labels: OFF':labelMode===1?'Labels: NORMAL':'Labels: LARGE';labels.forEach(s=>{s.visible=labelMode!==0;s.scale.set(labelMode===2?10.8:7.2,labelMode===2?1.8:1.2,1)})};
document.getElementById('controls').onclick=()=>{const p=document.getElementById('left');p.classList.toggle('control-hidden');document.getElementById('controls').textContent=p.classList.contains('control-hidden')?'Show Controls':'Hide Controls'};
ui();let clock=0;renderer.setAnimationLoop(()=>{clock+=.0024;
 if(cameraFlight){const raw=Math.min(1,(performance.now()-cameraFlight.start)/cameraFlight.duration),k=easeInOutCubic(raw);camera.position.lerpVectors(cameraFlight.fromPos,cameraFlight.toPos,k);controls.target.lerpVectors(cameraFlight.fromTarget,cameraFlight.toTarget,k);if(raw>=1){document.getElementById('eqInfo').textContent='Equipment focused. Click the equipment itself for detailed training information.';cameraFlight=null}}
 controls.update();labels.forEach(s=>{if(labelMode!==0)s.visible=true});flow132.forEach((arr,ph)=>arr.forEach(o=>{o.visible=e132();o.position.copy(p132[ph].getPoint((o.userData.t+clock)%1))}));flow33.forEach((arr,ph)=>arr.forEach(o=>{o.visible=e33();o.position.copy(p33[ph].getPoint((o.userData.t+clock*1.12)%1))}));flowFeeders.forEach((fd,fi)=>fd.forEach((arr,ph)=>arr.forEach(o=>{o.visible=e33();o.position.copy(pFeeders[fi][ph].getPoint((o.userData.t+clock*1.18)%1))})));renderer.render(scene,camera)});
}catch(err){const e=document.getElementById('err');e.style.display='block';e.textContent='3D simulator failed to initialize: '+err.message;console.error(err)}
