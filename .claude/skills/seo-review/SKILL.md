# SEO Review

Audit pages for SEO best practices.

## Checklist

### Meta Tags (Critical)

- [ ] `<title>` exists, 50-60 characters
- [ ] `<meta name="description">` exists, 150-160 characters
- [ ] `<meta name="viewport">` set correctly
- [ ] `<link rel="canonical">` for duplicate content prevention
- [ ] Language declared: `<html lang="en">`

### Open Graph (Social)

- [ ] `og:title` — same or variant of title
- [ ] `og:description` — same or variant of meta description
- [ ] `og:image` — 1200×630px minimum
- [ ] `og:url` — canonical URL
- [ ] `og:type` — website, article, product, etc.

### Twitter Cards

- [ ] `twitter:card` — summary_large_image recommended
- [ ] `twitter:title`
- [ ] `twitter:description`
- [ ] `twitter:image`

### Headings

- [ ] Single `<h1>` per page
- [ ] Logical hierarchy: h1 → h2 → h3 (no skipping)
- [ ] Headings describe content (not styled text)

### Images

- [ ] All `<img>` have `alt` attributes
- [ ] Alt text is descriptive, not "image" or filename
- [ ] Decorative images use `alt=""`
- [ ] Images have width/height to prevent layout shift

### Links

- [ ] Descriptive link text (not "click here")
- [ ] External links have `rel="noopener noreferrer"`
- [ ] No broken links
- [ ] Important pages within 3 clicks of homepage

### Performance (SEO Impact)

- [ ] Core Web Vitals passing
- [ ] No render-blocking resources
- [ ] Images optimized (WebP, lazy loading)
- [ ] Fonts preloaded

### Indexing

- [ ] `robots.txt` allows crawling
- [ ] `sitemap.xml` exists and is valid
- [ ] No `noindex` on important pages
- [ ] JSON-LD structured data present

## Review Process

1. Read `index.html` for meta tags
2. Scan page components for heading structure
3. Check images for alt text
4. Verify Open Graph tags
5. Check for sitemap.xml and robots.txt
6. Report findings with line numbers

## Output Format

```
SEO REVIEW: [page name]
═══════════════════════

CRITICAL
────────
✗ Missing meta description
  Fix: Add <meta name="description" content="...">

WARNINGS
────────
⚠ Title too long (72 chars, max 60)
  Current: "Very Long Title That Goes On..."

PASSED
──────
✓ Single h1 element
✓ All images have alt text
✓ Open Graph tags present

Score: 7/10
```
