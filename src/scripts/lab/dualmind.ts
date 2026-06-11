// DualMind split — one input, two cognitive engines. Ported constants from his game.
import { hotCss } from "./colormap";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("dm") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
let dpr = 1;
function size() {
  dpr = Math.min(2, devicePixelRatio);
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * dpr; canvas.height = r.height * dpr;
}
size(); addEventListener("resize", size);

// input: mouse X over the canvas (0..1); auto-sine when idle
let target = 0.5;
let userActive = 0;
canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  target = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  userActive = 1;
});

// engines
const NT = { x: 0.5 };
const A = { AC: 0.55, IC: 0.45, x: 0.5, hyper: 0, burn: 0, misfire: 0, state: "ACTIVE", read: 0.5 };
let week = 1, weekClock = 0;
const hist: number[] = []; // target history for lag
const divHist: number[] = [];
let frame = 0;

function tick(autoT: number) {
  frame++;
  // semester clock (a "week" ~ every 9s); ADHD carries cognitive debt forward
  weekClock++;
  if (weekClock > 560) { weekClock = 0; week = Math.min(10, week + 1); A.AC = Math.max(0.12, A.AC * 0.88); }
  // attention decays each tick (his 0.008/tick, scaled gentle for the demo)
  A.AC = Math.max(0.1, A.AC - 0.0009);

  const tx = userActive ? target : autoT;
  hist.push(tx); if (hist.length > 60) hist.shift();

  // neurotypical: instant, stable
  NT.x += (tx - NT.x) * 0.5;

  // ADHD input lag from attention: lag = (0.5-AC)/0.4 * 19 ticks (his model)
  const lag = A.AC < 0.5 ? Math.round(((0.5 - A.AC) / 0.4) * 19) : 0;
  let read = hist[Math.max(0, hist.length - 1 - Math.min(lag, hist.length - 1))];

  // misfire: ~20% chance when IC<0.60 → wrong output for a beat
  A.misfire *= 0.9;
  if (A.IC < 0.6 && Math.random() < 0.012 && !A.burn) { read = 1 - read; A.misfire = 1; }

  // hyperfocus: rare surge (RS high) → ×1.4 speed/brightness, then inevitable burnout
  if (!A.hyper && !A.burn && A.AC > 0.32 && Math.random() < 0.0016) { A.hyper = 1; }
  if (A.hyper > 0) { A.hyper -= 1 / 200; if (A.hyper <= 0) { A.hyper = 0; A.burn = 1; } }
  if (A.burn > 0) { A.burn -= 1 / 320; if (A.burn <= 0) A.burn = 0; }

  let spd = 0.16 + A.AC * 0.12;
  if (A.hyper > 0) spd *= 1.7;
  if (A.burn > 0) spd *= 0.12;
  A.read = read;
  A.x += (read - A.x) * spd;

  A.state = A.misfire > 0.5 ? "MISFIRE" : A.burn > 0 ? "BURNOUT" : A.hyper > 0 ? "HYPERFOCUS" : A.AC < 0.3 ? "STRAINED" : "ACTIVE";

  const div = Math.abs(NT.x - A.x);
  divHist.push(div); if (divHist.length > 120) divHist.shift();
}

function lane(y: number, h: number, name: string, sub: string, accent: string, px: number, ghost: number, distort: { misfire: number; hyper: number; burn: number; state: string }) {
  const W = canvas.width / dpr;
  // frame
  ctx.fillStyle = "#0a0d18"; rr(ctx, 24, y, W - 48, h, 12); ctx.fill();
  ctx.strokeStyle = "#161d36"; ctx.lineWidth = 1; rr(ctx, 24.5, y + 0.5, W - 49, h - 1, 12); ctx.stroke();
  // distortion fills
  if (distort.misfire > 0.5) { ctx.fillStyle = "rgba(220,40,40,0.16)"; rr(ctx, 24, y, W - 48, h, 12); ctx.fill(); }
  if (distort.hyper > 0) { ctx.fillStyle = "rgba(90,150,255,0.10)"; rr(ctx, 24, y, W - 48, h, 12); ctx.fill(); }
  if (distort.burn > 0) { ctx.fillStyle = "rgba(8,8,12,0.5)"; rr(ctx, 24, y, W - 48, h, 12); ctx.fill(); }

  const trackL = 56, trackR = W - 56, trackY = y + h * 0.62, tw = trackR - trackL;
  // track line
  ctx.strokeStyle = "#1c2542"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(trackL, trackY); ctx.lineTo(trackR, trackY); ctx.stroke();
  // ghost (the shared intention)
  const gx = trackL + ghost * tw;
  ctx.fillStyle = "rgba(150,160,190,0.35)"; ctx.beginPath(); ctx.arc(gx, trackY, 5, 0, 7); ctx.fill();
  // marker
  const mxp = trackL + px * tw;
  ctx.shadowColor = accent; ctx.shadowBlur = distort.hyper > 0 ? 22 : 10;
  ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(mxp, trackY, distort.hyper > 0 ? 11 : 9, 0, 7); ctx.fill();
  ctx.shadowBlur = 0;
  // labels
  ctx.font = "11px " + mono(); ctx.fillStyle = accent;
  ctx.fillText(name, 40, y + 22);
  ctx.fillStyle = "#5b678c"; ctx.font = "9px " + mono();
  ctx.fillText(sub, 40, y + 36);
  // state badge
  if (name.includes("RAYAN")) {
    const bw = 92;
    ctx.fillStyle = "#0d1428"; rr(ctx, W - 48 - bw, y + 14, bw, 18, 6); ctx.fill();
    ctx.fillStyle = badge(distort.state); ctx.font = "9px " + mono(); ctx.textAlign = "center";
    ctx.fillText(distort.state, W - 48 - bw / 2, y + 26); ctx.textAlign = "left";
  }
}

function badge(s: string) {
  return s === "MISFIRE" ? "#ff5555" : s === "BURNOUT" ? "#cc4444" : s === "HYPERFOCUS" ? "#6b9aff" : s === "STRAINED" ? "#e0a030" : "#4aaa68";
}

function draw() {
  const W = canvas.width / dpr, H = canvas.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const laneH = Math.min(150, (H - 200) / 2);
  lane(70, laneH, "MARCUS", "neurotypical · instant, stable", "#6b8cff", NT.x, NT.x, { misfire: 0, hyper: 0, burn: 0, state: "ACTIVE" });
  lane(70 + laneH + 24, laneH, "RAYAN", "ADHD · the same input, processed differently", "#ff8c42", A.x, NT.x, { misfire: A.misfire, hyper: A.hyper, burn: A.burn, state: A.state });

  // divergence graph
  const gy = 70 + (laneH + 24) * 2 + 10, gh = 70;
  ctx.fillStyle = "#090e1c"; rr(ctx, 24, gy, W - 48, gh, 10); ctx.fill();
  ctx.strokeStyle = "#161d36"; rr(ctx, 24.5, gy + 0.5, W - 49, gh - 1, 10); ctx.stroke();
  ctx.font = "9px " + mono(); ctx.fillStyle = "#5b678c";
  ctx.fillText("DIVERGENCE  ·  the gap is mechanical, not effort", 40, gy + 18);
  ctx.beginPath();
  for (let i = 0; i < divHist.length; i++) {
    const x = 40 + (i / 119) * (W - 80);
    const yv = gy + gh - 12 - divHist[i] * (gh - 26);
    i === 0 ? ctx.moveTo(x, yv) : ctx.lineTo(x, yv);
  }
  ctx.strokeStyle = hotCss(Math.min(1, divHist[divHist.length - 1] * 2 || 0), 0.95); ctx.lineWidth = 1.5; ctx.stroke();

  // live readouts
  const lag = A.AC < 0.5 ? Math.round(((0.5 - A.AC) / 0.4) * 19) : 0;
  ctx.font = "9px " + mono(); ctx.textAlign = "right";
  ctx.fillStyle = "#5b678c";
  ctx.fillText(`week ${week}/10   ·   attention ${A.AC.toFixed(2)}   ·   input-lag ${lag} ticks   ·   misfire ${(A.IC < 0.6 ? 20 : 0)}%`, W - 40, gy + 18);
  ctx.textAlign = "left";
}

function mono() { return "'JetBrains Mono', monospace"; }
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

let t0 = 0;
function loop(t: number) {
  const autoT = 0.5 + Math.sin(t * 0.0008) * 0.38;
  tick(autoT);
  draw();
  requestAnimationFrame(loop);
}
if (reduce) {
  // static: show a representative diverged state
  for (let i = 0; i < 600; i++) tick(0.5 + Math.sin(i * 0.05) * 0.38);
  draw();
} else requestAnimationFrame(loop);
