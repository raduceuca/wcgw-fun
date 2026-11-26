/**
 * What search engines and answer engines read: canonical URLs, page dates and the
 * schema.org graph. Build time only (it shells out to git).
 */
import { execFileSync } from 'node:child_process'
import { tools } from './home/tools'
import { type Page, site } from './site'

export const canonical = (path: string): string => new URL(path, site.url).href

/** Where an agent finds the markdown copy of a page (`Accept: text/markdown` serves the same file). */
export const markdownPath = (path: string): string => (path === '/' ? '/index.md' : `${path}.md`)

const today = (): string => new Date().toISOString().slice(0, 10)

/**
 * The day a page last changed: today if any of its sources has uncommitted edits
 * (a deploy before the commit), else the last commit that touched them.
 */
export function lastModified(sources: string[]): string {
  try {
    const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    if (git('status', '--porcelain', '--', ...sources)) return today()
    return git('log', '-1', '--format=%cs', '--', ...sources) || today()
  } catch {
    return today()
  }
}

/** A page's own date if it shows one, else what git says. */
export const modifiedDate = (page: Page): string => page.modified ?? lastModified(page.sources)

const ids = {
  studio: `${site.url}/#studio`,
  founder: `${site.url}/#founder`,
  website: `${site.url}/#website`,
}

interface PageMeta {
  page: Page
  title: string
  description: string
  /** The share card, a path on the site. */
  image: string
}

/** The schema.org graph for a page: the studio, its founder, the site, the page. */
export function jsonLd({ page, title, description, image }: PageMeta) {
  const url = canonical(page.path)
  const webPage: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': `${url}#page`,
    url,
    name: title,
    description,
    inLanguage: 'en',
    isPartOf: { '@id': ids.website },
    about: { '@id': ids.studio },
    author: { '@id': ids.founder },
    publisher: { '@id': ids.studio },
    datePublished: page.published,
    dateModified: modifiedDate(page),
    primaryImageOfPage: canonical(image),
  }
  if (page.path.startsWith('/stories/')) {
    webPage.mainEntity = {
      '@type': 'Article',
      headline: title.replace(/ WCGW$/, ''), // the page title without the site name
      description,
      image: canonical(image),
      author: { '@id': ids.founder },
      publisher: { '@id': ids.studio },
      datePublished: page.published,
      dateModified: modifiedDate(page),
    }
  }
  if (page.path === '/') {
    webPage.mainEntity = {
      '@type': 'ItemList',
      name: 'Tools for the aftermath',
      itemListElement: tools.map((tool, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'CreativeWork', name: tool.name, description: tool.description, ...(tool.url && { url: tool.url }), creator: { '@id': ids.studio } },
      })),
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ids.studio,
        name: site.name,
        alternateName: 'What could go wrong?',
        url: `${site.url}/`,
        logo: `${site.url}/icon.png`,
        email: site.email,
        description: 'A design studio in Bucharest. Design leadership by the month, and tools for the aftermath of AI.',
        address: { '@type': 'PostalAddress', addressLocality: 'Bucharest', addressCountry: 'RO' },
        founder: { '@id': ids.founder },
        sameAs: site.profiles.studio,
      },
      {
        '@type': 'Person',
        '@id': ids.founder,
        name: site.founder,
        description: 'Designer and builder, former Head of Design at MultiversX.',
        worksFor: { '@id': ids.studio },
        sameAs: site.profiles.founder,
      },
      {
        '@type': 'WebSite',
        '@id': ids.website,
        url: `${site.url}/`,
        name: site.name,
        inLanguage: 'en',
        publisher: { '@id': ids.studio },
        datePublished: site.launched,
      },
      webPage,
    ],
  }
}
