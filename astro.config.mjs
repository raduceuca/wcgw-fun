// @ts-check
import { readFile, writeFile } from 'node:fs/promises'
import { defineConfig } from 'astro/config'
import { htmlToMarkdown } from './src/markdown'
import { markdownPath } from './src/seo'
import { pages, site } from './src/site'

/**
 * After the build: a markdown copy of every public page (dist/index.md, dist/privacy.md),
 * and a _routes.json that runs the Pages Function (functions/_middleware.ts) on those
 * pages only, so it can answer `Accept: text/markdown` with them. Everything else stays static.
 * @returns {import('astro').AstroIntegration}
 */
const agentCopies = () => ({
  name: 'agent-copies',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      for (const { path } of Object.values(pages)) {
        const html = await readFile(new URL(path === '/' ? 'index.html' : `${path.slice(1)}.html`, dir), 'utf8')
        await writeFile(new URL(markdownPath(path).slice(1), dir), htmlToMarkdown(html, site.url))
      }
      const routes = { version: 1, include: Object.values(pages).map(page => page.path), exclude: [] }
      await writeFile(new URL('_routes.json', dir), `${JSON.stringify(routes, null, 2)}\n`)
    },
  },
})

/** Static marketing site for Cloudflare Pages (direct upload of dist/). */
export default defineConfig({
  site: 'https://wcgw.fun',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [agentCopies()],
  server: {
    port: 3369,
    host: true,
  },
  vite: {
    server: {
      allowedHosts: ['wcgw.local.dev', 'wcgw.fun.localhost'],
    },
  },
})
