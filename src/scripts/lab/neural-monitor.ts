import * as THREE from "three";
import { hotCss, HOT_GLSL } from "./colormap";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;

/* ---------------- BOLD field (WebGL fragment shader) ---------------- */
const fieldCanvas = document.getElementById("bold-field") as HTMLCanvasElement;
let renderer: THREE.WebGLRenderer | null = null;
let mat: THREE.ShaderMaterial | null = null;
const mouse = new THREE.Vector2(0.5, 0.5);

try {
  renderer = new THREE.WebGLRenderer({ canvas: fieldCanvas, antialias: false });
  renderer.setPixelRatio(Math.min(1.5, devicePixelRatio));
  const scene = new THREE.Scene();
  const cam = new THREE.Camera();
  mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: mouse },
    },
    vertexShader: `void main(){ gl_Position = vec4(position,1.0); }`,
    fragmentShader: `
      precision highp float;
      uniform float uTime; uniform vec2 uRes; uniform vec2 uMouse;
      ${HOT_GLSL}
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
        vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
      }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
      void main(){
        vec2 uv = gl_FragCoord.xy/uRes.xy;
        vec2 p = uv*vec2(uRes.x/uRes.y,1.0)*3.0;
        float n = fbm(p + uTime*0.04 + fbm(p*0.5 - uTime*0.02));
        float t = n*0.34;
        float d = distance(uv, uMouse);
        t += smoothstep(0.35,0.0,d)*0.22;
        vec3 col = hot(t) * 0.42;
        col *= 0.62 + 0.38*smoothstep(1.25,0.15,distance(uv,vec2(0.5)));
        gl_FragColor = vec4(col,1.0);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  renderer.render(scene, cam);
  (renderer as any)._scene = scene;
  (renderer as any)._cam = cam;
} catch (e) {
  renderer = null;
}

function sizeField() {
  if (!renderer || !mat) return;
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  (mat.uniforms.uRes.value as THREE.Vector2).set(
    w * renderer.getPixelRatio(),
    h * renderer.getPixelRatio()
  );
}
sizeField();
addEventListener("resize", sizeField);
if (fine) addEventListener("pointermove", (e) => {
  mouse.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
});

/* ---------------- The brain instrument (Canvas2D) ---------------- */
const inst = document.getElementById("instrument") as HTMLCanvasElement;
const ictx = inst.getContext("2d")!;
let idpr = 1;

// regions in the 230x175 schematic space (from DualMindGame/CLAUDE.md)
interface Region { id: string; x: number; y: number; r: number; mirror?: boolean; cur: number; tgt: number; hist: number[]; }
const regions: Region[] = [
  { id: "dlPFC", x: 78, y: 40, r: 13, mirror: true, cur: 0.4, tgt: 0.4, hist: [] },
  { id: "ACC", x: 115, y: 30, r: 11, cur: 0.4, tgt: 0.4, hist: [] },
  { id: "Caudate", x: 95, y: 58, r: 10, mirror: true, cur: 0.4, tgt: 0.4, hist: [] },
  { id: "N.Acc", x: 115, y: 80, r: 12, cur: 0.4, tgt: 0.4, hist: [] },
  { id: "VTA", x: 115, y: 100, r: 9, cur: 0.4, tgt: 0.4, hist: [] },
  { id: "Cereb", x: 115, y: 128, r: 13, cur: 0.4, tgt: 0.4, hist: [] },
];
const byId = (id: string) => regions.find((r) => r.id === id)!;
let divergence = 0.1, divTgt = 0.1;
let activeLabel = "BASELINE";

const SW = 230, SH = 175; // schematic dims

function sizeInst() {
  idpr = Math.min(2, devicePixelRatio);
  const rect = inst.getBoundingClientRect();
  inst.width = rect.width * idpr;
  inst.height = rect.height * idpr;
}
sizeInst();
addEventListener("resize", sizeInst);

function drawBrain(time: number) {
  const W = inst.width / idpr, H = inst.height / idpr;
  ictx.setTransform(idpr, 0, 0, idpr, 0, 0);
  ictx.clearRect(0, 0, W, H);

  // panel
  ictx.fillStyle = "#0c0e1e";
  roundRect(ictx, 0, 0, W, H, 14); ictx.fill();
  ictx.strokeStyle = "#1a2240"; ictx.lineWidth = 1;
  roundRect(ictx, 0.5, 0.5, W - 1, H - 1, 14); ictx.stroke();
  // scan lines
  ictx.globalAlpha = 0.06; ictx.strokeStyle = "#9fb0ff";
  for (let y = 0; y < H; y += 4) { ictx.beginPath(); ictx.moveTo(0, y); ictx.lineTo(W, y); ictx.stroke(); }
  ictx.globalAlpha = 1;

  // fit schematic into a centered box (leave room for graphs on right)
  const brainBoxW = W * 0.52;
  const s = Math.min(brainBoxW / SW, (H - 40) / SH);
  const ox = 22, oy = (H - SH * s) / 2;
  ictx.save();
  ictx.translate(ox, oy); ictx.scale(s, s);

  // anatomy (coronal-ish)
  const cx = SW / 2, cyTop = 70;
   anatomy(cx);

  // activation blobs
  for (const r of regions) {
    blob(r.x, r.y, r.r, r.cur);
    if (r.mirror) blob(SW - r.x, r.y, r.r, r.cur * 0.7);
  }

  // VTA -> N.Acc dopamine pathway
  const reward = (byId("N.Acc").cur + byId("VTA").cur) / 2;
  if (reward > 0.55) {
    ictx.save();
    ictx.setLineDash([3, 3]);
    ictx.strokeStyle = hotCss(reward, 0.8); ictx.lineWidth = 1.6;
    ictx.beginPath(); ictx.moveTo(byId("VTA").x, byId("VTA").y); ictx.lineTo(byId("N.Acc").x, byId("N.Acc").y); ictx.stroke();
    ictx.restore();
  }

  // MRI corner labels
  ictx.setTransform(idpr, 0, 0, idpr, 0, 0);
  ictx.font = "8px " + mono(); ictx.fillStyle = "#2a4a30";
  ictx.fillText("L", ox + 6, oy + 14); ictx.fillText("R", ox + brainBoxW - 14, oy + 14);
  ictx.fillStyle = "#1a3a20"; ictx.fillText("COR", ox + 6, oy + SH * s - 4);
  ictx.restore();

  // ----- right side: BOLD graphs + readouts -----
  const gx = ox + brainBoxW + 18, gw = W - gx - 18;
  const labelTop = 16;
  ictx.font = "8px " + mono();
  ictx.fillStyle = "#6b7aa8";
  ictx.fillText("BOLD · " + activeLabel, gx, labelTop);
  const gTop = labelTop + 10, gh = (H - gTop - 36) / regions.length;
  regions.forEach((r, i) => {
    const y0 = gTop + i * gh;
    // frame
    ictx.fillStyle = "#09101e"; ictx.fillRect(gx, y0, gw, gh - 3);
    ictx.strokeStyle = "#141c30"; ictx.lineWidth = 0.5; ictx.strokeRect(gx + 0.5, y0 + 0.5, gw - 1, gh - 4);
    // line
    const h = r.hist;
    ictx.beginPath();
    for (let k = 0; k < h.length; k++) {
      const x = gx + (k / (h.length - 1)) * gw;
      const y = y0 + (gh - 3) - h[k] * (gh - 5);
      k === 0 ? ictx.moveTo(x, y) : ictx.lineTo(x, y);
    }
    ictx.strokeStyle = hotCss(r.cur, 0.95); ictx.lineWidth = 1.1; ictx.stroke();
    // label + value
    ictx.fillStyle = hotCss(Math.max(0.3, r.cur), 0.9);
    ictx.font = "7px " + mono();
    ictx.fillText(r.id, gx + 3, y0 + gh - 6);
    ictx.textAlign = "right";
    ictx.fillText(r.cur.toFixed(2), gx + gw - 3, y0 + gh - 6);
    ictx.textAlign = "left";
  });

  // divergence meter (bottom)
  const dy = H - 24;
  ictx.fillStyle = "#3a4a70"; ictx.font = "7px " + mono();
  ictx.fillText("DIVERGENCE", gx, dy - 4);
  ictx.fillStyle = "#0a1020"; ictx.fillRect(gx, dy, gw, 5);
  ictx.fillStyle = hotCss(divergence, 1); ictx.fillRect(gx, dy, gw * divergence, 5);

  // live dot
  ictx.fillStyle = "#2a5a30"; ictx.font = "7px " + mono(); ictx.textAlign = "right";
  ictx.fillText("● LIVE", W - 14, H - 10); ictx.textAlign = "left";
}

function anatomy(cx: number) {
  // skull
  ictx.strokeStyle = "#2a3050"; ictx.lineWidth = 2;
  ellipse(cx, 85, 95, 78); ictx.stroke();
  // brain matter
  ictx.fillStyle = "#111428"; ellipse(cx, 85, 86, 70); ictx.fill();
  // sulci
  ictx.strokeStyle = "#1a1f3a"; ictx.lineWidth = 1.2;
  for (let i = -2; i <= 2; i++) { ictx.beginPath(); ictx.moveTo(cx + i * 28, 25); ictx.bezierCurveTo(cx + i * 22, 70, cx + i * 34, 110, cx + i * 24, 150); ictx.stroke(); }
  // corpus callosum + ventricles
  ictx.strokeStyle = "#1a1f3a"; ictx.beginPath(); ictx.moveTo(cx - 40, 78); ictx.quadraticCurveTo(cx, 64, cx + 40, 78); ictx.stroke();
  ictx.fillStyle = "#0a0c1e"; ellipse(cx - 16, 78, 8, 12); ictx.fill(); ellipse(cx + 16, 78, 8, 12); ictx.fill();
  // thalamus
  ictx.fillStyle = "#121630"; ellipse(cx, 92, 13, 9); ictx.fill();
  // brainstem
  ictx.fillStyle = "#0e1228"; roundRect(ictx, cx - 9, 120, 18, 28, 5); ictx.fill();
  // cerebellum
  ictx.fillStyle = "#111428"; ellipse(cx, 150, 40, 18); ictx.fill();
}

function blob(x: number, y: number, r: number, v: number) {
  const [cr, cg, cb] = require_hot(v);
  // outer glow
  let g = ictx.createRadialGradient(x, y, 0, x, y, r * 2.5);
  g.addColorStop(0, `rgba(${cr},${cg},${cb},${0.4 * v})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ictx.fillStyle = g; ictx.beginPath(); ictx.arc(x, y, r * 2.5, 0, 7); ictx.fill();
  // main
  ictx.fillStyle = `rgba(${cr},${cg},${cb},${Math.max(0.15, v * 0.9)})`;
  ictx.beginPath(); ictx.arc(x, y, r, 0, 7); ictx.fill();
  // bright center
  ictx.fillStyle = `rgba(${Math.min(255, cr + 60)},${Math.min(255, cg + 60)},${Math.min(255, cb + 60)},${v * 0.5})`;
  ictx.beginPath(); ictx.arc(x, y, r * 0.4, 0, 7); ictx.fill();
}

// local copy of hot() returning ints (avoid import cycle cost)
import { hot } from "./colormap";
function require_hot(v: number) { const c = hot(v); return [c[0] | 0, c[1] | 0, c[2] | 0]; }

function ellipse(x: number, y: number, rx: number, ry: number) { ictx.beginPath(); ictx.ellipse(x, y, rx, ry, 0, 0, 7); }
function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function mono() { return "'JetBrains Mono', monospace"; }

/* ---------------- scroll → which regions ignite ---------------- */
const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-regions]"));
function updateActive() {
  const mid = innerHeight * 0.5;
  let best: HTMLElement | null = null, bestD = Infinity;
  for (const ch of chapters) {
    const r = ch.getBoundingClientRect();
    const d = Math.abs((r.top + r.bottom) / 2 - mid);
    if (d < bestD) { bestD = d; best = ch; }
  }
  if (!best) return;
  const ids = (best.dataset.regions || "").split(",").map((s) => s.trim()).filter(Boolean);
  divTgt = parseFloat(best.dataset.divergence || "0.1");
  activeLabel = best.dataset.label || "BASELINE";
  for (const r of regions) r.tgt = ids.includes(r.id) ? 0.92 : 0.34;
  // mark active text
  chapters.forEach((c) => c.classList.toggle("active", c === best));
}
addEventListener("scroll", updateActive, { passive: true });
updateActive();

/* ---------------- loop ---------------- */
let frame = 0;
function loop(t: number) {
  frame++;
  if (mat) { mat.uniforms.uTime.value = t * 0.001; if (renderer) renderer.render((renderer as any)._scene, (renderer as any)._cam); }
  for (const r of regions) {
    r.cur += (r.tgt - r.cur) * 0.06;
    if (frame % 2 === 0) { r.hist.push(r.cur + (Math.random() - 0.5) * 0.04); if (r.hist.length > 60) r.hist.shift(); }
  }
  divergence += (divTgt - divergence) * 0.05;
  drawBrain(t);
  requestAnimationFrame(loop);
}
for (const r of regions) for (let i = 0; i < 60; i++) r.hist.push(0.4);
if (reduce) { updateActive(); for (const r of regions) r.cur = r.tgt; drawBrain(0); if (mat && renderer) renderer.render((renderer as any)._scene, (renderer as any)._cam); }
else requestAnimationFrame(loop);
