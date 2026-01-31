# Theme Cycle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform wcgw.fun into a CSS Zen Garden experience — clicking the mascot cycles through 8 radically different visual themes.

**Architecture:** Pure CSS theming via `data-theme` attribute on `<html>`. Each theme overrides CSS custom properties and adds theme-specific styles. SVG eye variants are embedded in the mascot and shown/hidden per theme. A few themes use generated background images.

**Tech Stack:** HTML, CSS (custom properties, pseudo-elements, gradients, filters), vanilla JS, Google Fonts CDN, Nano Banana Pro for select background images.

---

### Task 1: Foundation — Theme Cycling JS + Google Fonts

**Files:**
- Modify: `site/index.html` (JS block lines 121-204, font preload in head)
- Modify: `site/styles.css` (line 1 — Google Fonts import)

**Step 1: Update Google Fonts import to load all theme fonts**

In `site/styles.css` line 1, replace the import with:
```css
@import url('https://fonts.googleapis.com/css2?family=Kode+Mono:wght@400;700&family=Special+Elite&family=Anton&family=Press+Start+2P&family=Bangers&family=Comic+Neue:wght@400;700&family=DotGothic16&display=swap');
```

**Step 2: Add font preconnect to HTML head**

In `site/index.html`, add before the stylesheet link:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

**Step 3: Replace theme toggle JS with cycle logic**

Replace the theme toggle section (lines 124-142) with:
```javascript
const themes = ['light', 'dark', 'classified', 'broadcast', 'arcade', 'cartoon', 'brutalist', 'vaporwave'];
const logo = document.querySelector('.logo');
const root = document.documentElement;

const saved = localStorage.getItem('theme');
if (saved && themes.includes(saved)) {
  root.dataset.theme = saved;
} else {
  root.dataset.theme = 'light';
}

logo.addEventListener('click', () => {
  const current = root.dataset.theme || 'light';
  const idx = themes.indexOf(current);
  const next = themes[(idx + 1) % themes.length];
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
  if (window.clarity) {
    clarity('event', 'theme_toggle');
    clarity('set', 'theme', next);
  }
});
```

**Step 4: Commit**
```bash
git add site/index.html site/styles.css
git commit -m "feat: theme cycle foundation — JS cycling + all Google Fonts loaded"
```

---

### Task 2: Add SVG Eye Variants to Mascot

**Files:**
- Modify: `site/index.html` (SVG block lines 44-68)
- Modify: `site/styles.css` (eye visibility rules)

**Step 1: Add 6 new eye groups inside the SVG**

After the moon eye (line 67), before `</svg>`, add themed eye variants — all centered at (133, 43):

- `eye-classified`: Surveillance camera (circle + triangle)
- `eye-broadcast`: Signal bars (3 ascending rectangles)
- `eye-arcade`: Pixel coin (blocky circle with line)
- `eye-cartoon`: Spiral (SVG spiral path)
- `eye-brutalist`: Hazard triangle (triangle with !)
- `eye-vaporwave`: Glitch lines (3 offset horizontal lines)

Each wrapped in `<g class="eye-theme eye-{name}">`.

**Step 2: Add CSS to hide all theme eyes by default, show per theme**

```css
/* All theme eyes hidden by default */
.logo .eye-theme { opacity: 0; display: none; }

/* Per-theme eye visibility — hide X, show themed eye */
:root[data-theme="classified"] .logo .eye-x { opacity: 0; }
:root[data-theme="classified"] .logo .eye-classified { display: block; opacity: 1; }
/* ... repeat for each theme ... */
```

Also hide sun/moon for non-light/dark themes.

**Step 3: Commit**
```bash
git add site/index.html site/styles.css
git commit -m "feat: add themed SVG eye variants for all 8 themes"
```

---

### Task 3: Generate Background Images

**Files:**
- Create: `site/img/classified-stain.png` (coffee stain texture)
- Create: `site/img/cartoon-clouds.png` (cartoon sky with clouds)
- Create: `site/img/vaporwave-grid.png` (perspective grid floor)

**Step 1: Generate classified coffee stain texture**
```bash
export GEMINI_API_KEY="..."
uv run ~/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "Seamless tileable coffee ring stain texture on manila cream paper, aged document look, subtle brown watermarks, no text, clean edges for tiling, top down flat lay" \
  --filename "site/img/classified-stain.png" --resolution 1K
```

**Step 2: Generate cartoon clouds background**
```bash
uv run ~/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "Cartoon sky background in Family Guy American Dad animation style, bright blue sky with fluffy white cartoon clouds, simple flat colors, thick outlines on clouds, seamless horizontal tile, no characters" \
  --filename "site/img/cartoon-clouds.png" --resolution 2K
```

**Step 3: Generate vaporwave grid background**
```bash
uv run ~/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "Vaporwave aesthetic background, purple pink gradient sky, cyan perspective grid floor disappearing to horizon, no text no objects, retrowave synthwave style, clean geometric lines" \
  --filename "site/img/vaporwave-grid.png" --resolution 2K
```

**Step 4: Commit**
```bash
git add site/img/
git commit -m "feat: add generated background images for classified, cartoon, vaporwave themes"
```

---

### Task 4: Theme — Classified

**Files:**
- Modify: `site/styles.css` (append theme block)

**Step 1: Add classified theme CSS**

Full `:root[data-theme="classified"]` block:
- Colors: manila cream bg (#f5e6c8), dark brown text (#3d2b1f), red accent (#cc0000)
- Font: 'Special Elite', serif
- Background image: coffee stain texture tiled
- `::before` on body: rotated "CLASSIFIED" red stamp watermark
- Status badges: red with rough dashed borders (stamp look)
- Morse dividers: become solid black redaction bars
- Projects: slight typewriter indent
- About section: muted sepia tone

**Step 2: Commit**
```bash
git add site/styles.css
git commit -m "feat: add Classified theme — government document aesthetic"
```

---

### Task 5: Theme — Broadcast

**Files:**
- Modify: `site/styles.css` (append theme block)

**Step 1: Add broadcast theme CSS**

Full `:root[data-theme="broadcast"]` block:
- Colors: deep blue bg (#1a1a4e), white text, red accent (#dc2626)
- Font: 'Anton', sans-serif for headings; system-ui for body
- Body: red stripe bar across top (4px border-top)
- Header: "BREAKING" styled red background block behind brand name
- Projects: styled as news chyrons — colored background bars, left border accent
- Status badges: red pulse animation for "Live"
- `::after` on body: scrolling ticker-tape bar at bottom
- Layout: slightly wider max-width (600px)

**Step 2: Commit**
```bash
git add site/styles.css
git commit -m "feat: add Broadcast theme — breaking news TV aesthetic"
```

---

### Task 6: Theme — Arcade

**Files:**
- Modify: `site/styles.css` (append theme block)

**Step 1: Add arcade theme CSS**

Full `:root[data-theme="arcade"]` block:
- Colors: black bg (#000), neon green text (#33ff00), hot pink accent (#ff00ff)
- Font: 'Press Start 2P', monospace (smaller base size — 0.65rem)
- Body: scanline overlay via repeating-linear-gradient pseudo-element
- Body: subtle CRT curvature via box-shadow inset
- Projects: "> " prefix via ::before, game-select-menu style
- Status badges: blinking animation (arcade attract mode)
- Links: no underline, color swap on hover
- Pixel borders: stacked box-shadows for chunky border effect
- Line-height increased for readability with pixel font

**Step 2: Commit**
```bash
git add site/styles.css
git commit -m "feat: add Arcade theme — retro gaming CRT aesthetic"
```

---

### Task 7: Theme — Cartoon

**Files:**
- Modify: `site/styles.css` (append theme block)

**Step 1: Add cartoon theme CSS**

Full `:root[data-theme="cartoon"]` block:
- Colors: sky blue bg (#87CEEB), dark text (#1a1a1a), yellow accent (#FFD700)
- Font: 'Bangers', cursive for headings; 'Comic Neue', cursive for body
- Background: cartoon-clouds.png, fixed, cover
- All elements: thick 3px solid black borders, slight border-radius (8px)
- Projects: white bg cards with drop shadows offset (cartoon depth)
- Status badges: bright primary colors, rounded pill shape
- Main container: white bg panel with thick border (comic panel)
- Halftone dot pattern overlay on main via radial-gradient pseudo
- About: speech-bubble shape via CSS (rounded + triangle ::after)
- Headings: slight -1deg rotation for hand-drawn feel

**Step 2: Commit**
```bash
git add site/styles.css
git commit -m "feat: add Cartoon theme — Family Guy animation style"
```

---

### Task 8: Theme — Brutalist

**Files:**
- Modify: `site/styles.css` (append theme block)

**Step 1: Add brutalist theme CSS**

Full `:root[data-theme="brutalist"]` block:
- Colors: raw white bg (#fff), black text (#000), no accent (pure B&W)
- Font: system-ui, monospace fallback. Giant heading sizes (3rem+)
- No rounded corners anywhere (border-radius: 0)
- Borders: 4px solid black on everything
- Layout shift: max-width 700px, asymmetric padding
- Projects: overlapping via negative margins, rotated 1-2deg
- Status badges: raw black rectangles, inverted text
- Headers: oversized, breaking out of container
- Footer: huge text, left-aligned
- Aggressive text-transform: uppercase on headings
- No transitions, no animations, raw

**Step 2: Commit**
```bash
git add site/styles.css
git commit -m "feat: add Brutalist theme — raw anti-design concrete web"
```

---

### Task 9: Theme — Vaporwave

**Files:**
- Modify: `site/styles.css` (append theme block)

**Step 1: Add vaporwave theme CSS**

Full `:root[data-theme="vaporwave"]` block:
- Colors: deep purple bg (#2d1b69), pink text (#ff71ce), cyan accent (#01cdfe)
- Font: 'DotGothic16', monospace
- Background: vaporwave-grid.png, fixed, bottom, cover
- Gradient overlay via ::before (purple-to-transparent top-down)
- Text shadow: pink/cyan offset for glitch effect on headings
- Projects: translucent dark cards with cyan borders
- Status badges: cyan bg, purple text
- Links: cyan, glitch text-shadow on hover
- Main: subtle scanline overlay (different from arcade — wider gaps)
- Japanese decorative accents via ::before content on header (aestheticかわいい)

**Step 2: Commit**
```bash
git add site/styles.css
git commit -m "feat: add Vaporwave theme — 90s retrowave internet aesthetic"
```

---

### Task 10: Deploy + Final Commit

**Step 1: Deploy to Cloudflare Pages**
```bash
npx wrangler pages deploy site --project-name wcgw-fun
```

**Step 2: Final commit with all changes**
```bash
git add -A
git commit -m "feat: 8-theme CSS Zen Garden cycle — click mascot to transform"
git push
```
