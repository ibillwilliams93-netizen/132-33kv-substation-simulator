import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const host=document.getElementById('app');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9ab3c0);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,1000);camera.position.set(70,55,90);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;host.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,5,0);controls.enableDamping=true;
scene.add(new THREE.HemisphereLight(0xe8f5ff,0x55604d,2.2));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(60,100,50);sun.castShadow=true;scene.add(sun);
const M=(c,m=.2,r=.65)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
const steel=M(0x8f999d,.7,.45),porc=M(0xe5e1d6,.05,.3),green=M(0x506a5b,.35,.55),concrete=M(0x858986,.05,.9);
function box(s,p,mat=steel){const x=new THREE.Mesh(new THREE.BoxGeometry(...s),mat);x.position.set(...p);x.castShadow=x.receiveShadow=true;scene.add(x);return x}
function cyl(r,h,p,mat=steel){const x=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),mat);x.position.set(...p);x.castShadow=true;scene.add(x);return x}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(230,120),M(0x69736b,0,.98));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function ins(x,z,h){cyl(.18,h,[x,h/2+.4,z],steel);for(let y=.7;y<h+.4;y+=.45)cyl(.42,.13,[x,y,z],porc)}
// incoming gantry
[-42,-38].forEach(x=>box([.5,19,.5],[x,9.5,0]));box([8,.5,.5],[-40,18,0]);[-4,0,4].forEach(z=>ins(-40,z,4));
// HV equipment line
for(const x of [-28,-18,-8,2,12])[-4,0,4].forEach(z=>{box([2.5,.5,2],[x,.25,z],concrete);ins(x,z,x===-18?7:5)});
box([24,.35,.35],[25,7,-4]);box([24,.35,.35],[25,7,0]);box([24,.35,.35],[25,7,4]);
// transformer
box([18,.7,15],[52,.35,0],concrete);box([15,9,11],[52,5,0],green);
for(let z=-4;z<=4;z+=2)box([1.5,7,.25],[43.8,5,z],steel);
for(let z=-4;z<=4;z+=2)box([1.5,7,.25],[60.2,5,z],steel);
[-4,0,4].forEach(z=>{ins(48,z,6);ins(57,z,4)});
const cons=cyl(1.5,8,[52,12.5,0],green);cons.rotation.z=Math.PI/2;
// 33kV yard
for(const x of [70,80,90])[-3,0,3].forEach(z=>{box([1.8,.4,1.6],[x,.2,z],concrete);ins(x,z,3)});
[-3,0,3].forEach(z=>box([28,.2,.2],[92,4,z],steel));
// feeders
[-24,0,24].forEach(z=>{box([.4,11,.4],[108,5.5,z-4]);box([.4,11,.4],[108,5.5,z+4]);box([10,.35,.35],[108,9,z]);[-3,0,3].forEach(d=>ins(108,z+d,2.5))});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
(function loop(){requestAnimationFrame(loop);controls.update();renderer.render(scene,camera)})();