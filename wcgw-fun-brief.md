# wcgw.fun - Complete Site Brief

## Stack
- Static HTML/CSS (no framework needed)
- Deploy via Cloudflare Pages
- Single page

---

## Meta & Open Graph

### Page Title
```
WCGW — Tools for the aftermath
```

### Meta Description
```
Design tools. Sharp observations. The creative studio of Radu Ceuca.
```

### Open Graph
```html
<meta property="og:title" content="WCGW — Tools for the aftermath">
<meta property="og:description" content="Someone has to.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://wcgw.fun">
<meta property="og:image" content="https://wcgw.fun/og-image.png">
```

### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@wcgwfun">
<meta name="twitter:title" content="WCGW — Tools for the aftermath">
<meta name="twitter:description" content="Someone has to.">
<meta name="twitter:image" content="https://wcgw.fun/og-image.png">
```

### Favicon
- Use logo mark, sized down
- Provide favicon.ico and/or favicon.svg

---

## Page Copy

### Header
```
[LOGO]

Tools for the aftermath

Someone has to.
```

### Projects
```
claudecraft.dev
Designer-first boilerplate for Claude Code
[LIVE]

slopmeter.wtf
AI slop detection, measured in Altmans
[LIVE]

Taste Files
Design judgment, transferable
[COMING SOON]
```

### About
```
WCGW is the creative studio of Radu Ceuca. Designer and builder of things. Optimist with backups.

@raduceuca · @wcgwfun
```

### Footer
```
© 2025
```

---

## Design Direction

### Typography
- Monospace: JetBrains Mono (Google Fonts) or similar
- Keep it simple — one font family, vary weights if needed

### Colors
- Background: #0a0a0a (near black)
- Text: #f5f5f5 (off-white)
- Accent: Choose one — warning yellow (#facc15), hazard orange (#f97316), or clinical green (#22c55e)
- Use accent sparingly: status tags, links on hover

### Layout
- Mobile-first, should look good at 320px
- Centered, max-width ~600px
- Generous vertical whitespace
- Projects as a simple vertical list, not cards

### Status Tags
- [LIVE] and [COMING SOON] as small uppercase labels
- Muted color or accent, depending on status

### Interactions
- No animations
- Hover: underline on links, subtle color shift acceptable
- No JavaScript required

### Aesthetic
- Warning-label / incident-report energy
- Clinical, not playful
- Let content be funny, keep design straight-faced

---

## Constraints
- No JavaScript required
- Total page weight under 50kb (excluding font if self-hosted)
- Accessible: WCAG AA contrast, semantic HTML, proper heading hierarchy
- No tracking, no analytics, no cookies

---

## Assets Needed

1. **Logo file** — SVG preferred, also PNG fallback
2. **Social card** — 1200x630px for OG/Twitter
   - Dark background
   - Logo centered or top
   - "Tools for the aftermath" as text
   - Keep it minimal
3. **Favicon** — .ico and/or .svg from logo mark

---

## File Structure
```
/
├── index.html
├── styles.css
├── favicon.ico
├── favicon.svg (optional)
├── og-image.png
└── logo.svg
```

---

## Links

- claudecraft.dev → https://claudecraft.dev
- slopmeter.wtf → https://slopmeter.wtf
- Taste Files → no link (coming soon)
- @raduceuca → https://x.com/raduceuca
- @wcgwfun → https://x.com/wcgwfun
