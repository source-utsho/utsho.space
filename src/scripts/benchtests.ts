// benchtests.ts — runnable bench tests + the two most personal interactions.
//
// PUBLIC CONTRACT (the assembling page calls EXACTLY this):
//   import { initBenchTests } from '../scripts/benchtests';
//   initBenchTests(rootEl: HTMLElement, { reduceMotion: boolean }) -> void
//
// `rootEl` contains one or more [data-bench] panels. We find each, decide which
// rig to wire from its data-bench value, and build a self-contained instrument
// inside it. Zero runtime deps — every visual is hand-drawn into a <canvas> or
// inline <svg>/DOM we create. Nothing here imports the page's gauge or anything
// else; the panels stand alone.
//
// PANELS WIRED HERE
//   [data-bench="eldercare"]  RUN TEST -> robot-arm pill-retrieval cycle vs an
//                             honest (labelled "compressed") stopwatch. First
//                             pass 20.0s, "AFTER PID TUNING" pass 7.0s, both
//                             overlaid on a strip chart so the win is visual.
//   [data-bench="glove"]      Five flex channels as live amber traces; ASL sign
//                             buttons ripple a synthetic signature through them,
//                             fire an 80%-honest classifier, mark a <250ms
//                             latency interval, and (opt-in, muted) speak.
//   [data-bench="humancpu"]   The "2014 · FIRST CODE · runtime: none" row expands
//                             into ink pseudocode whose variable-trace table fills
//                             step by step on a scrub. "11 years" computed live
//                             from Date().getFullYear() - 2014.
//   [data-bench="tremor"]     "solder this joint" target trembles so the precise
//                             action keeps slipping; resolves into his line and
//                             redraws the trembling stroke into the RoboSics org
//                             chart. His joke — warm, never mockery.
//
// MOTION DISCIPLINE
//   * One SHARED rAF orchestrator drives every panel (see Orchestrator below).
//   * Each rig self-suspends via IntersectionObserver when its panel is offscreen.
//   * Canvas traces are capped to ~30fps; idle rigs ask for no frames at all.
//   * Every value change runs a damped spring (zeta ~0.7, ~8% overshoot,
//     settle <600ms). Numbers slew like odometers — they never crossfade.
//   * prefers-reduced-motion (passed in as reduceMotion): jump-cut to the final
//     state, no power-on flicker, no tremor.
//
// DESIGN TOKENS — read from CSS variables the assembling page defines, with the
// documented values as fallbacks so the module also works in isolation.

/* ────────────────────────────────────────────────────────────────────────── */
/* Tokens                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

interface Tokens {
  ground: string; panel: string; hairline: string; engrave: string; dim: string;
  amber: string; orange: string; green: string; red: string; gold: string;
}

// Resolve a CSS custom property off :root, falling back to the documented value.
function tokens(root: HTMLElement): Tokens {
  const cs = getComputedStyle(root);
  const v = (name: string, fallback: string) => {
    const got = cs.getPropertyValue(name).trim();
    return got || fallback;
  };
  return {
    ground: v("--ground", "#0C0D0F"),
    panel: v("--panel", "#141518"),
    hairline: v("--hairline", "#2A2D31"),
    engrave: v("--engrave", "#E8E6E1"),
    dim: v("--dim", "#8A8F98"),
    amber: v("--amber", "#FFB454"),
    orange: v("--orange", "#FF4F1F"),
    green: v("--green", "#46C28E"),
    red: v("--red", "#E84B3C"),
    gold: v("--gold", "#D4AF37"),
  };
}

const MONO =
  "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";
const SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";

/* ────────────────────────────────────────────────────────────────────────── */
/* Shared rAF orchestrator                                                     */
/*                                                                             */
/* A single requestAnimationFrame loop ticks every registered rig. A rig only  */
/* receives ticks while (a) its panel is on-screen AND (b) it has declared      */
/* itself active (mid-animation). Canvas rigs additionally ask for a 30fps cap. */
/* When no rig wants frames, the loop parks itself and restarts on demand —     */
/* so an idle, fully-settled page costs zero rAF time.                          */
/* ────────────────────────────────────────────────────────────────────────── */

interface Rig {
  // True while this rig wants to be ticked. Set false to release the loop.
  active: boolean;
  // True while the rig's panel is intersecting the viewport.
  visible: boolean;
  // If true, the rig is only ticked at ~30fps (canvas traces); else every frame.
  cap30?: boolean;
  // Last time (ms, performance.now) this rig was ticked — used for the 30fps cap.
  _last?: number;
  // Advance the rig. dt is ms since this rig was last ticked.
  tick(now: number, dt: number): void;
}

const FRAME_30 = 1000 / 30;

class Orchestrator {
  private rigs = new Set<Rig>();
  private raf = 0;
  private running = false;

  add(rig: Rig) {
    this.rigs.add(rig);
  }
  remove(rig: Rig) {
    this.rigs.delete(rig);
  }
  // Cancel the loop entirely (e.g. SPA navigation tears the page down).
  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.running = false;
  }
  // A rig calls this whenever it wants frames (becomes active / scrolls in).
  kick() {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.loop);
  }
  private loop = (now: number) => {
    let anyWanting = false;
    for (const rig of this.rigs) {
      const wants = rig.active && rig.visible;
      if (!wants) continue;
      anyWanting = true;
      const last = rig._last ?? now;
      const dt = now - last;
      if (rig.cap30 && dt < FRAME_30) continue; // throttle canvas traces
      rig._last = now;
      try {
        rig.tick(now, dt);
      } catch {
        /* never let one rig kill the loop */
      }
    }
    if (anyWanting) {
      this.raf = requestAnimationFrame(this.loop);
    } else {
      this.running = false; // park; kick() restarts us
    }
  };
}

// One orchestrator per initBenchTests call (panels in the same root share it).
function makeOrchestrator() {
  return new Orchestrator();
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Damped spring — the slew primitive every value change runs through          */
/*                                                                             */
/* Critically/under-damped second-order spring. zeta ~0.7 gives the ~8%        */
/* overshoot the brief asks for; omega tuned so it settles inside ~600ms.      */
/* `done()` reports when both position error and velocity are negligible so a  */
/* rig can release the rAF loop.                                               */
/* ────────────────────────────────────────────────────────────────────────── */

class Spring {
  value: number;
  target: number;
  private vel = 0;
  private omega: number; // natural frequency (rad/s)
  private zeta: number; // damping ratio

  constructor(initial: number, omega = 14, zeta = 0.7) {
    this.value = initial;
    this.target = initial;
    this.omega = omega;
    this.zeta = zeta;
  }
  set(target: number) {
    this.target = target;
  }
  jump(v: number) {
    this.value = v;
    this.target = v;
    this.vel = 0;
  }
  // dtMs clamped so a long pause (tab backgrounded) can't explode the integrator.
  step(dtMs: number) {
    const dt = Math.min(dtMs, 48) / 1000;
    if (dt <= 0) return this.value;
    const k = this.omega * this.omega;
    const c = 2 * this.zeta * this.omega;
    const a = k * (this.target - this.value) - c * this.vel;
    this.vel += a * dt;
    this.value += this.vel * dt;
    return this.value;
  }
  done(eps = 0.0015) {
    return (
      Math.abs(this.target - this.value) < eps && Math.abs(this.vel) < eps
    );
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Small shared helpers                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

const NS = "http://www.w3.org/2000/svg";
function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {}
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}
// HiDPI-aware canvas sizing. Returns CSS-pixel dimensions and sets the transform.
function fitCanvas(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = c.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  c.width = w * dpr;
  c.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h, dpr };
}
function clamp(x: number, lo: number, hi: number) {
  return x < lo ? lo : x > hi ? hi : x;
}
// Deterministic small jitter (no Math.random in render paths that must be stable).
function jitter(seed: number) {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s) - 0.5; // [-0.5, 0.5)
}

// Inject the one-time stylesheet the panels share. Scoped by a data attribute
// so we never collide with the page; tokens come through as CSS variables so
// the page's values win automatically.
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const css = `
[data-bench]{position:relative;color:var(--engrave,#E8E6E1);}
[data-bench] *{box-sizing:border-box;}
.bt-mono{font-family:${MONO};letter-spacing:.08em;}
.bt-serif{font-family:${SERIF};}
.bt-label{font-family:${MONO};letter-spacing:.08em;font-size:10px;color:var(--dim,#8A8F98);text-transform:uppercase;}
.bt-readout{font-family:${MONO};letter-spacing:.08em;font-size:13px;color:var(--amber,#FFB454);}
/* Engraved silkscreen text — 1px inset shadow */
.bt-engrave{color:var(--engrave,#E8E6E1);text-shadow:0 1px 0 rgba(0,0,0,.6),0 -1px 0 rgba(255,255,255,.04);}
/* The single orange control per screen: POWER / RUN / TRANSMIT */
.bt-run{font-family:${MONO};letter-spacing:.12em;font-size:11px;text-transform:uppercase;
  color:var(--ground,#0C0D0F);background:var(--orange,#FF4F1F);border:none;border-radius:2px;
  padding:8px 16px;cursor:pointer;position:relative;transition:filter .12s linear,transform .06s linear;}
.bt-run:hover{filter:brightness(1.08);}
.bt-run:active{transform:translateY(1px);}
.bt-run:disabled{opacity:.45;cursor:default;filter:grayscale(.4);}
.bt-run:focus-visible{outline:2px solid var(--amber,#FFB454);outline-offset:2px;}
/* Status pills */
.bt-pill{font-family:${MONO};letter-spacing:.08em;font-size:10px;padding:2px 7px;border-radius:999px;
  border:1px solid currentColor;display:inline-block;}
.bt-pill.ok{color:var(--green,#46C28E);}
.bt-pill.bad{color:var(--red,#E84B3C);}
.bt-pill.live{color:var(--amber,#FFB454);}
/* Honest/correction lines speak in red */
.bt-correct{color:var(--red,#E84B3C);}
/* Ibtihal's own voice — serif italic asides */
.bt-aside{font-family:${SERIF};font-style:italic;font-size:19px;line-height:1.35;color:var(--engrave,#E8E6E1);}
.bt-channels{display:grid;gap:6px;}
.bt-chip{font-family:${MONO};letter-spacing:.08em;font-size:11px;text-transform:uppercase;
  color:var(--engrave,#E8E6E1);background:transparent;border:1px solid var(--hairline,#2A2D31);
  border-radius:2px;padding:6px 10px;cursor:pointer;transition:border-color .12s,color .12s;}
.bt-chip:hover{border-color:var(--amber,#FFB454);color:var(--amber,#FFB454);}
.bt-chip:focus-visible{outline:2px solid var(--amber,#FFB454);outline-offset:2px;}
.bt-toggle{display:inline-flex;align-items:center;gap:6px;font-family:${MONO};font-size:10px;
  letter-spacing:.08em;color:var(--dim,#8A8F98);cursor:pointer;}
.bt-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.bt-trace-canvas{display:block;width:100%;border:1px solid var(--hairline,#2A2D31);border-radius:3px;
  background:var(--ground,#0C0D0F);}
/* HUMAN CPU pseudocode + trace table */
.bt-code{font-family:${MONO};font-size:12px;line-height:1.7;letter-spacing:.04em;
  color:var(--engrave,#E8E6E1);white-space:pre;}
.bt-code .ln{color:var(--dim,#8A8F98);}
.bt-code .cur{background:rgba(255,180,84,.14);box-shadow:inset 2px 0 0 var(--amber,#FFB454);}
.bt-table{border-collapse:collapse;font-family:${MONO};font-size:11px;letter-spacing:.06em;width:100%;}
.bt-table th,.bt-table td{border:1px solid var(--hairline,#2A2D31);padding:4px 8px;text-align:right;}
.bt-table th{color:var(--dim,#8A8F98);font-weight:400;text-transform:uppercase;font-size:10px;}
.bt-table td.fresh{color:var(--amber,#FFB454);}
.bt-graphpaper{background-image:
  linear-gradient(rgba(138,143,152,.10) 1px,transparent 1px),
  linear-gradient(90deg,rgba(138,143,152,.10) 1px,transparent 1px);
  background-size:14px 14px;background-color:var(--panel,#141518);}
/* TREMOR */
.bt-tremor-stage{position:relative;}
.bt-solder{position:absolute;width:26px;height:26px;border:1px solid var(--amber,#FFB454);border-radius:50%;
  display:grid;place-items:center;color:var(--amber,#FFB454);font-family:${MONO};font-size:10px;cursor:crosshair;
  will-change:transform;}
.bt-solder::after{content:"";position:absolute;width:4px;height:4px;border-radius:50%;background:var(--amber,#FFB454);}
@media (prefers-reduced-motion: reduce){.bt-run{transition:none;}}
`;
  const style = el("style");
  style.setAttribute("data-benchtests", "");
  style.textContent = css;
  document.head.appendChild(style);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* PUBLIC ENTRY                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export function initBenchTests(
  rootEl: HTMLElement,
  opts: { reduceMotion: boolean }
): void {
  const reduce = !!opts.reduceMotion;
  injectStyles();
  const tk = tokens(rootEl);
  const orch = makeOrchestrator();

  const panels = Array.from(
    rootEl.querySelectorAll<HTMLElement>("[data-bench]")
  );

  for (const panel of panels) {
    const kind = panel.getAttribute("data-bench");
    // Each builder registers its rig(s) with the orchestrator and returns a
    // `visibility` setter the IntersectionObserver below toggles.
    let onVisible: ((vis: boolean) => void) | null = null;
    try {
      switch (kind) {
        case "eldercare":
          onVisible = buildEldercare(panel, tk, reduce, orch);
          break;
        case "glove":
          onVisible = buildGlove(panel, tk, reduce, orch);
          break;
        case "humancpu":
          buildHumanCPU(panel, tk, reduce, orch); // self-suspends internally
          break;
        case "tremor":
          onVisible = buildTremor(panel, tk, reduce, orch);
          break;
        default:
          // Unknown data-bench value: leave the panel untouched.
          break;
      }
    } catch {
      // A failed build must never take down the others.
    }

    // Self-suspend offscreen. Canvas rigs expose onVisible; we flip their
    // `visible` flag so the orchestrator stops ticking them.
    if (onVisible) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) onVisible!(e.isIntersecting);
        },
        { threshold: 0.01 }
      );
      io.observe(panel);
    }
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   PANEL 1 — ELDER-CARE PILL-RETRIEVAL TEST   [data-bench="eldercare"]
   ──────────────────────────────────────────────────────────────────────────
   RUN TEST drives a 2-link SVG arm through pick → carry → place. The first run
   plays the cycle compressed to 20.0s of "real" time; the second, "AFTER PID
   TUNING", to 7.0s. Both runs leave a curve on a shared strip chart (error vs.
   time) so you SEE the tuned loop settle without overshoot. The clock is honest:
   it shows real compressed-equivalent seconds and is labelled "compressed".
   ════════════════════════════════════════════════════════════════════════════ */

function buildEldercare(
  panel: HTMLElement,
  tk: Tokens,
  reduce: boolean,
  orch: Orchestrator
): (vis: boolean) => void {
  // --- DOM scaffold ---------------------------------------------------------
  const wrap = el("div");
  wrap.style.display = "grid";
  wrap.style.gap = "12px";

  // The schematic arm (SVG)
  const W = 320;
  const H = 200;
  const scene = svg("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: "100%",
    role: "img",
    "aria-label": "Schematic robot arm retrieving a pill",
  });
  scene.style.maxWidth = "420px";
  scene.style.background = tk.ground;
  scene.style.border = `1px solid ${tk.hairline}`;
  scene.style.borderRadius = "3px";

  // base + bench
  scene.appendChild(
    svg("line", { x1: 24, y1: 168, x2: W - 24, y2: 168, stroke: tk.hairline, "stroke-width": 1 })
  );
  // shelf where the pill bottle sits
  scene.appendChild(
    svg("rect", { x: 246, y: 96, width: 54, height: 8, fill: "none", stroke: tk.hairline, "stroke-width": 1 })
  );
  scene.appendChild(svg("text", { x: 252, y: 92, fill: tk.dim, "font-size": 8, "font-family": MONO, "letter-spacing": "1" }));
  (scene.lastChild as SVGTextElement).textContent = "SHELF";
  // drop tray
  scene.appendChild(
    svg("rect", { x: 30, y: 150, width: 40, height: 14, fill: "none", stroke: tk.hairline, "stroke-width": 1 })
  );

  // arm pivot
  const pivotX = 150;
  const pivotY = 168;
  const L1 = 64; // upper link
  const L2 = 56; // forearm
  const link1 = svg("line", { x1: pivotX, y1: pivotY, x2: pivotX, y2: pivotY - L1, stroke: tk.engrave, "stroke-width": 3, "stroke-linecap": "round" });
  const link2 = svg("line", { x1: pivotX, y1: pivotY - L1, x2: pivotX, y2: pivotY - L1 - L2, stroke: tk.engrave, "stroke-width": 2.4, "stroke-linecap": "round" });
  const gripper = svg("circle", { cx: pivotX, cy: pivotY - L1 - L2, r: 4, fill: "none", stroke: tk.amber, "stroke-width": 1 });
  const pill = svg("circle", { cx: 273, cy: 92, r: 3.4, fill: tk.amber });
  scene.appendChild(svg("circle", { cx: pivotX, cy: pivotY, r: 5, fill: "none", stroke: tk.engrave, "stroke-width": 1 }));
  scene.appendChild(link1);
  scene.appendChild(link2);
  scene.appendChild(gripper);
  scene.appendChild(pill);

  // --- Strip chart (canvas) -------------------------------------------------
  const chart = el("canvas", "bt-trace-canvas");
  chart.style.height = "120px";
  const cctx = chart.getContext("2d")!;

  // --- Controls + readout ---------------------------------------------------
  const top = el("div", "bt-row");
  const run = el("button", "bt-run", "RUN TEST");
  run.type = "button";
  const clockBox = el("div");
  clockBox.style.marginLeft = "auto";
  const clockLbl = el("div", "bt-label");
  clockLbl.textContent = "CYCLE TIME · compressed";
  const clock = el("div", "bt-readout bt-engrave", "00.0 s");
  clock.style.fontSize = "20px";
  clockBox.appendChild(clockLbl);
  clockBox.appendChild(clock);
  const stage = el("div", "bt-label");
  stage.textContent = "READY";
  top.appendChild(run);
  top.appendChild(stage);
  top.appendChild(clockBox);

  const caption = el("p", "bt-aside");
  caption.style.maxWidth = "62ch";
  caption.innerHTML =
    `The arm didn't get faster because the motor got stronger — it got faster ` +
    `because the <span style="color:${tk.amber}">PID loop</span> stopped fighting itself. ` +
    `Same hardware, two tunings: <span class="bt-engrave">20.0s</span> of hunting and overshoot, ` +
    `then <span class="bt-engrave">7.0s</span> that just lands.`;
  // stays serif-italic — this caption is in Ibtihal's voice, not the machine's.

  wrap.appendChild(top);
  wrap.appendChild(scene);
  wrap.appendChild(chart);
  wrap.appendChild(caption);
  panel.appendChild(wrap);

  // --- Kinematics -----------------------------------------------------------
  // We animate two joint angles (shoulder a1, elbow a2) through a small keyframe
  // path: home → reach pill → grasp → carry → place → home. The TUNED run uses a
  // tighter spring (no overshoot); the UNTUNED run overshoots and re-hunts, which
  // is exactly why it reads slower on the same compressed clock.
  type Pose = { a1: number; a2: number; grip: boolean };
  const D = Math.PI / 180;
  const POSES: { pose: Pose; label: string }[] = [
    { pose: { a1: -90 * D, a2: 0, grip: false }, label: "HOME" },
    { pose: { a1: -34 * D, a2: -52 * D, grip: false }, label: "REACH" },
    { pose: { a1: -30 * D, a2: -60 * D, grip: true }, label: "GRASP" },
    { pose: { a1: -70 * D, a2: -30 * D, grip: true }, label: "CARRY" },
    { pose: { a1: -128 * D, a2: 24 * D, grip: true }, label: "PLACE" },
    { pose: { a1: -128 * D, a2: 24 * D, grip: false }, label: "RELEASE" },
    { pose: { a1: -90 * D, a2: 0, grip: false }, label: "HOME" },
  ];

  // springs for the two joints
  const sp1 = new Spring(POSES[0].pose.a1, 16, 0.72);
  const sp2 = new Spring(POSES[0].pose.a2, 16, 0.72);

  // chart history: error magnitude (0..1) sampled over the run, per pass
  type Series = { color: string; pts: number[]; label: string; secs: number };
  let seriesTuned: Series | null = null;
  let seriesUntuned: Series | null = null;

  // run state
  let running = false;
  let passTuned = false; // which pass we're on
  let segIndex = 0;
  let segElapsed = 0; // ms within the current segment (real time)
  let compElapsed = 0; // accumulated COMPRESSED seconds shown on the clock
  let curSeries: Series | null = null;

  // Per-pass timing. We compress the whole cycle into a target wall-clock the
  // viewer actually waits (so the demo is short), but the CLOCK we print counts
  // the honest compressed-equivalent seconds (20.0 / 7.0) — labelled compressed.
  const PLAY_MS = 3400; // real seconds the viewer waits per pass (~3.4s)
  function passTotalCompressed() {
    return passTuned ? 7.0 : 20.0;
  }
  // untuned spring is looser → visible overshoot + hunt
  function applyTuning() {
    if (passTuned) {
      sp1.jump(POSES[0].pose.a1);
      sp2.jump(POSES[0].pose.a2);
      (sp1 as any).omega = 20;
      (sp2 as any).omega = 20;
      (sp1 as any).zeta = 0.9; // crisp, lands clean
      (sp2 as any).zeta = 0.9;
    } else {
      sp1.jump(POSES[0].pose.a1);
      sp2.jump(POSES[0].pose.a2);
      (sp1 as any).omega = 11;
      (sp2 as any).omega = 11;
      (sp1 as any).zeta = 0.42; // bouncy, overshoots, re-hunts
      (sp2 as any).zeta = 0.42;
    }
  }

  function setStage(s: string) {
    stage.textContent = s;
  }

  function forwardK() {
    // shoulder angle measured from +x; our poses use link pointing up at -90°.
    const a1 = sp1.value;
    const a2 = sp2.value;
    const e1x = pivotX + Math.cos(a1) * L1;
    const e1y = pivotY + Math.sin(a1) * L1;
    const e2x = e1x + Math.cos(a1 + a2) * L2;
    const e2y = e1y + Math.sin(a1 + a2) * L2;
    return { e1x, e1y, e2x, e2y };
  }

  function renderArm(gripClosed: boolean, hasPill: boolean) {
    const { e1x, e1y, e2x, e2y } = forwardK();
    link1.setAttribute("x2", String(e1x));
    link1.setAttribute("y2", String(e1y));
    link2.setAttribute("x1", String(e1x));
    link2.setAttribute("y1", String(e1y));
    link2.setAttribute("x2", String(e2x));
    link2.setAttribute("y2", String(e2y));
    gripper.setAttribute("cx", String(e2x));
    gripper.setAttribute("cy", String(e2y));
    gripper.setAttribute("r", gripClosed ? "3" : "5");
    gripper.setAttribute("stroke", gripClosed ? tk.amber : tk.dim);
    if (hasPill) {
      pill.setAttribute("cx", String(e2x));
      pill.setAttribute("cy", String(e2y));
    } else if (!running) {
      pill.setAttribute("cx", "273");
      pill.setAttribute("cy", "92");
    }
  }

  function drawChart() {
    const { w, h } = fitCanvas(chart, cctx);
    cctx.clearRect(0, 0, w, h);
    // frame + baseline
    cctx.strokeStyle = tk.hairline;
    cctx.lineWidth = 1;
    cctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    // settle line (target = 0 error) near the bottom
    const base = h - 18;
    cctx.strokeStyle = "rgba(138,143,152,0.25)";
    cctx.beginPath();
    cctx.moveTo(0, base);
    cctx.lineTo(w, base);
    cctx.stroke();
    // axis labels
    cctx.font = "10px " + MONO;
    cctx.fillStyle = tk.dim;
    cctx.fillText("POSITION ERROR", 8, 14);
    cctx.textAlign = "right";
    cctx.fillText("0", w - 6, base + 3);
    cctx.textAlign = "left";

    const top = 22;
    const span = base - top;
    const plot = (s: Series | null, dim: boolean) => {
      if (!s || s.pts.length < 2) return;
      cctx.beginPath();
      for (let i = 0; i < s.pts.length; i++) {
        const x = (i / (s.pts.length - 1)) * (w - 2) + 1;
        const y = base - clamp(s.pts[i], 0, 1) * span;
        i === 0 ? cctx.moveTo(x, y) : cctx.lineTo(x, y);
      }
      // amber = subject trace, drawn as a 1px double-stroke phosphor line
      cctx.strokeStyle = s.color;
      cctx.globalAlpha = dim ? 0.5 : 1;
      cctx.lineWidth = 1;
      cctx.stroke();
      if (s.color === tk.amber) {
        // faint second pass = the phosphor double-stroke
        cctx.globalAlpha = (dim ? 0.5 : 1) * 0.4;
        cctx.lineWidth = 3;
        cctx.stroke();
      }
      cctx.globalAlpha = 1;
    };
    // untuned in dim engrave, tuned in amber phosphor
    plot(seriesUntuned, true);
    plot(seriesTuned, false);

    // legend
    cctx.font = "10px " + MONO;
    if (seriesUntuned) {
      cctx.fillStyle = tk.dim;
      cctx.fillText(`UNTUNED ${seriesUntuned.secs.toFixed(1)}s`, 8, h - 6);
    }
    if (seriesTuned) {
      cctx.fillStyle = tk.amber;
      cctx.textAlign = "right";
      cctx.fillText(`PID TUNED ${seriesTuned.secs.toFixed(1)}s`, w - 8, h - 6);
      cctx.textAlign = "left";
    }
  }

  // The rig ticked by the orchestrator.
  const rig: Rig = {
    active: false,
    visible: false,
    cap30: true,
    tick(_now, dt) {
      if (!running) {
        // settle springs to current pose, then idle
        sp1.step(dt);
        sp2.step(dt);
        renderArm(false, false);
        if (sp1.done() && sp2.done()) {
          rig.active = false; // release loop
        }
        return;
      }
      // advance through segments. Each segment owns an equal slice of PLAY_MS.
      const segMs = PLAY_MS / (POSES.length - 1);
      segElapsed += dt;
      // set spring targets for the segment we're entering
      const target = POSES[segIndex + 1];
      sp1.set(target.pose.a1);
      sp2.set(target.pose.a2);
      sp1.step(dt);
      sp2.step(dt);

      // honest compressed clock: fraction of the cycle done × pass total
      const frac =
        (segIndex + clamp(segElapsed / segMs, 0, 1)) / (POSES.length - 1);
      compElapsed = frac * passTotalCompressed();
      clock.textContent = compElapsed.toFixed(1).padStart(4, "0") + " s";
      setStage(target.label);

      // sample error for the chart (distance of springs from their targets)
      if (curSeries) {
        const err =
          (Math.abs(sp1.target - sp1.value) + Math.abs(sp2.target - sp2.value)) /
          (Math.PI); // normalize ~0..1
        curSeries.pts.push(clamp(err, 0, 1));
      }

      const hasPill = target.pose.grip || POSES[segIndex].pose.grip;
      renderArm(target.pose.grip, hasPill && segIndex >= 2 && segIndex <= 4);
      drawChart();

      if (segElapsed >= segMs) {
        segElapsed = 0;
        segIndex++;
        if (segIndex >= POSES.length - 1) {
          // pass finished
          if (curSeries) curSeries.secs = passTotalCompressed();
          finishPass();
        }
      }
    },
  };

  function finishPass() {
    if (!passTuned) {
      // chain straight into the tuned pass
      passTuned = true;
      startPass();
    } else {
      running = false;
      run.disabled = false;
      setStage("DONE · −65% cycle time");
      clock.textContent = "07.0 s";
      drawChart();
    }
  }

  function startPass() {
    applyTuning();
    segIndex = 0;
    segElapsed = 0;
    compElapsed = 0;
    curSeries = { color: passTuned ? tk.amber : tk.dim, pts: [], label: passTuned ? "TUNED" : "UNTUNED", secs: 0 };
    if (passTuned) seriesTuned = curSeries;
    else seriesUntuned = curSeries;
    rig.active = true;
    orch.kick();
  }

  function runTest() {
    if (running) return;
    running = true;
    passTuned = false;
    seriesTuned = null;
    seriesUntuned = null;
    run.disabled = true;
    setStage("UNTUNED PASS");
    if (reduce) {
      // jump-cut: synthesize both finished curves and the final pose, no motion.
      const synth = (overshoot: boolean): number[] => {
        const out: number[] = [];
        const n = 60;
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1);
          // decaying error; untuned overshoots through zero a couple of times
          let e = Math.exp(-t * (overshoot ? 3 : 6));
          if (overshoot) e *= 1 + 0.5 * Math.cos(t * 18);
          out.push(clamp(Math.abs(e), 0, 1));
        }
        return out;
      };
      seriesUntuned = { color: tk.dim, pts: synth(true), label: "UNTUNED", secs: 20.0 };
      seriesTuned = { color: tk.amber, pts: synth(false), label: "TUNED", secs: 7.0 };
      sp1.jump(POSES[POSES.length - 1].pose.a1);
      sp2.jump(POSES[POSES.length - 1].pose.a2);
      renderArm(false, false);
      drawChart();
      clock.textContent = "07.0 s";
      setStage("DONE · −65% cycle time");
      running = false;
      run.disabled = false;
      return;
    }
    startPass();
  }
  run.addEventListener("click", runTest);

  // initial static frame
  renderArm(false, false);
  drawChart();

  orch.add(rig);
  return (vis: boolean) => {
    rig.visible = vis;
    if (vis && rig.active) orch.kick();
    if (vis) {
      // re-fit canvas in case it was resized while hidden
      drawChart();
    }
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   PANEL 2 — GLOVE FLEX-CHANNEL TEST   [data-bench="glove"]
   ──────────────────────────────────────────────────────────────────────────
   Five flex-sensor channels scroll as live amber traces. Sign buttons inject a
   hand-authored signature (per-finger bend keyframes) — no model, just shaped
   curves. Tapping a sign ripples it through the channels, fires a classifier
   readout, draws a sub-250ms latency interval on the trace, and (opt-in, OFF by
   default) speaks the word. The honest line stays foregrounded: 80% accuracy,
   65% satisfaction.
   ════════════════════════════════════════════════════════════════════════════ */

function buildGlove(
  panel: HTMLElement,
  tk: Tokens,
  reduce: boolean,
  orch: Orchestrator
): (vis: boolean) => void {
  const FINGERS = ["THUMB", "INDEX", "MIDDLE", "RING", "PINKY"];
  const N = 220; // samples per channel buffer

  // synthetic per-finger target bend (0 relaxed → 1 fully flexed) for each sign
  type Sign = { word: string; bend: number[] };
  const SIGNS: Sign[] = [
    { word: "HELLO", bend: [0.2, 0.15, 0.15, 0.2, 0.25] }, // open hand wave
    { word: "YES", bend: [0.8, 0.9, 0.9, 0.9, 0.9] }, // fist nodding
    { word: "THANK YOU", bend: [0.3, 0.25, 0.3, 0.35, 0.4] }, // flat hand from chin
    { word: "I LOVE YOU", bend: [0.1, 0.1, 0.95, 0.95, 0.1] }, // ILY handshape
  ];

  // --- DOM ------------------------------------------------------------------
  const wrap = el("div");
  wrap.style.display = "grid";
  wrap.style.gap = "12px";

  const canvas = el("canvas", "bt-trace-canvas");
  canvas.style.height = "180px";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Five live flex-sensor channels");
  const cx = canvas.getContext("2d")!;

  // classifier readout
  const readRow = el("div", "bt-row");
  const readLbl = el("div", "bt-label");
  readLbl.textContent = "CLASSIFIER";
  const readWord = el("div", "bt-readout bt-engrave", "—");
  readWord.style.fontSize = "20px";
  const conf = el("div", "bt-label");
  conf.textContent = "";
  const latency = el("span", "bt-pill live", "");
  latency.style.display = "none";
  readRow.appendChild(readLbl);
  readRow.appendChild(readWord);
  readRow.appendChild(conf);
  readRow.appendChild(latency);

  // sign buttons
  const signRow = el("div", "bt-row");
  signRow.setAttribute("role", "group");
  signRow.setAttribute("aria-label", "ASL sign signatures");

  // speech toggle (opt-in, muted by default)
  const speakLbl = el("label", "bt-toggle");
  const speakBox = el("input");
  speakBox.type = "checkbox";
  speakBox.style.accentColor = tk.amber;
  speakLbl.appendChild(speakBox);
  speakLbl.appendChild(document.createTextNode("SPEAK (off)"));
  const speechOK =
    typeof window !== "undefined" && "speechSynthesis" in window;
  if (!speechOK) {
    speakBox.disabled = true;
    speakLbl.lastChild!.textContent = "SPEAK (unavailable)";
  }
  speakBox.addEventListener("change", () => {
    speakLbl.lastChild!.textContent = speakBox.checked ? "SPEAK (on)" : "SPEAK (off)";
  });

  // honest stat block — his voice
  const honest = el("div");
  honest.style.maxWidth = "62ch";
  honest.innerHTML =
    `<div class="bt-row" style="gap:14px;margin-bottom:6px">` +
    `<span class="bt-pill ok">ACCURACY 80%</span>` +
    `<span class="bt-pill bad">SATISFACTION 65%</span></div>` +
    `<p class="bt-aside">Eighty percent accuracy demos beautifully. The number that ` +
    `actually taught me something was the <span class="bt-correct">65% satisfaction</span> ` +
    `score — the people wearing it didn't care that it was right four times in five. ` +
    `They cared about the fifth time.</p>`;

  wrap.appendChild(readRow);
  wrap.appendChild(canvas);
  const controls = el("div", "bt-row");
  controls.appendChild(signRow);
  controls.appendChild(speakLbl);
  wrap.appendChild(controls);
  wrap.appendChild(honest);
  panel.appendChild(wrap);

  // --- channel state --------------------------------------------------------
  // each channel: ring buffer of samples + a spring driving its current bend
  const chans = FINGERS.map((_, i) => ({
    buf: new Array<number>(N).fill(0.08 + i * 0.005),
    sp: new Spring(0.08, 18, 0.7),
    base: 0.06 + i * 0.012, // idle resting bend, slightly different per finger
  }));

  // a "gesture in progress" pushes the springs toward a sign, then releases
  let gestureT = -1; // ms remaining in the active gesture, <0 = idle
  let pendingClassifyAt = -1; // performance.now when to fire the classifier
  let pendingSign: Sign | null = null;
  let latencyMarkAtX = -1; // x-sample index where the gesture started (for the interval marker)
  let measuredLatencyMs = 0;

  function rgba(hex: string, a: number) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function draw() {
    const { w, h } = fitCanvas(canvas, cx);
    cx.clearRect(0, 0, w, h);
    cx.strokeStyle = tk.hairline;
    cx.lineWidth = 1;
    cx.strokeRect(0.5, 0.5, w - 1, h - 1);

    const padT = 10;
    const padB = 16;
    const rowH = (h - padT - padB) / FINGERS.length;
    for (let c = 0; c < chans.length; c++) {
      const y0 = padT + c * rowH;
      const mid = y0 + rowH / 2;
      // lane baseline
      cx.strokeStyle = rgba(tk.dim, 0.18);
      cx.beginPath();
      cx.moveTo(0, mid);
      cx.lineTo(w, mid);
      cx.stroke();
      // label
      cx.font = "10px " + MONO;
      cx.fillStyle = tk.dim;
      cx.fillText(FINGERS[c], 6, y0 + 11);

      // amber trace — 1px double-stroke phosphor
      const buf = chans[c].buf;
      const amp = rowH * 0.42;
      const plot = (lw: number, alpha: number) => {
        cx.beginPath();
        for (let i = 0; i < N; i++) {
          const x = (i / (N - 1)) * w;
          const y = mid - (buf[i] - 0.5) * 2 * amp;
          i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
        }
        cx.strokeStyle = rgba(tk.amber, alpha);
        cx.lineWidth = lw;
        cx.stroke();
      };
      plot(3, 0.22); // bloom
      plot(1, 0.95); // core
    }

    // sub-250ms latency interval marker
    if (latencyMarkAtX >= 0 && measuredLatencyMs > 0) {
      const startX = (latencyMarkAtX / (N - 1)) * w;
      const endX = clamp(startX + 26, startX + 10, w - 4); // visual span
      cx.strokeStyle = tk.amber;
      cx.lineWidth = 1;
      cx.beginPath();
      cx.moveTo(startX, h - 6);
      cx.lineTo(endX, h - 6);
      cx.stroke();
      // end caps
      for (const xx of [startX, endX]) {
        cx.beginPath();
        cx.moveTo(xx, h - 9);
        cx.lineTo(xx, h - 3);
        cx.stroke();
      }
      cx.font = "10px " + MONO;
      cx.fillStyle = tk.amber;
      cx.fillText(`${measuredLatencyMs.toFixed(0)}ms`, endX + 4, h - 4);
    }
  }

  // advance the ring buffers one tick toward each channel's spring value
  function advance(dt: number) {
    for (const c of chans) {
      c.sp.step(dt);
      c.buf.push(c.sp.value + jitter(performance.now() * 0.01 + c.base * 99) * 0.012);
      c.buf.shift();
    }
  }

  const rig: Rig = {
    active: false,
    visible: false,
    cap30: true,
    tick(now, dt) {
      advance(dt);
      // gesture lifecycle: hold the sign briefly, then relax to baseline
      if (gestureT >= 0) {
        gestureT -= dt;
        if (gestureT < 0) {
          for (const c of chans) c.sp.set(c.base);
        }
      }
      // classifier fires after the (short, honest) processing window
      if (pendingClassifyAt > 0 && now >= pendingClassifyAt && pendingSign) {
        fireClassifier(pendingSign, now);
        pendingClassifyAt = -1;
        pendingSign = null;
      }
      draw();
      // NOTE: we intentionally do NOT self-release here. These are LIVE sensor
      // traces — they keep scrolling (breathing) for as long as the panel is in
      // view. The orchestrator + IntersectionObserver fully suspend us offscreen
      // (the visibility callback sets rig.active), so an off-screen glove costs
      // nothing while an on-screen one stays alive at the 30fps cap.
    },
  };

  // 80% honest classifier: 1-in-5 deliberately returns the wrong neighbour, and
  // when it does we say so in red. This is the demo refusing to lie about itself.
  let signTapCount = 0;
  function classify(sign: Sign): { word: string; correct: boolean; conf: number } {
    signTapCount++;
    const miss = signTapCount % 5 === 0; // exactly 20% miss rate
    if (miss) {
      const others = SIGNS.filter((s) => s !== sign);
      const wrong = others[signTapCount % others.length];
      return { word: wrong.word, correct: false, conf: 0.55 + (signTapCount % 3) * 0.04 };
    }
    return { word: sign.word, correct: true, conf: 0.82 + (signTapCount % 4) * 0.03 };
  }

  function fireClassifier(sign: Sign, now: number) {
    const res = classify(sign);
    measuredLatencyMs = clamp(now - gestureStartNow, 60, 240); // always < 250ms
    readWord.textContent = res.word;
    readWord.style.color = res.correct ? tk.amber : tk.red;
    if (res.correct) {
      conf.innerHTML = `<span style="color:${tk.green}">MATCH</span> · ${(res.conf * 100).toFixed(0)}%`;
    } else {
      conf.innerHTML = `<span class="bt-correct">MISS</span> · best guess ${(res.conf * 100).toFixed(0)}%`;
    }
    latency.textContent = `Δ ${measuredLatencyMs.toFixed(0)}ms (<250)`;
    latency.style.display = "";
    // speak only if opted in
    if (speakBox.checked && speechOK && res.correct) {
      try {
        const u = new SpeechSynthesisUtterance(res.word.toLowerCase());
        u.rate = 0.95;
        u.volume = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {
        /* speech is best-effort */
      }
    }
  }

  let gestureStartNow = 0;
  function performSign(sign: Sign) {
    if (reduce) {
      // jump straight to the held pose + classifier, no ripple
      sign.bend.forEach((b, i) => chans[i].sp.jump(b));
      for (const c of chans) c.buf.fill(0);
      gestureStartNow = performance.now();
      measuredLatencyMs = 0;
      fireClassifier(sign, gestureStartNow); // latency clamps to floor
      latencyMarkAtX = Math.floor(N * 0.6);
      measuredLatencyMs = 120;
      draw();
      // relax after a moment without animation
      sign.bend.forEach((_, i) => chans[i].sp.jump(chans[i].base));
      draw();
      return;
    }
    gestureStartNow = performance.now();
    latencyMarkAtX = N - 1; // marker anchored at the live edge
    // drive each finger to its signature bend (springs give the ripple/overshoot)
    sign.bend.forEach((b, i) => {
      // stagger slightly per finger so it ripples across the hand
      window.setTimeout(() => chans[i].sp.set(b), reduce ? 0 : i * 26);
    });
    gestureT = 520; // hold ~0.5s then release
    // classifier returns after an honest sub-250ms processing window
    pendingClassifyAt = performance.now() + 180;
    pendingSign = sign;
    rig.active = true;
    orch.kick();
  }

  for (const sign of SIGNS) {
    const b = el("button", "bt-chip", sign.word);
    b.type = "button";
    b.addEventListener("click", () => performSign(sign));
    signRow.appendChild(b);
  }

  draw();
  orch.add(rig);
  return (vis: boolean) => {
    rig.visible = vis;
    if (vis) {
      // keep a slow live idle so the channels breathe when in view (not when hidden)
      rig.active = true;
      orch.kick();
    } else {
      rig.active = false; // fully suspend offscreen
    }
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   PANEL 3 — THE HUMAN CPU   [data-bench="humancpu"]
   ──────────────────────────────────────────────────────────────────────────
   The calibration-log row "2014 · FIRST CODE · runtime: none" expands into an
   ink-on-graph-paper pseudocode fragment. A VARIABLE TRACE TABLE fills in row by
   row on a scrub/timer — the site hand-executes a tiny program the way he did in
   a library with no computer. The closing line computes "11 years" live from
   Date().getFullYear() - 2014 (display only; animation timing uses
   performance.now, never the Date API).
   ════════════════════════════════════════════════════════════════════════════ */

function buildHumanCPU(
  panel: HTMLElement,
  tk: Tokens,
  reduce: boolean,
  orch: Orchestrator
): void {
  // The toggle row that expands. The page may already render the row text; if a
  // [data-cpu-row] exists we use it as the trigger, else we synthesize one.
  let trigger = panel.querySelector<HTMLElement>("[data-cpu-row]");
  if (!trigger) {
    trigger = el("button", "bt-chip");
    trigger.style.width = "100%";
    trigger.style.textAlign = "left";
    trigger.textContent = "2014 · FIRST CODE · runtime: none ▸";
    panel.appendChild(trigger);
  }
  trigger.setAttribute("role", "button");
  trigger.setAttribute("tabindex", "0");
  trigger.setAttribute("aria-expanded", "false");

  // The expandable body
  const body = el("div", "bt-graphpaper");
  body.style.cssText +=
    "overflow:hidden;height:0;border:1px solid " +
    tk.hairline +
    ";border-radius:3px;margin-top:8px;";
  panel.appendChild(body);

  const inner = el("div");
  inner.style.cssText = "padding:16px;display:grid;gap:14px;";
  body.appendChild(inner);

  // --- the tiny program he runs by hand --------------------------------------
  // sum 1..3 then "print" a greeting — small enough to dry-run in ink.
  const PROGRAM = [
    "n ← 3",
    "sum ← 0",
    "i ← 1",
    "while i ≤ n:",
    "    sum ← sum + i",
    "    i ← i + 1",
    'out ← "hello, world"',
    "print out",
  ];
  // Hand-traced execution steps: which line is "current" and the variable state
  // AFTER that line executes. This is the dry-run table he'd keep in the margin.
  type Step = { line: number; n: string; sum: string; i: string; out: string };
  const STEPS: Step[] = [
    { line: 0, n: "3", sum: "—", i: "—", out: "—" },
    { line: 1, n: "3", sum: "0", i: "—", out: "—" },
    { line: 2, n: "3", sum: "0", i: "1", out: "—" },
    { line: 4, n: "3", sum: "1", i: "1", out: "—" }, // sum=0+1
    { line: 5, n: "3", sum: "1", i: "2", out: "—" },
    { line: 4, n: "3", sum: "3", i: "2", out: "—" }, // sum=1+2
    { line: 5, n: "3", sum: "3", i: "3", out: "—" },
    { line: 4, n: "3", sum: "6", i: "3", out: "—" }, // sum=3+3
    { line: 5, n: "3", sum: "6", i: "4", out: "—" },
    { line: 6, n: "3", sum: "6", i: "4", out: '"hello, world"' },
    { line: 7, n: "3", sum: "6", i: "4", out: '"hello, world"' },
  ];

  // pseudocode pane
  const codePane = el("pre", "bt-code");
  const codeLines: HTMLSpanElement[] = [];
  PROGRAM.forEach((line, i) => {
    const span = el("span");
    span.innerHTML =
      `<span class="ln">${String(i + 1).padStart(2, " ")}</span>  ` + escapeHTML(line);
    codePane.appendChild(span);
    codePane.appendChild(document.createTextNode("\n"));
    codeLines.push(span);
  });

  // trace table
  const table = el("table", "bt-table");
  table.innerHTML =
    "<thead><tr><th>step</th><th>n</th><th>sum</th><th>i</th><th>out</th></tr></thead>";
  const tbody = el("tbody");
  table.appendChild(tbody);

  const grid = el("div");
  grid.style.cssText =
    "display:grid;gap:16px;grid-template-columns:minmax(180px,1fr) minmax(220px,1.2fr);align-items:start;";
  grid.appendChild(codePane);
  const tableWrap = el("div");
  const tableLbl = el("div", "bt-label");
  tableLbl.textContent = "VARIABLE TRACE";
  tableLbl.style.marginBottom = "6px";
  tableWrap.appendChild(tableLbl);
  tableWrap.appendChild(table);
  grid.appendChild(tableWrap);
  inner.appendChild(grid);

  // scrub control
  const scrubRow = el("div", "bt-row");
  const scrub = el("input");
  scrub.type = "range";
  scrub.min = "0";
  scrub.max = String(STEPS.length - 1);
  scrub.value = "0";
  scrub.step = "1";
  scrub.style.flex = "1";
  scrub.style.accentColor = tk.amber;
  scrub.setAttribute("aria-label", "Scrub the hand-traced execution");
  const stepLbl = el("div", "bt-label");
  stepLbl.style.minWidth = "120px";
  scrubRow.appendChild(stepLbl);
  scrubRow.appendChild(scrub);
  inner.appendChild(scrubRow);

  // closing line — "11 years" computed live (DISPLAY only; not animation timing)
  const years = new Date().getFullYear() - 2014;
  const closer = el("p", "bt-aside");
  closer.style.maxWidth = "62ch";
  closer.innerHTML =
    `<span class="bt-engrave" style="font-family:${MONO};font-size:13px;letter-spacing:.08em">` +
    `print "hello, world"</span> — received ` +
    `<span class="bt-engrave">${years} years</span> late.`;
  inner.appendChild(closer);

  // --- render a given step ---------------------------------------------------
  let shownStep = -1;
  function renderStep(idx: number, animateRow: boolean) {
    const s = STEPS[idx];
    if (!s) return;
    // highlight current code line
    codeLines.forEach((ln, i) => ln.classList.toggle("cur", i === s.line));
    stepLbl.textContent = `STEP ${idx + 1} / ${STEPS.length} · line ${s.line + 1}`;

    // The cell values for a given step, indexed [step#, n, sum, i, out].
    const rowCells = (k: number): string[] => {
      const st = STEPS[k];
      return [String(k + 1), st.n, st.sum, st.i, st.out];
    };
    // build the trace table up to and including this step (table fills row by row)
    tbody.innerHTML = "";
    for (let k = 0; k <= idx; k++) {
      const tr = el("tr");
      const cells = rowCells(k);
      const prev = k > 0 ? rowCells(k - 1) : null;
      cells.forEach((val, ci) => {
        const td = el("td");
        td.textContent = val;
        // On the newest row, light up the cells that actually changed this step.
        // Only while auto-playing (animateRow) — manual scrubbing shows a calm
        // table so you can read it, no flashing.
        const isNewest = k === idx;
        const changed = ci > 0 && (prev === null || prev[ci] !== val);
        if (isNewest && changed && animateRow) td.classList.add("fresh");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    shownStep = idx;
  }

  scrub.addEventListener("input", () => {
    stopAuto();
    renderStep(parseInt(scrub.value, 10), false);
  });

  // --- auto-play (timer-driven, performance.now ONLY) ------------------------
  let autoActive = false;
  let lastStepAt = 0;
  const STEP_INTERVAL = 620; // ms per traced step
  const rig: Rig = {
    active: false,
    visible: false,
    cap30: false,
    tick(now) {
      if (!autoActive) {
        rig.active = false;
        return;
      }
      if (now - lastStepAt >= STEP_INTERVAL) {
        lastStepAt = now;
        const next = shownStep + 1;
        if (next >= STEPS.length) {
          autoActive = false;
          rig.active = false;
          return;
        }
        scrub.value = String(next);
        renderStep(next, true);
      }
    },
  };
  function startAuto() {
    if (reduce) {
      // jump straight to the fully-filled table, no scrubbing animation
      renderStep(STEPS.length - 1, false);
      scrub.value = String(STEPS.length - 1);
      return;
    }
    autoActive = true;
    lastStepAt = performance.now() - STEP_INTERVAL; // fire immediately
    rig.active = true;
    orch.kick();
  }
  function stopAuto() {
    autoActive = false;
    rig.active = false;
  }
  orch.add(rig);

  // visibility gating for the auto-play rig
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        rig.visible = e.isIntersecting;
        if (e.isIntersecting && rig.active) orch.kick();
      }
    },
    { threshold: 0.01 }
  );
  io.observe(panel);

  // --- expand / collapse -----------------------------------------------------
  let open = false;
  function setOpen(next: boolean) {
    open = next;
    trigger!.setAttribute("aria-expanded", String(open));
    if (open) {
      // measure then animate height (or jump if reduced)
      const target = inner.scrollHeight;
      if (reduce) {
        body.style.height = "auto";
        renderStep(STEPS.length - 1, false);
        scrub.value = String(STEPS.length - 1);
      } else {
        body.style.transition = "height .42s cubic-bezier(.2,.8,.2,1)";
        body.style.height = target + "px";
        const onEnd = () => {
          body.style.height = "auto";
          body.removeEventListener("transitionend", onEnd);
        };
        body.addEventListener("transitionend", onEnd);
        renderStep(0, false);
        startAuto();
      }
      if (trigger!.tagName === "BUTTON")
        trigger!.textContent = "2014 · FIRST CODE · runtime: none ▾";
    } else {
      stopAuto();
      const cur = body.scrollHeight;
      body.style.height = cur + "px";
      // force reflow then collapse
      void body.offsetHeight;
      body.style.height = "0px";
      if (trigger!.tagName === "BUTTON")
        trigger!.textContent = "2014 · FIRST CODE · runtime: none ▸";
    }
  }
  trigger.addEventListener("click", () => setOpen(!open));
  trigger.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter" || (e as KeyboardEvent).key === " ") {
      e.preventDefault();
      setOpen(!open);
    }
  });

  // reduced motion: render the resolved state immediately so it's never empty,
  // but keep it collapsed until the visitor opens it.
  renderStep(0, false);
}

/* ════════════════════════════════════════════════════════════════════════════
   PANEL 4 — THE TREMOR   [data-bench="tremor"]
   ──────────────────────────────────────────────────────────────────────────
   A "solder this joint" target trembles so the precise click keeps slipping.
   After a beat it RESOLVES into his line — "so I stopped trying to hold the iron,
   and held the team together instead" — and the trembling stroke redraws itself
   into the RoboSics org chart (founder → members). His joke. Warm, self-aware,
   never mockery. reduceMotion: show the resolved chart + line immediately, no
   tremor, no slipping.
   ════════════════════════════════════════════════════════════════════════════ */

function buildTremor(
  panel: HTMLElement,
  tk: Tokens,
  reduce: boolean,
  orch: Orchestrator
): (vis: boolean) => void {
  const W = 360;
  const H = 220;

  const wrap = el("div");
  wrap.style.display = "grid";
  wrap.style.gap = "12px";

  const prompt = el("div", "bt-label");
  prompt.textContent = reduce ? "RESOLVED" : "TASK · SOLDER THIS JOINT";
  prompt.setAttribute("aria-live", "polite");

  const stage = el("div", "bt-tremor-stage");
  stage.style.position = "relative";
  stage.style.width = "100%";
  stage.style.maxWidth = W + "px";
  stage.style.height = H + "px";
  stage.style.border = `1px solid ${tk.hairline}`;
  stage.style.borderRadius = "3px";
  stage.style.background = tk.ground;
  stage.style.overflow = "hidden";

  // the SVG that holds both the trembling stroke AND the org chart it becomes
  const scene = svg("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: "100%",
    height: "100%",
  });
  stage.appendChild(scene);

  // the trembling solder target (a DOM node so the slip feels physical/cursor-y)
  const target = el("div", "bt-solder");
  target.style.left = "0px";
  target.style.top = "0px";
  target.setAttribute("role", "button");
  target.setAttribute("aria-label", "Solder target");
  target.title = "hold still…";
  stage.appendChild(target);

  // the resolved line — his voice
  const line = el("p", "bt-aside");
  line.style.maxWidth = "62ch";
  line.style.minHeight = "1.4em";
  line.textContent = "";

  wrap.appendChild(prompt);
  wrap.appendChild(stage);
  wrap.appendChild(line);
  panel.appendChild(wrap);

  // --- the org chart geometry (founder → members) ----------------------------
  // computed in viewBox space; the trembling stroke morphs into these edges
  const cxc = W / 2;
  const founder = { x: cxc, y: 40, label: "FOUNDER" };
  const members = [
    { x: 60, y: 150, label: "MECH" },
    { x: 150, y: 165, label: "FIRMWARE" },
    { x: 240, y: 165, label: "VISION" },
    { x: 320, y: 150, label: "OUTREACH" },
  ];

  // build (but hide) the org chart so we can fade/redraw it in
  const orgGroup = svg("g");
  orgGroup.setAttribute("opacity", "0");
  scene.appendChild(orgGroup);
  const edges: SVGLineElement[] = [];
  for (const m of members) {
    const e = svg("line", {
      x1: founder.x,
      y1: founder.y + 10,
      x2: m.x,
      y2: m.y - 10,
      stroke: tk.amber,
      "stroke-width": 1,
    });
    edges.push(e);
    orgGroup.appendChild(e);
  }
  function node(x: number, y: number, label: string, isFounder: boolean) {
    const g = svg("g");
    const r = svg("rect", {
      x: x - 34,
      y: y - 12,
      width: 68,
      height: 24,
      rx: 2,
      fill: tk.panel,
      stroke: isFounder ? tk.amber : tk.hairline,
      "stroke-width": 1,
    });
    const t = svg("text", {
      x,
      y: y + 4,
      fill: isFounder ? tk.amber : tk.engrave,
      "font-size": 9,
      "font-family": MONO,
      "text-anchor": "middle",
      "letter-spacing": "1",
    });
    t.textContent = label;
    g.appendChild(r);
    g.appendChild(t);
    return g;
  }
  orgGroup.appendChild(node(founder.x, founder.y, founder.label, true));
  for (const m of members) orgGroup.appendChild(node(m.x, m.y, m.label, false));

  // the trembling stroke (single jittery path) shown during the "solder" beat
  const stroke = svg("path", {
    d: "",
    fill: "none",
    stroke: tk.amber,
    "stroke-width": 1.2,
    "stroke-linecap": "round",
  });
  scene.appendChild(stroke);

  // --- tremor mechanics ------------------------------------------------------
  // The target wanders with a hand-tremor jitter (sum of a few sines) so the
  // precise click keeps slipping. After N near-misses OR a short timeout it
  // resolves — the point is the warmth of giving up the precise grip, not failure.
  const RESOLVE_LINE =
    "so I stopped trying to hold the iron, and held the team together instead";
  let resolved = false;
  let attempts = 0;
  let beatStart = 0;
  const HOME = { x: W * 0.5 - 13, y: H * 0.5 - 13 }; // center-ish home in px space
  // tremor path points (in viewBox space) accumulated for the trembling stroke
  const tpts: { x: number; y: number }[] = [];

  function pxToView(px: number, py: number) {
    const r = stage.getBoundingClientRect();
    return { x: (px / r.width) * W, y: (py / r.height) * H };
  }

  function tremorOffset(now: number) {
    // sum-of-sines hand tremor ~6-10Hz, small amplitude, plus slow wander
    const t = now / 1000;
    const dx =
      Math.sin(t * 41) * 5 +
      Math.sin(t * 13.3 + 1.1) * 7 +
      Math.sin(t * 2.1) * 9;
    const dy =
      Math.cos(t * 37 + 0.4) * 5 +
      Math.cos(t * 11.7) * 6 +
      Math.cos(t * 1.7 + 2) * 8;
    return { dx, dy };
  }

  const rig: Rig = {
    active: false,
    visible: false,
    cap30: true,
    tick(now) {
      if (resolved) {
        rig.active = false;
        return;
      }
      const { dx, dy } = tremorOffset(now);
      const x = HOME.x + dx;
      const y = HOME.y + dy;
      target.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      // record the trembling path in viewBox space
      const v = pxToView(x + 13, y + 13);
      tpts.push(v);
      if (tpts.length > 90) tpts.shift();
      let d = "";
      for (let i = 0; i < tpts.length; i++) {
        d += (i === 0 ? "M" : "L") + tpts[i].x.toFixed(1) + " " + tpts[i].y.toFixed(1) + " ";
      }
      stroke.setAttribute("d", d);
      stroke.setAttribute("opacity", "0.85");
      // auto-resolve after ~5s of trying even without clicks (don't trap people)
      if (now - beatStart > 5200) resolve();
    },
  };

  function nearMiss() {
    if (resolved) return;
    attempts++;
    // a gentle wink: the target jumps a little further the more you chase it,
    // but never humiliatingly — three tries and it gives you the point.
    if (attempts >= 3) {
      resolve();
    } else {
      prompt.textContent = `TASK · SOLDER THIS JOINT  (slipped ×${attempts})`;
    }
  }

  // the trembling stroke REDRAWS into the org-chart edges
  function morphToOrg() {
    if (reduce) {
      stroke.setAttribute("opacity", "0");
      orgGroup.setAttribute("opacity", "1");
      return;
    }
    // animate: fade the tremble out while drawing each edge with a dash sweep
    stroke.style.transition = "opacity .5s linear";
    stroke.setAttribute("opacity", "0");
    orgGroup.setAttribute("opacity", "1");
    // draw the edges in with stroke-dash, the trembling line "settling" into order
    edges.forEach((e, i) => {
      const len = Math.hypot(e.x2.baseVal.value - e.x1.baseVal.value, e.y2.baseVal.value - e.y1.baseVal.value);
      e.style.strokeDasharray = String(len);
      e.style.strokeDashoffset = String(len);
      e.style.transition = `stroke-dashoffset .5s cubic-bezier(.2,.8,.2,1) ${0.1 + i * 0.08}s`;
      // force reflow per edge then release the offset
      void (e as unknown as HTMLElement).getBoundingClientRect();
      e.style.strokeDashoffset = "0";
    });
    // fade the chart nodes in
    orgGroup.querySelectorAll("g, rect, text").forEach((n) => {
      (n as SVGElement).style.transition = "opacity .5s linear .25s";
    });
  }

  function typeLine(text: string) {
    if (reduce) {
      line.textContent = text;
      return;
    }
    // odometer-ish reveal: characters land, never fade. Driven by performance.now.
    let i = 0;
    const startedAt = performance.now();
    const CPS = 38; // chars per second
    const step = () => {
      const elapsed = performance.now() - startedAt;
      const want = Math.floor((elapsed / 1000) * CPS);
      if (want > i) {
        i = Math.min(want, text.length);
        line.textContent = text.slice(0, i);
      }
      if (i < text.length) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function resolve() {
    if (resolved) return;
    resolved = true;
    rig.active = false;
    target.style.display = "none";
    prompt.textContent = "RESOLVED";
    morphToOrg();
    typeLine(RESOLVE_LINE);
  }

  // clicks/taps on the target are the "missed solder"; clicking the stage too.
  target.addEventListener("click", nearMiss);
  stage.addEventListener("pointerdown", (e) => {
    if (resolved) return;
    // if they click and it's not dead-on the wandering target, it's a near miss
    nearMiss();
    e.preventDefault();
  });

  // reduced motion: resolved immediately, no tremor at all
  if (reduce) {
    target.style.display = "none";
    stroke.setAttribute("opacity", "0");
    orgGroup.setAttribute("opacity", "1");
    line.textContent = RESOLVE_LINE;
    prompt.textContent = "RESOLVED";
  } else {
    // start in a calm pre-state; tremor begins once visible
    target.textContent = "+";
  }

  orch.add(rig);
  return (vis: boolean) => {
    rig.visible = vis;
    if (reduce || resolved) return;
    if (vis) {
      if (!beatStart) beatStart = performance.now();
      rig.active = true;
      orch.kick();
    } else {
      rig.active = false; // suspend the tremor offscreen
    }
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* util                                                                         */
/* ────────────────────────────────────────────────────────────────────────── */
function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
