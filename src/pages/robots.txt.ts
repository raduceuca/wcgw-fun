import type { APIRoute } from 'astro'
import { site } from '../site'

/** Search engines and AI assistants are all welcome: the site wants to be found and quoted. */
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
