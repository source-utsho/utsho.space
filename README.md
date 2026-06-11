# utsho.space — Ibtihal Utsho

A refined, editorial personal site with tasteful motion. Big typography,
warm paper palette, one bold accent, smooth scroll-reveals. Built with
[Astro](https://astro.build) — ships as fast static files, hosts anywhere.

---

## 🚀 Run it

```bash
npm install      # once
npm run dev      # → http://localhost:4321
```

## ✏️ Edit your content — one file

**Everything you'll edit lives in [`src/config.ts`](./src/config.ts):**

- `site` — your name, role, location, status, social links
- `hero` — the giant headline + supporting line
- `marquee` — the scrolling keyword strip (your range)
- `about` — your story / approach (write it in your voice)
- `capabilities` — what you do, grouped (Build / Design / Think)
- `work` — your selected projects (add a `href` to make a row clickable)
- `contact` — closing line + email

Save while `npm run dev` runs and it updates instantly.

> Tip: in the headline and a few places you can wrap a word in `*asterisks*`
> to make it italic + accent-colored, e.g. `"things that *matter*"`.

## 🎨 Change the look

All colors and fonts are CSS variables at the top of
[`src/styles/global.css`](./src/styles/global.css) (`:root`).

- **Accent color** → `--accent` (currently a warm vermilion)
- **Go dark** → swap `--paper`, `--ink`, `--muted`, `--line` for dark values
  in that one `:root` block. Nothing else needs to change.
- **Fonts** → `--serif` / `--sans` / `--mono` (loaded in `src/layouts/Layout.astro`)

## ♿ / ⚙️ Built in

- Smooth scroll-reveal animations (respect `prefers-reduced-motion`)
- Scroll-progress bar + condensing nav
- Responsive (mobile → desktop), SEO + social-share meta tags
- ~Zero JavaScript beyond a tiny motion script

## 📦 Build & deploy

```bash
npm run build    # → static site in ./dist
npm run preview  # preview that build locally
```

Deploy `dist/` to **Vercel**, **Netlify**, **Cloudflare Pages**, or
**GitHub Pages**. When you're ready to point `utsho.space` at it, ask and I'll
walk you through the exact DNS records for your registrar.
