# Sitemap Generator

Generate XML sitemaps for static and dynamic routes.

## When to Use

- Before deploying to production
- After adding new pages/routes
- When setting up SEO

## Output Format

Generate `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Priority Guidelines

| Page Type | Priority | Change Frequency |
|-----------|----------|------------------|
| Homepage | 1.0 | weekly |
| Main sections | 0.8 | weekly |
| Blog posts | 0.6 | monthly |
| Legal pages | 0.3 | yearly |

## Steps

1. Scan `src/pages/` for route components
2. Check `src/App.tsx` for route definitions
3. Extract all public routes (exclude auth-protected)
4. Generate sitemap.xml with today's date
5. Create `public/robots.txt` if missing:

```
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

## Dynamic Routes

For dynamic routes like `/blog/:slug`, either:
- Fetch content list from CMS/API
- Read from `src/data/` files
- Ask user for URL list

## Validation

After generation, validate at:
- https://www.xml-sitemaps.com/validate-xml-sitemap.html
