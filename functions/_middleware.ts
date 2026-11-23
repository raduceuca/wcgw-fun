/**
 * Markdown content negotiation. An agent that asks for `Accept: text/markdown` gets the
 * page's markdown copy (built by the agent-copies integration in astro.config.mjs);
 * browsers get the HTML as before. Runs only on the public pages (dist/_routes.json).
 */
interface Context {
  request: Request
  next: () => Promise<Response>
  env: { ASSETS: { fetch: (request: Request) => Promise<Response> } }
}

const markdownPath = (path: string) => (path === '/' ? '/index.md' : `${path.replace(/\/$/, '')}.md`)

export const onRequest = async ({ request, next, env }: Context): Promise<Response> => {
  const wantsMarkdown = /\btext\/markdown\b/i.test(request.headers.get('Accept') ?? '')
  if (wantsMarkdown) {
    const url = new URL(request.url)
    url.pathname = markdownPath(url.pathname)
    const md = await env.ASSETS.fetch(new Request(url, { method: request.method }))
    if (md.ok) {
      return new Response(md.body, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept', 'Cache-Control': 'public, max-age=0, must-revalidate' },
      })
    }
  }
  const page = await next()
  const response = new Response(page.body, page)
  response.headers.append('Vary', 'Accept')
  return response
}
