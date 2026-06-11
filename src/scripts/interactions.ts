/**
 * LIVE INTERACTION LAYER — the site responds in real time.
 *  - a cursor "probe" that trails the mouse and swells over interactive things
 *  - the hero EEG turns into a live oscilloscope that reacts to your mouse + clicks
 *  - magnetic buttons, card tilt + spotlight that follow the cursor
 *  - traveling pulses along each section's signal line
 *  - a scroll-progress trace
 * All disabled under reduced-motion / coarse pointers; nothing blocks input.
 */
const fine = window.matchMedia("(pointer: fine)").matches;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// shared pointer state
let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;
let lastMx = mx;
let lastMy = my;
let speed = 0;
let clickPulse = 0;

window.addEventListener(
  "pointermove",
  (e) => {
    mx = e.clientX;
    my = e.clientY;
  },
  { passive: true }
);
window.addEventListener("pointerdown", () => (clickPulse = 1));

/* ---- cursor probe ---- */
let probe: HTMLDivElement | null = null;
let px = mx;
let py = my;
if (fine && !reduce) {
  probe = document.createElement("div");
  probe.className = "cursor-probe";
  document.body.appendChild(probe);
  const sel = "a, button, summary, .scard, .readout, .btn, .contact-email, .nav-links";
  document.addEventListener("pointerover", (e) => {
    if ((e.target as HTMLElement).closest(sel)) probe!.classList.add("lg");
  });
  document.addEventListener("pointerout", (e) => {
    if ((e.target as HTMLElement).closest(sel)) probe!.classList.remove("lg");
  });
  document.addEventListener("pointerleave", () => (probe!.style.opacity = "0"));
  document.addEventListener("pointerenter", () => (probe!.style.opacity = ""));
}

/* ---- magnetic buttons ---- */
if (fine && !reduce) {
  document.querySelectorAll<HTMLElement>(".btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.4 - 2}px)`;
    });
    btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
  });
}

/* ---- card tilt + spotlight ---- */
if (fine && !reduce) {
  document.querySelectorAll<HTMLElement>(".scard").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", nx * 100 + "%");
      card.style.setProperty("--my", ny * 100 + "%");
      const rx = (0.5 - ny) * 5;
      const ry = (nx - 0.5) * 5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  });
}

/* ---- section signal traveling pulses ---- */
interface Pulse { dot: SVGCircleElement; path: SVGPathElement; len: number; t: number; spd: number; }
const pulses: Pulse[] = [];
if (!reduce) {
  document.querySelectorAll<SVGSVGElement>(".section-head .signal").forEach((svg, i) => {
    const path = svg.querySelector("path");
    if (!path) return;
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("r", "2.6");
    dot.setAttribute("class", "travel");
    svg.appendChild(dot);
    pulses.push({ dot, path, len: path.getTotalLength(), t: i * 0.2, spd: 0.0016 });
  });
}

/* ---- hero oscilloscope ---- */
const canvas = document.querySelector<HTMLCanvasElement>(".hero-osc");
let octx: CanvasRenderingContext2D | null = null;
let ow = 0;
let oh = 0;
let dpr = 1;
const N = 170;
const buf = new Array(N).fill(0);
let phase = 0;
function sizeOsc() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  ow = rect.width;
  oh = rect.height || 46;
  canvas.width = ow * dpr;
  canvas.height = oh * dpr;
  octx = canvas.getContext("2d");
  octx?.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function drawOsc() {
  if (!octx) return;
  const amp = Math.min(0.12 + speed * 0.013 + clickPulse * 0.9, 1);
  phase += 0.32;
  const v = (Math.sin(phase) * 0.45 + (Math.random() - 0.5) * 0.85) * amp;
  buf.push(v);
  buf.shift();
  octx.clearRect(0, 0, ow, oh);
  // baseline
  octx.strokeStyle = "rgba(31,42,68,0.18)";
  octx.lineWidth = 1;
  octx.beginPath();
  octx.moveTo(0, oh / 2);
  octx.lineTo(ow, oh / 2);
  octx.stroke();
  // trace
  octx.strokeStyle = "#1f2a44";
  octx.globalAlpha = 0.85;
  octx.lineWidth = 1.5;
  octx.beginPath();
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * ow;
    const y = oh / 2 - buf[i] * (oh / 2 - 3);
    i === 0 ? octx.moveTo(x, y) : octx.lineTo(x, y);
  }
  octx.stroke();
  // leading scan dot (ember)
  octx.globalAlpha = 1;
  const ly = oh / 2 - buf[N - 1] * (oh / 2 - 3);
  octx.fillStyle = "#c8742e";
  octx.beginPath();
  octx.arc(ow - 2, ly, 3, 0, Math.PI * 2);
  octx.fill();
}
if (canvas) {
  sizeOsc();
  window.addEventListener("resize", sizeOsc);
  if (reduce) {
    // static single frame
    for (let i = 0; i < 40; i++) drawOsc();
  }
}

/* ---- scroll progress ---- */
const bar = document.getElementById("scrollbar");
function onScroll() {
  if (!bar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---- single rAF loop ---- */
function loop() {
  // pointer speed (decays)
  const inst = Math.min(Math.hypot(mx - lastMx, my - lastMy), 60);
  speed += (inst - speed) * 0.18;
  lastMx = mx;
  lastMy = my;
  clickPulse *= 0.88;

  if (probe) {
    px += (mx - px) * 0.2;
    py += (my - py) * 0.2;
    probe.style.transform = `translate(-50%,-50%) translate3d(${px}px,${py}px,0)`;
  }

  if (octx && !reduce) drawOsc();

  for (const p of pulses) {
    p.t = (p.t + p.spd) % 1;
    const pt = p.path.getPointAtLength(p.t * p.len);
    p.dot.setAttribute("cx", String(pt.x));
    p.dot.setAttribute("cy", String(pt.y));
  }

  requestAnimationFrame(loop);
}
if (!reduce || probe || pulses.length) requestAnimationFrame(loop);
