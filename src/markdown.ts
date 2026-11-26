/**
 * Turns a built page into markdown for agents (`Accept: text/markdown`, /index.md).
 * Reads only `<main>`, the way a reader would: decoration marked aria-hidden is left
 * out, screen-reader text is kept. Small on purpose: it knows the tags this site uses.
 */

const VOID = new Set(['br', 'img', 'hr', 'meta', 'link', 'input', 'source', 'wbr'])
/** Never content. */
const SKIP = new Set(['script', 'style', 'template', 'svg', 'button', 'noscript'])
const BLOCK = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'li', 'dt', 'dd', 'blockquote'])
const INLINE: Record<string, [string, string]> = {
  em: ['*', '*'],
  i: ['*', '*'],
  cite: ['*', '*'],
  strong: ['**', '**'],
  b: ['**', '**'],
  s: ['~~', '~~'],
  del: ['~~', '~~'],
  code: ['`', '`'],
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', mdash: '—', ndash: '–', hellip: '…' }
const decode = (text: string) =>
  text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (whole, code: string) => {
    if (code[0] === '#') return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)))
    return ENTITIES[code.toLowerCase()] ?? whole
  })

const attr = (attrs: string, name: string): string | undefined => {
  const m = attrs.match(new RegExp(`(?:^|\\s)${name}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?`, 'i'))
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? '') : undefined
}

interface Frame {
  tag: string
  text: string
  href?: string
}

export function htmlToMarkdown(html: string, base: string): string {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? ''
  const source = main.replace(/<!--[\s\S]*?-->/g, '')

  const out: string[] = []
  const stack: Frame[] = [{ tag: 'root', text: '' }]
  let skipDepth = 0
  let list: 'ul' | 'ol' | null = null
  let term = ''
  let liParts: string[] | null = null
  let inList = false

  const top = () => stack[stack.length - 1]
  /** Source whitespace collapses; only a <br> (BREAK) becomes a line break. */
  const clean = (text: string) => text.replace(/\s+/g, ' ').replace(/ ?\u0000 ?/g, '\n').trim()

  const flush = (tag: string, text: string) => {
    const body = clean(text)
    if (tag === 'li') {
      const parts = [...(liParts ?? []), body].filter(Boolean)
      if (parts.length) item(`${list === 'ol' ? '1.' : '-'} ${parts.join(' — ')}`)
      return
    }
    if (!body) return
    // A paragraph inside a quote is quoted too: marked on its own line, in quote marks inside a list item.
    const quoted = tag === 'blockquote' || stack.some((f) => f.tag === 'blockquote')
    if (liParts) return void liParts.push(quoted && !body.startsWith('“') ? `“${body}”` : body)
    if (tag === 'dt') return void (term = body)
    if (tag === 'dd') return void item(`- **${term}:** ${body}`)
    const heading = tag.match(/^h(\d)$/)
    out.push(heading ? `${'#'.repeat(Number(heading[1]))} ${body}` : quoted ? `> ${body}` : body)
    inList = false
  }
  /** List items sit on consecutive lines, one list per run. */
  const item = (line: string) => {
    if (inList) out[out.length - 1] += `\n${line}`
    else out.push(line)
    inList = true
  }

  for (const [, close, rawTag, attrs = '', text] of source.matchAll(/<(\/)?([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    if (text !== undefined) {
      if (!skipDepth) top().text += decode(text)
      continue
    }
    const tag = rawTag.toLowerCase()
    const selfClosing = VOID.has(tag) || attrs.trimEnd().endsWith('/')

    if (skipDepth) {
      if (selfClosing) continue
      skipDepth += close ? -1 : 1
      continue
    }
    if (!close && (SKIP.has(tag) || attr(attrs, 'aria-hidden') === 'true')) {
      if (!selfClosing) skipDepth = 1
      continue
    }

    if (tag === 'br') {
      top().text += '\u0000'
      continue
    }
    if (selfClosing) continue

    if (!close) {
      if (tag === 'ul' || tag === 'ol') list = tag
      if (tag === 'ul' || tag === 'ol' || tag === 'dl') inList = false
      if (tag === 'li') liParts = []
      if (BLOCK.has(tag) || tag === 'a' || tag in INLINE) {
        stack.push({ tag, text: '', href: tag === 'a' ? attr(attrs, 'href') : undefined })
      } else if (tag === 'div' || tag === 'section') {
        // A block boundary without its own markdown: close any loose text first.
        flush('p', top().text)
        top().text = ''
      }
      continue
    }

    if (tag === 'ul' || tag === 'ol') list = null
    const frame = top()
    if (frame.tag !== tag) {
      if (tag === 'div' || tag === 'section') {
        flush('p', frame.text)
        frame.text = ''
      }
      continue
    }
    stack.pop()
    if (tag === 'a') {
      const label = clean(frame.text)
      const href = frame.href && !frame.href.startsWith('#') ? new URL(frame.href, base).href : undefined
      top().text += href && label ? `[${label}](${href})` : frame.text
    } else if (tag in INLINE) {
      const [open, shut] = INLINE[tag]
      const label = frame.text.trim()
      top().text += label ? `${frame.text.match(/^\s*/)?.[0]}${open}${label}${shut}${frame.text.match(/\s*$/)?.[0]}` : frame.text
    } else {
      flush(tag, frame.text)
      if (tag === 'li') liParts = null
    }
  }
  flush('p', top().text)

  return `${out.join('\n\n')}\n`
}
