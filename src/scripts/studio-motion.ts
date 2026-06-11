// studio-motion.ts — full-page, reusable studio-grade motion primitives.
// Contract is class/attribute driven so it can wire into any markup:
//   .reveal            -> fades/rises in when scrolled into view
//   .stagger > *       -> children reveal in sequence (sets --i index)
//   .split             -> heading text is split into words that rise behind a mask
//   [data-count]       -> number counts up when revealed
//   .magnetic          -> button is pulled toward the cursor
//   [data-parallax]    -> translateY by scroll (attr value = strength, default 0.12)
//   .tilt              -> 3D tilt toward the cursor on hover
// Plus: a mass-based accent cursor (pointer:fine only) and a scroll-progress rail.
// Everything is gated by prefers-reduced-motion.

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function initMotion(opts: { getScroll?: () => number } = {}) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const getScroll = opts.getScroll ?? (() => window.scrollY);

  splitHeadings();

  if (reduce) {
    // Show everything immediately, no motion.
    document.querySelectorAll(".reveal, .split .w-in").forEach((el) => el.classList.add("in"));
    document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => { el.textContent = el.dataset.count || el.textContent; });
    return;
  }

  // ---- stagger indices ----
  document.querySelectorAll<HTMLElement>(".stagger").forEach((group) => {
    Array.from(group.children).forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(i)));
  });

  // ---- reveal on scroll (covers .reveal and split headings) ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      el.classList.add("in");
      el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal, .split").forEach((el) => io.observe(el));

  // ---- magnetic buttons ----
  if (fine) document.querySelectorAll<HTMLElement>(".magnetic").forEach((btn) => {
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const loop = () => { cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18; btn.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`; if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(loop); else raf = 0; };
    btn.addEventListener("pointermove", (e) => { const r = btn.getBoundingClientRect(); tx = (e.clientX - (r.left + r.width / 2)) * 0.32; ty = (e.clientY - (r.top + r.height / 2)) * 0.42; if (!raf) raf = requestAnimationFrame(loop); });
    btn.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  });

  // ---- 3D tilt cards ----
  if (fine) document.querySelectorAll<HTMLElement>(".tilt").forEach((card) => {
    card.style.transformStyle = "preserve-3d";
    card.addEventListener("pointermove", (e) => { const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; card.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateZ(0)`; });
    card.addEventListener("pointerleave", () => { card.style.transform = "perspective(900px) rotateX(0) rotateY(0)"; });
  });

  // ---- parallax + scroll progress (single rAF) ----
  const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
  const bar = document.getElementById("scrollbar");
  let ticking = false;
  function onScroll() {
    const y = getScroll();
    for (const el of parallax) {
      const r = el.getBoundingClientRect(); const k = parseFloat(el.dataset.parallax || "0.12");
      const center = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-center * k).toFixed(2)}px, 0)`;
    }
    if (bar) { const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`; }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // ---- mass-based accent cursor (does NOT hide native cursor) ----
  if (fine) {
    const dot = document.createElement("div"); dot.id = "mcursor"; document.body.appendChild(dot);
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, scale = 1, tscale = 1;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const hov = "a, button, .magnetic, .tilt, [data-cursor]";
    addEventListener("pointerover", (e) => { if ((e.target as HTMLElement).closest(hov)) tscale = 2.4; });
    addEventListener("pointerout", (e) => { if ((e.target as HTMLElement).closest(hov)) tscale = 1; });
    (function loop() { x += (tx - x) * 0.18; y += (ty - y) * 0.18; scale += (tscale - scale) * 0.15; dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale.toFixed(3)})`; requestAnimationFrame(loop); })();
  }
}

// Split text of every .split element into masked, rising words.
function splitHeadings() {
  document.querySelectorAll<HTMLElement>(".split").forEach((el) => {
    if (el.dataset.split) return; el.dataset.split = "1";
    const words = (el.textContent || "").trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const wrap = document.createElement("span"); wrap.className = "w";
      const inner = document.createElement("span"); inner.className = "w-in"; inner.textContent = w;
      inner.style.setProperty("--wi", String(i));
      wrap.appendChild(inner); el.appendChild(wrap);
      el.appendChild(document.createTextNode(" "));
    });
  });
}

function countUp(el: HTMLElement) {
  if (el.dataset.done) return; el.dataset.done = "1";
  const target = parseFloat((el.dataset.count || "").replace(/[^0-9.]/g, ""));
  const suffix = (el.dataset.count || "").replace(/[0-9.,]/g, "");
  if (!isFinite(target)) { el.textContent = el.dataset.count || ""; return; }
  const dur = 1100; let start = 0;
  function tick(now: number) { if (!start) start = now; const k = Math.min((now - start) / dur, 1); const e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(target * e).toLocaleString() + suffix; if (k < 1) requestAnimationFrame(tick); else el.textContent = el.dataset.count || ""; }
  el.textContent = "0" + suffix; requestAnimationFrame(tick);
}

// Companion CSS contract (add to the page once):
export const MOTION_CSS = `
@media (prefers-reduced-motion: no-preference) {
  .reveal { opacity: 0; transform: translateY(26px); transition: opacity .8s ${EASE}, transform .8s ${EASE}; }
  .reveal.in { opacity: 1; transform: none; }
  .stagger > * { transition-delay: calc(var(--i, 0) * 80ms); }
  .split .w { display: inline-block; overflow: hidden; vertical-align: top; }
  .split .w-in { display: inline-block; transform: translateY(110%); transition: transform .9s ${EASE}; transition-delay: calc(var(--wi, 0) * 40ms); }
  .split.in .w-in { transform: translateY(0); }
  [data-parallax] { will-change: transform; }
}
#scrollbar { position: fixed; top: 0; left: 0; height: 2px; width: 100%; transform: scaleX(0); transform-origin: 0 50%; background: var(--acc, #3DE1C4); z-index: 60; pointer-events: none; }
#mcursor { position: fixed; top: 0; left: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--acc, #3DE1C4); mix-blend-mode: screen; pointer-events: none; z-index: 70; opacity: 0.85; will-change: transform; }
@media (pointer: coarse) { #mcursor { display: none; } }
`;
