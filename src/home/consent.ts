/**
 * Cookie consent for Microsoft Clarity. Clarity records without cookies until a yes
 * (the tag is in BaseLayout); the answer lives in one localStorage key.
 */
export const CONSENT_KEY = 'wcgw-consent'
export type Answer = 'yes' | 'no'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const REPLY_MS = 2000
/** Matches the banner's fade-out. */
const LEAVE_MS = 300

export function stored(): Answer | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw === 'yes' || raw === 'no' ? raw : null
  } catch {
    return null
  }
}

/** Remembers the answer and tells Clarity (Consent API v2). Ads are never allowed. */
export function decide(answer: Answer): void {
  try {
    localStorage.setItem(CONSENT_KEY, answer)
  } catch {
    /* private mode: ask again next visit */
  }
  const analytics = answer === 'yes' ? 'granted' : 'denied'
  window.clarity?.('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: analytics,
  })
  window.gtag?.('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analytics,
  })
}

/** Shows the banner when there is no answer yet; `[data-consent-open]` reopens it. */
export function initConsent(): void {
  const banner = document.querySelector<HTMLElement>('[data-consent]')
  const reply = banner?.querySelector<HTMLElement>('[data-consent-reply]')
  if (!banner || !reply) return
  let timer = 0

  const answers = [...banner.querySelectorAll<HTMLElement>('[data-consent-answer]')]

  const open = () => {
    window.clearTimeout(timer)
    banner.classList.remove('is-answered', 'is-leaving')
    answers.forEach(el => el.classList.remove('is-chosen', 'is-cut'))
    reply.textContent = ''
    banner.hidden = false
  }

  if (!stored()) open()

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    if (event.target.closest('[data-consent-open]')) {
      open()
      banner.focus() // the slip, not an answer: no nudge toward yes
      return
    }
    const button = event.target.closest<HTMLElement>('[data-consent-answer]')
    if (!button) return
    decide(button.dataset.consentAnswer === 'yes' ? 'yes' : 'no')
    answers.forEach(el => el.classList.add(el === button ? 'is-chosen' : 'is-cut'))
    banner.classList.add('is-answered')
    reply.textContent = button.dataset.reply ?? ''
    timer = window.setTimeout(() => {
      banner.classList.add('is-leaving')
      timer = window.setTimeout(() => (banner.hidden = true), LEAVE_MS)
    }, REPLY_MS)
  })
}
