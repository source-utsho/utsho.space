// ============================================================================
// brain.ts — the lab SPECIMEN
// ----------------------------------------------------------------------------
// Refactored out of the old morphing hero (index.astro). What changed:
//   • The morph system is GONE. No lattice, no chip, no uMix tween, no
//     MIND/NETWORK/SILICON cycling. There is one object: a human brain,
//     held still on a slow turntable under a cold examination key-light.
//   • Re-tinted from the cyan/indigo palette to AMBER-ON-GRAPHITE. The
//     specimen reads as graphite; sulci (aDepth) stay legible through
//     VALUE/brightness, never hue separation. The only glow is --amber
//     phosphor, and only where the fMRI scan-plane crosses the cloud.
//   • Added an fMRI SCAN-PLANE (uScanX): driven by hero scroll via
//     setScanT(t). Particles in front of the plane dim; a thin cross-section
//     slice ignites amber.
//   • Added 6 fixed anatomical CALIPER ANCHORS, projected to screen each
//     frame and published as CSS --cx/--cy custom props on caliperLayer
//     children. We do NOT draw leader lines — the page does that.
//
// The buildBrain() generator below is REUSED VERBATIM from the old hero
// (the seeded mulberry32 PRNG, value-noise sulci, ellipsoid-SDF lobes,
// cerebellum folia, brainstem, interior hint, and the per-point aDepth).
// Only the surrounding scene/material/loop are new.
//
// Public surface (called by index.astro exactly as documented):
//   initBrain({ canvas, caliperLayer, reduceMotion, getScrollT })
//     -> { setScanT(t), sleep(), wake(), dispose() }
// ============================================================================

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export interface InitBrainOpts {
  /** The single <canvas> we own. One WebGL context lives here. */
  canvas: HTMLCanvasElement;
  /**
   * A layer holding 6 children with [data-caliper="..."] keys (see ANCHORS).
   * Each frame we write --cx / --cy (px, viewport-relative to the canvas) so
   * the page can draw hairline leader lines to engraved labels.
   */
  caliperLayer: HTMLElement;
  /** prefers-reduced-motion: render ONE posed frame, no turntable, no loop. */
  reduceMotion: boolean;
  /** Hero scroll progress 0..1 — drives the scan plane each frame. */
  getScrollT: () => number;
}

export interface BrainHandle {
  /** Position the fMRI plane along the specimen's depth, 0 (back) .. 1 (front). */
  setScanT(t: number): void;
  /** Pause the rAF loop entirely (hero offscreen). */
  sleep(): void;
  /** Resume the loop (hero back in view). */
  wake(): void;
  /** Tear down: free GPU buffers, drop the context, remove listeners. */
  dispose(): void;
}

// ----------------------------------------------------------------------------
// Anatomical caliper anchors — fixed points in brain object-space.
// Coordinate frame (matches buildBrain): +X anterior (front), +Y superior
// (top), +Z right hemisphere. The lateral view reads left=posterior on screen
// because we frame the specimen so anterior faces the camera's right; these
// are hand-placed on the cortical surface of the right hemisphere so leader
// lines stay clear of the midline.
// ----------------------------------------------------------------------------
const ANCHORS: { key: string; pos: [number, number, number] }[] = [
  // prefrontal / executive — front pole, superior            (DUALMIND)
  { key: "prefrontal", pos: [12.8, 4.6, 4.4] },
  // motor cortex — central, top of the hemisphere            (THE GLOVE)
  { key: "motor", pos: [2.0, 9.6, 4.6] },
  // Broca's area — inferior frontal, left-language but posed right (360 QUESTIONS)
  { key: "broca", pos: [9.2, -1.0, 6.4] },
  // hippocampus — medial temporal, deep & inferior           (memory / ROBOSICS sensing)
  { key: "hippocampus", pos: [3.0, -3.4, 5.2] },
  // occipital — posterior pole                               (vision)
  { key: "occipital", pos: [-13.8, 1.4, 3.0] },
  // cerebellum — postero-inferior                            (coordination)
  { key: "cerebellum", pos: [-12.4, -6.4, 4.0] },
];

export function initBrain(opts: InitBrainOpts): BrainHandle {
  const { canvas, caliperLayer, reduceMotion, getScrollT } = opts;

  // ----- point budget: mobile/tiny canvas gets a lighter cloud -------------
  const small = innerWidth < 760 || canvas.clientWidth < 520;
  const N = reduceMotion ? 30000 : small ? 30000 : 120000;

  // ==========================================================================
  // buildBrain() — REUSED VERBATIM from the old hero. Procedural human brain,
  // anatomical point cloud (lateral view readable). Returns a Float32Array of
  // positions with an attached `.aDepth` (0 gyral crest .. 1 sulcus/fissure).
  // The only edit is `N` now comes from the closure above instead of a module
  // constant — the algorithm itself is untouched.
  // ==========================================================================
  function buildBrain(): Float32Array {
    const out = new Float32Array(N * 3);
    const depth = new Float32Array(N); // aDepth per point

    // seeded PRNG (mulberry32) — deterministic brain every load
    let _s = (0x9e3779b9 ^ 1337) >>> 0;
    function rng(): number {
      _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
      let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    // integer-hash trilinear value noise (allocation-free)
    function h3(i: number, j: number, k: number): number {
      let n = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1274126177)) | 0;
      n = (n ^ (n >>> 13)) | 0; n = Math.imul(n, 1274126177); n = (n ^ (n >>> 16)) >>> 0;
      return n / 4294967296;
    }
    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    function vn(x: number, y: number, z: number): number {
      const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
      const u = fade(x - X), v = fade(y - Y), w = fade(z - Z);
      const c000 = h3(X, Y, Z), c100 = h3(X + 1, Y, Z);
      const c010 = h3(X, Y + 1, Z), c110 = h3(X + 1, Y + 1, Z);
      const c001 = h3(X, Y, Z + 1), c101 = h3(X + 1, Y, Z + 1);
      const c011 = h3(X, Y + 1, Z + 1), c111 = h3(X + 1, Y + 1, Z + 1);
      const x00 = c000 + (c100 - c000) * u, x10 = c010 + (c110 - c010) * u;
      const x01 = c001 + (c101 - c001) * u, x11 = c011 + (c111 - c011) * u;
      const y0 = x00 + (x10 - x00) * v, y1 = x01 + (x11 - x01) * v;
      return y0 + (y1 - y0) * w;
    }
    // iq approximate ellipsoid SDF + cubic smooth-min union
    function sdEllip(px: number, py: number, pz: number, cx: number, cy: number, cz: number, rx: number, ry: number, rz: number): number {
      const x = px - cx, y = py - cy, z = pz - cz;
      const ex = x / rx, ey = y / ry, ez = z / rz;
      const k0 = Math.sqrt(ex * ex + ey * ey + ez * ez);
      if (k0 < 1e-6) return -Math.min(rx, ry, rz);
      const fx = ex / rx, fy = ey / ry, fz = ez / rz;
      const k1 = Math.sqrt(fx * fx + fy * fy + fz * fz);
      return (k0 * (k0 - 1.0)) / k1;
    }
    const smin = (a: number, b: number, k: number) => {
      const h = Math.max(k - Math.abs(a - b), 0) / k;
      return Math.min(a, b) - h * h * h * k * (1 / 6);
    };

    // analytic lobes: 0,1 R/L hemispheres · 2 occipital pole · 3,4 R/L temporal
    const CPX = [0.0, 0.0, -11.7, 4.6, 4.6];
    const CPY = [1.0, 1.0, 1.2, -4.9, -4.9];
    const CPZ = [5.4, -5.4, 0.0, 8.9, -8.9]; // hemi Z offset = longitudinal fissure
    const CRX = [14.5, 14.5, 4.4, 7.2, 7.2];
    const CRY = [8.4, 8.4, 4.7, 3.7, 3.7];
    const CRZ = [7.2, 7.2, 7.2, 4.3, 4.3];
    const NCP = 5, CK = 1.6;
    let _min1 = 0, _min2 = 0, _imin = 0;
    function cerebrumField(px: number, py: number, pz: number): number {
      _min1 = 1e9; _min2 = 1e9; _imin = 0;
      let f = 1e9;
      for (let i = 0; i < NCP; i++) {
        const d = sdEllip(px, py, pz, CPX[i], CPY[i], CPZ[i], CRX[i], CRY[i], CRZ[i]);
        if (d < _min1) { _min2 = _min1; _min1 = d; _imin = i; }
        else if (d < _min2) { _min2 = d; }
        f = f >= 1e8 ? d : smin(f, d, CK);
      }
      return f;
    }
    // cerebellum (postero-inferior) + brainstem capsule
    const CBX = -10.8, CBY = -6.2, CBZ = 0.0, CBRX = 5.0, CBRY = 3.9, CBRZ = 7.4;
    const BSA = [-6.2, -5.2, 0.4], BSB = [-3.4, -11.8, 0.0], BSR0 = 1.95, BSR1 = 1.05;

    // ridged + domain-warped noise → serpentine gyri (~28-30 ridges/hemisphere)
    function cortexFold(px: number, py: number, pz: number): number {
      const wx = vn(px * 0.45 + 11.3, py * 0.45 + 5.7, pz * 0.45 + 2.1) - 0.5;
      const wy = vn(px * 0.45 + 3.2, py * 0.45 + 9.1, pz * 0.45 + 7.4) - 0.5;
      const wz = vn(px * 0.45 + 6.8, py * 0.45 + 1.5, pz * 0.45 + 4.9) - 0.5;
      const X = px + wx, Y = py + wy, Z = pz + wz;
      const r1 = 1.0 - Math.abs(2.0 * vn(X, Y, Z) - 1.0);
      const r2 = 1.0 - Math.abs(2.0 * vn(X * 2.1 + 20, Y * 2.1, Z * 2.1) - 1.0);
      return r1 * 0.72 + r2 * 0.28; // 1 crest .. 0 floor
    }

    let idx = 0;
    const TAU = Math.PI * 2;
    let _dx = 0, _dy = 0, _dz = 0;
    function randDir(): void {
      const u = rng() * 2 - 1, phi = rng() * TAU, s = Math.sqrt(Math.max(0, 1 - u * u));
      _dx = s * Math.cos(phi); _dy = u; _dz = s * Math.sin(phi);
    }

    // cerebrum shell: surface-sample lobes, reject buried points — this
    // auto-carves the longitudinal fissure; seams become darkened walls
    function buildCerebrum(count: number): void {
      const w: number[] = []; let acc = 0;
      for (let i = 0; i < NCP; i++) { acc += CRX[i] * CRY[i] + CRY[i] * CRZ[i] + CRX[i] * CRZ[i]; w.push(acc); }
      const total = acc;
      let written = 0, attempts = 0; const maxA = count * 8;
      while (written < count && attempts < maxA) {
        attempts++;
        const t = rng() * total; let li = 0; while (li < NCP - 1 && t > w[li]) li++;
        randDir();
        let px = CPX[li] + _dx * CRX[li], py = CPY[li] + _dy * CRY[li], pz = CPZ[li] + _dz * CRZ[li];
        const f = cerebrumField(px, py, pz);
        if (f < -0.45) continue; // buried inside another lobe
        let nx = (px - CPX[_imin]) / (CRX[_imin] * CRX[_imin]);
        let ny = (py - CPY[_imin]) / (CRY[_imin] * CRY[_imin]);
        let nz = (pz - CPZ[_imin]) / (CRZ[_imin] * CRZ[_imin]);
        const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= nl; ny /= nl; nz /= nl;
        px -= nx * f * 0.8; py -= ny * f * 0.8; pz -= nz * f * 0.8;
        const seam = Math.max(0, 1 - (_min2 - _min1) / 1.5) * Math.max(0, 1 - Math.abs(_min1) / 1.3);
        const fold = cortexFold(px, py, pz);
        let disp = (fold - 0.5) * 1.9;
        let aD = 1.0 - fold;
        disp -= seam * 1.15; // deepen fissures
        aD = Math.max(aD, seam * 0.97);
        px += nx * disp; py += ny * disp; pz += nz * disp;
        if (py < -6.2) py = -6.2 + (py + 6.2) * 0.45; // flatten inferior surface
        out[idx * 3] = px; out[idx * 3 + 1] = py; out[idx * 3 + 2] = pz;
        depth[idx] = aD < 0 ? 0 : aD > 1 ? 1 : aD;
        idx++; written++;
      }
    }
    // cerebellum: fine parallel horizontal folia + vermis midline groove
    function buildCerebellum(count: number): void {
      let written = 0, attempts = 0; const maxA = count * 8;
      while (written < count && attempts < maxA) {
        attempts++;
        randDir();
        let px = CBX + _dx * CBRX, py = CBY + _dy * CBRY, pz = CBZ + _dz * CBRZ;
        if (cerebrumField(px, py, pz) < -0.25) continue;
        let nx = (px - CBX) / (CBRX * CBRX), ny = (py - CBY) / (CBRY * CBRY), nz = (pz - CBZ) / (CBRZ * CBRZ);
        const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= nl; ny /= nl; nz /= nl;
        let phase = (py - CBY) * 5.5 + (px - CBX) * 1.2;
        phase += (vn(px * 0.6 + 50, py * 0.6, pz * 0.6) - 0.5) * 0.6;
        const r = 1.0 - Math.abs(Math.sin(phase));
        px += nx * (r - 0.5) * 0.55; py += ny * (r - 0.5) * 0.55; pz += nz * (r - 0.5) * 0.55;
        let aD = 0.45 + (1.0 - r) * 0.5;
        if (Math.abs(pz) < 0.9) aD = Math.max(aD, 0.8);
        out[idx * 3] = px; out[idx * 3 + 1] = py; out[idx * 3 + 2] = pz;
        depth[idx] = aD > 1 ? 1 : aD;
        idx++; written++;
      }
    }
    // brainstem: tapering capsule with pons bulge
    function buildBrainstem(count: number): void {
      const ax = BSB[0] - BSA[0], ay = BSB[1] - BSA[1], az = BSB[2] - BSA[2];
      const alen = Math.sqrt(ax * ax + ay * ay + az * az), ux = ax / alen, uy = ay / alen, uz = az / alen;
      let e1x = -uy, e1y = ux, e1z = 0; const e1l = Math.sqrt(e1x * e1x + e1y * e1y) || 1; e1x /= e1l; e1y /= e1l;
      const e2x = uy * e1z - uz * e1y, e2y = uz * e1x - ux * e1z, e2z = ux * e1y - uy * e1x;
      let written = 0, attempts = 0; const maxA = count * 8;
      while (written < count && attempts < maxA) {
        attempts++;
        const t = rng();
        let rad = BSR0 + (BSR1 - BSR0) * t;
        rad *= 1.0 + 0.45 * Math.exp(-((t - 0.3) / 0.18) * ((t - 0.3) / 0.18));
        const a = rng() * TAU, ca = Math.cos(a), sa = Math.sin(a);
        const bx = BSA[0] + ax * t, by = BSA[1] + ay * t, bz = BSA[2] + az * t;
        const nx = e1x * ca + e2x * sa, ny = e1y * ca + e2y * sa, nz = e1z * ca + e2z * sa;
        let px = bx + nx * rad, py = by + ny * rad, pz = bz + nz * rad;
        if (cerebrumField(px, py, pz) < -0.2) continue;
        const wob = (vn(px * 0.7, py * 0.7, pz * 0.7) - 0.5) * 0.25;
        px += nx * wob; py += ny * wob; pz += nz * wob;
        out[idx * 3] = px; out[idx * 3 + 1] = py; out[idx * 3 + 2] = pz;
        depth[idx] = 0.4;
        idx++; written++;
      }
    }
    // interior volume hint (~8%)
    function buildInterior(count: number): void {
      let written = 0, attempts = 0; const maxA = count * 8;
      while (written < count && attempts < maxA) {
        attempts++;
        const li = (rng() * NCP) | 0; randDir();
        const frac = Math.cbrt(rng()) * 0.84;
        out[idx * 3] = CPX[li] + _dx * CRX[li] * frac;
        out[idx * 3 + 1] = CPY[li] + _dy * CRY[li] * frac;
        out[idx * 3 + 2] = CPZ[li] + _dz * CRZ[li] * frac;
        depth[idx] = 0.72 + rng() * 0.28;
        idx++; written++;
      }
    }

    const nInterior = Math.round(N * 0.08);
    const nBrainstem = Math.round(N * 0.03);
    const nCerebellum = Math.round(N * 0.125);
    const nCerebrum = N - nInterior - nBrainstem - nCerebellum;
    buildCerebrum(nCerebrum);
    buildCerebellum(nCerebellum);
    buildBrainstem(nBrainstem);
    buildInterior(nInterior);
    while (idx < N) buildCerebrum(N - idx);

    (out as any).aDepth = depth;
    return out;
  }
  // ===================== end reused generator ===============================

  const positions = buildBrain();
  const aDepth = (positions as any).aDepth as Float32Array;
  const aRand = new Float32Array(N);
  for (let i = 0; i < N; i++) aRand[i] = Math.random();

  // ----- renderer / scene / camera (one WebGL context) ---------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0d0f); // --ground (warm off-black)

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.set(0, 0, 66);
  camera.lookAt(0, 0, 0);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));
  geo.setAttribute("aDepth", new THREE.BufferAttribute(aDepth, 1));

  // ----- design tokens as THREE colors -------------------------------------
  // The specimen is GRAPHITE; the only glow is --amber phosphor at the slice.
  const cGraphite = new THREE.Color(0x3a3d42); // cool mid-graphite (body)
  const cGraphiteHi = new THREE.Color(0x9aa0a8); // lit graphite crest (value, not hue)
  const cAmber = new THREE.Color(0xffb454); // --amber phosphor (scan slice only)

  const uniforms = {
    uTime: { value: 0 },
    uSize: { value: 0.92 },
    uIntro: { value: reduceMotion ? 0.0 : 1.0 }, // power-on settle; reduce => no flicker
    // fMRI plane: position in object-space Z-of-view. We drive it along the
    // specimen's anterior↔posterior axis (object +X), but resolve the actual
    // sweep value in object space each frame from scan-T so the slice is a true
    // cross-section regardless of turntable angle (the plane rotates WITH the
    // brain — it cuts the tissue, not the screen).
    uScanX: { value: 0.0 }, // current plane position along object +X
    uScanW: { value: 1.35 }, // slice half-width (thickness of the glowing band)
    cGraphite: { value: cGraphite },
    cGraphiteHi: { value: cGraphiteHi },
    cAmber: { value: cAmber },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aRand;
      attribute float aDepth;
      uniform float uTime; uniform float uSize; uniform float uIntro;
      uniform float uScanX; uniform float uScanW;
      varying float vDepth;   // 0 crest .. 1 sulcus
      varying float vRand;
      varying float vSlice;   // 1 inside the scan band .. 0 outside
      varying float vAhead;   // 1 in FRONT of the plane (toward camera-anterior) .. 0 behind
      void main(){
        vec3 p = position;
        // gentle power-on breathing only during intro, then dead still
        float amp = uIntro * 7.0;
        if (amp > 0.0001) {
          p += vec3(
            sin(p.y*0.6 + uTime*0.5 + aRand*6.28),
            cos(p.z*0.6 + uTime*0.45),
            sin(p.x*0.6 + uTime*0.4)
          ) * amp * (0.3 + aRand*0.5);
        }
        vDepth = aDepth;
        vRand = aRand;
        // scan plane is a slab perpendicular to object +X (anterior axis):
        float dx = position.x - uScanX;
        vSlice = 1.0 - smoothstep(0.0, uScanW, abs(dx)); // bright inside band
        vAhead = smoothstep(-0.4, uScanW*1.2, dx);       // ahead of plane -> dim
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * (0.5 + aRand * 0.95) * (220.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform vec3 cGraphite; uniform vec3 cGraphiteHi; uniform vec3 cAmber;
      varying float vDepth; varying float vRand; varying float vSlice; varying float vAhead;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);

        // -- VALUE-based legibility (no hue separation for sulci) --
        // crest (aDepth~0) reads bright graphite; sulcus (aDepth~1) sinks dark.
        float lit = mix(1.0, 0.30, vDepth);          // brightness falloff in folds
        vec3 col = mix(cGraphite, cGraphiteHi, (1.0 - vDepth) * (0.4 + vRand*0.35));
        col *= lit;

        // -- fMRI slice: the ONLY amber. crest of the slice ignites phosphor --
        float glow = vSlice * (0.55 + (1.0 - vDepth) * 0.6);
        col = mix(col, cAmber, clamp(glow, 0.0, 1.0));
        // hot core where slice meets a gyral crest
        col += cAmber * vSlice * (1.0 - vDepth) * 0.5;

        // -- particles AHEAD of the plane fade back into the graphite dark --
        float aheadDim = mix(1.0, 0.22, vAhead * (1.0 - vSlice));

        float alpha = a * (0.30 * (1.0 - vDepth * 0.25) + vSlice * 0.5) * aheadDim;
        gl_FragColor = vec4(col, alpha);
      }`,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ----- post: cold exam light + HALVED bloom (old hero used 0.3) ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.15, 0.4, 0.26);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ----- placement / resize ------------------------------------------------
  // Reusable scratch so the per-frame projection allocates nothing.
  const _v = new THREE.Vector3();

  function placeAndResize() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = w < 700 ? 0.6 : 0.92;
    // Center the specimen in the frame at z=0 — a turntable wants to sit on the
    // optical axis, not be pushed to the side like the old hero cloud.
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * 66;
    const halfW = halfH * camera.aspect;
    if (w < 760) { points.position.set(0, 0, 0); points.scale.setScalar(0.6); }
    else { points.position.set(0, 0, 0); points.scale.setScalar(Math.min(1, halfW / 60)); }
    points.updateMatrixWorld(true);
  }
  placeAndResize();
  addEventListener("resize", placeAndResize);

  // ----- caliper projection ------------------------------------------------
  // Map each anatomical anchor → screen px (relative to the canvas box) and
  // publish as --cx/--cy on the matching [data-caliper] child. We do not draw.
  const caliperEls = new Map<string, HTMLElement>();
  for (const a of ANCHORS) {
    const el = caliperLayer.querySelector<HTMLElement>(`[data-caliper="${a.key}"]`);
    if (el) caliperEls.set(a.key, el);
  }
  function projectCalipers() {
    if (caliperEls.size === 0) return;
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    points.updateMatrixWorld(true);
    for (const a of ANCHORS) {
      const el = caliperEls.get(a.key);
      if (!el) continue;
      _v.set(a.pos[0], a.pos[1], a.pos[2]);
      points.localToWorld(_v);
      _v.project(camera); // -> NDC
      const sx = (_v.x * 0.5 + 0.5) * w;
      const sy = (-_v.y * 0.5 + 0.5) * h;
      // z>1 means behind the camera; mark occluded so the page can hide a line
      const behind = _v.z > 1;
      el.style.setProperty("--cx", `${sx.toFixed(1)}px`);
      el.style.setProperty("--cy", `${sy.toFixed(1)}px`);
      el.dataset.occluded = behind ? "1" : "0";
    }
  }

  // ----- scan-plane state (damped, mechanical — never ease-in-out) ---------
  // setScanT writes a target in 0..1; we slew the object-space plane position
  // toward it with a critically-near-damped spring so it slews like an
  // odometer rather than fading.
  const SCAN_MIN = -15.5, SCAN_MAX = 14.5; // object +X span of the specimen
  let scanTarget = clamp01(getScrollTSafe());
  let scanPos = SCAN_MIN + (SCAN_MAX - SCAN_MIN) * scanTarget; // object-space X
  let scanVel = 0;
  function clamp01(x: number) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function getScrollTSafe(): number {
    try { return clamp01(getScrollT()); } catch { return 0.5; }
  }
  function setScanT(t: number): void {
    scanTarget = clamp01(t);
    if (reduceMotion) {
      scanPos = SCAN_MIN + (SCAN_MAX - SCAN_MIN) * scanTarget;
      uniforms.uScanX.value = scanPos;
    }
  }

  // ----- the loop ----------------------------------------------------------
  const clock = new THREE.Clock();
  let running = false;
  let rafId = 0;

  // damped spring: zeta ~0.72, settle <600ms (matches the motion contract)
  const SPRING_K = 120; // stiffness
  const SPRING_ZETA = 0.72;

  function step() {
    const raw = clock.getDelta();
    const dt = Math.min(raw, 0.05);
    uniforms.uTime.value += dt;

    // power-on settle (no flicker — just a brief breath that decays)
    if (uniforms.uIntro.value > 0) {
      uniforms.uIntro.value = Math.max(0, uniforms.uIntro.value - dt / 1.6);
    }

    // pull scan target from hero scroll each frame
    scanTarget = clamp01(getScrollTSafe());
    const goalX = SCAN_MIN + (SCAN_MAX - SCAN_MIN) * scanTarget;
    // damped-spring integrate toward goalX
    const damping = 2 * SPRING_ZETA * Math.sqrt(SPRING_K);
    const accel = SPRING_K * (goalX - scanPos) - damping * scanVel;
    scanVel += accel * dt;
    scanPos += scanVel * dt;
    uniforms.uScanX.value = scanPos;

    // slow turntable — gentle continuous Y rotation, cold and steady
    points.rotation.y += dt * 0.12;

    projectCalipers();
    composer.render();

    if (running) rafId = requestAnimationFrame(step);
  }

  function renderStaticFrame() {
    // reduceMotion / posed: scan plane mid-brain, calipers pre-projected,
    // turntable angled to read as a 3/4 lateral specimen, single render.
    uniforms.uIntro.value = 0;
    points.rotation.y = -0.35; // posed 3/4 view, anterior toward camera-right
    const t = reduceMotion ? 0.5 : clamp01(getScrollTSafe());
    scanPos = SCAN_MIN + (SCAN_MAX - SCAN_MIN) * t;
    uniforms.uScanX.value = scanPos;
    points.updateMatrixWorld(true);
    projectCalipers();
    composer.render();
  }

  function wake(): void {
    if (reduceMotion) { renderStaticFrame(); return; }
    if (running) return;
    running = true;
    clock.getDelta(); // discard the gap so dt doesn't spike after a sleep
    rafId = requestAnimationFrame(step);
  }
  function sleep(): void {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  // ----- offscreen self-suspend (IntersectionObserver) ---------------------
  // The shared rAF orchestrator in index.astro may also call sleep()/wake(),
  // but we guard ourselves too: pause FULLY when the hero canvas leaves view.
  let io: IntersectionObserver | null = null;
  if (!reduceMotion && typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) wake(); else sleep(); },
      { threshold: 0 }
    );
    io.observe(canvas);
  }

  // ----- boot --------------------------------------------------------------
  if (reduceMotion) {
    renderStaticFrame();
  } else {
    wake(); // IO will keep it honest, but start hot since the hero is on top
  }

  // ----- teardown ----------------------------------------------------------
  function dispose(): void {
    sleep();
    removeEventListener("resize", placeAndResize);
    io?.disconnect();
    io = null;
    geo.dispose();
    mat.dispose();
    bloom.dispose();
    composer.dispose?.();
    renderer.dispose();
    // drop the GL context so we never leak it on hot-reload / SPA nav
    renderer.forceContextLoss?.();
  }

  return { setScanT, sleep, wake, dispose };
}