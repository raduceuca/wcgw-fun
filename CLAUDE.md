# wcgw-fun

The creative studio landing page for [wcgw.fun](https://wcgw.fun).

## Quick Reference

| Aspect | Value |
|--------|-------|
| **Type** | Astro static site (Vite under the hood) |
| **Deploy** | Cloudflare Pages project `wcgw-fun` — `npm run deploy` (builds then `wrangler pages deploy dist`) |
| **Domain** | wcgw.fun |
| **Analytics** | Microsoft Clarity (disabled on localhost) |

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
├── layouts/BaseLayout.astro
├── styles/home.css        # Paper / Night manuscript styles
├── scripts/home.ts        # Client boot
└── home/                  # Theme, stream, mishaps, physics…
public/                    # favicon, portraits, og-image
```

Legacy Vite multi-page tools under `tools/` are separate from the Astro landing deploy.

---

## Design Direction

- Prefs + Paper copy locks: three-beat hero, agency lede, cake CTA, Paper/Night
- Delight: token stream + mishaps (`src/home/mishaps.ts`); Act Two is quiet copy + binned/kept piles (mole game rejected)
- Type: EB Garamond + Instrument Sans (nums)
- Drop classified / mono theme zoo

Scaffolded with [claudecraft](https://claudecraft.dev) / [wcgw-starter](https://github.com/raduceuca/wcgw-starter) direction by [@raduceuca](https://x.com/raduceuca).
