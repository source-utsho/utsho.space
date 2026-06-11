import * as THREE from "three";
import Lenis from "lenis";
import { EMBER_GLSL } from "./colormap";
import { buildTargets } from "./shapes";
import { sampleImageEdges, sampleScatter } from "./shapeSampler";
import { scenes } from "./scenes";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
const mobile = innerWidth < 760;
const N = mobile ? 13000 : 38000;
const R = 2.3;
const NS = scenes.length;

const canvas = document.getElementById("cloud") as HTMLCanvasElement;
const shapeKeys = scenes.map((s) => s.shape);
const targets = buildTargets(N, R, shapeKeys.filter((k) => k !== "house"));
let houseT = await sampleImageEdges("/house.png", N, R, [0.0, 0.05, 1.0, 0.85], 0.16, 440, 0.07, 0.28, 0.68);
let nz = false; for (let i = 0; i < 300; i++) if (houseT[i] !== 0) { nz = true; break; }
if (!nz) houseT = sampleScatter(N, R);
targets["house"] = houseT;
const shapeArr = (i: number) => targets[scenes[i].shape];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.setSize(innerWidth, innerHeight, false);
renderer.setClearColor(0x0a0806, 1);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
cam.position.set(0, 0, 6.7);

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(shapeArr(0)), 3));
geo.setAttribute("aFrom", new THREE.BufferAttribute(new Float32Array(shapeArr(0)), 3));
geo.setAttribute("aTo", new THREE.BufferAttribute(new Float32Array(shapeArr(1)), 3));
const rnd = new Float32Array(N); for (let i = 0; i < N; i++) rnd[i] = Math.random();
geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));

const mat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uMix: { value: 0 }, uTime: { value: 0 }, uTurb: { value: 0.04 }, uColorT: { value: scenes[0].colorT }, uSize: { value: mobile ? 13 : 16 } },
  vertexShader: `
    attribute vec3 aFrom; attribute vec3 aTo; attribute float aRand;
    uniform float uMix, uTime, uTurb, uColorT, uSize;
    varying vec3 vCol; varying float vA;
    ${EMBER_GLSL}
    void main(){
      vec3 p = mix(aFrom, aTo, smoothstep(0.0,1.0,uMix));
      float tt = uTime*0.6 + aRand*40.0;
      p += vec3(sin(p.y*1.4+tt), cos(p.z*1.2+tt*1.1), sin(p.x*1.3+tt*0.9)) * uTurb * (0.5+aRand);
      vCol = ember(clamp(uColorT + (aRand-0.5)*0.14, 0.0, 1.0));
      vA = 0.45 + aRand*0.55;
      vec4 mv = modelViewMatrix * vec4(p,1.0);
      gl_PointSize = uSize * (1.0 / -mv.z) * (0.55 + aRand*0.7);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `
    varying vec3 vCol; varying float vA;
    void main(){
      vec2 c = gl_PointCoord-0.5; float d=length(c);
      if(d>0.5) discard;
      gl_FragColor = vec4(vCol, smoothstep(0.5,0.0,d)*vA);
    }`,
});
const points = new THREE.Points(geo, mat);
scene.add(points);

addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight, false);
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
});

// mouse parallax (subtle, keeps shapes readable)
let mxn = 0, myn = 0;
if (fine) addEventListener("pointermove", (e) => { mxn = (e.clientX / innerWidth - 0.5); myn = (e.clientY / innerHeight - 0.5); });

const sceneEls = Array.from(document.querySelectorAll<HTMLElement>(".sc-ch"));
const indexEls = Array.from(document.querySelectorAll<HTMLElement>(".sc-index a"));
let curSeg = -1;
function applySeg(seg: number) {
  if (seg === curSeg) return; curSeg = seg;
  (geo.getAttribute("aFrom") as THREE.BufferAttribute).copyArray(shapeArr(seg)); geo.getAttribute("aFrom").needsUpdate = true;
  (geo.getAttribute("aTo") as THREE.BufferAttribute).copyArray(shapeArr(Math.min(seg + 1, NS - 1))); geo.getAttribute("aTo").needsUpdate = true;
}

let targetX = 0, progress = 0;
function readProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress = (max > 0 ? scrollY / max : 0) * (NS - 1);
  const seg = Math.max(0, Math.min(NS - 2, Math.floor(progress)));
  applySeg(seg);
  const lt = progress - seg;
  mat.uniforms.uMix.value = lt;
  mat.uniforms.uColorT.value = scenes[seg].colorT + (scenes[seg + 1].colorT - scenes[seg].colorT) * lt;
  const tf = scenes[seg].turb ?? 0.012, tt = scenes[seg + 1].turb ?? 0.012;
  mat.uniforms.uTurb.value = tf + (tt - tf) * lt + 0.22 * Math.sin(lt * Math.PI); // crisp at rest, flowing mid-morph
  const active = Math.round(progress);
  targetX = scenes[active].side === "l" ? 0.95 : -0.95;
  sceneEls.forEach((el, i) => el.classList.toggle("active", i === active));
  indexEls.forEach((el, i) => el.classList.toggle("on", i === active));
}

let lenis: Lenis | null = null;
if (!reduce) { lenis = new Lenis({ smoothWheel: true, lerp: 0.09 }); lenis.on("scroll", readProgress); }
addEventListener("scroll", readProgress, { passive: true });
applySeg(0); readProgress();

function loop(t: number) {
  lenis?.raf(t);
  mat.uniforms.uTime.value = t * 0.001;
  points.position.x += (targetX - points.position.x) * 0.06;
  points.rotation.y += (mxn * 0.05 - points.rotation.y) * 0.04;
  points.rotation.x += (myn * 0.04 - points.rotation.x) * 0.04;
  renderer.render(scene, cam);
  requestAnimationFrame(loop);
}
if (reduce) {
  // snap to the nearest shape, no morph, no turbulence
  const snap = () => {
    const active = Math.round(progress);
    (geo.getAttribute("aFrom") as THREE.BufferAttribute).copyArray(shapeArr(active)); geo.getAttribute("aFrom").needsUpdate = true;
    (geo.getAttribute("aTo") as THREE.BufferAttribute).copyArray(shapeArr(active)); geo.getAttribute("aTo").needsUpdate = true;
    mat.uniforms.uTurb.value = 0; mat.uniforms.uColorT.value = scenes[active].colorT;
    points.position.x = targetX; renderer.render(scene, cam);
  };
  addEventListener("scroll", () => { readProgress(); snap(); }, { passive: true });
  snap();
} else requestAnimationFrame(loop);
