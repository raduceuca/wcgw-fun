import type { APIRoute } from 'astro'
import { canonical, markdownPath } from '../../seo'
import { livePages, site } from '../../site'

/**
 * An honest MCP card: wcgw.fun is a site to read, not an app to drive, so it lists no
 * server. It points agents at the readable copies, and at the studio tool that does ship one.
 */
export const GET: APIRoute = () =>
  Response.json({
    name: 'fun.wcgw/site',
    title: site.name,
    description: `The studio site of ${site.name}. Read-only: there is no MCP server here and nothing to call. Read the markdown instead.`,
    websiteUrl: `${site.url}/`,
    remotes: [],
    resources: {
      llms: canonical('/llms.txt'),
      markdown: livePages.map(page => canonical(markdownPath(page.path))),
      sitemap: canonical('/sitemap.xml'),
    },
    related: [
      {
        name: 'VibeCheck',
        description: 'Catches what your agent shipped, hands it back, checks the fix. Runs as a local MCP server.',
        url: 'https://vibecheck.wcgw.fun',
        package: { registryType: 'npm', identifier: '@wcgw/vibe-check-mcp', transport: { type: 'stdio' } },
      },
    ],
    contact: site.email,
  })
