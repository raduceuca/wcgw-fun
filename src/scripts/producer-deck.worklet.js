/*
  The deck. The hidden track's mix goes onto a short loop of tape and plays back from it, the way
  DJ software plays a record. Plain JS on purpose: it runs in the audio thread (AudioWorklet), which
  loads it by URL, so Vite ships it as its own same-origin file (it also passes a strict script-src 'self').
  Loaded by Player in producer-music.ts, which sits it between the mix and the master.

  play   the read head sits 256 samples (about 5 ms) behind the write head: the music, live.
  hand   a hand on the record moves the read head. Forward, back, or held still: pitch and tempo
         follow the hand, backwards plays backwards, and a held record is silent.
  slip   let go and the head jumps (12 ms crossfade) to where the beat is now, as with Slip in
         DJ software. The band never drifts and the faders stay instant.
  brake  Stop: the platter runs down to nothing, like a turntable switched off.

  Messages in: { live } { grab } { turn: seconds } { release } { brake: seconds }.
  Message out, about 45 times a second: the platter's speed (1 playing, 0 held, below 0 backwards).
*/
const SECONDS = 4 // how far back a hand can pull the record
const BEHIND = 256
const XF = 0.012
const CATCH = 0.025 // the head reaches where the hand put it in about this long

class Deck extends AudioWorkletProcessor {
  constructor() {
    super()
    this.size = Math.ceil(sampleRate * SECONDS)
    this.tape = [new Float32Array(this.size), new Float32Array(this.size)]
    this.w = 0 // samples written, ever
    this.p = 0 // the read head, in samples
    this.rate = 1
    this.mode = 'play'
    this.target = 0
    this.brakeBy = 0
    this.old = null // the head being faded out after a slip
    this.dc = [0, 0, 0, 0] // DC blocker state: x1, y1 per channel
    this.blocks = 0
    this.port.onmessage = ({ data: m }) => {
      if (m.live) this.slip()
      else if (m.grab && this.mode !== 'brake') {
        this.mode = 'hand'
        this.target = this.p
      } else if (m.turn !== undefined && this.mode === 'hand') this.target += m.turn * sampleRate
      else if (m.release && this.mode === 'hand') this.slip()
      else if (m.brake !== undefined) {
        this.mode = 'brake'
        this.brakeBy = Math.abs(this.rate) / Math.max(1, m.brake * sampleRate)
      }
    }
  }

  slip() {
    const len = Math.round(XF * sampleRate)
    this.old = { p: this.p, rate: this.rate, left: len, len }
    this.p = this.w - BEHIND
    this.rate = 1
    this.mode = 'play'
  }

  read(c, p) {
    const t = this.tape[c]
    const n = this.size
    const i = Math.floor(p)
    const f = p - i
    const a = t[((i % n) + n) % n]
    const b = t[(((i + 1) % n) + n) % n]
    return a + (b - a) * f
  }

  process(inputs, outputs) {
    const inp = inputs[0] || []
    const out = outputs[0]
    const N = out[0].length
    const n = this.size

    // record what the band plays
    for (let c = 0; c < 2; c++) {
      const src = inp[c] || inp[0]
      const t = this.tape[c]
      for (let k = 0; k < N; k++) t[(this.w + k) % n] = src ? src[k] : 0
    }
    this.w += N
    const live = this.w - BEHIND
    const oldest = this.w - n + N * 2

    // how fast the platter turns by the end of this block
    const r0 = this.rate
    let r1 = 1
    if (this.mode === 'hand') {
      this.target = Math.min(live, Math.max(oldest, this.target))
      if (this.p < oldest) this.p = oldest
      const want = Math.max(-8, Math.min(8, (this.target - this.p) / (CATCH * sampleRate)))
      r1 = r0 + (want - r0) * 0.3
    } else if (this.mode === 'brake') {
      r1 = r0 > 0 ? Math.max(0, r0 - this.brakeBy * N) : Math.min(0, r0 + this.brakeBy * N)
    }
    this.rate = r1

    // a turntable is silent when it does not turn
    const loud = (r) => Math.min(1, Math.abs(r) * 4)
    const L = out[0]
    const R = out[1] || out[0]
    for (let k = 0; k < N; k++) {
      const r = r0 + ((r1 - r0) * (k + 1)) / N
      this.p += r
      const g = loud(r)
      let l = this.read(0, this.p) * g
      let rr = this.read(1, this.p) * g
      const o = this.old
      if (o) {
        o.p += o.rate
        const x = (o.left / o.len) * loud(o.rate)
        const keep = 1 - o.left / o.len
        l = l * keep + this.read(0, o.p) * x
        rr = rr * keep + this.read(1, o.p) * x
        if (--o.left <= 0) this.old = null
      }
      // DC blocker, so a record held mid-waveform does not leave an offset behind
      const d = this.dc
      const yl = l - d[0] + 0.9995 * d[1]
      d[0] = l
      d[1] = yl
      const yr = rr - d[2] + 0.9995 * d[3]
      d[2] = rr
      d[3] = yr
      L[k] = yl
      R[k] = yr
    }
    if (this.mode === 'play') this.p = live // locked: no drift, ever

    if (++this.blocks % 8 === 0) this.port.postMessage(r1)
    return true
  }
}

registerProcessor('deck', Deck)
