# wcgw-fun

The creative studio landing page for [wcgw.fun](https://wcgw.fun).

## Quick Reference

| Aspect | Value |
|--------|-------|
| **Type** | Static HTML/CSS site |
| **Deploy** | Cloudflare Pages project `wcgw-fun` (upload `site/`; Git not connected — deploy with `wrangler pages deploy site --project-name=wcgw-fun`) |
| **Domain** | wcgw.fun |
| **Analytics** | Microsoft Clarity (disabled on localhost) |

---

## Project Structure

```
site/
├── index.html       # Editorial manifesto landing page
├── styles.css       # Paper / Night stylesheet
├── favicon.svg      # Brand favicon
├── logo.svg         # Brand logo
├── og-image.png     # Open Graph social card
└── og-template.html # OG image template reference
```

The `site/` directory is what ships to Cloudflare Pages. Root Vite tooling under `tools/` is separate.

---

## Design Direction

Source of truth: Paper file “WCGW design directions” + Project preferences (editorial manifesto).

- Type: EB Garamond + Instrument Sans (nums)
- Themes: Paper (`#FAFAFA`) and Night only — no classified / mono
- Hero three-beat + lede “Infinite output. An abdication of agency.” + cake CTA

---

## Notes

- No JavaScript framework for the landing page
- Inline JS for: theme toggle, reveal, Bucharest clock, Clarity
- Clarity is conditionally loaded (skipped on localhost/127.0.0.1)
- Scaffolded with [claudecraft](https://claudecraft.dev) by [@raduceuca](https://x.com/raduceuca)
