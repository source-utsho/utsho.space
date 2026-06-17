// gauge.ts — SVG analog needle-gauge factory driven by a real second-order
// damped-spring solver. The easing is not a cubic-bezier guess: the needle
// obeys the same ODE a physical galvanometer movement does, so the swing,
// the ~8% overshoot, and the settle are emergent — not keyframed.
//
//   import { makeGauge } from "../scripts/gauge";
//   const g = makeGauge(svgEl, { value: 0, min: 0, max: 100, unit: "%", label: "LOAD", decimals: 0, reduceMotion: false });
//   g.set(72);     // needle springs to 72, odometer slews with it
//   g.destroy();   // detaches the rAF loop + clears the <svg>
//
// Zero dependencies. Self-suspends (no perpetual rAF) and pauses offscreen.
//
// ── THE PHYSICS ──────────────────────────────────────────────────────────────
// A damped harmonic oscillator. Let x be the needle's angle, x* the target.
// The error e = x − x* obeys:
//
//        e'' + 2·ζ·ω·e' + ω²·e = 0
//
//   ω  (omega)  — undamped natural frequency (rad/s). Bigger ω ⇒ stiffer
//                 spring ⇒ faster response. We derive ω from a target settle
//                 time so the gauge always settles < ~600ms.
//   ζ  (zeta)   — damping ratio (dimensionless).
//                   ζ = 1  → critically damped: fastest approach, NO overshoot.
//                   ζ < 1  → under-damped: it overshoots and rings.
//                   ζ > 1  → over-damped: sluggish, no overshoot.
//                 A real bench meter is deliberately under-damped to ~ζ=0.65
//                 so the needle visibly "snaps and settles" — that little
//                 overshoot reads as a precision instrument, not a CSS tween.
//
//   Peak overshoot of a 2nd-order step response is a closed form of ζ alone:
//                   overshoot = exp( −π·ζ / sqrt(1 − ζ²) )
//   ζ = 0.65 ⇒ ≈ 0.073  → about 7–8% past target, ~2 visible oscillations.
//
// We integrate with a FIXED-TIMESTEP accumulator (semi-implicit Euler) instead
// of stepping by the raw frame delta. Variable dt makes a spring explode on a
// dropped frame; a fixed sub-step (here 1/240s) makes the motion bit-for-bit
// identical at 30, 60, or 144 Hz. That frame-rate independence is the whole
// reason to bother with real physics.
// ─────────────────────────────────────────────────────────────────────────────

export interface GaugeOpts {
  value: number;
  min: number;
  max: number;
  unit?: string;
  label?: string;
  decimals?: number;
  reduceMotion: boolean;
  /** damping ratio; 0.65 ≈ 8% overshoot (default), 1 = no overshoot */
  zeta?: number;
  /** target settle time in seconds (drives ω); keep ≤ 0.6 */
  settle?: number;
}

export interface GaugeHandle {
  set(v: number): void;
  destroy(): void;
}

const SVGNS = "http://www.w3.org/2000/svg";
// Semicircular sweep: 180° fan, opening upward (−90° on the left → +90° right).
const A0 = -90; // degrees: needle angle at min
const A1 = 90; //  degrees: needle angle at max
const DEG = Math.PI / 180;

const el = (name: string, attrs: Record<string, string | number>) => {
  const n = document.createElementNS(SVGNS, name);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  return n;
};
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
// point on the gauge face at radius r and gauge-angle a (degrees, A0..A1)
const polar = (cx: number, cy: number, r: number, aDeg: number): [number, number] => {
  const a = aDeg * DEG;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};

export function makeGauge(svg: SVGSVGElement, opts: GaugeOpts): GaugeHandle {
  const { min, max, unit = "", label = "", decimals = 0, reduceMotion } = opts;
  const zeta = opts.zeta ?? 0.65; // ~8% overshoot — the signature curve
  const settleT = opts.settle ?? 0.5; // seconds to settle inside the 2% band

  // ── geometry ──────────────────────────────────────────────────────────────
  // A fixed 200×120 viewBox; the host <svg> scales it responsively.
  const W = 200, H = 122, cx = W / 2, cy = 96, rArc = 78, rTick = 78;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${label || "gauge"} ${opts.value}${unit}`);
  while (svg.firstChild) svg.removeChild(svg.firstChild); // idempotent re-mount

  // sweep arc — drawn in --hairline, the dim track the needle rides over
  const [ax0, ay0] = polar(cx, cy, rArc, A0);
  const [ax1, ay1] = polar(cx, cy, rArc, A1);
  svg.appendChild(el("path", {
    d: `M ${ax0.toFixed(2)} ${ay0.toFixed(2)} A ${rArc} ${rArc} 0 0 1 ${ax1.toFixed(2)} ${ay1.toFixed(2)}`,
    fill: "none", stroke: "var(--hairline, #2A2D31)", "stroke-width": 1.5, "stroke-linecap": "round",
  }));

  // ticks — 50 minor, every 5th a major. Majors are longer + engrave-white.
  const MINOR = 50;
  for (let i = 0; i <= MINOR; i++) {
    const t = i / MINOR;
    const a = A0 + (A1 - A0) * t;
    const major = i % 5 === 0;
    const [x1, y1] = polar(cx, cy, rTick, a);
    const [x2, y2] = polar(cx, cy, rTick - (major ? 9 : 5), a);
    svg.appendChild(el("line", {
      x1: x1.toFixed(2), y1: y1.toFixed(2), x2: x2.toFixed(2), y2: y2.toFixed(2),
      stroke: major ? "var(--engrave, #E8E6E1)" : "var(--dim, #8A8F98)",
      "stroke-width": major ? 1.25 : 0.75, "stroke-linecap": "round",
      opacity: major ? 0.85 : 0.5,
    }));
  }

  // amber phosphor needle: a 1px double-stroke (under-glow + hot core) is the
  // ONLY glowing element here — live data is allowed to glow, nothing else.
  const needleGlow = el("line", {
    x1: cx, y1: cy, x2: cx, y2: cy - rArc + 10,
    stroke: "var(--amber, #FFB454)", "stroke-width": 2.5, "stroke-linecap": "round",
    opacity: 0.35, filter: "blur(0.4px)",
  });
  const needle = el("line", {
    x1: cx, y1: cy, x2: cx, y2: cy - rArc + 10,
    stroke: "var(--amber, #FFB454)", "stroke-width": 1, "stroke-linecap": "round",
  });
  const hub = el("circle", { cx, cy, r: 4, fill: "var(--panel, #141518)", stroke: "var(--amber, #FFB454)", "stroke-width": 1 });
  svg.appendChild(needleGlow);
  svg.appendChild(needle);
  svg.appendChild(hub);

  // odometer readout — Plex Mono, engraved via the inset text-shadow the host
  // sets on .gauge-readout. Tabular figures so digits don't jitter while slewing.
  const readout = el("text", {
    x: cx, y: 116, "text-anchor": "middle",
    class: "gauge-readout",
    fill: "var(--engrave, #E8E6E1)",
    "font-family": "'IBM Plex Mono', monospace",
    "font-size": 13, "letter-spacing": "0.08em",
    style: "font-variant-numeric: tabular-nums;",
  }) as SVGTextElement;
  svg.appendChild(readout);
  if (label) {
    svg.appendChild(el("text", {
      x: cx, y: 18, "text-anchor": "middle", fill: "var(--dim, #8A8F98)",
      "font-family": "'IBM Plex Mono', monospace", "font-size": 9,
      "letter-spacing": "0.08em", style: "text-transform:uppercase;",
    })).textContent = label;
  }

  // ── spring state ────────────────────────────────────────────────────────────
  // value → normalized 0..1 → needle angle. We spring on the *value* itself
  // (vel is value/sec) and map to angle each frame; the readout reads `pos`,
  // so needle and number always agree — the odometer can't drift from the dial.
  const norm = (v: number) => clamp((v - min) / (max - min || 1), 0, 1);
  const angleOf = (v: number) => A0 + (A1 - A0) * norm(v);

  let pos = opts.value; // current displayed value
  let vel = 0; //          value velocity
  let target = opts.value;

  // ω from desired settle time: the 2% settle of a 2nd-order system is
  // t_s ≈ 4 / (ζ·ω)  ⇒  ω = 4 / (ζ · t_s).
  const omega = 4 / (zeta * settleT);
  const FIXED = 1 / 240; // fixed integrator sub-step (s) — frame-rate independence
  const k = omega * omega; // spring constant  (ω²)
  const c = 2 * zeta * omega; // damping coefficient (2ζω)

  function paint() {
    const a = angleOf(pos);
    const [nx, ny] = polar(cx, cy, rArc - 12, a);
    needle.setAttribute("x2", nx.toFixed(2));
    needle.setAttribute("y2", ny.toFixed(2));
    needleGlow.setAttribute("x2", nx.toFixed(2));
    needleGlow.setAttribute("y2", ny.toFixed(2));
    readout.textContent = pos.toFixed(decimals) + unit;
  }
  paint();

  // ── the loop: only alive while moving AND on-screen ─────────────────────────
  let raf = 0;
  let visible = true;
  let acc = 0; // leftover time for the fixed-step accumulator
  let last = 0;

  function step(now: number) {
    raf = 0;
    if (!last) last = now;
    // clamp dt so a backgrounded tab (huge gap) can't fast-forward the spring
    let frame = Math.min((now - last) / 1000, 0.05);
    last = now;
    acc += frame;
    // drain the accumulator in fixed sub-steps — deterministic at any FPS
    while (acc >= FIXED) {
      const e = pos - target; // displacement from target
      const accel = -k * e - c * vel; // ODE: a = −ω²·e − 2ζω·v
      vel += accel * FIXED; // semi-implicit Euler: integrate v first…
      pos += vel * FIXED; //                       …then x with the NEW v
      acc -= FIXED;
    }
    paint();
    // settled? stop the loop. Re-armed by set(). No perpetual rAF.
    const span = Math.abs(max - min) || 1;
    const atRest = Math.abs(pos - target) < span * 1e-4 && Math.abs(vel) < span * 1e-3;
    if (atRest) {
      pos = target; vel = 0; acc = 0; paint();
      return; // loop dies here
    }
    if (visible) raf = requestAnimationFrame(step);
    // if offscreen, we simply stop scheduling; the observer re-arms on re-entry
  }
  function arm() {
    if (raf || reduceMotion || !visible) return;
    last = 0; acc = 0;
    raf = requestAnimationFrame(step);
  }

  // Suspend while scrolled out of view, resume (and finish settling) on return.
  let io: IntersectionObserver | null = null;
  if (!reduceMotion && typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && Math.abs(pos - target) > 1e-6) arm();
    }, { threshold: 0 });
    io.observe(svg);
  }

  function set(v: number) {
    target = v;
    svg.setAttribute("aria-label", `${label || "gauge"} ${v}${unit}`);
    if (reduceMotion) {
      // reduced motion: jump-cut to final, one tick, no spring, no power-on flicker
      pos = target; vel = 0;
      paint();
      return;
    }
    arm(); // retarget; the running (or freshly armed) spring chases it
  }

  function destroy() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  return { set, destroy };
}