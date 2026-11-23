/** Site settings. */
export const site = {
  url: 'https://wcgw.fun',
  name: 'WCGW',
  twitter: '@wcgwfun',
  /** Public contact. Cloudflare Email Routing on wcgw.fun forwards it. */
  email: 'hello@wcgw.fun',
  /** Microsoft Clarity project. Empty: no tag, no consent banner. Loads in production builds only. */
  clarityId: 'v939g6gw99',
  /** Google Tag Manager Web container. Empty: no tag. Loads in production builds only with Consent Mode v2. */
  gtmId: 'GTM-PGBNWK8Z',
  /** The person behind the studio. Author of every page. */
  founder: 'Radu Ceucă',
  /** Profiles that are the same studio or person: JSON-LD `sameAs` and `<link rel="me">`. */
  profiles: {
    studio: ['https://x.com/wcgwfun'],
    founder: ['https://x.com/raduceuca', 'https://github.com/raduceuca'],
  },
  /** First release of wcgw.fun (the repo's first site commit). */
  launched: '2026-01-29',
}

/**
 * Every public page: the sitemap, canonical URLs, markdown copies for agents and the
 * Pages Function routes all come from this list. `sources` are the files whose last
 * change dates the page.
 */
export const pages = {
  home: {
    path: '/',
    published: site.launched,
    sources: ['src/pages/index.astro', 'src/home/tools.ts'],
  },
  privacy: {
    path: '/privacy',
    published: '2026-11-18',
    /** The notice's own "Updated" date, shown on the page. Bump it when what it says changes. */
    modified: '2026-11-18',
    sources: ['src/pages/privacy.astro'],
  },
  stories: {
    path: '/stories',
    published: '2026-11-23',
    sources: ['src/pages/stories/index.astro'],
  },
  thisIsNotIt: {
    path: '/stories/this-is-not-it',
    published: '2026-11-23',
    sources: ['src/pages/stories/this-is-not-it.astro', 'src/components/StoryDeck.astro', 'src/components/StoryCompare.astro'],
  },
} satisfies Record<string, Page>

export interface Page {
  path: string
  /** ISO date, YYYY-MM-DD. */
  published: string
  /** ISO date. Set only when the page shows its own date; otherwise git dates it from `sources`. */
  modified?: string
  sources: string[]
}
