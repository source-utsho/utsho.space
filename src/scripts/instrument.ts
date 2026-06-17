// instrument.ts — SUBJECT TRACE engine.
//
// The site measures the visitor and draws their session as a live phosphor
// strip-chart. EVERYTHING is in-browser; nothing is transmitted, stored, or
// phoned home. The "telemetry" is a bit — but the measurements are real:
// we genuinely sample pointer + scroll velocity and classify attention.
//
// Contract (called by index.astro exactly like this):
//   initInstrument({ traceCanvas, classEl, clockEl, channelEls, onSkim?, reduceMotion })
//     -> { exportSVG():string, sleep():void, wake():void }
//
// Design tokens (machine speaks Plex Mono, --amber is the ONLY glow):
//   --ground #0C0D0F  --panel #141518  --hairline #2A2D31  --engrave #E8E6E1
//   --dim #8A8F98  --amber #FFB454 (phosphor — live data + the subject trace)
//
// Motion: mechanical + damped. No ease-in-out. <=30fps trace, self-suspends
// offscreen via the page's IntersectionObserver wiring + our own visibility
// guards. Zero dependencies.

const AMBER = "#FFB454"; // phosphor — the only glowing color
const ENGRAVE = "#E8E6E1";
const DIM = "#8A8F98";
const GROUND = "#0C0D0F";
const HAIRLINE = "#2A2D31";

export interface InstrumentOpts {
  traceCanvas: HTMLCanvasElement;
  classEl: HTMLElement;
  clockEl: HTMLElement;
  channelEls: HTMLElement[];
  onSkim?: () => void;
  reduceMotion: boolean;
}

export interface InstrumentHandle {
  exportSVG(): string;
  sleep(): void;
  wake(): void;
}

// One recorded sample of the strip-chart (history kept for the SVG souvenir).
interface Sample { t: number; v: number } // t = seconds since first input, v = 0..1
// A stamped event tick (channel crossing) drawn as a vertical mark on the trace.
interface Tick { t: number; label: string }

export function initInstrument(opts: InstrumentOpts): InstrumentHandle {
  const { traceCanvas, classEl, clockEl, channelEls, onSkim, reduceMotion } = opts;
  const ctx = traceCanvas.getContext("2d")!;

  // ---- timing (performance.now ONLY — never the Date API for timing) ----
  const now = () => performance.now();
  let firstInputAt = 0;          // ms timestamp of the visitor's first move/scroll
  const sessionT = () => (firstInputAt ? (now() - firstInputAt) / 1000 : 0); // seconds

  // ---- measured input signal ----
  // We fuse pointer speed (px/s) and scroll speed (px/s) into ONE normalized
  // amplitude. These constants are the "full-scale deflection" of each channel.
  const POINTER_FS = 2600; // px/s that reads as a full-amplitude flick
  const SCROLL_FS = 2400;  // px/s of scroll that reads as full amplitude
  let lastPX = 0, lastPY = 0, lastMoveAt = 0, havePointer = false;
  let pointerVel = 0;       // instantaneous, px/s
  let scrollVel = 0;        // instantaneous, px/s
  let lastScrollY = typeof scrollY === "number" ? scrollY : 0;
  let lastScrollAt = now();
  let lastInputAt = 0;      // any input — drives the IDLE classifier
  let signal = 0;           // smoothed 0..1 amplitude actually plotted (damped)

  // ---- damped spring helper (zeta ~0.72, ~8% overshoot, settles <600ms) ----
  // Numbers slew like odometers; values never fade. Used for the plotted
  // signal so the pen has mass instead of teleporting.
  function spring(cur: number, target: number, vel: { v: number }, dt: number, omega = 16, zeta = 0.72) {
    // semi-implicit integration of a damped harmonic oscillator
    const f = omega * omega * (target - cur) - 2 * zeta * omega * vel.v;
    vel.v += f * dt;
    return cur + vel.v * dt;
  }
  const sigVel = { v: 0 };

  // ---- history for the downloadable SVG souvenir ----
  const history: Sample[] = [];
  const ticks: Tick[] = [];
  const MAX_HISTORY = 4000; // ~2.2 min at 30fps; trims oldest beyond this

  // ---- classification (hysteresis, so the label never flickers) ----
  // States derived from MEASURED behavior. Jokes point INWARD, never at the
  // visitor.
  type State = "PRE" | "IDLE" | "SCANNING" | "READING" | "HYPERFOCUS";
  let state: State = "PRE";
  const LABELS: Record<State, string> = {
    PRE: "AWAITING SUBJECT… move something.",
    IDLE: "IDLE",
    SCANNING: "SCANNING",
    READING: "READING",
    HYPERFOCUS: "HYPERFOCUS?",
  };
  let stateSince = now();         // when we entered the current state
  let dwellChannel = -1;          // index of channel currently dwelt on
  let dwellSince = now();         // when the current channel dwell began
  let lowInputRun = 0;            // ms of continuous low-but-present input (reading)

  function setState(next: State) {
    if (next === state) return;
    state = next;
    stateSince = now();
    classEl.textContent = LABELS[next];
  }
  classEl.textContent = LABELS.PRE; // initial readout before any input

  // ---- skim detection: scroll velocity parked in "skim band" for ~8s ----
  const SKIM_LO = 900, SKIM_HI = 2600; // px/s window that reads as skimming
  let skimRunStart = 0;     // ms when the current skim run began (0 = not skimming)
  let skimFired = false;    // onSkim() fires at most once per session

  // ---- current-channel readout (last channel's label echoed near classEl) ----
  let currentChannel = "";

  // =====================================================================
  // INPUT LISTENERS — passive, cheap. We only read; nothing leaves the page.
  // =====================================================================
  function markInput() {
    const t = now();
    if (!firstInputAt) { firstInputAt = t; stateSince = t; dwellSince = t; }
    lastInputAt = t;
  }

  function onPointer(e: PointerEvent) {
    const t = now();
    if (havePointer) {
      const dt = Math.max(1, t - lastMoveAt) / 1000;
      const dx = e.clientX - lastPX, dy = e.clientY - lastPY;
      pointerVel = Math.hypot(dx, dy) / dt; // px/s
    }
    lastPX = e.clientX; lastPY = e.clientY; lastMoveAt = t; havePointer = true;
    markInput();
  }

  function onScroll() {
    const t = now();
    const y = typeof scrollY === "number" ? scrollY : 0;
    const dt = Math.max(1, t - lastScrollAt) / 1000;
    scrollVel = Math.abs(y - lastScrollY) / dt; // px/s
    lastScrollY = y; lastScrollAt = t;
    markInput();
  }

  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("scroll", onScroll, { passive: true });

  // =====================================================================
  // CHANNEL CROSSINGS — when the subject enters a new channel, stamp a tick.
  // The page passes the section elements; we observe them ourselves.
  // =====================================================================
  let channelIO: IntersectionObserver | null = null;
  if (channelEls.length) {
    channelIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const idx = channelEls.indexOf(e.target as HTMLElement);
        if (idx < 0) continue;
        const label =
          (e.target as HTMLElement).dataset.channel ||
          (e.target as HTMLElement).getAttribute("aria-label") ||
          (e.target as HTMLElement).id ||
          `CH${String(idx + 1).padStart(2, "0")}`;
        if (label === currentChannel) continue;
        currentChannel = label;
        // reset dwell tracking — a new channel is a new thing to look at
        dwellChannel = idx; dwellSince = now();
        if (firstInputAt) ticks.push({ t: sessionT(), label: label.toUpperCase() });
        // echo the current channel onto the classification readout's data slot
        classEl.dataset.channel = label.toUpperCase();
      }
    }, { threshold: 0.55 });
    channelEls.forEach((el) => channelIO!.observe(el));
  }

  // =====================================================================
  // TAB TELEMETRY — title swaps when the subject looks away / comes back.
  // =====================================================================
  const baseTitle = document.title;
  let reacquireTimer = 0;
  function onVisibility() {
    if (document.visibilityState === "hidden") {
      document.title = "RECORDING PAUSED — subject looked away";
    } else {
      document.title = "SIGNAL REACQUIRED";
      if (reacquireTimer) clearTimeout(reacquireTimer);
      reacquireTimer = window.setTimeout(() => { document.title = baseTitle; }, 1400);
      // reset velocity estimators so the first sample back isn't a phantom spike
      lastMoveAt = now(); lastScrollAt = now(); lastScrollY =
        typeof scrollY === "number" ? scrollY : 0;
    }
  }
  document.addEventListener("visibilitychange", onVisibility);

  // =====================================================================
  // CANVAS SIZING — DPR-aware; the phosphor canvas darkens between frames.
  // =====================================================================
  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(2, devicePixelRatio || 1);
    const r = traceCanvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    traceCanvas.width = Math.round(W * dpr);
    traceCanvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintBackground();
  }
  function paintBackground() {
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, 0, W, H);
    drawGrid();
  }
  function drawGrid() {
    // faint engraved graticule so the trace reads as an instrument, not a toy
    ctx.save();
    ctx.strokeStyle = HAIRLINE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, H / 2 + 0.5); ctx.lineTo(W, H / 2 + 0.5); // zero-line
    ctx.stroke();
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    for (let gx = 0; gx <= W; gx += 48) { ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, H); }
    for (let gy = H / 2 % 32; gy <= H; gy += 32) { ctx.moveTo(0, gy + 0.5); ctx.lineTo(W, gy + 0.5); }
    ctx.stroke();
    ctx.restore();
  }
  addEventListener("resize", resize);

  // The pen rides at the right edge; the canvas scrolls left by SCROLL_PX/frame.
  const SCROLL_PX = 2;
  let penX = 0;          // x of the most recently drawn column
  let prevPenY = 0;      // y of the previous column (for line continuity)
  let havePrev = false;

  function plotColumn() {
    // 1) shift the existing trace left by copying the canvas onto itself
    ctx.save();
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(traceCanvas, -SCROLL_PX * dpr, 0);
    ctx.restore();
    // 2) repaint the freshly-exposed strip on the right with background
    ctx.save();
    ctx.fillStyle = GROUND;
    ctx.fillRect(W - SCROLL_PX, 0, SCROLL_PX, H);
    ctx.restore();
    // 3) gentle global trail fade — phosphor decay WITHOUT heavy blur.
    //    A translucent ground wash dims older pixels a touch each frame.
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    const pad = 6;
    const amp = (H / 2) - pad;
    const y = H / 2 - signal * amp;
    penX = W - 1;

    // phosphor look: 1px primary stroke + a faint offset second stroke
    if (havePrev) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = AMBER;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(penX - SCROLL_PX + 0.5, prevPenY + 0.5);
      ctx.lineTo(penX + 0.5, y + 0.5);
      ctx.stroke();
      // second, offset stroke — the faint "bloom ghost" of a real CRT pen
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.moveTo(penX - SCROLL_PX + 0.5, prevPenY + 1.5);
      ctx.lineTo(penX + 0.5, y + 1.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // hot pixel at the pen tip
    ctx.fillStyle = AMBER;
    ctx.fillRect(penX - 1, Math.round(y) - 1, 2, 2);

    prevPenY = y; havePrev = true;
  }

  // Stamp a channel-crossing flag onto the live trace at the pen edge.
  // We only draw a flag on the frame a new tick arrives.
  let lastTickCount = 0;
  function drawNewTicks() {
    if (ticks.length === lastTickCount) return;
    lastTickCount = ticks.length;
    ctx.save();
    ctx.strokeStyle = ENGRAVE;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(penX + 0.5, 0); ctx.lineTo(penX + 0.5, H);
    ctx.stroke();
    ctx.restore();
  }

  // =====================================================================
  // PER-FRAME MEASUREMENT — runs inside the rAF loop (or once, if reduced).
  // =====================================================================
  function updateMeasurements(dt: number) {
    // velocity decays toward zero when no fresh events arrive (so the pen
    // settles instead of holding a stale spike)
    const decay = Math.exp(-dt * 6);
    pointerVel *= decay;
    scrollVel *= decay;

    // fuse the two channels into one full-scale signal, then damp it
    const raw = Math.min(1, pointerVel / POINTER_FS + scrollVel / SCROLL_FS);
    signal = spring(signal, raw, sigVel, dt);
    signal = signal < 0 ? 0 : signal > 1 ? 1 : signal;

    if (firstInputAt) {
      history.push({ t: sessionT(), v: signal });
      if (history.length > MAX_HISTORY) history.shift();
    }

    classify(dt);
    updateClock();
    detectSkim();
  }

  function classify(dt: number) {
    const t = now();
    if (!firstInputAt) { setState("PRE"); return; }
    const sinceInput = t - lastInputAt;

    // IDLE: no input for ~2s. (We point the joke at the instrument, never you:
    // an idle trace is the recorder waiting, not the subject failing.)
    if (sinceInput > 2000) { lowInputRun = 0; setState("IDLE"); return; }

    // SCANNING: sustained high scroll velocity = blasting through the page.
    if (scrollVel > 1500) { lowInputRun = 0; setState("SCANNING"); return; }

    // Low, steady input while present = READING. Build a run so a single
    // twitch can't toggle us; this is the hysteresis.
    const lowSteady = signal < 0.28 && sinceInput < 1500;
    if (lowSteady) lowInputRun += dt * 1000;
    else lowInputRun = Math.max(0, lowInputRun - dt * 1600);

    // HYPERFOCUS?: long focused dwell on ONE channel with low input.
    const dwellMs = t - dwellSince;
    if (lowInputRun > 1400 && dwellChannel >= 0 && dwellMs > 9000 && state !== "SCANNING") {
      setState("HYPERFOCUS");
      return;
    }
    if (lowInputRun > 1200) { setState("READING"); return; }

    // in-between / active but not skimming: latch READING once plausible so the
    // mid-band never flickers between labels.
    if (state === "PRE") setState("READING");
  }

  function detectSkim() {
    const t = now();
    const inBand = scrollVel >= SKIM_LO && scrollVel <= SKIM_HI;
    if (inBand) {
      if (!skimRunStart) skimRunStart = t;
      else if (!skimFired && t - skimRunStart >= 8000) {
        skimFired = true;
        // page owns the 30-sec toast; never let it crash the trace
        try { onSkim && onSkim(); } catch { /* swallow */ }
      }
    } else if (skimRunStart && t - skimRunStart > 600 &&
      (scrollVel < SKIM_LO * 0.5 || scrollVel > SKIM_HI * 1.6)) {
      // grace window so a momentary stutter doesn't reset the run
      skimRunStart = 0;
    }
  }

  // session T+ as mm:ss, slewed like an odometer (monotonic — never fades)
  let shownSecs = -1;
  function updateClock() {
    const secs = Math.floor(sessionT());
    if (secs === shownSecs) return;
    shownSecs = secs;
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    clockEl.textContent = `T+${mm}:${ss}`;
  }
  clockEl.textContent = "T+00:00";

  // =====================================================================
  // rAF LOOP — capped at 30fps for the canvas; suspends on sleep().
  // =====================================================================
  let raf = 0, running = false, lastFrame = 0;
  const FRAME_MS = 1000 / 30; // hard 30fps cap for the phosphor trace

  function frame(ts: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const elapsed = ts - lastFrame;
    if (elapsed < FRAME_MS) return; // throttle to <=30fps
    const dt = Math.min(0.066, elapsed / 1000); // clamp dt after tab-switches
    lastFrame = ts;
    // pause real work while the tab is hidden — no point plotting a blank
    if (document.visibilityState === "hidden") { updateClock(); return; }
    updateMeasurements(dt);
    plotColumn();
    drawNewTicks();
  }

  // =====================================================================
  // REDUCED MOTION — no loop. Render a static, pre-completed waveform once
  // and label it. Classification still updates as TEXT from live input.
  // =====================================================================
  function renderStatic() {
    resize();
    paintBackground();
    const pad = 6, amp = (H / 2) - pad;
    // deterministic, instrument-looking sample trace (not random noise)
    ctx.strokeStyle = AMBER; ctx.lineWidth = 1; ctx.globalAlpha = 0.95;
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const u = x / W;
      const v = 0.5 + 0.42 * Math.sin(u * 22) * Math.exp(-Math.pow((u - 0.5) * 2.4, 2))
        + 0.12 * Math.sin(u * 67);
      const y = H / 2 - (v - 0.5) * 2 * amp * 0.8;
      if (x === 0) ctx.moveTo(x + 0.5, y + 0.5); else ctx.lineTo(x + 0.5, y + 0.5);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.22;
    ctx.translate(0, 1.4); ctx.stroke(); ctx.translate(0, -1.4);
    ctx.globalAlpha = 1;
    // label
    ctx.fillStyle = DIM;
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("PRE-RECORDED SESSION", 8, 14);
    // seed a little history so exportSVG() produces a sensible souvenir
    for (let i = 0; i <= 200; i++) {
      const u = i / 200;
      history.push({ t: u * 30, v: 0.5 + 0.4 * Math.sin(u * 22) * Math.exp(-Math.pow((u - 0.5) * 2.4, 2)) });
    }
  }

  // =====================================================================
  // BOOT
  // =====================================================================
  if (reduceMotion) {
    renderStatic();
    // still classify from real input, but as text only (no animation loop):
    addEventListener("pointermove", () => { classify(0.05); }, { passive: true });
    addEventListener("scroll", () => { classify(0.05); updateClock(); }, { passive: true });
  } else {
    resize();
  }

  function wake() {
    if (reduceMotion || running) return;
    running = true; lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function sleep() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  if (!reduceMotion) wake();

  // =====================================================================
  // exportSVG() — the downloadable souvenir. Standalone SVG of the whole
  // recorded trace, titled, with event ticks + the T+ duration.
  // =====================================================================
  function exportSVG(): string {
    const w = 900, h = 280, padX = 24, padY = 28;
    const plotW = w - padX * 2, plotH = h - padY * 2;
    const data = history.length ? history : [{ t: 0, v: 0.5 }];
    const tMax = Math.max(1, data[data.length - 1].t);
    const x = (t: number) => padX + (t / tMax) * plotW;
    const y = (v: number) => padY + (1 - v) * plotH;

    let path = "";
    data.forEach((s, i) => { path += (i ? "L" : "M") + x(s.t).toFixed(1) + " " + y(s.v).toFixed(1) + " "; });

    const tickMarks = ticks.map((tk) => {
      const tx = x(tk.t).toFixed(1);
      return `<line x1="${tx}" y1="${padY}" x2="${tx}" y2="${padY + plotH}" stroke="${ENGRAVE}" stroke-width="1" opacity="0.5"/>`
        + `<text x="${tx}" y="${padY - 6}" fill="${DIM}" font-size="9" font-family="IBM Plex Mono, monospace" letter-spacing="1" text-anchor="middle">${esc(tk.label)}</text>`;
    }).join("");

    const secs = Math.floor(data[data.length - 1].t);
    const dur = `T+${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

    // faint graticule
    let grid = "";
    for (let gx = padX; gx <= w - padX; gx += 60) grid += `<line x1="${gx}" y1="${padY}" x2="${gx}" y2="${padY + plotH}" stroke="${HAIRLINE}" stroke-width="1" opacity="0.4"/>`;
    grid += `<line x1="${padX}" y1="${(padY + plotH / 2).toFixed(1)}" x2="${w - padX}" y2="${(padY + plotH / 2).toFixed(1)}" stroke="${HAIRLINE}" stroke-width="1" opacity="0.6"/>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${GROUND}"/>
  <text x="${padX}" y="18" fill="${ENGRAVE}" font-size="11" font-family="IBM Plex Mono, monospace" letter-spacing="2">SESSION RECORD — SUBJECT: YOU</text>
  <text x="${w - padX}" y="18" fill="${AMBER}" font-size="11" font-family="IBM Plex Mono, monospace" letter-spacing="1" text-anchor="end">${dur}</text>
  ${grid}
  ${tickMarks}
  <path d="${path.trim()}" fill="none" stroke="${AMBER}" stroke-width="1"/>
  <path d="${path.trim()}" fill="none" stroke="${AMBER}" stroke-width="1" opacity="0.22" transform="translate(0,1.4)"/>
  <text x="${padX}" y="${h - 8}" fill="${DIM}" font-size="9" font-family="IBM Plex Mono, monospace" letter-spacing="1">measured in-browser · nothing transmitted · ${history.length} samples</text>
</svg>`;
  }

  function esc(s: string) {
    return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));
  }

  return { exportSVG, sleep, wake };
}
