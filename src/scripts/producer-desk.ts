/*
  The playable desk: 32 faders on one wide board, a transport, a stutter you hold.
  Events (on document), for the page to hook into:
    producer:fader  { name, value, mix }   a reader moved a fader (mix = all 32 channels)
    producer:pan    { name, value }        a reader turned a channel's knob (-100 left .. 100 right)
    producer:play   { playing }            transport started or stopped
    producer:hit    { stems, bar, step, line }   a sixteenth that played, live (line: what she started singing)
    producer:deck   { rate }               the platter's speed, ~45 a second (1 playing, 0 held, <0 backwards)
  And one it listens for:
    producer:load   { mix: { kick: 40, ... }, pans? }   move faders to a mix (motorised), the knobs too
    producer:scratch { phase, deg }        a hand on a record: grab, turn (degrees, clockwise +), release
*/
import { BPM, CH, MY_PAN, stemOf, track, type Channel, type Stem } from './producer-music'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 100) => Math.min(b, Math.max(a, v))
const emit = (type: string, detail: unknown) => document.dispatchEvent(new CustomEvent(type, { detail }))

for (const root of document.querySelectorAll<HTMLElement>('[data-pd]')) {
  // cap centre travel inside the desk, as a fraction of its height (ProducerDesk.astro measures it)
  const TOP = Number(root.dataset.top)
  const BOTTOM = Number(root.dataset.bottom)
  const player = track // the page's one track: the records and the bar play it too
  const chans = [...root.querySelectorAll<HTMLElement>('[data-pd-ch]')]
  const byName = new Map(chans.map((c) => [c.dataset.name as Channel, c]))
  const playBtn = root.querySelector<HTMLButtonElement>('[data-pd-play]')!
  const playLabel = root.querySelector<HTMLElement>('[data-pd-play-label]')!
  const stutterBtn = root.querySelector<HTMLButtonElement>('[data-pd-stutter]')!
  const recallBtn = root.querySelector<HTMLButtonElement>('[data-pd-recall]')!
  const meter = [...root.querySelectorAll<HTMLElement>('[data-pd-meter] i')]
  const pos = root.querySelector<HTMLElement>('[data-pd-pos]')!
  const note = root.querySelector<HTMLElement>('[data-pd-note]')!
  const lyric = root.querySelector<HTMLElement>('[data-pd-lyric]')!

  const value = (c: HTMLElement) => Number(c.getAttribute('aria-valuenow'))
  const mix = () => Object.fromEntries(chans.map((c) => [c.dataset.name, value(c)])) as Record<Channel, number>

  // quiet: move the cap only. The track may already be playing my mix before the desk is in view.
  const set = (c: HTMLElement, v: number, quiet = false) => {
    const val = Math.round(clamp(v))
    c.style.setProperty('--v', String(val / 100))
    c.setAttribute('aria-valuenow', String(val))
    c.setAttribute('aria-valuetext', `${c.dataset.name} at ${val}`)
    if (!quiet) player.set(c.dataset.name as Channel, val)
  }

  // motorised moves: recall, load, the bounce-back after too loud
  const moving = new WeakMap<HTMLElement, number>()
  const glide = (c: HTMLElement, to: number, delay = 0, ms = 900, quiet = false) => {
    const from = value(c)
    if (reduce) return set(c, to, quiet)
    const id = (moving.get(c) ?? 0) + 1
    moving.set(c, id)
    const t0 = performance.now() + delay
    const step = (t: number) => {
      if (moving.get(c) !== id) return // a hand took over
      const k = clamp((t - t0) / ms, 0, 1)
      set(c, from + (to - from) * (1 - Math.pow(1 - k, 4)), quiet)
      if (k < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  const recall = (quiet = false) => chans.forEach((c, i) => glide(c, Number(c.dataset.mix), i * 28, 900, quiet))

  let noteTimer = 0
  const say = (text: string) => {
    note.textContent = text
    note.classList.add('on')
    clearTimeout(noteTimer)
    noteTimer = window.setTimeout(() => note.classList.remove('on'), 2600)
  }
  const tooLoud = (c: HTMLElement) => {
    c.classList.remove('shake')
    void c.offsetWidth
    c.classList.add('shake')
    const allUp = chans.every((x) => value(x) >= 90)
    say(allUp ? 'Everything is loud. So nothing is.' : 'Louder was never the point.')
    setTimeout(() => glide(c, Number(c.dataset.mix), 0, 700), 650)
  }
  const moved = (c: HTMLElement) => emit('producer:fader', { name: c.dataset.name, value: value(c), mix: mix() })

  /* ---------------------------------------------------------- hands on the faders */

  chans.forEach((c) => {
    const cap = c.querySelector<HTMLElement>('[data-pd-cap]')!
    const desk = c.parentElement!
    let drag: { id: number; grab: number } | null = null
    let dragged = false

    // pointer y -> value, keeping where on the cap you grabbed it
    const fromY = (y: number, grab = 0) => {
      const r = desk.getBoundingClientRect()
      const f = (y - r.top) / r.height - grab
      return ((BOTTOM - f) / (BOTTOM - TOP)) * 100
    }
    const capCentre = () => {
      const r = desk.getBoundingClientRect()
      const f = BOTTOM - (value(c) / 100) * (BOTTOM - TOP)
      return r.top + f * r.height
    }

    c.addEventListener('pointerdown', (ev) => {
      const onCap = ev.target === cap
      // on touch, the strip scrolls the page; only the cap is a handle. Taps still jump (below).
      if (ev.pointerType !== 'mouse' && !onCap) return
      ev.preventDefault()
      c.focus({ preventScroll: true })
      moving.set(c, (moving.get(c) ?? 0) + 1)
      const r = desk.getBoundingClientRect()
      drag = { id: ev.pointerId, grab: onCap ? (ev.clientY - capCentre()) / r.height : 0 }
      dragged = true
      c.setPointerCapture(ev.pointerId)
      c.classList.add('held')
      if (!onCap) {
        set(c, fromY(ev.clientY))
        moved(c)
      }
    })
    c.addEventListener('pointermove', (ev) => {
      if (!drag || ev.pointerId !== drag.id) return
      set(c, fromY(ev.clientY, drag.grab))
      moved(c)
    })
    const up = (ev: PointerEvent) => {
      if (!drag || ev.pointerId !== drag.id) return
      drag = null
      c.classList.remove('held')
      if (value(c) >= 96) tooLoud(c)
    }
    c.addEventListener('pointerup', up)
    c.addEventListener('pointercancel', up)
    // a tap on the strip (touch) sends the cap there
    c.addEventListener('click', (ev) => {
      if (dragged) { dragged = false; return }
      moving.set(c, (moving.get(c) ?? 0) + 1)
      glide(c, fromY(ev.clientY), 0, 260)
      setTimeout(() => { moved(c); if (value(c) >= 96) tooLoud(c) }, 280)
    })
    c.addEventListener('keydown', (ev) => {
      const d = ({ ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 20, PageDown: -20 } as Record<string, number>)[ev.key]
      if (ev.key === 'Home') set(c, 0)
      else if (ev.key === 'End') set(c, 100)
      else if (d) set(c, value(c) + d)
      else return
      ev.preventDefault()
      moving.set(c, (moving.get(c) ?? 0) + 1)
      moved(c)
      if (value(c) >= 96) tooLoud(c)
    })
  })

  /* ---------------------------------------------------------- the knobs: pan, one a channel */

  const knobs = [...root.querySelectorAll<HTMLElement>('[data-pd-pan]')]
  const knobOf = new Map(knobs.map((k) => [k.dataset.name as Channel, k]))
  const pv = (k: HTMLElement) => Number(k.getAttribute('aria-valuenow'))
  const setPan = (k: HTMLElement, v: number, quiet = false) => {
    const raw = Math.round(clamp(v, -100, 100))
    const val = Math.abs(raw) < 4 ? 0 : raw // the middle clicks in
    k.style.setProperty('--p', String(val / 100))
    k.setAttribute('aria-valuenow', String(val))
    k.setAttribute('aria-valuetext', val ? `${Math.abs(val)} ${val < 0 ? 'left' : 'right'}` : 'centre')
    if (!quiet) player.setPan(k.dataset.name as Channel, val)
  }
  const panned = (k: HTMLElement) => emit('producer:pan', { name: k.dataset.name, value: pv(k) })
  for (const k of knobs) {
    let drag: { y: number; v: number } | null = null
    k.addEventListener('pointerdown', (ev) => {
      ev.preventDefault()
      drag = { y: ev.clientY, v: pv(k) }
      try {
        k.setPointerCapture(ev.pointerId)
      } catch {}
      k.focus({ preventScroll: true })
    })
    k.addEventListener('pointermove', (ev) => {
      if (!drag) return
      setPan(k, drag.v + (drag.y - ev.clientY) * 1.6) // up turns it right
      panned(k)
    })
    const up = () => (drag = null)
    k.addEventListener('pointerup', up)
    k.addEventListener('pointercancel', up)
    k.addEventListener('dblclick', () => {
      setPan(k, 0)
      panned(k)
    })
    k.addEventListener('keydown', (ev) => {
      const d = ({ ArrowUp: 10, ArrowRight: 10, ArrowDown: -10, ArrowLeft: -10 } as Record<string, number>)[ev.key]
      if (ev.key === 'Home') setPan(k, 0)
      else if (d) setPan(k, pv(k) + d)
      else return
      ev.preventDefault()
      panned(k)
    })
  }
  // the board is wider than a small window: a strip reached by key comes fully into view
  for (const el of [...chans, ...knobs]) {
    el.addEventListener('focus', () => el.matches(':focus-visible') && el.scrollIntoView({ block: 'nearest', inline: 'nearest' }))
  }
  const recallPans = () => knobs.forEach((k) => setPan(k, MY_PAN[k.dataset.name as Channel] ?? 0))

  /* ---------------------------------------------------------- the desk loads my mix when it arrives */

  // a mix someone sent (producer:load before the desk arrived): the track plays it, the motor brings it up
  let sent: Partial<Record<Channel, number>> | null = null
  let arrived = reduce
  if (reduce) {
    chans.forEach((c) => set(c, Number(c.dataset.mix)))
    new IntersectionObserver((e, o) => e.some((x) => x.isIntersecting) && (o.disconnect(), player.prefetch()), { rootMargin: '50%' }).observe(root)
  }
  else {
    // the track plays my mix from the top; the caps start down and the motor brings them up on arrival
    chans.forEach((c) => {
      player.set(c.dataset.name as Channel, Number(c.dataset.mix))
      set(c, 0, true)
    })
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      io.disconnect()
      arrived = true
      if (sent) chans.forEach((c, i) => glide(c, sent![c.dataset.name as Channel] ?? Number(c.dataset.mix), i * 28, 900, true))
      else recall(true)
      if (sent) say('Their mix.')
      player.prefetch()
    }, { threshold: 0.45 })
    io.observe(root)
  }
  recallBtn.addEventListener('click', () => {
    recall()
    recallPans()
    say('Back to my mix.')
  })
  document.addEventListener('producer:load', (ev) => {
    const d = (ev as CustomEvent<{ mix?: Partial<Record<Channel, number>>; pans?: Partial<Record<Channel, number>> }>).detail ?? {}
    const want = d.mix ?? {}
    // the knobs turn at once (the motor is the faders')
    for (const [n, v] of Object.entries(d.pans ?? {})) {
      const k = knobOf.get(n as Channel)
      if (k && typeof v === 'number') setPan(k, v)
    }
    if (!arrived) {
      sent = want
      CH.forEach((n) => typeof want[n] === 'number' && player.set(n, clamp(want[n]!)))
      return
    }
    CH.forEach((n, i) => {
      const c = byName.get(n)
      if (c && typeof want[n] === 'number') glide(c, clamp(want[n]!), i * 22)
    })
  })

  /* ---------------------------------------------------------- transport */

  const buf = new Float32Array(1024)
  let raf = 0
  const draw = () => {
    const lvl = player.meter(buf)
    const lit = Math.round(lvl * meter.length)
    meter.forEach((m, i) => m.classList.toggle('lit', i < lit))
    raf = requestAnimationFrame(draw)
  }

  let shown = false
  const setPlaying = (on: boolean) => {
    if (on === shown) return
    shown = on
    playBtn.setAttribute('aria-pressed', String(on))
    playLabel.textContent = on ? 'Stop' : 'Play'
    stutterBtn.disabled = !on
    if (on) draw()
    else {
      cancelAnimationFrame(raf)
      meter.forEach((m) => m.classList.remove('lit'))
      lyric.classList.remove('on')
      pos.textContent = `${BPM} BPM`
      stutterOff()
    }
    emit('producer:play', { playing: on })
  }
  // the track may be started or stopped from the bar or a record too; the desk shows whatever it does
  player.watch(setPlaying)
  playBtn.addEventListener('click', () => {
    if (player.playing) player.stop(0.8) // the platter runs down, like a turntable switched off
    else void player.play()
  })
  // leaving the tab is a stop, not a background gig
  addEventListener('pagehide', () => player.stop())
  document.addEventListener('visibilitychange', () => document.hidden && player.stop())

  // what played, shown on the caps that played it
  // a stem that played: the caps of its channels that are up
  const byStem = new Map<Stem, HTMLElement[]>()
  for (const c of chans) {
    const s = stemOf(c.dataset.name as Channel)
    if (s) byStem.set(s, [...(byStem.get(s) ?? []), c])
  }
  const deskEl = root.querySelector<HTMLElement>('[data-pd-desk]')!
  // hits animate only while the desk is on screen (the song plays the whole page long)
  let deskSeen = false
  new IntersectionObserver(([e]) => (deskSeen = e.isIntersecting)).observe(root)
  let lyricTimer = 0
  player.onHit = (h) => {
    const beat = Math.floor((h.step % 16) / 4) + 1
    pos.textContent = `Bar ${h.bar + 1} · ${beat}`
    for (const s of deskSeen && !reduce ? h.stems : []) { // reduced motion: nothing pulses on its own
      for (const c of byStem.get(s) ?? []) {
        if (value(c) === 0) continue
        // opacity only (the page's motion rule): the cap dips and comes back on its hit
        c.querySelector('[data-pd-cap]')?.animate([{ opacity: 0.72 }, { opacity: 1 }], { duration: s === 'pad' ? 900 : 180, easing: 'ease-out' })
      }
    }
    if (!reduce && deskSeen && h.stems.includes('kick') && value(byName.get('kick')!) > 0) {
      deskEl.animate([{ transform: 'scale(1.004)' }, { transform: 'scale(1)' }], { duration: 160, easing: 'ease-out' })
    }
    if (h.line) {
      lyric.textContent = `“${h.line}”`
      lyric.classList.toggle('on', value(byName.get('vox')!) > 0)
      clearTimeout(lyricTimer)
      lyricTimer = window.setTimeout(() => lyric.classList.remove('on'), 3600)
    }
    emit('producer:hit', { stems: h.stems, bar: h.bar, step: h.step, line: h.line })
  }

  /* ---------------------------------------------------------- the records on the page are this deck's platter */

  // the-producer.ts sends the hand; the deck (producer-deck.worklet.js) turns it into pitch and tempo
  document.addEventListener('producer:scratch', (ev) => {
    const d = (ev as CustomEvent<{ phase: 'grab' | 'turn' | 'release'; deg?: number }>).detail
    if (d.phase === 'grab') player.grab()
    else if (d.phase === 'turn') player.turn(d.deg ?? 0)
    else player.release()
  })
  player.onRate = (rate) => emit('producer:deck', { rate })

  /* ---------------------------------------------------------- stutter: hold it */

  let held = false
  const stutterOn = () => {
    if (!player.playing || held) return
    held = true
    stutterBtn.classList.add('down')
    player.stutter(true)
  }
  function stutterOff() {
    if (!held) return
    held = false
    stutterBtn.classList.remove('down')
    player.stutter(false)
  }
  stutterBtn.addEventListener('pointerdown', (ev) => { ev.preventDefault(); stutterBtn.setPointerCapture(ev.pointerId); stutterOn() })
  stutterBtn.addEventListener('pointerup', stutterOff)
  stutterBtn.addEventListener('pointercancel', stutterOff)
  stutterBtn.addEventListener('contextmenu', (ev) => ev.preventDefault())
  stutterBtn.addEventListener('keydown', (ev) => { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) { ev.preventDefault(); stutterOn() } })
  stutterBtn.addEventListener('keyup', (ev) => { if (ev.key === ' ' || ev.key === 'Enter') stutterOff() })

  // S anywhere on the page, while the track plays and you are not typing
  const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
  addEventListener('keydown', (ev) => {
    if (ev.key.toLowerCase() !== 's' || ev.repeat || ev.metaKey || ev.ctrlKey || ev.altKey || typing(ev.target)) return
    if (!player.playing) return
    ev.preventDefault()
    stutterOn()
  })
  addEventListener('keyup', (ev) => { if (ev.key.toLowerCase() === 's') stutterOff() })
  addEventListener('blur', stutterOff)
}
