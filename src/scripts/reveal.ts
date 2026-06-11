// Motion layer: reveal-on-scroll, count-up readouts, nav border.
// All gated by .js + prefers-reduced-motion so nothing hides or jumps without support.

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function countUp(el: HTMLElement) {
  if (el.dataset.counted) return;
  const target = parseFloat(el.dataset.count || "");
  if (!isFinite(target) || reduce) return; // reduced-motion / non-numeric: leave final value
  el.dataset.counted = "1";
  let start: number | null = null;
  const dur = 1100;
  function tick(now: number) {
    if (start === null) start = now;
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased).toString();
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = el.dataset.count!;
  }
  el.textContent = "0";
  requestAnimationFrame(tick);
}

function activate(el: Element) {
  el.classList.add("in");
  el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
}

const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          activate(e.target);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  items.forEach((el) => io.observe(el));
  setTimeout(() => items.forEach(activate), 2600); // failsafe: never leave hidden
} else {
  items.forEach(activate);
}

// nav hairline on scroll
const nav = document.getElementById("nav");
const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
