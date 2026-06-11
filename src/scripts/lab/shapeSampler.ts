/**
 * Accurate shape sampler — turns real SVG silhouettes into particle clouds.
 *  - sampleFilled: rasterize filled SVG path(s) and scatter N points across the solid area
 *    (recognizable solids: Bangladesh landmass, an apple, a rocket body, a brain section…)
 *  - sampleStroke: walk an SVG path's length for thin line-forms (a coastline, a circuit trace, an EEG)
 * Returns a Float32Array of N*3, centered, aspect-correct, the larger dimension scaled to ±R,
 * with a little z-depth so the cloud reads as volumetric.
 */

export function sampleFilled(
  paths: string[],
  vbW: number,
  vbH: number,
  count: number,
  R = 3,
  depth = 0.5
): Float32Array {
  const s = 300 / Math.max(vbW, vbH);
  const cw = Math.max(1, Math.round(vbW * s));
  const ch = Math.max(1, Math.round(vbH * s));
  const cv = document.createElement("canvas");
  cv.width = cw; cv.height = ch;
  const ctx = cv.getContext("2d")!;
  ctx.scale(s, s);
  ctx.fillStyle = "#fff";
  for (const d of paths) ctx.fill(new Path2D(d));
  const data = ctx.getImageData(0, 0, cw, ch).data;

  // collect filled pixels
  const filled: number[] = [];
  for (let i = 0; i < cw * ch; i++) {
    if (data[i * 4 + 3] > 128) filled.push(i);
  }
  const out = new Float32Array(count * 3);
  const maxdim = Math.max(cw, ch);
  if (filled.length === 0) return out;
  for (let i = 0; i < count; i++) {
    const idx = filled[(Math.random() * filled.length) | 0];
    const px = idx % cw;
    const py = (idx / cw) | 0;
    out[i * 3] = ((px - cw / 2) / (maxdim / 2)) * R;
    out[i * 3 + 1] = ((ch / 2 - py) / (maxdim / 2)) * R;
    out[i * 3 + 2] = (Math.random() * 2 - 1) * depth;
  }
  return out;
}

// Sample points across any shape drawn by a canvas draw-function (centered, white fill on SxS).
export function sampleDrawn(
  draw: (ctx: CanvasRenderingContext2D, S: number) => void,
  count: number,
  R = 3,
  depth = 0.45,
  S = 300
): Float32Array {
  const cv = document.createElement("canvas");
  cv.width = S; cv.height = S;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  draw(ctx, S);
  const data = ctx.getImageData(0, 0, S, S).data;
  const filled: number[] = [];
  for (let i = 0; i < S * S; i++) if (data[i * 4 + 3] > 100) filled.push(i);
  const out = new Float32Array(count * 3);
  if (!filled.length) return out;
  for (let i = 0; i < count; i++) {
    const idx = filled[(Math.random() * filled.length) | 0];
    const px = idx % S, py = (idx / S) | 0;
    out[i * 3] = ((px - S / 2) / (S / 2)) * R;
    out[i * 3 + 1] = ((S / 2 - py) / (S / 2)) * R;
    out[i * 3 + 2] = (Math.random() * 2 - 1) * depth;
  }
  return out;
}

export function sampleStroke(
  d: string,
  vbW: number,
  vbH: number,
  count: number,
  R = 3,
  jitter = 0.06,
  depth = 0.3
): Float32Array {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
  document.body.appendChild(svg);
  const len = path.getTotalLength();
  const maxdim = Math.max(vbW, vbH);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const pt = path.getPointAtLength((i / count) * len);
    out[i * 3] = ((pt.x - vbW / 2) / (maxdim / 2)) * R + (Math.random() - 0.5) * jitter;
    out[i * 3 + 1] = ((vbH / 2 - pt.y) / (maxdim / 2)) * R + (Math.random() - 0.5) * jitter;
    out[i * 3 + 2] = (Math.random() * 2 - 1) * depth;
  }
  document.body.removeChild(svg);
  return out;
}

// Sample a real PHOTO into particles by its edge structure (his actual house, drawn in light).
export function sampleImageEdges(
  src: string,
  count: number,
  R = 2.3,
  crop: [number, number, number, number] = [0, 0, 1, 1],
  depth = 0.18,
  W = 240,
  thrFrac = 0.16,
  fillFrac = 0,
  fillMaxLum = 0.72
): Promise<Float32Array> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const iw = img.width, ih = img.height;
      const cx0 = crop[0] * iw, cy0 = crop[1] * ih, cw = (crop[2] - crop[0]) * iw, ch = (crop[3] - crop[1]) * ih;
      const sc = W / cw, w = Math.max(2, Math.round(cw * sc)), h = Math.max(2, Math.round(ch * sc));
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      const ctx = cv.getContext("2d")!;
      ctx.drawImage(img, cx0, cy0, cw, ch, 0, 0, w, h);
      const d = ctx.getImageData(0, 0, w, h).data;
      const gray = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) gray[i] = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) / 255;
      const mag = new Float32Array(w * h); let mx = 0;
      const g = (x: number, y: number) => gray[y * w + x];
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const gx = g(x + 1, y - 1) + 2 * g(x + 1, y) + g(x + 1, y + 1) - g(x - 1, y - 1) - 2 * g(x - 1, y) - g(x - 1, y + 1);
        const gy = g(x - 1, y + 1) + 2 * g(x, y + 1) + g(x + 1, y + 1) - g(x - 1, y - 1) - 2 * g(x, y - 1) - g(x + 1, y - 1);
        const m = Math.hypot(gx, gy); mag[y * w + x] = m; if (m > mx) mx = m;
      }
      const edge: number[] = []; const fill: number[] = []; const thr = mx * thrFrac;
      for (let i = 0; i < w * h; i++) {
        if (mag[i] > thr) edge.push(i);
        else if (fillFrac > 0 && gray[i] < fillMaxLum && gray[i] > 0.04) fill.push(i);
      }
      const out = new Float32Array(count * 3); const maxdim = Math.max(w, h);
      if (!edge.length && !fill.length) return resolve(out);
      const place = (i: number, idx: number) => {
        const px = idx % w, py = (idx / w) | 0;
        out[i * 3] = ((px - w / 2) / (maxdim / 2)) * R;
        out[i * 3 + 1] = ((h / 2 - py) / (maxdim / 2)) * R;
        out[i * 3 + 2] = (Math.random() * 2 - 1) * depth;
      };
      for (let i = 0; i < count; i++) {
        const useFill = fill.length && (!edge.length || Math.random() < fillFrac);
        const list = useFill ? fill : edge;
        place(i, list[(Math.random() * list.length) | 0]);
      }
      resolve(out);
    };
    img.onerror = () => resolve(new Float32Array(count * 3));
    img.src = src;
  });
}

// Procedural fallbacks (for the abstract cognitive states that have no real outline).
export function gauss() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.28318 * v);
}

export function sampleScatter(count: number, R = 3): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out[i * 3] = (Math.random() * 2 - 1) * R * 1.7;
    out[i * 3 + 1] = (Math.random() * 2 - 1) * R * 1.15;
    out[i * 3 + 2] = (Math.random() * 2 - 1) * R * 1.3;
  }
  return out;
}

export function sampleCluster(count: number, spread = 0.42): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out[i * 3] = gauss() * spread;
    out[i * 3 + 1] = gauss() * spread;
    out[i * 3 + 2] = gauss() * spread;
  }
  return out;
}
