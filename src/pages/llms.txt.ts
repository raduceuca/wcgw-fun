import type { APIRoute } from 'astro'
import { tools } from '../home/tools'
import { canonical, markdownPath } from '../seo'
import { pages, site } from '../site'

/** The site in brief, for language models (llmstxt.org). Facts only, all of them on the page. */
export const GET: APIRoute = () => {
  const toolLines = tools.map(tool =>
    tool.url ? `- [${tool.name}](${tool.url}): ${tool.description}.` : `- ${tool.name} (coming soon): ${tool.description}.`,
  )
  const body = `# ${site.name}

> ${site.name} (What could go wrong?) is the design studio of ${site.founder} in Bucharest. It sells design leadership by the month: credible, reasoned no's that stop the wrong things before they reach users. It also builds tools for the aftermath of AI-made everything.

- Status: taking monthly engagements.
- Founder: ${site.founder}, designer and builder, former Head of Design at MultiversX.
- Contact: ${site.email}, ${[...site.profiles.studio, ...site.profiles.founder].join(', ')}

## Pages

- [Home](${canonical(markdownPath(pages.home.path))}): the studio, what it says no to, its tools, and how to hire it.
- [Privacy](${canonical(markdownPath(pages.privacy.path))}): what the site records (Microsoft Clarity), the cookies, and how to change your answer.
- [Stories](${canonical(markdownPath(pages.stories.path))}): illustrated stories from the aftermath.
- [The Accidental Manifesto](${canonical(markdownPath(pages.thisIsNotIt.path))}): how one picture for a LinkedIn post became a two-minute film in 25 versions.

## Tools

${toolLines.join('\n')}
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
