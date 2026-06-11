/** 15 recognizable silhouettes, drawn with canvas primitives, sampled into particle targets. */
import { sampleDrawn } from "./shapeSampler";

type Ctx = CanvasRenderingContext2D;
const PI = Math.PI;
function circle(c: Ctx, x: number, y: number, r: number) { c.beginPath(); c.arc(x, y, r, 0, 2 * PI); c.fill(); }
function rrect(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fill();
}
function capsule(c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number) {
  c.lineCap = "round"; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
function poly(c: Ctx, pts: number[][]) { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.fill(); }
function star(c: Ctx, cx: number, cy: number, R: number, r: number, n: number) {
  c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * 2 * PI - PI / 2; const rad = i % 2 ? r : R; const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.fill();
}

const DRAW: Record<string, (c: Ctx, S: number) => void> = {
  rocket(c, S) {
    const cx = S / 2;
    poly(c, [[cx, S * 0.06], [cx + S * 0.1, S * 0.26], [cx - S * 0.1, S * 0.26]]); // nose
    rrect(c, cx - S * 0.1, S * 0.24, S * 0.2, S * 0.42, S * 0.04); // body
    poly(c, [[cx - S * 0.1, S * 0.52], [cx - S * 0.22, S * 0.7], [cx - S * 0.1, S * 0.66]]); // fin L
    poly(c, [[cx + S * 0.1, S * 0.52], [cx + S * 0.22, S * 0.7], [cx + S * 0.1, S * 0.66]]); // fin R
    poly(c, [[cx - S * 0.08, S * 0.66], [cx + S * 0.08, S * 0.66], [cx + S * 0.18, S * 0.95], [cx - S * 0.18, S * 0.95]]); // exhaust
  },
  profile(c, S) {
    // head facing right
    c.beginPath();
    c.moveTo(S * 0.28, S * 0.2);
    c.bezierCurveTo(S * 0.5, S * 0.1, S * 0.74, S * 0.16, S * 0.72, S * 0.36); // forehead
    c.bezierCurveTo(S * 0.71, S * 0.42, S * 0.82, S * 0.44, S * 0.78, S * 0.5); // nose bridge→tip
    c.bezierCurveTo(S * 0.76, S * 0.53, S * 0.7, S * 0.52, S * 0.7, S * 0.56); // nostril
    c.bezierCurveTo(S * 0.7, S * 0.6, S * 0.74, S * 0.62, S * 0.68, S * 0.66); // lips
    c.bezierCurveTo(S * 0.66, S * 0.72, S * 0.7, S * 0.78, S * 0.6, S * 0.82); // chin
    c.bezierCurveTo(S * 0.48, S * 0.86, S * 0.34, S * 0.82, S * 0.3, S * 0.7); // jaw
    c.bezierCurveTo(S * 0.24, S * 0.6, S * 0.22, S * 0.34, S * 0.28, S * 0.2); // back of head
    c.closePath(); c.fill();
  },
  bangladesh(c, S) {
    // stylized national outline (recognizable: wider south, narrowing north, jagged east)
    poly(c, [
      [S * 0.42, S * 0.12], [S * 0.5, S * 0.1], [S * 0.55, S * 0.2], [S * 0.62, S * 0.22],
      [S * 0.6, S * 0.34], [S * 0.7, S * 0.42], [S * 0.66, S * 0.52], [S * 0.72, S * 0.62],
      [S * 0.64, S * 0.7], [S * 0.66, S * 0.82], [S * 0.56, S * 0.86], [S * 0.5, S * 0.8],
      [S * 0.44, S * 0.86], [S * 0.36, S * 0.78], [S * 0.4, S * 0.66], [S * 0.32, S * 0.6],
      [S * 0.36, S * 0.48], [S * 0.3, S * 0.4], [S * 0.38, S * 0.32], [S * 0.34, S * 0.22],
    ]);
  },
  brain(c, S) {
    const cx = S / 2;
    // two hemispheres
    c.beginPath();
    c.moveTo(cx, S * 0.2);
    c.bezierCurveTo(S * 0.3, S * 0.12, S * 0.14, S * 0.34, S * 0.2, S * 0.5);
    c.bezierCurveTo(S * 0.22, S * 0.62, S * 0.34, S * 0.66, S * 0.4, S * 0.64);
    c.bezierCurveTo(S * 0.42, S * 0.72, S * 0.5, S * 0.74, cx, S * 0.7); // brainstem dip
    c.bezierCurveTo(S * 0.5, S * 0.74, S * 0.58, S * 0.72, S * 0.6, S * 0.64);
    c.bezierCurveTo(S * 0.66, S * 0.66, S * 0.78, S * 0.62, S * 0.8, S * 0.5);
    c.bezierCurveTo(S * 0.86, S * 0.34, S * 0.7, S * 0.12, cx, S * 0.2);
    c.closePath(); c.fill();
    // brainstem + cerebellum
    rrect(c, cx - S * 0.04, S * 0.66, S * 0.08, S * 0.12, S * 0.02);
    c.fillStyle = "#fff"; circle(c, cx, S * 0.8, S * 0.07);
  },
  apple(c, S) {
    const cx = S / 2, cy = S * 0.56;
    circle(c, cx - S * 0.13, cy, S * 0.2);
    circle(c, cx + S * 0.13, cy, S * 0.2);
    rrect(c, cx - S * 0.26, cy - S * 0.1, S * 0.52, S * 0.34, S * 0.16);
    poly(c, [[cx - S * 0.06, S * 0.3], [cx + S * 0.06, S * 0.3], [cx, S * 0.42]]); // top dimple notch (subtractive look via small)
    rrect(c, cx - S * 0.015, S * 0.24, S * 0.03, S * 0.12, S * 0.01); // stem
    c.save(); c.translate(cx + S * 0.06, S * 0.28); c.rotate(0.5); c.beginPath(); c.ellipse(0, 0, S * 0.08, S * 0.04, 0, 0, 2 * PI); c.fill(); c.restore(); // leaf
  },
  hand(c, S) { handBase(c, S, true); },
  openhand(c, S) { handBase(c, S, false); },
  robot(c, S) {
    const cx = S / 2;
    rrect(c, cx - S * 0.16, S * 0.28, S * 0.32, S * 0.34, S * 0.06); // body
    c.beginPath(); c.arc(cx, S * 0.28, S * 0.16, PI, 2 * PI); c.fill(); // dome head
    circle(c, cx, S * 0.24, S * 0.04); // sensor eye
    circle(c, cx - S * 0.1, S * 0.66, S * 0.07); circle(c, cx + S * 0.1, S * 0.66, S * 0.07); // wheels
    circle(c, cx, S * 0.46, S * 0.08); c.fillStyle = "#fff"; // dispenser drum
    capsule(c, cx + S * 0.16, S * 0.36, cx + S * 0.3, S * 0.3, S * 0.05); // arm
  },
  ventilator(c, S) {
    const cx = S / 2, cy = S * 0.5;
    c.beginPath(); c.ellipse(cx, cy, S * 0.14, S * 0.18, 0, 0, 2 * PI); c.fill(); // bag
    poly(c, [[cx - S * 0.2, S * 0.34], [cx - S * 0.13, S * 0.4], [cx - S * 0.13, S * 0.6], [cx - S * 0.2, S * 0.66]]); // paddle L
    poly(c, [[cx + S * 0.2, S * 0.34], [cx + S * 0.13, S * 0.4], [cx + S * 0.13, S * 0.6], [cx + S * 0.2, S * 0.66]]); // paddle R
    capsule(c, cx, S * 0.32, cx + S * 0.18, S * 0.2, S * 0.035); // tube
    rrect(c, cx - S * 0.08, S * 0.72, S * 0.16, S * 0.1, S * 0.02); // control box
  },
  sbc(c, S) {
    rrect(c, S * 0.14, S * 0.4, S * 0.4, S * 0.26, S * 0.02); // PCB
    for (let i = 0; i < 12; i++) rrect(c, S * 0.17 + i * S * 0.027, S * 0.41, S * 0.012, S * 0.04, 0); // GPIO header
    rrect(c, S * 0.28, S * 0.5, S * 0.1, S * 0.1, S * 0.01); // SoC
    rrect(c, S * 0.5, S * 0.46, S * 0.05, S * 0.05, 0); rrect(c, S * 0.5, S * 0.56, S * 0.05, S * 0.05, 0); // ports
    rrect(c, S * 0.6, S * 0.22, S * 0.26, S * 0.2, S * 0.01); // monitor
    rrect(c, S * 0.71, S * 0.42, S * 0.04, S * 0.06, 0); // stand
  },
  medalgold(c, S) {
    const cx = S / 2;
    poly(c, [[cx - S * 0.12, S * 0.16], [cx - S * 0.04, S * 0.16], [cx + S * 0.02, S * 0.42], [cx - S * 0.08, S * 0.42]]); // ribbon L
    poly(c, [[cx + S * 0.12, S * 0.16], [cx + S * 0.04, S * 0.16], [cx - S * 0.02, S * 0.42], [cx + S * 0.08, S * 0.42]]); // ribbon R
    circle(c, cx, S * 0.62, S * 0.18); // disc
    c.fillStyle = "#fff"; circle(c, cx, S * 0.62, S * 0.13); star(c, cx, S * 0.62, S * 0.08, S * 0.035, 5);
  },
  medalstar(c, S) {
    const cx = S / 2;
    poly(c, [[cx - S * 0.1, S * 0.14], [cx + S * 0.1, S * 0.14], [cx + S * 0.06, S * 0.34], [cx - S * 0.06, S * 0.34]]); // ribbon
    star(c, cx, S * 0.6, S * 0.24, S * 0.1, 8); // star order
    c.fillStyle = "#fff"; circle(c, cx, S * 0.6, S * 0.07);
  },
  guitar(c, S) {
    const cx = S / 2;
    circle(c, cx, S * 0.68, S * 0.2); // lower bout
    circle(c, cx, S * 0.5, S * 0.15); // upper bout
    rrect(c, cx - S * 0.03, S * 0.16, S * 0.06, S * 0.34, S * 0.02); // neck
    rrect(c, cx - S * 0.05, S * 0.1, S * 0.1, S * 0.08, S * 0.01); // headstock
    c.save(); // soundhole punch (draw bg-color hole by clearing)
    c.globalCompositeOperation = "destination-out"; circle(c, cx, S * 0.66, S * 0.05);
    c.restore();
  },
  dog(c, S) {
    const cx = S * 0.5;
    c.beginPath(); c.ellipse(cx, S * 0.55, S * 0.22, S * 0.12, 0, 0, 2 * PI); c.fill(); // body
    capsule(c, cx - S * 0.14, S * 0.62, cx - S * 0.16, S * 0.78, S * 0.05); // leg
    capsule(c, cx - S * 0.06, S * 0.64, cx - S * 0.07, S * 0.8, S * 0.05);
    capsule(c, cx + S * 0.08, S * 0.64, cx + S * 0.09, S * 0.8, S * 0.05);
    capsule(c, cx + S * 0.16, S * 0.62, cx + S * 0.18, S * 0.78, S * 0.05);
    circle(c, cx + S * 0.26, S * 0.42, S * 0.1); // head (up-turned)
    poly(c, [[cx + S * 0.3, S * 0.34], [cx + S * 0.38, S * 0.3], [cx + S * 0.34, S * 0.4]]); // ear/snout
    capsule(c, cx - S * 0.2, S * 0.5, cx - S * 0.3, S * 0.42, S * 0.03); // tail
  },
  chip(c, S) {
    const cx = S / 2, q = S * 0.16;
    rrect(c, cx - q, cx - q, q * 2, q * 2, S * 0.02); // die
    for (let i = 0; i < 5; i++) {
      const o = cx - q + S * 0.04 + i * S * 0.06;
      rrect(c, o, cx - q - S * 0.05, S * 0.02, S * 0.05, 0); // top legs
      rrect(c, o, cx + q, S * 0.02, S * 0.05, 0); // bottom legs
      rrect(c, cx - q - S * 0.05, o, S * 0.05, S * 0.02, 0); // left legs
      rrect(c, cx + q, o, S * 0.05, S * 0.02, 0); // right legs
    }
    c.fillStyle = "#fff"; circle(c, cx - q * 0.6, cx - q * 0.6, S * 0.015); // pin-1 dot
  },
  plane(c, S) {
    const cx = S / 2;
    rrect(c, cx - S * 0.05, S * 0.18, S * 0.1, S * 0.62, S * 0.05); // fuselage
    poly(c, [[cx, S * 0.1], [cx + S * 0.055, S * 0.22], [cx - S * 0.055, S * 0.22]]); // nose
    poly(c, [[cx, S * 0.36], [cx + S * 0.42, S * 0.56], [cx + S * 0.42, S * 0.62], [cx, S * 0.5], [cx - S * 0.42, S * 0.62], [cx - S * 0.42, S * 0.56]]); // main wings
    poly(c, [[cx, S * 0.7], [cx + S * 0.2, S * 0.8], [cx + S * 0.2, S * 0.83], [cx, S * 0.78], [cx - S * 0.2, S * 0.83], [cx - S * 0.2, S * 0.8]]); // tailplane
  },
  twobrain(c, S) {
    brainAt(c, S * 0.3, S * 0.5, S * 0.18);
    brainAt(c, S * 0.7, S * 0.5, S * 0.18);
  },
};

function brainAt(c: Ctx, cx: number, cy: number, r: number) {
  circle(c, cx - r * 0.42, cy - r * 0.12, r * 0.56);
  circle(c, cx + r * 0.42, cy - r * 0.12, r * 0.56);
  circle(c, cx, cy - r * 0.28, r * 0.5);
  rrect(c, cx - r * 0.72, cy - r * 0.12, r * 1.44, r * 0.72, r * 0.3);
  rrect(c, cx - r * 0.12, cy + r * 0.5, r * 0.24, r * 0.36, r * 0.06);
  circle(c, cx, cy + r * 0.82, r * 0.26);
}

function handBase(c: Ctx, S: number, sensored: boolean) {
  const cx = S * 0.5, palmY = S * 0.66;
  rrect(c, cx - S * 0.13, palmY - S * 0.1, S * 0.26, S * 0.2, S * 0.06); // palm
  const fx = [-0.09, -0.03, 0.03, 0.09];
  const fl = [0.26, 0.32, 0.3, 0.24];
  fx.forEach((x, i) => capsule(c, cx + x * S, palmY - S * 0.08, cx + x * S, palmY - fl[i] * S, S * 0.05)); // fingers
  capsule(c, cx - S * 0.12, palmY, cx - S * 0.24, palmY - S * 0.1, S * 0.055); // thumb
  if (sensored) {
    c.fillStyle = "#fff";
    fx.forEach((x, i) => { circle(c, cx + x * S, palmY - S * 0.14, S * 0.022); circle(c, cx + x * S, palmY - fl[i] * S * 0.8, S * 0.022); });
    rrect(c, cx - S * 0.06, palmY + S * 0.1, S * 0.12, S * 0.05, S * 0.01); // wrist module
  }
}

export type ShapeKey = keyof typeof DRAW;

export function buildTargets(N: number, R: number, keys: string[]): Record<string, Float32Array> {
  const out: Record<string, Float32Array> = {};
  for (const k of keys) {
    const fn = DRAW[k];
    out[k] = fn ? sampleDrawn(fn, N, R, 0.26) : sampleDrawn(DRAW.brain, N, R, 0.26);
  }
  return out;
}
