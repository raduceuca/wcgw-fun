import type { APIRoute } from 'astro'
import { canonical, modifiedDate } from '../seo'
import { pages } from '../site'

export const GET: APIRoute = () => {
  const urls = Object.values(pages).map(
    page => `  <url>\n    <loc>${canonical(page.path)}</loc>\n    <lastmod>${modifiedDate(page)}</lastmod>\n  </url>`,
  )
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
