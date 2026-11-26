// @ts-check
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import { htmlToMarkdown } from './src/markdown'
import { markdownPath } from './src/seo'
import { draftPaths, livePages, site } from './src/site'

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
      // Drafts (draft: true in src/site.ts) are dev only: drop their pages, their assets and their short links.
      for (const path of draftPaths) {
        await rm(new URL(`${path.slice(1)}.html`, dir), { force: true })
        await rm(new URL(path.slice(1), dir), { recursive: true, force: true })
      }
      const redirects = new URL('_redirects', dir)
      const lines = (await readFile(redirects, 'utf8')).split('\n')
      const toDraft = (line = '') => draftPaths.includes(line.trim().split(/\s+/)[1])
      // drop a draft's short link and the comment line right above it
      const kept = lines.filter((line, i) => !toDraft(line) && !(line.startsWith('#') && toDraft(lines[i + 1])))
      await writeFile(redirects, kept.join('\n'))
      if (draftPaths.length) await pruneOrphans(dir)
      for (const { path } of livePages) {
        const html = await readFile(new URL(path === '/' ? 'index.html' : `${path.slice(1)}.html`, dir), 'utf8')
        await writeFile(new URL(markdownPath(path).slice(1), dir), htmlToMarkdown(html, site.url))
      }
      const routes = { version: 1, include: livePages.map(page => page.path), exclude: [] }
      await writeFile(new URL('_routes.json', dir), `${JSON.stringify(routes, null, 2)}\n`)
    },
  },
})

/**
 * Delete files in dist/_astro that nothing left in dist/ refers to: the scripts and styles that only a
 * draft page used. Repeats until stable, since a chunk can be referenced only by another orphan.
 * @param {URL} dir
 */
const pruneOrphans = async (dir) => {
  const root = fileURLToPath(dir)
  const all = (await readdir(root, { recursive: true })).filter(f => /\.(html|css|js|mjs|json|md|xml|txt)$/.test(f) || f === '_redirects' || f === '_headers')
  let assets = (await readdir(join(root, '_astro')))
  for (let changed = true; changed;) {
    changed = false
    const texts = await Promise.all(all.map(async f => [f, await readFile(join(root, f), 'utf8').catch(() => '')]))
    for (const asset of assets) {
      const used = texts.some(([f, text]) => f !== join('_astro', asset) && text.includes(asset))
      if (!used) {
        await rm(join(root, '_astro', asset), { force: true })
        assets = assets.filter(a => a !== asset)
        const at = all.indexOf(join('_astro', asset))
        if (at >= 0) all.splice(at, 1)
        changed = true
      }
    }
  }
}

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
