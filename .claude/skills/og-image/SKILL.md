# OG Image Generator

Create Open Graph images for social sharing.

## Specifications

| Platform | Size | Aspect Ratio |
|----------|------|--------------|
| Open Graph | 1200×630 | 1.91:1 |
| Twitter | 1200×628 | 1.91:1 |
| LinkedIn | 1200×627 | 1.91:1 |
| Facebook | 1200×630 | 1.91:1 |

**Safe zone:** Keep text within 1080×560 centered area.

## Template Structure

```
┌─────────────────────────────────────────┐
│                                         │
│  LOGO (optional, top-left)              │
│                                         │
│                                         │
│     HEADLINE                            │
│     Large, bold, max 2 lines            │
│                                         │
│     Subheadline (optional)              │
│     Smaller, max 1 line                 │
│                                         │
│                                         │
│  DOMAIN (bottom-left)   VISUAL (right)  │
│                                         │
└─────────────────────────────────────────┘
```

## Design Guidelines

### Typography
- Headline: 48-72px, bold
- Subheadline: 24-32px, regular
- Domain: 18-24px, medium
- Max 50 characters per line

### Colors
- High contrast (4.5:1 minimum)
- Match brand colors
- Solid backgrounds work best (gradients can compress poorly)

### Content
- One clear message
- No small text (unreadable in previews)
- Avoid busy backgrounds
- Include brand element (logo, color, pattern)

## HTML/CSS Template

```html
<div style="
  width: 1200px;
  height: 630px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px;
  background: #1a1a2e;
  color: white;
  font-family: system-ui, sans-serif;
">
  <h1 style="
    font-size: 64px;
    font-weight: 700;
    line-height: 1.1;
    margin: 0 0 20px;
  ">
    Your Headline Here
  </h1>
  <p style="
    font-size: 28px;
    opacity: 0.8;
    margin: 0;
  ">
    Your subheadline or description
  </p>
  <div style="
    margin-top: auto;
    font-size: 20px;
    opacity: 0.6;
  ">
    example.com
  </div>
</div>
```

## React Component

```tsx
interface OgImageProps {
  title: string
  subtitle?: string
  domain?: string
}

export function OgImage({ title, subtitle, domain }: OgImageProps) {
  return (
    <div className="w-[1200px] h-[630px] flex flex-col justify-center p-16 bg-base-300">
      <h1 className="text-6xl font-bold leading-tight mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-2xl text-base-content/70">
          {subtitle}
        </p>
      )}
      {domain && (
        <p className="mt-auto text-xl text-base-content/50">
          {domain}
        </p>
      )}
    </div>
  )
}
```

## Generation Options

### 1. Static (recommended for simple sites)
- Create in Figma/design tool
- Export as PNG
- Place in `public/og-image.png`

### 2. Dynamic (for blogs/products)
- Use @vercel/og or Satori
- Generate at build time or on-demand
- Create API route: `/api/og?title=...`

### 3. Screenshot service
- Use Puppeteer/Playwright
- Render HTML template
- Screenshot at 1200×630

## Meta Tags

```html
<meta property="og:image" content="https://example.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Description of image" />
<meta name="twitter:image" content="https://example.com/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
```

## Testing

- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/
- General: https://www.opengraph.xyz/
