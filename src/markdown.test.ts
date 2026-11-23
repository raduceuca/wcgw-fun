import { describe, expect, it } from 'vitest'
import { htmlToMarkdown } from './markdown'

const page = (main: string) => `<html><head><title>x</title></head><body><header>Logo</header><main>${main}</main><footer>©</footer></body></html>`

describe('htmlToMarkdown', () => {
  it('reads main only, as a reader would', () => {
    const md = htmlToMarkdown(
      page(
        '<h1>What could go <span aria-hidden="true"><span>w</span><span>r</span></span><span class="sr-only">wrong?</span></h1>' +
          '<p>Line one.<br/>Line two. <button>Theme</button><svg><path></path></svg></p>',
      ),
      'https://wcgw.fun',
    )
    expect(md).toBe('# What could go wrong?\n\nLine one.\nLine two.\n')
  })

  it('makes links absolute and keeps inline marks', () => {
    const md = htmlToMarkdown(page('<p>See <a href="/privacy">Privacy</a>, <s>a chatbot</s> and <code>_clck</code>. <a href="#tools">Skip</a></p>'), 'https://wcgw.fun')
    expect(md).toBe('See [Privacy](https://wcgw.fun/privacy), ~~a chatbot~~ and `_clck`. Skip\n')
  })

  it('writes lists and definition lists as one run of items', () => {
    const md = htmlToMarkdown(
      page(
        '<ul><li><p><a href="https://x.dev">X</a> <span>Live</span></p><p>Does a thing</p></li><li><p>Y</p></li></ul>' +
          '<dl><dt>Status</dt><dd>Open.</dd><dt>Based in</dt><dd>Bucharest.</dd></dl>',
      ),
      'https://wcgw.fun',
    )
    expect(md).toBe('- [X](https://x.dev/) Live — Does a thing\n- Y\n\n- **Status:** Open.\n- **Based in:** Bucharest.\n')
  })
})
