# wcgw-fun

The creative studio landing page for [wcgw.fun](https://wcgw.fun).

## Quick Reference

| Aspect | Value |
|--------|-------|
| **Type** | Astro static site (Vite under the hood) |
| **Deploy** | Cloudflare Pages project `wcgw-fun` — `npm run deploy` (builds then `wrangler pages deploy dist`) |
| **Domain** | wcgw.fun |
| **Analytics** | Microsoft Clarity, production builds only, with a cookie consent banner |

---

## Commands

```sh
npm run dev      # http://localhost:3369
npm run build    # Astro → dist/
npm run test     # vitest (home modules)
npm run deploy   # build + Pages direct upload
```

---

## Landing structure

```
src/
├── pages/index.astro      # Landing route
│   pages/privacy.astro    # Privacy notice (Clarity)
├── layouts/BaseLayout.astro  # Head, Clarity tag, consent banner
├── components/            # Logo, ConsentBanner
├── site.ts                # Site settings and the list of public pages
├── seo.ts                 # Canonical URLs, page dates (git), JSON-LD graph
├── markdown.ts            # Built HTML → markdown copies for agents
├── copy.ts                # Interface copy outside the manuscript
├── styles/home.css        # Paper / Night manuscript styles
├── scripts/home.ts        # Client boot
└── home/                  # Theme, stream, mishaps, physics…
public/                    # favicon, portraits, og-image, self-hosted fonts
functions/_middleware.ts   # Pages Function: Accept: text/markdown → the page's .md copy
```

Legacy Vite multi-page tools under `tools/` are separate from the Astro landing deploy.

---

## Design Direction

- Prefs + Paper copy locks: three-beat hero, agency lede, Paper/Night (cake CTA rejected — do not bring back)
- Delight: token stream + mishaps (`src/home/mishaps.ts`); Act Two is quiet copy + binned/kept piles (mole game rejected)
- Type: EB Garamond + Instrument Sans (nums)
- Drop classified / mono theme zoo
- Logo: the real mark from the WCGW design system (https://claude.ai/artifact/FnowZ9hbtfL5eRU3iFP39w), paths in `src/home/logo.ts`. Never redraw it. Its blurred back-ring glow is removed on purpose.
- No glows or shadows anywhere: no `box-shadow`, `filter` blur or `text-shadow`. Edges are 1px `--hair` lines.

## Tracking and consent

Decided 2026-11-18. Scope change: the site now tracks, with consent.

- Microsoft Clarity (ID in `src/site.ts`; empty turns it off) loads in production builds only.
- It records from the first page view in Clarity's cookieless no-consent mode. Cookies (`_clck`, `_clsk`) are set only after a yes.
- Consent API v2. `ad_Storage` is always `'denied'`; a yes grants `analytics_Storage` only.
- The answer is one localStorage key. `src/home/consent.ts` owns it and `decide()`; the banner is `src/components/ConsentBanner.astro`; the footer "Cookies" link reopens it.
- Banner copy lives in `src/copy.ts`. Refusing must stay as easy as accepting: two equal buttons.
- The banner stays generic; `/privacy` (`src/pages/privacy.astro`) is the notice Clarity's terms require. It names Microsoft Clarity, what it records, the cookies, and links Microsoft's privacy statement. Keep it in step with any tracking change, and bump its date.

## Discovery (SEO, AEO, GEO)

Decided 2026-11-22. Graded by VibeCheck (Lookout re-scan: `POST http://127.0.0.1:8796/api/projects/studio/audit`).

- Every public page is listed once in `pages` (`src/site.ts`). Add a page there and it gets a canonical URL, a sitemap entry, JSON-LD, a markdown copy and the Pages Function route. A page without an entry (the 404) is `noindex`.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/.well-known/mcp.json` are Astro endpoints in `src/pages/`. robots.txt allows every crawler, AI ones included.
- Page dates: `dateModified` comes from git (today when a source file has uncommitted edits). The privacy notice keeps its own `modified` date in `pages`, shown on the page.
- `src/pages/404.astro` gives unknown paths a real 404. Without it Pages served the home page for every path, robots.txt included.
- The markdown copies are generated from the built `<main>` after the build (`astro.config.mjs`), so they never drift from the page. `dist/_routes.json` runs the Pages Function on the public pages only; everything else is served statically.
- The MCP card is honest: the site has no MCP server, and the card says so and points at the markdown.
- Fonts are self-hosted (`public/fonts`, `src/styles/fonts.css`, latin + latin-ext): no Google request, no render-blocking stylesheet.

Scaffolded with [claudecraft](https://claudecraft.dev) / [wcgw-starter](https://github.com/raduceuca/wcgw-starter) direction by [@raduceuca](https://x.com/raduceuca).
