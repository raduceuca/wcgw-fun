/*
  The page's track, built up section by section as it is read (the page calls track.arrange()),
  mixed at the desk in B2: 32 channels in eight stems. A live disco band from freely licensed samples
  (band.mp3: drums, bass, guitar, Rhodes, strings, horns), a few synths (Moog, clav, organ, lead), a
  sampled grand. Disco in A minor, 116 BPM: a melodic piano, a lot of room, and a singer
  delivering the most AI sentences ever written. The vocal is one generated a cappella
  (ElevenLabs Music), cut into lines, each anchored to a beat of the singer's own grid.

  The engine takes any BaseAudioContext, so the same code plays live (AudioContext)
  and renders offline (OfflineAudioContext) for previews and tests.
*/

export const STEMS = ['kick', 'snare', 'bass', 'vox', 'keys', 'gtr', 'pad', 'fx'] as const
export type Stem = (typeof STEMS)[number]
export const BPM = 116 // Random Access Memories territory (Get Lucky is 116)
export const STEP = 60 / BPM / 4 // one sixteenth, in seconds
/** a record at 33⅓ rpm: one turn of the platter is 1.8 s of music */
export const TURN = 60 / (100 / 3)
const DECK_URL = new URL('./producer-deck.worklet.js', import.meta.url)
const SWING = 0 // straight. the singer is straight, so are we.

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

/* --------------------------------------------------------------- the song */

type Chord = { bass: number; keys: number[]; gtr: number[] }
// Am9, Dm9, Fmaj9, G6/9. One chord a bar. All diatonic: she sings A, B, C, D, G.
const PROG: Chord[] = [
  { bass: 33, keys: [60, 64, 67, 71], gtr: [69, 72] },
  { bass: 38, keys: [60, 64, 65, 69], gtr: [69, 72] },
  { bass: 41, keys: [60, 64, 67, 69], gtr: [69, 72] },
  { bass: 43, keys: [59, 62, 64, 69], gtr: [67, 71] },
]
// piano melody for the instrumental stretch: [step, midi, length in steps]
const MELODY: [number, number, number][][] = [
  [[0, 76, 3], [4, 72, 2], [6, 74, 2], [8, 76, 5], [14, 79, 2]],
  [[0, 77, 3], [4, 76, 2], [6, 74, 2], [8, 72, 6], [14, 74, 2]],
  [[0, 76, 3], [4, 72, 2], [6, 69, 2], [8, 72, 3], [12, 74, 4]],
  [[0, 74, 3], [4, 71, 2], [6, 67, 2], [8, 71, 4], [12, 74, 2], [14, 76, 2]],
]
// the Rhodes comps: [step, velocity, length in steps], pushed onto the offbeats
const COMP: [number, number, number][] = [[2, 0.6, 2], [7, 0.4, 1], [10, 0.6, 2], [14, 0.45, 1.5]]
// the disco bass, one bar: step -> [interval from the root (or a walk into the next chord), length, velocity]
const BASSLINE: Record<number, [number | 'walk', number, number]> = {
  0: [0, 1.6, 1], 2: [12, 0.8, 0.8], 4: [0, 1.4, 0.9], 6: [12, 0.8, 0.8], 7: [0, 0.5, 0.5],
  8: [0, 1.6, 0.95], 10: [12, 0.8, 0.8], 11: [7, 0.6, 0.6], 12: [0, 1.4, 0.9], 14: [12, 0.8, 0.8], 15: ['walk', 0.8, 0.7],
}
const CLAV = [0, 3, 6, 8, 10, 11, 14]
const GTR = [6, 14]

/* --------------------------------------------------------------- the singer */

// The demos: one singer per lab's cassette (Fig. 1), every one singing the same eight sentences.
// Each is an ElevenLabs Music a cappella, cut into lines: desk/vox.py for the first, voices/voices.py
// (pitched into A minor, cut where it rests, every line checked by transcription) for the rest.
// Timings per line: [offset in its file, length, lead before the beat, first syllable], seconds.
type Line = { at: number; dur: number; lead: number; on: number; text: string }
type Timing = readonly [number, number, number, number]
const TEXT = [
  'Let’s delve into it', 'It’s not just a song, it’s a journey', 'Unlock your potential', 'In today’s fast-paced world',
  'I hope this helps', 'I hope this helps', 'Great question', 'Let me know if you need anything else',
]
const BAR = 16 * STEP
// the lines were cut and measured at 122 BPM; the files are stretched to BPM (voices/retime.py, Rubber
// Band, pitch kept), so every timing stretches by the same ratio
const RETIME = 122 / BPM
// a line is sung every two bars, so none may run longer (the last one, which ends the song, may ring)
const voice = (id: string, lab: string, url: string, t: readonly Timing[]) => ({
  id, lab, url,
  lines: t.map(([at, dur, lead, on], i): Line => {
    const [a, d, l, o] = [at, dur, lead, on].map((x) => x * RETIME)
    return { at: a, dur: i < 7 ? Math.min(d, 2 * BAR - 0.04) : d, lead: l, on: o, text: TEXT[i] }
  }),
})
export type Voice = ReturnType<typeof voice>
const V = '/stories/the-producer/voices'
export const VOICES = [
  voice('chatgpt', 'ChatGPT', '/stories/the-producer/desk/vox.mp3', [
    [0.0, 2.5309, 0.0511, 0.0251], [2.6309, 3.5787, 0.0315, 0.0255], [6.3096, 3.4078, 0.0, 0.04], [9.8174, 3.3001, 0.0412, 0.0252],
    [13.2174, 2.8832, 0.0, 0.241], [16.2006, 2.3016, 0.0438, 0.0248], [18.6022, 2.1449, 0.0568, 0.0248], [20.8471, 3.8944, 0.0, 0.058]]),
  voice('claude', 'Claude', `${V}/claude.mp3`, [
    [0.0, 2.6204, 0.03, 0.03], [2.7204, 3.5085, 0.03, 0.03], [6.3289, 2.7771, 0.03, 0.03], [9.2061, 3.7175, 0.03, 0.03],
    [13.0236, 2.5101, 0.03, 0.03], [15.6337, 2.4985, 0.03, 0.03], [18.2322, 1.6045, 0.03, 0.03], [19.9367, 4.5186, 0.03, 0.03]]),
  voice('gemini', 'Gemini', `${V}/gemini.mp3`, [
    [0.0, 2.7829, 0.03, 0.03], [2.8829, 3.3924, 0.03, 0.03], [6.3754, 2.5101, 0.03, 0.03], [8.9855, 4.1413, 0.03, 0.03],
    [13.2268, 2.87, 0.03, 0.03], [16.1968, 2.8468, 0.03, 0.03], [19.1435, 2.185, 0.03, 0.03], [21.4285, 5.0933, 0.03, 0.03]]),
  voice('grok', 'Grok', `${V}/grok.mp3`, [
    [0.0, 2.9687, 0.03, 0.03], [3.0687, 3.288, 0.03, 0.03], [6.4566, 3.108, 0.03, 0.03], [9.6646, 3.2241, 0.03, 0.03],
    [12.9888, 2.5914, 0.03, 0.03], [15.6801, 2.5856, 0.03, 0.03], [18.3657, 1.2446, 0.03, 0.03], [19.7103, 4.774, 0.03, 0.03]]),
  voice('pi', 'Pi', `${V}/pi.mp3`, [
    [0.0, 2.0515, 0.03, 0.03], [2.1515, 3.7756, 0.03, 0.03], [6.0271, 2.5275, 0.03, 0.03], [8.6546, 3.9033, 0.03, 0.03],
    [12.6579, 3.4041, 0.03, 0.03], [16.1619, 3.2067, 0.03, 0.03], [19.4686, 1.7496, 0.03, 0.03], [21.3183, 3.6537, 0.03, 0.03]]),
  voice('lechat', 'Le Chat', `${V}/lechat.mp3`, [
    [0.0, 1.8309, 0.03, 0.03], [1.9309, 3.0674, 0.03, 0.03], [5.0983, 1.8832, 0.03, 0.03], [7.0814, 2.8468, 0.03, 0.03],
    [10.0282, 2.2721, 0.03, 0.03], [12.4003, 1.9644, 0.03, 0.03], [14.4647, 1.6161, 0.03, 0.03], [16.1808, 3.526, 0.03, 0.03]]),
]
/** the sentences (the same for every singer), timed for the first */
export const LINES: Line[] = VOICES[0].lines
export const VOX_URL = VOICES[0].url

// the singer on the track: the cassette chosen in Fig. 1
let current: Voice = VOICES[0]
export const voiceNow = () => current
// 32 bars: two bars of intro, the verse, eight bars of piano, the hook, a stutter fill.
const SONG: Record<number, number> = { 2: 0, 4: 1, 6: 2, 8: 3, 10: 4, 12: 6, 14: 5, 16: 7, 26: 4, 28: 6, 30: 5 }
const CYCLE = 32

/* --------------------------------------------------------------- the pad: a grand piano in a long room */

// Salamander Grand Piano V3 (Alexander Holm, CC-BY 3.0), nine notes in one file: [midi, offset in seconds]
export const PIANO_URL = '/stories/the-producer/desk/piano.mp3'
const PIANO: [number, number][] = [[48, 0], [51, 3.6], [54, 7.2], [57, 10.8], [60, 14.4], [63, 18], [66, 21.6], [69, 25.2], [72, 28.8]]
const PIANO_LEN = 3.45
const PIANO_SOLO = (b: number) => b >= 18 && b < 26

/*
 * The desk (Fig. 5): 32 channels, eight to a module, each in one of the eight stems the page arranges
 * (null: always in, like the returns and the click). [name, stem, trim (how loud at fader 100, before the
 * fader curve), room send, echo send, my mix]. Left to right, module by module.
 */
export const CHANNELS = [
  ['kick', 'kick', 1.0, 0.02, 0, 70],
  ['snare', 'snare', 0.75, 0.14, 0, 64],
  ['clap', 'snare', 0.75, 0.22, 0, 38],
  ['hat', 'snare', 0.42, 0.04, 0, 56],
  ['open', 'snare', 0.38, 0.06, 0.04, 50],
  ['tamb', 'snare', 0.34, 0.1, 0, 46],
  ['conga', 'snare', 0.6, 0.15, 0, 44],
  ['click', null, 3.5, 0, 0, 40],
  ['bass', 'bass', 0.9, 0, 0, 72],
  ['moog', 'bass', 0.7, 0, 0.05, 48],
  ['sub', 'bass', 0.6, 0, 0, 36],
  ['rhodes', 'keys', 0.3, 0.22, 0.08, 62],
  ['clav', 'keys', 0.6, 0.08, 0.06, 40],
  ['organ', 'keys', 0.5, 0.3, 0, 30],
  ['piano', 'keys', 0.5, 0.3, 0.12, 58],
  ['lead', 'keys', 0.35, 0.3, 0.22, 44],
  ['vox', 'vox', 0.95, 0.32, 0.2, 76],
  ['double', 'vox', 0.7, 0, 0, 34],
  ['voder', 'vox', 1.5, 0, 0, 64],
  ['gtrL', 'gtr', 0.7, 0.18, 0.08, 54],
  ['gtrR', 'gtr', 1.0, 0.22, 0.16, 48],
  ['mute', 'gtr', 1.2, 0.08, 0, 40],
  ['strings', 'pad', 0.45, 0.35, 0, 60],
  ['rips', 'pad', 0.55, 0.35, 0.08, 52],
  ['brass', 'pad', 1.0, 0.22, 0.08, 46],
  ['wash', 'pad', 0.5, 0, 0, 50],
  ['riser', 'fx', 0.6, 0.6, 0.15, 44],
  ['impact', 'fx', 0.6, 0.6, 0.15, 48],
  ['crackle', 'fx', 0.4, 0, 0, 36],
  ['hall', null, 1.1, 0, 0, 58],
  ['echo', null, 1.1, 0, 0, 52],
  ['phaser', null, 1.7, 0, 0, 60],
] as const satisfies readonly (readonly [string, Stem | null, number, number, number, number])[]
export type Channel = (typeof CHANNELS)[number][0]
export const CH = CHANNELS.map((c) => c[0]) as Channel[]
const SPEC = Object.fromEntries(CHANNELS.map((c) => [c[0], c])) as unknown as Record<Channel, (typeof CHANNELS)[number]>
/** a channel's stem (null: the returns and the click, always in) */
export const stemOf = (c: Channel) => SPEC[c][1] as Stem | null
const STEM_CH = Object.fromEntries(STEMS.map((st) => [st, CH.filter((c) => stemOf(c) === st)])) as Record<Stem, Channel[]>
/** my mix: where the desk's faders start */
export const MINE = Object.fromEntries(CHANNELS.map((c) => [c[0], c[5]])) as Record<Channel, number>
/** my pans, -100 (left) to 100 (right): the channel knobs; the rest sit in the middle */
export const MY_PAN: Partial<Record<Channel, number>> = { tamb: -25, conga: 25, rhodes: -15, clav: 30, lead: 15, gtrL: -40, gtrR: 40, mute: -30, brass: -15, rips: 15 }

/*
 * The band: freely licensed one-shots in one file (band.mp3, built by band/band.py in the visuals folder).
 * name -> [offset, length, root midi (null: a drum)]. Drums and percussion: Virtuosity Drums (Versilian
 * Studios, Karoryfer) and VCSL claps, CC0. Bass: Swagbass; guitar: Black And Green Guitars (Karoryfer), CC0.
 * Rhodes: jRhodes3d by Jeff Learman, CC BY 4.0. Strings and horns: VSCO 2 Community Edition, CC0.
 */
export const BAND_URL = '/stories/the-producer/desk/band.mp3'
const BAND: Record<string, [number, number, number | null]> = {"kick": [0.0, 0.55, null], "snare": [0.7, 0.45, null], "clap": [1.3, 0.4, null], "hat": [1.85, 0.14, null], "hat-soft": [2.14, 0.12, null], "open": [2.41, 0.5, null], "tamb": [3.06, 0.4, null], "conga-hi": [3.61, 0.5, null], "conga-lo": [4.26, 0.55, null], "bass-33": [4.96, 1.4, 33], "bass-36": [6.51, 1.4, 36], "bass-39": [8.06, 1.4, 39], "bass-42": [9.6099, 1.4, 42], "bass-45": [11.1599, 1.4, 45], "bass-48": [12.7099, 1.4, 48], "bass-51": [14.2599, 1.4, 51], "gtr-55": [15.8098, 0.35, 55], "gtr-58": [16.3098, 0.35, 58], "gtr-60": [16.8098, 0.35, 60], "gtr-63": [17.3098, 0.35, 63], "gtr-65": [17.8098, 0.35, 65], "gtr-69": [18.3097, 0.35, 69], "gtr-72": [18.8097, 0.35, 72], "rhodes-55": [19.3097, 2.6, 55], "rhodes-59": [22.0597, 2.6, 59], "rhodes-62": [24.8097, 2.6, 62], "rhodes-65": [27.5597, 2.6, 65], "rhodes-71": [30.3097, 2.6, 71], "rhodes-76": [33.0597, 2.6, 76], "str-62": [35.8097, 4.2, 62], "spic-62": [40.1597, 0.4, 62], "str-66": [40.7097, 4.2, 66], "spic-66": [45.0597, 0.4, 66], "str-69": [45.6097, 4.2, 69], "spic-69": [49.9597, 0.4, 69], "str-72": [50.5097, 4.2, 72], "spic-72": [54.8597, 0.4, 72], "str-76": [55.4097, 4.2, 76], "spic-76": [59.7597, 0.4, 76], "str-79": [60.3097, 4.2, 79], "spic-79": [64.6597, 0.4, 79], "tpt-67": [65.2097, 0.55, 67], "tpt-70": [65.9097, 0.55, 70], "tpt-74": [66.6097, 0.55, 74], "tpt-77": [67.3097, 0.55, 77], "tbn-46": [68.0097, 0.55, 46], "tbn-53": [68.7097, 0.55, 53], "tbn-58": [69.4097, 0.55, 58], "tbn-62": [70.1097, 0.55, 62]}
// the pitched instruments, note by note: bass, gtr, rhodes, str, spic, tpt, tbn
const BAND_NOTES: Record<string, [number, number, number][]> = {}
for (const [k, v] of Object.entries(BAND)) if (v[2] !== null) (BAND_NOTES[k.split('-')[0]] ??= []).push(v as [number, number, number])

export type Hit = { step: number; bar: number; stems: Stem[]; time: number; line?: string }
export const KNOBS = ['filter', 'space', 'echo', 'drive'] as const
/** how the band plays in a section (Engine.look) */
export type Look = { pump: number; phaser: number; disco: boolean; robot: number; click: boolean }
/** the whole band, as on your record */
export const FULL: Look = { pump: 0.8, phaser: 0.6, disco: true, robot: 0.3, click: false }
// the voder's level against her dry voice (measured: see docs/the-producer-music.md)
const ROBOT_GAIN = 3
export type Knob = (typeof KNOBS)[number]
export type PadSound =
  | 'line-0' | 'line-1' | 'line-4' | 'line-6'
  | 'kick' | 'clap' | 'hat' | 'conga-hi' | 'conga-lo'
  | 'chord-0' | 'chord-1' | 'chord-2' | 'chord-3'
  | 'riser' | 'impact' | 'again' | 'tape'

export class Engine {
  readonly ctx: BaseAudioContext
  readonly ch = {} as Record<Channel, GainNode>
  private pan = {} as Record<Channel, StereoPannerNode> // each channel's knob, after its fader
  private rvGate = {} as Record<Stem, GainNode>
  private dlGate = {} as Record<Stem, GainNode>
  private band: AudioBuffer | null = null
  private lastLead = 0
  private arr = {} as Record<Stem, GainNode>
  readonly analyser: AnalyserNode
  private noise: AudioBuffer
  // the pump: four depths of the same sidechain (Engine.pump), loop, bass, voice and the room
  private duckLoop!: GainNode
  private melody!: GainNode // the held stutter chops this: keys, grand, guitar, pad, strings (dry; their room rings on)
  private duckLow!: GainNode
  private duckVox!: GainNode
  private duckWet!: GainNode
  private duckUntil = 0
  private pumpBase = 0.4
  private pumpMacro = 0
  // the page's filter on everything but the kick (Engine.sweep), and the build that shuts it before the drop
  private sceneIn!: GainNode
  private sceneB!: BiquadFilterNode
  private sweptTo = 1
  private buildUntil = 0
  private buildBus: GainNode | null = null
  private pendingSweep = 1
  // the disco band (from B1): sequencer bass, guitar chops, strings, a phaser, and the click
  private disco = false
  private clickOn = false
  private phaserIn!: GainNode
  private phaserWet!: GainNode
  private phaserBase = 0
  private phaserMacro = 0
  private chopIn!: DynamicsCompressorNode
  // the voder: her voice played on the bar's chord (or a held chord pad)
  private voxDry!: GainNode
  private robotOut!: GainNode
  private carriers: OscillatorNode[] = []
  private robotBase = 0
  private chordHold: number[] | null = null
  private chordHoldUntil = 0
  private robotUntil = 0
  private voderBuilt = false
  private gate: GainNode
  private mix: GainNode
  private hp: BiquadFilterNode
  private out: GainNode
  private wet: GainNode
  private reverbIn: GainNode
  private delayIn: GainNode
  private crackle: GainNode | null = null
  private djLow!: BiquadFilterNode
  private voderIn!: AudioNode
  private scene!: BiquadFilterNode
  private djHigh!: BiquadFilterNode
  private drive!: WaveShaperNode
  private echoFb!: GainNode
  private level = {} as Record<Channel, number>
  private gates = Object.fromEntries(STEMS.map((s) => [s, { on: true, at: 0 }])) as Record<Stem, { on: boolean; at: number }>
  stutter = false
  /** the line she sang last (AGAIN asks for it again) */
  sung = 0
  private stutterFrom = 0
  private vox: AudioBuffer | null = null
  private lines: Line[] = LINES // the singer's timings (each cassette has its own)
  private grand: AudioBuffer | null = null
  private wash: GainNode
  // the line being sung: which, when it started, its source (so a stutter can cut and resume it)
  private singing: { line: Line; t: number; src: AudioBufferSourceNode } | null = null
  private cuedUntil = 0 // a line the reader asked for (Fig. 2) is being sung: the song's own waits

  constructor(ctx: BaseAudioContext) {
    this.ctx = ctx
    const n = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = n.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    this.noise = n
    // the desk's 32 faders, made first so every voice and return can be wired to its own
    for (const c of CH) {
      this.ch[c] = ctx.createGain()
      this.ch[c].gain.value = 0
      this.level[c] = 0
      this.pan[c] = ctx.createStereoPanner()
      this.pan[c].pan.value = (MY_PAN[c] ?? 0) / 100
      this.ch[c].connect(this.pan[c])
    }

    // master: sum -> gate (where the deck goes in) -> highpass -> glue -> limiter -> out -> analyser
    const sum = ctx.createGain()
    sum.gain.value = 1.9 // makeup into the glue
    this.mix = sum
    this.gate = ctx.createGain()
    this.hp = ctx.createBiquadFilter()
    this.hp.type = 'highpass'
    this.hp.frequency.value = 20
    const glue = ctx.createDynamicsCompressor()
    glue.threshold.value = -14
    glue.knee.value = 8
    glue.ratio.value = 3
    glue.attack.value = 0.005
    glue.release.value = 0.2
    const limit = ctx.createDynamicsCompressor()
    limit.threshold.value = -2
    limit.knee.value = 0
    limit.ratio.value = 20
    limit.attack.value = 0.001
    limit.release.value = 0.08
    this.out = ctx.createGain()
    this.out.gain.value = 0.9
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 1024
    // Fig. 6's knobs on the master: a DJ filter (low-pass one way, high-pass the other) and drive
    this.djLow = ctx.createBiquadFilter()
    this.djLow.type = 'lowpass'
    this.djLow.frequency.value = 20000
    this.djLow.Q.value = 0.9
    this.djHigh = ctx.createBiquadFilter()
    this.djHigh.type = 'highpass'
    this.djHigh.frequency.value = 20
    this.djHigh.Q.value = 0.9
    this.drive = ctx.createWaveShaper()
    this.drive.oversample = 'none'
    // the page's own filter (French house): closed at the front, opened by reading (Player.sweep). Two
    // low-passes in a row, the first resonant mid-sweep so it sings. Everything but the kick goes through
    // it (sceneIn, below), so the floor never goes muffled.
    this.scene = ctx.createBiquadFilter()
    this.scene.type = 'lowpass'
    this.scene.frequency.value = 20000
    this.scene.Q.value = 0.7
    this.sceneB = ctx.createBiquadFilter()
    this.sceneB.type = 'lowpass'
    this.sceneB.frequency.value = 20000
    this.sceneB.Q.value = 0.5
    this.sceneIn = ctx.createGain()
    this.sceneIn.connect(this.scene).connect(this.sceneB).connect(sum)
    sum.connect(this.gate).connect(this.djLow).connect(this.djHigh).connect(this.drive).connect(this.hp).connect(glue).connect(limit).connect(this.out)
    this.out.connect(this.analyser)
    this.out.connect(ctx.destination)

    // the pump: everything but the drums breathes around the kick, each by its own depth
    this.duckLoop = ctx.createGain()
    this.duckLow = ctx.createGain()
    this.duckVox = ctx.createGain()
    this.duckWet = ctx.createGain()
    this.melody = ctx.createGain()
    this.duckLoop.connect(this.melody).connect(this.sceneIn)
    for (const d of [this.duckLow, this.duckVox, this.duckWet]) d.connect(this.sceneIn)

    // the phaser: six all-pass stages swept once every two bars, on the keys, the guitar, the grand and
    // the strings (dry + swept: the notches). Its depth is the page's (Engine.look) plus the filter macro.
    this.phaserIn = ctx.createGain()
    this.phaserWet = ctx.createGain()
    this.phaserWet.gain.value = 0
    this.phaserIn.connect(this.duckLoop)
    const sweepLfo = ctx.createOscillator()
    sweepLfo.frequency.value = BPM / 60 / 8
    const sweepDepth = ctx.createGain()
    sweepDepth.gain.value = 2400
    sweepLfo.connect(sweepDepth)
    let stage: AudioNode = this.phaserIn
    for (const f of [300, 520, 800, 1200, 1700, 2400]) {
      const ap = ctx.createBiquadFilter()
      ap.type = 'allpass'
      ap.frequency.value = f
      ap.Q.value = 0.6
      try {
        ap.detune.automationRate = 'k-rate' // a 0.25 Hz sweep needs no per-sample maths
      } catch {
        // older engines: a-rate it is
      }
      sweepDepth.connect(ap.detune)
      stage.connect(ap)
      stage = ap
    }
    stage.connect(this.phaserWet).connect(this.ch.phaser)
    this.pan.phaser.connect(this.duckLoop)
    sweepLfo.start(0)

    // the guitar chops go through one hard compressor, like a disco rhythm guitar
    this.chopIn = ctx.createDynamicsCompressor()
    this.chopIn.threshold.value = -32
    this.chopIn.ratio.value = 12
    this.chopIn.attack.value = 0.002
    this.chopIn.release.value = 0.08

    // the voder: her voice (the modulator) shapes a saw chord (the carrier), band by band. The bands are
    // persistent nodes, so the bounce has it too. The consonants pass through dry, so words stay words.
    this.voxDry = ctx.createGain()
    this.robotOut = ctx.createGain()
    this.robotOut.gain.value = 0
    this.voxDry.connect(this.duckVox)
    this.robotOut.connect(this.ch.voder)
    this.pan.voder.connect(this.duckVox)
    const mod = ctx.createBiquadFilter()
    mod.type = 'highshelf'
    mod.frequency.value = 3000
    mod.gain.value = 6
    this.voderIn = mod

    // the room: a generated hall and a dotted-eighth ping-pong
    this.wet = ctx.createGain()
    this.wet.connect(this.duckWet)
    this.reverbIn = ctx.createGain()
    const verb = ctx.createConvolver()
    verb.buffer = this.hall(3.4)
    const verbTone = ctx.createBiquadFilter()
    verbTone.type = 'lowpass'
    verbTone.frequency.value = 6500
    this.reverbIn.connect(verb).connect(verbTone).connect(this.ch.hall)
    this.pan.hall.connect(this.wet)

    this.delayIn = ctx.createGain()
    const dl = ctx.createDelay(2)
    const dr = ctx.createDelay(2)
    dl.delayTime.value = dr.delayTime.value = STEP * 4
    const fb = ctx.createGain()
    fb.gain.value = 0.28
    this.echoFb = fb
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 2800
    const pl = ctx.createStereoPanner()
    const pr = ctx.createStereoPanner()
    pl.pan.value = -0.7
    pr.pan.value = 0.7
    this.delayIn.connect(dl)
    dl.connect(dr)
    dr.connect(tone).connect(fb).connect(dl)
    dl.connect(pl).connect(this.ch.echo)
    dr.connect(pr).connect(this.ch.echo)
    this.pan.echo.connect(this.wet)
    dr.connect(this.reverbIn)

    // the wash: piano into a dark room that swells in, so the chord arrives like a pad
    this.wash = ctx.createGain()
    const washTone = ctx.createBiquadFilter()
    washTone.type = 'lowpass'
    washTone.frequency.value = 2400
    const washVerb = ctx.createConvolver()
    washVerb.buffer = this.swell(6)
    const washDry = ctx.createGain()
    washDry.gain.value = 0.1
    const washLow = ctx.createBiquadFilter()
    washLow.type = 'highpass'
    washLow.frequency.value = 170 // leave the low end to the bass
    this.wash.connect(washLow).connect(washTone).connect(washVerb)
    this.wash.connect(washDry)

    // the eight stems the page arranges: a gate each, after the channels' faders (the page brings them in).
    // The kick straight to the mix (under no filter, it drives the pump); the rest through the page's
    // filter, the tonal ones ducked by the pump, the keys, guitars and strings phased.
    for (const st of STEMS) {
      const a = ctx.createGain()
      this.arr[st] = a
      if (st === 'kick') a.connect(sum)
      else if (st === 'snare' || st === 'fx') a.connect(this.sceneIn)
      else if (st === 'bass') a.connect(this.duckLow)
      else if (st === 'vox') a.connect(this.voxDry) // and to the voder, once it is built
      else a.connect(this.phaserIn)
      // the room and the echo hear a stem only while it is in the song, so the sends have gates too
      this.rvGate[st] = ctx.createGain()
      this.rvGate[st].connect(this.reverbIn)
      this.dlGate[st] = ctx.createGain()
      this.dlGate[st].connect(this.delayIn)
    }
    for (const [c, st, , rv, dly] of CHANNELS) {
      // the double and the voder are made from her voice after its gate; the returns and the click are
      // wired where they are made
      if (!st || c === 'double' || c === 'voder') continue
      const g = this.pan[c]
      g.connect(this.arr[st])
      if (rv) {
        const send = ctx.createGain()
        send.gain.value = rv
        g.connect(send).connect(this.rvGate[st])
      }
      if (dly) {
        const send = ctx.createGain()
        send.gain.value = dly
        g.connect(send).connect(this.dlGate[st])
      }
    }
    // the double: her voice again, 28 ms late and drifting a little (ADT), a touch to the right
    const adt = ctx.createDelay(0.1)
    adt.delayTime.value = 0.028
    const drift = ctx.createOscillator()
    drift.frequency.value = 0.37
    const driftDepth = ctx.createGain()
    driftDepth.gain.value = 0.003
    drift.connect(driftDepth).connect(adt.delayTime)
    drift.start(0)
    const adtPan = ctx.createStereoPanner()
    adtPan.pan.value = 0.35
    this.arr.vox.connect(adt).connect(adtPan).connect(this.ch.double)
    this.pan.double.connect(this.duckVox)
    this.pan.click.connect(this.sceneIn)
    this.chopIn.connect(this.ch.gtrL)
    washVerb.connect(this.ch.wash)
    washDry.connect(this.ch.wash)
  }

  setVox(buf: AudioBuffer, lines: Line[] = LINES) {
    this.vox = buf
    this.lines = lines
  }
  setPiano(buf: AudioBuffer) {
    this.grand = buf
  }

  /** the band's samples (band.mp3); until they arrive, every part plays on its synth */
  setBand(buf: AudioBuffer) {
    this.band = buf
  }

  /** a channel's knob: -100 (left) to 100 (right) */
  setPan(c: Channel, v: number, now = this.ctx.currentTime) {
    this.pan[c].pan.setTargetAtTime(Math.max(-1, Math.min(1, v / 100)), now, 0.03)
  }

  /** fader position 0..100 for a channel */
  set(c: Channel, v: number, now = this.ctx.currentTime) {
    const x = Math.max(0, Math.min(100, v)) / 100
    this.level[c] = x
    this.ch[c].gain.setTargetAtTime(x * x * SPEC[c][2] * 1.6, now, 0.03)
  }

  /**
   * Fig. 6's knobs, 0..1 each. filter: 0.5 is open, down is low-pass, up is high-pass. space and echo:
   * 0.5 is the song as written, 0 dry, 1 about three times as much. drive: 0 clean, 1 hot.
   */
  knob(name: Knob, v: number, now = this.ctx.currentTime) {
    const x = Math.max(0, Math.min(1, v))
    const to = (p: AudioParam, val: number) => p.setTargetAtTime(val, now, 0.04)
    if (name === 'filter') {
      // one macro: down is a resonant low-pass that also pumps harder and phases as it closes; up is a
      // high-pass; the middle is clean
      to(this.djLow.frequency, x < 0.5 ? 180 * (20000 / 180) ** (x / 0.5) : 20000)
      to(this.djHigh.frequency, x > 0.5 ? 20 * (2500 / 20) ** ((x - 0.5) / 0.5) : 20)
      to(this.djLow.Q, 0.9 + 5 * Math.exp(-(((x - 0.25) / 0.15) ** 2)))
      const closed = x < 0.5 ? (0.5 - x) / 0.5 : 0
      this.pumpMacro = closed * 0.3
      this.phaserMacro = closed * 0.4
      this.writePhaser(now)
    } else if (name === 'space') to(this.reverbIn.gain, (x * 2) ** 1.6)
    else if (name === 'echo') {
      to(this.delayIn.gain, (x * 2) ** 1.6)
      to(this.echoFb.gain, 0.28 + Math.max(0, x - 0.5) * 0.6)
    } else {
      const k = x * 6
      const curve = new Float32Array(1024)
      for (let i = 0; i < curve.length; i++) {
        const s = (i / 1023) * 2 - 1
        curve[i] = k < 0.01 ? s : Math.tanh(s * (1 + k)) / Math.tanh(1 + k)
      }
      this.drive.curve = k < 0.01 ? null : curve
      this.drive.oversample = k < 0.01 ? 'none' : '2x'
    }
  }

  /** a pad on Fig. 6, or a drum on Fig. 4, at t. Each goes through its stem, so the desk mixes it too. */
  hit(sound: PadSound, t: number) {
    switch (sound) {
      case 'kick': return this.kick(t)
      case 'clap': return this.clap(t)
      case 'hat': return this.hat(t, true, 0.9)
      case 'conga-hi': return this.conga(t, true)
      case 'conga-lo': return this.conga(t, false)
      case 'riser': return this.riser(t, 16 * STEP)
      case 'impact': return this.impact(t)
      default:
        if (sound.startsWith('chord-')) {
          const ch = PROG[Number(sound.slice(6))]
          this.rhodes(t, ch.keys, 0.85, STEP * 3)
          this.bass(t, ch.bass, STEP * 3)
        } else if (sound.startsWith('line-')) this.cue(Number(sound.slice(5)), t)
    }
  }

  /** a hand drum from Fig. 4, and the band's congas: sampled once the band is in, else a pitched thump */
  private conga(t: number, high: boolean, vel = 1) {
    if (this.play(high ? 'conga-hi' : 'conga-lo', t, this.ch.conga, vel, { pan: high ? 0.4 : 0.25 })) return
    const c = this.ctx
    const f = high ? 330 : 215
    const o = c.createOscillator()
    o.frequency.setValueAtTime(f * 1.45, t)
    o.frequency.exponentialRampToValueAtTime(f, t + 0.03)
    o.connect(this.env(t, 0.75 * vel, 0.002, high ? 0.22 : 0.32, this.ch.conga))
    o.start(t)
    o.stop(t + 0.45)
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = high ? 2300 : 1500
    bp.Q.value = 1.1
    this.noiseSrc(t, 0.03).connect(bp).connect(this.env(t, 0.2 * vel, 0.001, 0.03, this.ch.conga))
  }

  /**
   * The last word: she sings her closing line over the first chord (the grand and the bass, held),
   * then the needle runs into the groove. Returns when the groove starts.
   */
  finale(t: number) {
    const last = this.lines.length - 1 // “Let me know if you need anything else”
    this.robot(0, t) // the last word is hers, not the robot's
    this.cue(last, t)
    this.pad(t, PROG[0].keys, 32 * STEP)
    this.bass(t, PROG[0].bass, 8 * STEP, 0.8)
    const groove = t + this.lines[last].dur + 0.8
    this.runout(groove, 3)
    return groove
  }

  /** the run-out groove: the music is over, the needle clicks once a turn, the crackle goes on */
  runout(t: number, turns: number) {
    const c = this.ctx
    for (let k = 0; k < turns; k++) {
      const at = t + k * TURN
      const bp = c.createBiquadFilter()
      bp.type = 'lowpass'
      bp.frequency.value = 900
      this.noiseSrc(at, 0.02).connect(bp).connect(this.env(at, 0.5, 0.001, 0.02, this.mix))
    }
    this.crackle?.gain.setTargetAtTime(0.05, t, 0.3)
  }

  /** she sings line i at t (the beat), in the band, cutting whatever she was singing */
  cue(i: number, t: number) {
    const l = this.lines[i % this.lines.length]
    this.sung = i % this.lines.length
    if (!this.vox) return l
    if (this.robotUntil > t) {
      // a plain line after a robot one is hers again
      this.robotUntil = 0
      this.robot(this.robotBase, t)
    }
    this.singing?.src.stop(t)
    this.singing = { line: l, t, src: this.sample(t - l.lead, l.at, l.dur) }
    this.cuedUntil = t + l.dur
    return l
  }

  /**
   * Whether a stem can be heard at t: in the arrangement (or not long out of it, its tail still ringing)
   * and its fader up. Voices for a silent stem are not built at all, which is most of the work on a phone.
   */
  audible(stem: Stem, t: number) {
    if (!STEM_CH[stem].some((c) => this.level[c] > 0)) return false
    const g = this.gates[stem]
    return g.on ? t >= g.at - 0.05 : t < g.at + 1.5
  }

  /** a channel that can be heard at t: its fader up and its stem in (or no stem: always in) */
  private on(c: Channel, t: number) {
    const st = stemOf(c)
    return this.level[c] > 0 && (!st || this.audible(st, t))
  }

  /** the arrangement: bring a stem in (or take it out) from t, settling within about a beat. at once: no glide. */
  open(stem: Stem, on: boolean, t: number, atOnce = false) {
    this.gates[stem] = { on, at: t }
    for (const p of [this.arr[stem].gain, this.rvGate[stem].gain, this.dlGate[stem].gain]) {
      p.cancelScheduledValues(t)
      if (atOnce) p.setValueAtTime(on ? 1 : 0, t)
      else p.setTargetAtTime(on ? 1 : 0, t, 0.18)
    }
  }

  /** the band steps back while she sings raw in the booth (Fig. 1, Fig. 2) */
  stepBack(on: boolean, level = 0.55, now = this.ctx.currentTime) {
    this.mix.gain.setTargetAtTime(on ? level : 1.9, now, 0.12)
  }

  /** put a node between the mix and the master: the live deck (producer-deck.worklet.js) */
  insert(node: AudioNode) {
    this.mix.disconnect(this.gate)
    this.mix.connect(node).connect(this.gate)
  }

  /**
   * The filter build, the French house way: 0 is the whole band through a closed, resonant low-pass
   * (as if from the next room), 1 is wide open. The resonance falls away as it opens.
   */
  sweep(x: number, now = this.ctx.currentTime, atOnce = false) {
    this.pendingSweep = x
    if (now < this.buildUntil) return // the build has the filter until the drop (then the page has it back)
    const k = Math.max(0, Math.min(1, x))
    const f = 260 * (20000 / 260) ** (k ** 1.6)
    // closing takes its time, opening is quick; the first setting (the track starting) is just where it is
    const tc = atOnce ? 0.001 : k < this.sweptTo ? 0.5 : 0.08
    this.sweptTo = k
    this.scene.frequency.setTargetAtTime(f, now, tc)
    this.sceneB.frequency.setTargetAtTime(Math.min(20000, f * 1.3), now, tc)
    // it sings on the way: most resonant about a third open
    this.scene.Q.setTargetAtTime(0.7 + 7.5 * Math.exp(-(((k - 0.35) / 0.22) ** 2)), now, tc)
  }

  /**
   * How the band plays, set by the page per section: pump (0..1), phaser (0..1), disco (the French band
   * from B1), robot (the voder under her, 0..1), click (the click track under the intro).
   */
  look(o: Partial<Look>, now = this.ctx.currentTime) {
    if (o.pump !== undefined) this.pumpBase = o.pump
    if (o.phaser !== undefined) {
      this.phaserBase = o.phaser
      this.writePhaser(now)
    }
    if (o.disco !== undefined) this.disco = o.disco
    if (o.click !== undefined) this.clickOn = o.click
    if (o.robot !== undefined) {
      this.robotBase = o.robot
      // a robot line still being sung keeps the robot; the new share takes over when it ends
      this.robot(o.robot, Math.max(now, this.robotUntil))
    }
  }
  private writePhaser(now: number) {
    this.phaserWet.gain.setTargetAtTime(Math.min(1, this.phaserBase + this.phaserMacro) * 0.85, now, 0.2)
  }
  /**
   * The voder's bands, built the first time the robot is wanted (it is most of the always-on graph, so a
   * reader who never meets the robot never pays for it). Her voice reaches it from then on.
   */
  private voder() {
    if (this.voderBuilt) return
    this.voderBuilt = true
    const ctx = this.ctx
      const carrier = ctx.createGain()
      carrier.gain.value = 0.2
      for (let i = 0; i < 5; i++) {
        const o = ctx.createOscillator()
        o.type = 'sawtooth'
        o.detune.value = i % 2 ? 6 : -6
        o.connect(carrier)
        o.start(0)
        this.carriers.push(o)
      }
      this.tune(PROG[0].keys, PROG[0].bass, ctx.currentTime)
      const abs = new Float32Array(2049)
      for (let i = 0; i < abs.length; i++) abs[i] = Math.abs(i / 1024 - 1)
      const many = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 4) > 4
      const bands = many ? 14 : 10
      const bp = (from: AudioNode, f: number) => {
        const a = ctx.createBiquadFilter()
        a.type = 'bandpass'
        a.frequency.value = f
        a.Q.value = 4
        const b = ctx.createBiquadFilter()
        b.type = 'bandpass'
        b.frequency.value = f
        b.Q.value = 4
        from.connect(a).connect(b)
        return b
      }
      for (let i = 0; i < bands; i++) {
        const f = 150 * (7000 / 150) ** (i / (bands - 1))
        const rect = ctx.createWaveShaper()
        rect.curve = abs
        const smooth1 = ctx.createBiquadFilter()
        smooth1.type = 'lowpass'
        smooth1.frequency.value = 30
        const smooth2 = ctx.createBiquadFilter()
        smooth2.type = 'lowpass'
        smooth2.frequency.value = 30
        const amp = ctx.createGain()
        amp.gain.value = 12
        bp(this.voderIn, f).connect(rect).connect(smooth1).connect(smooth2).connect(amp)
        const band = ctx.createGain()
        band.gain.value = 0
        amp.connect(band.gain)
        bp(carrier, f).connect(band).connect(this.robotOut)
      }
      const sss = ctx.createBiquadFilter()
      sss.type = 'highpass'
      sss.frequency.value = 5000
      const sssGain = ctx.createGain()
      sssGain.gain.value = 0.25
      this.voderIn.connect(sss).connect(sssGain).connect(this.robotOut)
    this.arr.vox.connect(this.voderIn)
  }

  /** the voder's share of her voice, 0 (her) to 1 (the robot) */
  private robot(x: number, t: number) {
    if (x > 0) this.voder()
    for (const [p, v] of [[this.robotOut.gain, x * ROBOT_GAIN], [this.voxDry.gain, 1 - 0.7 * x]] as const) {
      p.cancelScheduledValues(t)
      p.setTargetAtTime(v, t, 0.03)
    }
  }
  /** the carrier: the chord's four notes and its root an octave down */
  private tune(notes: readonly number[], root: number, t: number) {
    if (!this.carriers.length) return
    const all = [...notes.slice(0, 4), root + 12]
    this.carriers.forEach((o, i) => o.frequency.setValueAtTime(hz(all[i] ?? all[0]), t))
  }

  /** she sings line i on the beat t as the robot, on the chord she is given (a held chord pad) */
  robotLine(i: number, t: number, chord: number) {
    const ch = PROG[chord % PROG.length]
    this.chordHold = [...ch.keys]
    this.tune(ch.keys, ch.bass, t)
    this.robot(1, t)
    const l = this.cue(i, t)
    this.chordHoldUntil = t + l.dur
    this.robotUntil = t + l.dur
    this.robot(this.robotBase, t + l.dur)
  }

  /**
   * The build into the drop (B3 to B4): a bar of riser and clap roll while the filter shuts, then on the
   * one everything lands, wide open, with an impact. Returns when the drop lands.
   */
  build(t: number) {
    const BAR = 16 * STEP
    if (this.ctx.currentTime < this.buildUntil) return this.buildUntil - 0.02 // already building
    // the build's own sounds go through one gain, so leaving B4 before the drop can take them back
    const bus = this.ctx.createGain()
    bus.connect(this.ch.riser)
    this.buildBus = bus
    this.riser(t, BAR, bus)
    for (const [k, v] of [[8, 0.35], [10, 0.45], [12, 0.55], [13, 0.62], [14, 0.72], [15, 0.85]] as const) this.clap(t + k * STEP, v, bus)
    this.buildUntil = t + BAR + 0.02
    this.scene.frequency.cancelScheduledValues(t)
    this.scene.frequency.setTargetAtTime(380, t, BAR / 3)
    this.scene.Q.setTargetAtTime(7, t, BAR / 3)
    this.scene.frequency.setValueAtTime(20000, t + BAR)
    this.scene.Q.setValueAtTime(0.7, t + BAR)
    this.sceneB.frequency.setValueAtTime(20000, t + BAR)
    this.sweptTo = 1
    this.impact(t + BAR, bus)
    return t + BAR
  }

  /** back out of the build before the drop (the reader left B4): its sounds fade, the filter is the page's again */
  cancelBuild(now = this.ctx.currentTime) {
    if (now >= this.buildUntil) return
    this.buildBus?.gain.setTargetAtTime(0, now, 0.05)
    for (const p of [this.scene.frequency, this.scene.Q, this.sceneB.frequency]) p.cancelScheduledValues(now)
    this.buildUntil = 0
    this.sweep(this.pendingSweep, now)
  }

  /**
   * A new singer mid-phrase: from the beat t she carries on from where the last one was in the same line,
   * with a short tape wow, like a tape swap. False if nobody was singing (she starts on her next line).
   */
  swapVoice(buf: AudioBuffer, lines: Line[], t: number) {
    const sing = this.singing
    const idx = sing ? this.lines.indexOf(sing.line) : -1
    this.vox = buf
    this.lines = lines
    if (!sing || idx < 0) return false
    const start = sing.t - sing.line.lead
    if (t <= start || t >= start + sing.line.dur - 0.15) return false
    const nl = lines[idx]
    const into = (t - start) * (nl.dur / sing.line.dur)
    if (into >= nl.dur - 0.1) return false
    sing.src.stop(t)
    const src = this.sample(t, nl.at + into, nl.dur - into)
    src.playbackRate.setValueAtTime(1, t)
    src.playbackRate.linearRampToValueAtTime(0.94, t + 0.06)
    src.playbackRate.linearRampToValueAtTime(1, t + 0.12)
    this.singing = { line: nl, t: sing.t, src }
    return true
  }

  /** the crackle off (stopped), or back on (the next start) */
  quiet(t: number, off = true) {
    this.crackle?.gain.setTargetAtTime(off ? 0 : 0.05, t, 0.1)
  }

  /** sound on at once, for a pad played with the track stopped */
  wake(now = this.ctx.currentTime) {
    this.out.gain.cancelScheduledValues(now)
    this.out.gain.setValueAtTime(0.9, now)
  }

  fadeIn(t: number) {
    this.out.gain.cancelScheduledValues(t)
    this.out.gain.setValueAtTime(0, t)
    this.out.gain.linearRampToValueAtTime(0.9, t + 0.25)
  }
  fadeOut(t: number) {
    this.out.gain.cancelScheduledValues(t)
    this.out.gain.setTargetAtTime(0, t, 0.08)
  }

  startCrackle(t: number) {
    if (this.crackle) return
    const src = this.ctx.createBufferSource()
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate)
    const d = b.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.9 : (Math.random() * 2 - 1) * 0.012
    src.buffer = b
    src.loop = true
    const f = this.ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 3000
    f.Q.value = 0.6
    this.crackle = this.ctx.createGain()
    this.crackle.gain.value = 0.05
    src.connect(f).connect(this.crackle).connect(this.ch.crackle)
    src.start(t)
  }

  /* ------------------------------------------------------------ stutter */

  setStutter(on: boolean, now = this.ctx.currentTime) {
    if (on === this.stutter) return
    this.stutter = on
    // stutter house: the melodic part is chopped on the sixteenths (in step()), the drums, the bass and
    // her voice carry on untouched. Letting go opens it straight back up.
    const g = this.melody.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    if (on) this.stutterFrom = now
    else g.setTargetAtTime(1, now, 0.01)
  }

  /* ------------------------------------------------------------ the sequencer */

  /** schedule one sixteenth. step counts from 0 forever. */
  step(step: number, t: number): Hit {
    const s = step % 16
    const bar = Math.floor(step / 16)
    const ch = PROG[bar % 4]
    const fill = bar % 8 === 7 && s >= 8
    const hits: Stem[] = []
    if (s % 2) t += SWING * STEP

    // the carrier follows the bar's chord, unless a held chord pad has it
    if (s === 0) {
      const held = this.chordHold && t < this.chordHoldUntil
      this.tune(held ? this.chordHold! : ch.keys, ch.bass, t)
    }
    // the click track, Giorgio's: a quiet tick on every beat under the intro, before the drums
    if (this.clickOn && s % 4 === 0) this.click(t, s === 0)

    // the kit, live and dry: the kick on every beat (out for the last two beats of the fill), the snare on
    // 2 and 4 with a clap under it, closed hats on the sixteenths, the open hat on every "and"
    if (s % 4 === 0 && !(fill && s >= 8 && bar % 16 === 15)) {
      if (this.on('kick', t)) this.kick(t)
      else this.pump(t)
      hits.push('kick')
    }
    if (s === 4 || s === 12) {
      if (this.on('snare', t)) this.snare(t, 0.95)
      if (this.on('clap', t)) this.clap(t, 0.75)
      hits.push('snare')
    }
    if (fill && s >= 13 && this.on('snare', t)) this.snare(t, 0.3 + (s - 13) * 0.15) // a pickup into the next eight
    if (s % 4 === 2) {
      if (this.on('open', t)) this.hat(t, true, 0.7)
    } else if (this.on('hat', t)) this.hat(t, false, s % 4 === 0 ? 0.6 : s % 2 ? 0.32 : 0.48)
    // the tambourine on 2 and 4, a shake on the last sixteenth of every beat
    if ((s === 4 || s === 12 || s % 4 === 3) && this.on('tamb', t)) this.tamb(t, s % 4 === 3 ? 0.45 : 0.8)
    // from B1, the congas: a call and an answer over two bars
    if (this.disco && this.on('conga', t)) {
      if ((bar % 2 ? [3, 10] : [3, 6, 11]).includes(s)) this.conga(t, true, 0.65)
      if ((bar % 2 ? [7, 14, 15] : [14]).includes(s)) this.conga(t, false, 0.7)
    }

    const cb = bar % CYCLE
    const next = PROG[(bar + 1) % 4]
    // bass: the octave disco line on the fingered bass (the root on the beat, the octave on the "and", a
    // walk into the next chord); from B1 Giorgio's sequencer on the Moog under it; a sine sub on 1 and 3
    const bl = BASSLINE[s]
    if (bl && this.on('bass', t)) {
      const [iv, len, vel] = bl
      const midi = iv === 'walk' ? next.bass + (next.bass > ch.bass ? -1 : 1) : ch.bass + iv
      this.bass(t, midi, STEP * len, vel)
      if (s % 4 === 0) hits.push('bass')
    }
    if (this.disco && this.on('moog', t)) {
      const fifth = s >= 12 && bar % 2 === 1 ? 7 : 0
      this.seqBass(t, ch.bass + fifth + (s % 2 ? 12 : 0), s % 4 === 0 ? 1 : s % 2 ? 0.62 : 0.8)
    }
    if ((s === 0 || s === 8) && this.on('sub', t)) this.sub(t, ch.bass, STEP * 6)

    // keys: the Rhodes comps on the offbeats; while she rests (the piano stretch) the grand plays the
    // melody and, from B1, the Moog lead doubles it an octave up; from B1 the clav picks the sixteenths
    // and the organ holds the bar's chord
    for (const [at, vel, len] of COMP) if (at === s && this.on('rhodes', t)) { this.rhodes(t, ch.keys, vel, STEP * len); hits.push('keys') }
    if (PIANO_SOLO(cb)) for (const [at, n, len] of MELODY[bar % 4]) if (at === s) {
      if (this.on('piano', t)) this.grandNote(t, n - 12, 0.85, STEP * len)
      if (this.disco && this.on('lead', t)) this.lead(t, n, STEP * len)
      hits.push('keys')
    }
    if (this.disco && CLAV.includes(s) && this.on('clav', t)) this.clav(t, ch.keys[(s >> 1) % ch.keys.length] + 12, s % 4 === 0 ? 0.9 : 0.6)
    if (this.disco && s === 0 && this.on('organ', t)) this.organ(t, ch.keys, STEP * 15.5)

    // the singer. lines start a hair early (lead) so the beat lands where she put it.
    let line: string | undefined
    if (s === 0 && SONG[cb] !== undefined && t >= this.cuedUntil && this.vox && this.audible('vox', t)) {
      const l = this.lines[SONG[cb]]
      const at = t - l.lead
      this.singing?.src.stop(Math.max(at, this.ctx.currentTime)) // AGAIN or a jump: never two of her
      this.singing = { line: l, t, src: this.sample(at, l.at, l.dur) }
      this.sung = SONG[cb]
      line = l.text
      hits.push('vox')
    }
    // the stutter fill: "I-I-I-I hope", rising in the last beat
    if (cb === CYCLE - 1 && s >= 8) {
      const l = this.lines[4]
      const sub = s >= 12 ? 2 : 1
      for (let k = 0; k < sub; k++) {
        const rate = s >= 12 ? 2 ** ((s - 12) * 2 / 12 + k / 12) : 1
        this.sample(t + (k * STEP) / sub, l.at + l.on - 0.01, (STEP / sub) * 0.85, rate)
      }
      hits.push('vox')
    }

    // guitar: right, single notes on the offbeats; from B1, left, the chicken scratch (the chord on every
    // "and", a lighter one on the "e"), and the mute channel scratching the strings in between
    if (this.audible('gtr', t)) {
      const gi = GTR.indexOf(s)
      if (gi >= 0 && this.on('gtrR', t)) this.pluck(t, ch.gtr[gi % ch.gtr.length], gi % 2 ? 0.25 : -0.25)
      if (this.disco) {
        if (s % 4 === 2 && this.on('gtrL', t)) this.chop(t, ch.keys, 0.9)
        else if (s % 4 === 1 && this.on('gtrL', t)) this.chop(t, ch.keys, 0.45)
        else if (this.on('mute', t)) this.mute(t, s % 4 === 0 ? 0.8 : 0.5)
      }
      if (s % 4 === 2) hits.push('gtr')
    }

    // the wash (the grand in a long room) holds the bar; from B1 the strings: a bed on every chord, a rip
    // into every eighth bar, a fall at every sixteenth, stabs on the last "and" of the odd bars; and in
    // the hook, the horns
    // the wash is the bed until the strings come in; then it steps back under them (two beds are mud)
    if (s === 0 && this.on('wash', t)) { this.pad(t, ch.keys, STEP * 16, this.disco && this.on('strings', t) ? 0.4 : 1); hits.push('pad') }
    if (this.disco && this.audible('pad', t)) {
      if (s === 0 && this.on('strings', t)) this.strings(t, ch.keys, STEP * 16, 'hold')
      if (this.on('rips', t)) {
        if (s === 14 && bar % 8 === 7) this.strings(t, next.keys, STEP * 2, 'rip')
        if (s === 12 && bar % 16 === 15) this.strings(t, ch.keys, STEP * 4, 'fall')
        if (s === 14 && bar % 2 === 1 && bar % 8 !== 7) this.spic(t, next.keys, 0.7)
      }
      if (cb >= 24 && this.on('brass', t)) {
        if (s === 0 && bar % 2 === 0) this.brass(t, ch.keys, 0.85)
        if (s === 14 && bar % 2 === 1) this.brass(t, next.keys, 0.7)
      }
    }

    // fx: a riser into every 8, a soft impact on the one
    if (bar % 8 === 7 && s === 0 && this.on('riser', t)) this.riser(t, STEP * 16)
    if (bar % 8 === 0 && s === 0 && this.on('impact', t)) { this.impact(t); hits.push('fx') }

    // held stutter: the melodic part opens on every sixteenth and dips after half of it, a little deeper
    // the longer it is held (to about a quarter over the first bar). Soft edges, so it pulses, never clicks.
    if (this.stutter) {
      const g = this.melody.gain
      const held = Math.min(1, (t - this.stutterFrom) / (STEP * 16))
      g.setTargetAtTime(1, t, 0.004)
      g.setTargetAtTime(0.55 - 0.3 * held, t + STEP * 0.5, 0.012)
      hits.push('keys')
    }

    return { step, bar, stems: hits, time: t, line }
  }

  /* ------------------------------------------------------------ voices */

  private env(t: number, peak: number, attack: number, decay: number, dest: AudioNode) {
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
    g.connect(dest)
    return g
  }

  private noiseSrc(t: number, dur: number) {
    const src = this.ctx.createBufferSource()
    src.buffer = this.noise
    src.start(t, Math.random() * 1.5, dur + 0.05)
    return src
  }

  private kick(t: number) {
    if (this.play('kick', t, this.ch.kick)) return this.pump(t)
    const c = this.ctx
    const o = c.createOscillator()
    o.frequency.setValueAtTime(165, t)
    o.frequency.exponentialRampToValueAtTime(48, t + 0.09)
    o.frequency.exponentialRampToValueAtTime(42, t + 0.4)
    o.connect(this.env(t, 1, 0.002, 0.42, this.ch.kick))
    o.start(t)
    o.stop(t + 0.5)
    const click = this.noiseSrc(t, 0.01)
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2500
    click.connect(hp).connect(this.env(t, 0.25, 0.001, 0.012, this.ch.kick))
    this.pump(t)
  }

  /** the pump: every tonal stem dips on the kick and swells back, the French house breath */
  private pump(t: number) {
    const d = Math.min(1, this.pumpBase + this.pumpMacro)
    // a kick inside the last curve (a pad on a sixteenth) rides it: curves may not overlap
    if (d < 0.02 || t < this.duckUntil) return
    for (const [node, k] of [[this.duckLoop, 0.85], [this.duckLow, 0.6], [this.duckVox, 0.35], [this.duckWet, 0.7]] as const) {
      const depth = d * k
      const curve = new Float32Array(64)
      for (let i = 0; i < 64; i++) curve[i] = 1 - depth * (1 - i / 63) ** 2.2
      const g = node.gain
      g.cancelScheduledValues(t)
      g.setValueAtTime(1 - depth, t)
      g.setValueCurveAtTime(curve, t + 0.008, 0.42)
    }
    this.duckUntil = t + 0.43
  }

  private clap(t: number, vel = 1, dest: AudioNode = this.ch.clap) {
    if (this.play('clap', t, dest, vel * 0.9, { pan: -0.1 })) return
    const c = this.ctx
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1400
    bp.Q.value = 0.9
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    for (const k of [0, 0.011, 0.023]) {
      g.gain.setValueAtTime(0.9 * vel, t + k)
      g.gain.exponentialRampToValueAtTime(0.15 * vel, t + k + 0.009)
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.23)
    this.noiseSrc(t, 0.25).connect(bp).connect(g).connect(dest)
  }

  private hat(t: number, open: boolean, vel: number) {
    const dest = open ? this.ch.open : this.ch.hat
    if (this.play(open ? 'open' : vel > 0.45 ? 'hat' : 'hat-soft', t, dest, open ? vel : vel * 1.4, { len: open ? 0.3 : 0.12, pan: open ? 0.15 : -0.15 })) return
    const c = this.ctx
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = open ? 6500 : 8000
    const pan = c.createStereoPanner()
    pan.pan.value = open ? 0.15 : -0.15
    const dur = open ? 0.22 : 0.035
    this.noiseSrc(t, dur).connect(hp).connect(pan).connect(this.env(t, 0.32 * vel, 0.001, dur, dest))
  }

  private bass(t: number, midi: number, len: number, vel = 1) {
    if (this.play('bass', t, this.ch.bass, vel * 0.9, { midi, len: len + 0.05, fade: 0.05 })) return
    const c = this.ctx
    const f = hz(midi)
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.Q.value = 4
    lp.frequency.setValueAtTime(900, t)
    lp.frequency.exponentialRampToValueAtTime(220, t + len)
    const g = this.env(t, 0.75 * vel, 0.006, len + 0.08, this.ch.bass)
    lp.connect(g)
    for (const [type, gain] of [['sine', 1], ['triangle', 0.45]] as const) {
      const o = c.createOscillator()
      o.type = type
      o.frequency.value = f
      const og = c.createGain()
      og.gain.value = gain
      o.connect(og).connect(lp)
      o.start(t)
      o.stop(t + len + 0.15)
    }
  }

  /** the sequencer bass, Giorgio's: a short saw and square through a snapping low-pass, a sine under it */
  private seqBass(t: number, midi: number, vel: number) {
    const c = this.ctx
    const f = hz(midi)
    const len = STEP * 0.72
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.Q.value = 6
    lp.frequency.setValueAtTime(1400, t)
    lp.frequency.exponentialRampToValueAtTime(260, t + len)
    const g = this.env(t, 0.42 * vel, 0.003, len, this.ch.moog)
    lp.connect(g)
    for (const [type, gain] of [['sawtooth', 0.6], ['square', 0.3]] as const) {
      const o = c.createOscillator()
      o.type = type
      o.frequency.value = f
      const og = c.createGain()
      og.gain.value = gain
      o.connect(og).connect(lp)
      o.start(t)
      o.stop(t + len + 0.05)
    }
    if (f < 90) {
      const sub = c.createOscillator()
      sub.frequency.value = f
      sub.connect(this.env(t, 0.5 * vel, 0.004, len, this.ch.moog))
      sub.start(t)
      sub.stop(t + len + 0.05)
    }
  }

  /** a disco guitar chop: three notes of the chord, high, strummed fast, a wah on each hit */
  private chop(t: number, keys: readonly number[], vel: number) {
    if (this.band) {
      // three strings of the chord, strummed down fast, choked short
      keys.slice(1, 4).forEach((n, i) => this.play('gtr', t + i * 0.007, this.chopIn, vel * 0.5, { midi: n, len: vel > 0.7 ? 0.12 : 0.06, fade: 0.03, pan: -0.3 }))
      return
    }
    const c = this.ctx
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 3
    bp.frequency.setValueAtTime(600, t)
    bp.frequency.exponentialRampToValueAtTime(2400, t + 0.07)
    const g = this.env(t, 0.22 * vel, 0.002, 0.06, this.chopIn)
    bp.connect(g)
    keys.slice(1, 4).forEach((n, i) => {
      const o = c.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = hz(n + 12)
      o.connect(bp)
      o.start(t + i * 0.005)
      o.stop(t + 0.1)
    })
  }

  /** disco strings: five detuned saws; a bed (hold), a rip up into the next eight (rip), a fall (fall) */
  private strings(t: number, notes: readonly number[], len: number, shape: 'hold' | 'rip' | 'fall') {
    const dest = shape === 'hold' ? this.ch.strings : this.ch.rips
    if (this.band) {
      notes.slice(0, 3).forEach((n, i) => {
        // the bed is voiced inside the range the section was sampled in (62..79), low and quiet under her
        const src = this.play('str', t, dest, shape === 'hold' ? 0.2 : 0.45, { midi: shape === 'hold' ? n + 12 * Number(n < 62) : n + 12, len: len + 0.6, fade: 0.6, attack: shape === 'hold' ? 0.6 : 0.01, pan: (i - 1) * 0.35 })
        if (!src) return
        const r = src.playbackRate.value
        if (shape === 'rip') {
          src.playbackRate.setValueAtTime(r * 2 ** (-7 / 12), t)
          src.playbackRate.linearRampToValueAtTime(r, t + 0.09)
        } else if (shape === 'fall') {
          src.playbackRate.setValueAtTime(r, t + len * 0.4)
          src.playbackRate.linearRampToValueAtTime(r / 2, t + len * 0.4 + 0.35)
        }
      })
      return
    }
    const c = this.ctx
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 4500
    const g = c.createGain()
    const peak = shape === 'hold' ? 0.035 : 0.07
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + (shape === 'hold' ? 0.6 : 0.03))
    g.gain.setValueAtTime(peak, t + len * 0.7)
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.3)
    lp.connect(g).connect(dest)
    for (const n of notes.slice(0, 3)) {
      for (const cents of [-14, -7, 0, 7, 14]) {
        const o = c.createOscillator()
        o.type = 'sawtooth'
        o.frequency.value = hz(n + 12)
        if (shape === 'rip') {
          o.detune.setValueAtTime(cents - 700, t)
          o.detune.linearRampToValueAtTime(cents, t + 0.09)
        } else if (shape === 'fall') {
          o.detune.setValueAtTime(cents, t + len * 0.4)
          o.detune.linearRampToValueAtTime(cents - 1200, t + len * 0.4 + 0.35)
        } else o.detune.value = cents
        o.connect(lp)
        o.start(t)
        o.stop(t + len + 0.4)
      }
    }
  }

  /** the click track: a short tick, a little higher on the one */
  private click(t: number, one: boolean) {
    const o = this.ctx.createOscillator()
    o.frequency.value = one ? 2000 : 1500
    o.connect(this.env(t, 0.05, 0.001, 0.025, this.ch.click))
    o.start(t)
    o.stop(t + 0.04)
  }

  private piano(t: number, notes: readonly number[], vel: number, len: number, dest: AudioNode = this.ch.piano) {
    const c = this.ctx
    for (const n of notes) {
      const f = hz(n)
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.setValueAtTime(Math.min(9000, f * 9), t)
      lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 2), t + 1.2)
      const decay = Math.max(0.5, len * 2.4)
      const g = this.env(t, 0.16 * vel, 0.004, decay, dest)
      // let go of the key: damp the tail after the note length
      g.gain.setTargetAtTime(0.0001, t + len + 0.05, 0.25)
      lp.connect(g)
      const parts: [OscillatorType, number, number][] = [['triangle', 1, 1], ['sine', 2, 0.35], ['sine', 3, 0.12], ['sine', 4.02, 0.05]]
      for (const [type, mult, gain] of parts) {
        const o = c.createOscillator()
        o.type = type
        o.frequency.value = f * mult
        o.detune.value = (Math.random() - 0.5) * 6
        const og = c.createGain()
        og.gain.value = gain
        o.connect(og).connect(lp)
        o.start(t)
        o.stop(t + decay + 0.1)
      }
      // hammer
      const hp = c.createBiquadFilter()
      hp.type = 'bandpass'
      hp.frequency.value = Math.min(6000, f * 6)
      this.noiseSrc(t, 0.02).connect(hp).connect(this.env(t, 0.03 * vel, 0.001, 0.02, dest))
    }
  }

  /**
   * One of the band's samples at t into dest: a drum by name, or (with midi) the nearest sampled note of
   * that instrument, pitched. Returns its source (to bend it), or false until band.mp3 has arrived.
   */
  private play(name: string, t: number, dest: AudioNode, vel = 1, o: { midi?: number; len?: number; fade?: number; attack?: number; pan?: number } = {}) {
    if (!this.band) return false
    let hit: [number, number, number | null] | undefined = BAND[name]
    let rate = 1
    if (o.midi !== undefined) {
      hit = undefined
      for (const k of BAND_NOTES[name] ?? []) if (!hit || Math.abs(k[2] - o.midi) < Math.abs(hit[2]! - o.midi)) hit = k
      if (!hit) return false
      rate = 2 ** ((o.midi - hit[2]!) / 12)
    }
    if (!hit) return false
    const [at, dur] = hit
    const c = this.ctx
    const len = Math.min(o.len ?? dur / rate, dur / rate)
    const fade = Math.min(o.fade ?? 0.02, len / 2)
    const src = c.createBufferSource()
    src.buffer = this.band
    src.playbackRate.value = rate
    const g = c.createGain()
    if (o.attack) {
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(vel, t + o.attack)
    } else g.gain.setValueAtTime(vel, t)
    g.gain.setValueAtTime(vel, t + Math.max(o.attack ?? 0, len - fade))
    g.gain.linearRampToValueAtTime(0, t + len)
    src.connect(g)
    if (o.pan) {
      const p = c.createStereoPanner()
      p.pan.value = o.pan
      g.connect(p).connect(dest)
    } else g.connect(dest)
    src.start(t, at, Math.min(dur, len * rate + 0.01))
    return src
  }

  /** the snare, hand-muted (the 70s way), on 2 and 4 */
  private snare(t: number, vel = 1) {
    if (this.play('snare', t, this.ch.snare, vel)) return
    const c = this.ctx
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1900
    bp.Q.value = 0.8
    this.noiseSrc(t, 0.2).connect(bp).connect(this.env(t, 0.6 * vel, 0.001, 0.16, this.ch.snare))
    const o = c.createOscillator()
    o.type = 'triangle'
    o.frequency.setValueAtTime(220, t)
    o.frequency.exponentialRampToValueAtTime(170, t + 0.06)
    o.connect(this.env(t, 0.5 * vel, 0.001, 0.09, this.ch.snare))
    o.start(t)
    o.stop(t + 0.15)
  }

  private tamb(t: number, vel = 1) {
    if (this.play('tamb', t, this.ch.tamb, vel, { len: 0.28, pan: 0.3 })) return
    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 6500
    this.noiseSrc(t, 0.12).connect(hp).connect(this.env(t, 0.25 * vel, 0.004, 0.1, this.ch.tamb))
  }

  /** a sine under the bass, felt more than heard */
  private sub(t: number, midi: number, len: number) {
    const o = this.ctx.createOscillator()
    o.frequency.value = hz(midi)
    o.connect(this.env(t, 0.5, 0.01, len, this.ch.sub))
    o.start(t)
    o.stop(t + len + 0.1)
  }

  /** the Rhodes: a chord, the hand a hair slower than the beat from the bottom up */
  private rhodes(t: number, notes: readonly number[], vel: number, len: number) {
    if (!this.band) return this.piano(t, notes.map((n) => n + 12), vel, len, this.ch.rhodes)
    notes.forEach((n, i) => this.play('rhodes', t + i * 0.006, this.ch.rhodes, vel * 0.7, { midi: n, len: len + 0.25, fade: 0.2, pan: (i / (notes.length - 1) - 0.5) * 0.4 }))
  }

  /** one note on the grand (the Salamander's nine), for the melody; the damper when the key is let go */
  private grandNote(t: number, n: number, vel: number, len: number) {
    if (!this.grand) return this.piano(t, [n + 12], vel, len)
    const [m, at] = PIANO.reduce((a, b) => (Math.abs(b[0] - n) < Math.abs(a[0] - n) ? b : a))
    const src = this.ctx.createBufferSource()
    src.buffer = this.grand
    src.playbackRate.value = 2 ** ((n - m) / 12)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(vel * 0.8, t)
    g.gain.setTargetAtTime(0, t + len + 0.1, 0.25)
    src.connect(g).connect(this.ch.piano)
    src.start(t, at, PIANO_LEN)
  }

  /** the clav: a bright, short pluck (a pulse and a saw through a snapping low-pass); no free clavinet samples exist */
  private clav(t: number, midi: number, vel: number) {
    const c = this.ctx
    const bp = c.createBiquadFilter()
    bp.type = 'lowpass'
    bp.Q.value = 3
    bp.frequency.setValueAtTime(4200, t)
    bp.frequency.exponentialRampToValueAtTime(1100, t + 0.08)
    bp.connect(this.env(t, 0.5 * vel, 0.001, 0.1, this.ch.clav))
    for (const [type, mult] of [['square', 1], ['sawtooth', 2.003]] as const) {
      const o = c.createOscillator()
      o.type = type
      o.frequency.value = hz(midi) * mult
      o.connect(bp)
      o.start(t)
      o.stop(t + 0.14)
    }
  }

  /** the organ: drawbars (sines at 1, 2, 3 and 4 times the note), in slowly, held for the bar */
  private organ(t: number, notes: readonly number[], len: number) {
    const c = this.ctx
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.05, t + 0.15)
    g.gain.setValueAtTime(0.05, t + len)
    g.gain.linearRampToValueAtTime(0, t + len + 0.12)
    g.connect(this.ch.organ)
    for (const n of notes.slice(0, 3)) {
      for (const [m, a] of [[1, 1], [2, 0.6], [3, 0.35], [4, 0.2]] as const) {
        const o = c.createOscillator()
        o.frequency.value = hz(n) * m
        const og = c.createGain()
        og.gain.value = a
        o.connect(og).connect(g)
        o.start(t)
        o.stop(t + len + 0.2)
      }
    }
  }

  /** the Moog lead: two saws a hair apart through a resonant low-pass, gliding from its last note */
  private lead(t: number, midi: number, len: number) {
    const c = this.ctx
    const f = hz(midi)
    const from = this.lastLead || f
    this.lastLead = f
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.Q.value = 4
    lp.frequency.setValueAtTime(900, t)
    lp.frequency.exponentialRampToValueAtTime(3200, t + 0.04)
    lp.frequency.exponentialRampToValueAtTime(1400, t + len + 0.05)
    lp.connect(this.env(t, 0.4, 0.01, len + 0.05, this.ch.lead))
    for (const d of [-6, 6]) {
      const o = c.createOscillator()
      o.type = 'sawtooth'
      o.detune.value = d
      o.frequency.setValueAtTime(from, t)
      o.frequency.exponentialRampToValueAtTime(f, t + 0.05)
      o.connect(lp)
      o.start(t)
      o.stop(t + len + 0.15)
    }
  }

  /** a muted strum, the "chk" between the chords: a hair of a guitar note and a scrape of the strings */
  private mute(t: number, vel: number) {
    this.play('gtr', t, this.ch.mute, vel * 0.5, { midi: 64, len: 0.03, fade: 0.02, pan: -0.2 })
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2200
    bp.Q.value = 1.6
    this.noiseSrc(t, 0.03).connect(bp).connect(this.env(t, 0.35 * vel, 0.001, 0.025, this.ch.mute))
  }

  /** string stabs (spiccato): the top of the chord, an octave up */
  private spic(t: number, notes: readonly number[], vel: number) {
    for (const n of notes.slice(1, 4)) this.play('spic', t, this.ch.rips, vel * 0.6, { midi: n + 12, len: 0.3 })
  }

  /** the horns: trumpets on the top of the chord, a trombone on its root, short and together */
  private brass(t: number, notes: readonly number[], vel: number) {
    notes.slice(1, 4).forEach((n, i) => this.play('tpt', t, this.ch.brass, vel * 0.55, { midi: n, len: 0.28, pan: (i - 1) * 0.3 }))
    this.play('tbn', t, this.ch.brass, vel * 0.6, { midi: notes[0] - 12, len: 0.3 })
  }

  /** play a slice of the a cappella */
  private sample(t: number, offset: number, dur: number, rate = 1) {
    const c = this.ctx
    const src = c.createBufferSource()
    if (!this.vox) return src
    src.buffer = this.vox
    src.playbackRate.value = rate
    // asked for a moment ago (a line's lead-in, a context that has only just started): start now, that far in
    const late = Math.max(0, c.currentTime - t)
    t += late
    offset += late * rate
    dur = Math.max(0.02, dur - late * rate)
    const g = c.createGain()
    const end = t + dur / rate
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(1, t + 0.004)
    g.gain.setValueAtTime(1, Math.max(t + 0.005, end - 0.012))
    g.gain.linearRampToValueAtTime(0, end)
    src.connect(g).connect(this.ch.vox)
    src.start(t, Math.max(0, offset), dur + 0.02)
    return src
  }

  private pluck(t: number, midi: number, panV: number) {
    if (this.play('gtr', t, this.ch.gtrR, 0.6, { midi, len: 0.22, fade: 0.06, pan: panV })) return
    const c = this.ctx
    const o = c.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = hz(midi)
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.Q.value = 3
    lp.frequency.setValueAtTime(3800, t)
    lp.frequency.exponentialRampToValueAtTime(500, t + 0.09)
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 280
    const pan = c.createStereoPanner()
    pan.pan.value = panV
    o.connect(lp).connect(hp).connect(pan).connect(this.env(t, 0.32, 0.002, 0.17, this.ch.gtrR))
    o.start(t)
    o.stop(t + 0.25)
  }

  private pad(t: number, notes: number[], _len: number, level = 1) {
    const c = this.ctx
    if (!this.grand) return
    const voices = [...notes.map((n) => n - 12), notes[notes.length - 1] + 2]
    voices.forEach((n, i) => {
      // nearest sampled note, then a small pitch shift (never more than a tone and a half)
      const [m, at] = PIANO.reduce((a, b) => (Math.abs(b[0] - n) < Math.abs(a[0] - n) ? b : a))
      const src = c.createBufferSource()
      src.buffer = this.grand
      src.playbackRate.value = 2 ** ((n - m) / 12)
      const g = c.createGain()
      g.gain.value = (i === voices.length - 1 ? 0.35 : 0.55) * 0.5 * level
      const pan = c.createStereoPanner()
      pan.pan.value = ((i / (voices.length - 1)) * 2 - 1) * 0.6
      src.connect(g).connect(pan).connect(this.wash)
      const when = t + i * 0.022 // a slow hand, low to high
      src.start(when, at, PIANO_LEN)
    })
  }

  /** a room that breathes in: slow attack, long dark tail */
  private swell(seconds: number) {
    const c = this.ctx
    const len = Math.floor(c.sampleRate * seconds)
    const b = c.createBuffer(2, len, c.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch)
      let lp = 0
      for (let i = 0; i < len; i++) {
        const t = i / c.sampleRate
        lp += ((Math.random() * 2 - 1) - lp) * 0.35
        d[i] = lp * (1 - Math.exp(-t / 0.45)) * Math.exp(-t / 1.9) * 0.6
      }
    }
    return b
  }

  private riser(t: number, len: number, dest: AudioNode = this.ch.riser) {
    const c = this.ctx
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 2
    bp.frequency.setValueAtTime(300, t)
    bp.frequency.exponentialRampToValueAtTime(7000, t + len)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.35, t + len)
    g.gain.linearRampToValueAtTime(0, t + len + 0.02)
    const src = c.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    src.connect(bp).connect(g).connect(dest)
    src.start(t)
    src.stop(t + len + 0.05)
  }

  private impact(t: number, dest: AudioNode = this.ch.impact) {
    const c = this.ctx
    const o = c.createOscillator()
    o.frequency.setValueAtTime(90, t)
    o.frequency.exponentialRampToValueAtTime(30, t + 1.2)
    o.connect(this.env(t, 0.6, 0.005, 1.4, dest))
    o.start(t)
    o.stop(t + 1.5)
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(5000, t)
    lp.frequency.exponentialRampToValueAtTime(300, t + 1.5)
    this.noiseSrc(t, 1.6).connect(lp).connect(this.env(t, 0.3, 0.003, 1.6, dest))
  }

  private hall(seconds: number) {
    const c = this.ctx
    const len = Math.floor(c.sampleRate * seconds)
    const b = c.createBuffer(2, len, c.sampleRate)
    const pre = Math.floor(c.sampleRate * 0.025)
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch)
      let lp = 0
      for (let i = pre; i < len; i++) {
        const k = (i - pre) / (len - pre)
        lp += ((Math.random() * 2 - 1) - lp) * (0.9 - k * 0.6) // darker as it decays
        d[i] = lp * Math.pow(1 - k, 2.6) * 0.5
      }
    }
    return b
  }
}

/* --------------------------------------------------------------- the raw vocal: the demo tape, the booth */

const bytes = new Map<string, Promise<ArrayBuffer>>()
/** a singer's a cappella (the chosen one by default), downloaded once, the first time anything asks for it */
export function voxBytes(v: Voice = current) {
  let p = bytes.get(v.id)
  if (!p) {
    p = fetch(v.url).then((r) => {
      if (!r.ok) throw new Error(`vox ${r.status}`)
      return r.arrayBuffer()
    })
    p.catch(() => bytes.delete(v.id)) // a failed download may be tried again
    bytes.set(v.id, p)
  }
  return p
}

let bandFile: Promise<ArrayBuffer> | null = null
/** the band's samples (band.mp3), downloaded once for the whole page */
export function bandBytes() {
  bandFile ??= fetch(BAND_URL).then((r) => {
    if (!r.ok) throw new Error(`band ${r.status}`)
    return r.arrayBuffer()
  })
  return bandFile
}

let grand: Promise<ArrayBuffer> | null = null
/** the grand piano's nine notes, downloaded once for the whole page */
export function pianoBytes() {
  grand ??= fetch(PIANO_URL).then((r) => {
    if (!r.ok) throw new Error(`piano ${r.status}`)
    return r.arrayBuffer()
  })
  return grand
}

/**
 * Your record: the whole song (32 bars, about 63 s), every stem in, at the reader's fader levels,
 * rendered offline (no sound needed) and encoded as a 16-bit stereo WAV.
 */
export async function bounce(levels: Record<Channel, number>, onBar?: (done: number, of: number) => void, knobs?: Partial<Record<Knob, number>>, pans?: Partial<Record<Channel, number>>) {
  const v = current
  const [vox, piano] = await Promise.all([voxBytes(v).catch(() => undefined), pianoBytes().catch(() => undefined)])
  const buf = await render(levels, CYCLE, 44100, [], vox, 0, piano, onBar, knobs, v.lines, pans)
  return toWav(buf)
}

/** an AudioBuffer as a 16-bit PCM WAV file */
export function toWav(buf: AudioBuffer) {
  const ch = Math.min(2, buf.numberOfChannels)
  const n = buf.length
  const out = new DataView(new ArrayBuffer(44 + n * ch * 2))
  const str = (at: number, s: string) => [...s].forEach((c, i) => out.setUint8(at + i, c.charCodeAt(0)))
  str(0, 'RIFF')
  out.setUint32(4, 36 + n * ch * 2, true)
  str(8, 'WAVEfmt ')
  out.setUint32(16, 16, true)
  out.setUint16(20, 1, true)
  out.setUint16(22, ch, true)
  out.setUint32(24, buf.sampleRate, true)
  out.setUint32(28, buf.sampleRate * ch * 2, true)
  out.setUint16(32, ch * 2, true)
  out.setUint16(34, 16, true)
  str(36, 'data')
  out.setUint32(40, n * ch * 2, true)
  const data = Array.from({ length: ch }, (_, c) => buf.getChannelData(c))
  const pcm = new Int16Array(out.buffer, 44, n * ch) // every browser is little-endian, as WAV is
  for (let i = 0, j = 0; i < n; i++) {
    for (let c = 0; c < ch; c++, j++) {
      const x = data[c][i]
      pcm[j] = x <= -1 ? -0x8000 : x >= 1 ? 0x7fff : x < 0 ? x * 0x8000 : x * 0x7fff
    }
  }
  return new Blob([out], { type: 'audio/wav' })
}

/**
 * Her voice, dry, before the band. Fig. 1 plays the whole a cappella off a cassette;
 * Fig. 2 records her one line at a time. One voice at a time: a new one cuts the last.
 */
export class Booth {
  readonly ctx: AudioContext
  private out: GainNode
  private bufs = new Map<string, Promise<AudioBuffer>>()
  private now: { src: AudioBufferSourceNode; gain: GainNode; stop: () => void } | null = null
  private taken = 0

  constructor(ctx: AudioContext, dest: AudioNode = ctx.destination) {
    this.ctx = ctx
    this.out = ctx.createGain()
    this.out.gain.value = 0.9
    this.out.connect(dest)
  }

  /** the chosen singer, decoded once per singer */
  private vox(v: Voice = current) {
    let p = this.bufs.get(v.id)
    if (!p) {
      p = voxBytes(v).then((b) => this.ctx.decodeAudioData(b.slice(0)))
      this.bufs.set(v.id, p)
    }
    return p
  }

  /** she is singing (a tape or a take) */
  get busy() {
    return this.now !== null
  }

  /** cut whatever she is singing */
  stop() {
    this.now?.stop()
    this.now = null
  }

  /**
   * The demo: the whole a cappella off a cassette. Wow and flutter, a little hiss, no top end.
   * Resolves when the tape runs out or is stopped. at: when to start (a bar line, with the band playing).
   */
  async cassette(at?: number): Promise<void> {
    const buf = await this.vox()
    this.stop()
    const c = this.ctx
    const t = Math.max(at ?? 0, c.currentTime + 0.05)
    const src = c.createBufferSource()
    src.buffer = buf
    // the motor: a quick spin up, then wow (slow) and flutter (fast) on the speed
    src.playbackRate.setValueAtTime(0.82, t)
    src.playbackRate.linearRampToValueAtTime(1, t + 0.14)
    for (const [hz, depth] of [[0.55, 0.0028], [7.5, 0.0007]]) {
      const lfo = c.createOscillator()
      lfo.frequency.value = hz
      const d = c.createGain()
      d.gain.value = depth
      lfo.connect(d).connect(src.playbackRate)
      lfo.start(t)
      src.addEventListener('ended', () => lfo.stop())
    }
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 110
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 6800
    lp.Q.value = 0.4
    const sat = c.createWaveShaper()
    const curve = new Float32Array(1024)
    for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(((i / 1023) * 2 - 1) * 1.6) / Math.tanh(1.6)
    sat.curve = curve
    const gain = c.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(1, t + 0.06)
    src.connect(hp).connect(lp).connect(sat).connect(gain).connect(this.out)
    // tape hiss, under her
    const hiss = c.createBufferSource()
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
    const nd = nb.getChannelData(0)
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
    hiss.buffer = nb
    hiss.loop = true
    const hb = c.createBiquadFilter()
    hb.type = 'bandpass'
    hb.frequency.value = 5200
    hb.Q.value = 0.5
    const hg = c.createGain()
    hg.gain.value = 0.012
    hiss.connect(hb).connect(hg).connect(gain)
    hiss.start(t)
    src.start(t)
    return new Promise<void>((done) => {
      const stop = () => {
        if (this.now?.src !== src) return
        this.now = null
        const at = c.currentTime
        // the motor lets go: down in pitch, then nothing
        src.playbackRate.cancelScheduledValues(at)
        src.playbackRate.setValueAtTime(src.playbackRate.value, at)
        src.playbackRate.linearRampToValueAtTime(0.35, at + 0.18)
        gain.gain.cancelScheduledValues(at)
        gain.gain.setValueAtTime(gain.gain.value, at)
        gain.gain.linearRampToValueAtTime(0, at + 0.18)
        src.stop(at + 0.2)
        hiss.stop(at + 0.2)
        done()
      }
      src.addEventListener('ended', () => {
        try { hiss.stop() } catch { /* already stopped */ }
        if (this.now?.src === src) this.now = null
        done()
      })
      this.now = { src, gain, stop }
    })
  }

  /**
   * The booth: she records the next line, dry and close, after a two-click count-in at 122 BPM.
   * Returns the take number and the line, at once; resolves `sung` when she is done.
   */
  async take(): Promise<{ n: number; text: string; sung: Promise<void> }> {
    const v = current
    const buf = await this.vox(v)
    this.stop()
    const c = this.ctx
    const n = ++this.taken
    const l = v.lines[(n - 1) % v.lines.length]
    const eighth = 30 / BPM
    const t = c.currentTime + 0.05
    // count-in: two clicks in her headphones, leaking into the mic
    for (const k of [0, 1]) {
      const o = c.createOscillator()
      o.frequency.value = k ? 1500 : 2000
      const g = c.createGain()
      g.gain.setValueAtTime(0.0001, t + k * eighth)
      g.gain.exponentialRampToValueAtTime(0.06, t + k * eighth + 0.002)
      g.gain.exponentialRampToValueAtTime(0.0001, t + k * eighth + 0.04)
      o.connect(g).connect(this.out)
      o.start(t + k * eighth)
      o.stop(t + k * eighth + 0.05)
    }
    const at = t + 2 * eighth - l.lead
    const src = c.createBufferSource()
    src.buffer = buf
    // close on the mic: a little more chest
    const prox = c.createBiquadFilter()
    prox.type = 'lowshelf'
    prox.frequency.value = 220
    prox.gain.value = 3
    const gain = c.createGain()
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(1, at + 0.006)
    gain.gain.setValueAtTime(1, at + l.dur - 0.02)
    gain.gain.linearRampToValueAtTime(0, at + l.dur)
    src.connect(prox).connect(gain).connect(this.out)
    src.start(at, l.at, l.dur + 0.02)
    const sung = new Promise<void>((done) => {
      const stop = () => {
        if (this.now?.src !== src) return
        this.now = null
        const s = c.currentTime
        gain.gain.cancelScheduledValues(s)
        gain.gain.setValueAtTime(gain.gain.value, s)
        gain.gain.linearRampToValueAtTime(0, s + 0.02)
        src.stop(s + 0.03)
        done()
      }
      src.addEventListener('ended', () => {
        if (this.now?.src === src) this.now = null
        done()
      })
      this.now = { src, gain, stop }
    })
    return { n, text: l.text, sung }
  }
}

/* --------------------------------------------------------------- live player */

export class Player {
  ctx: AudioContext | null = null
  engine: Engine | null = null
  playing = false
  private next = 0
  private n = 0
  private timer = 0
  private levels: Partial<Record<Channel, number>> = {}
  private pans: Partial<Record<Channel, number>> = { ...MY_PAN }
  onHit: (h: Hit) => void = () => {}
  /** the platter's speed, about 45 times a second: 1 playing, 0 held or stopped, below 0 backwards */
  onRate: (rate: number) => void = () => {}
  private deck: AudioWorkletNode | null = null
  private deckReady: Promise<void> | null = null
  private voxLoaded: Promise<void> | null = null
  private wanted = false // play was asked for and not taken back (downloads can take a moment)
  private starting: Promise<void> | null = null
  private watchers = new Set<(playing: boolean) => void>()
  private open = Object.fromEntries(STEMS.map((s) => [s, true])) as Record<Stem, boolean>
  private takes = 0
  private againAt = 0
  private endAt = 0
  private endTimer = 0
  private jumpTo = -1
  private swept = 1
  private ending = false // the run-out: the song is over, the platter still turns
  private wakeTimer = 0
  private looks: Partial<Look> = {}
  private knobs: Record<Knob, number> = { filter: 0.5, space: 0.5, echo: 0.5, drive: 0 }

  /** told every time the track starts or stops, whoever started or stopped it */
  watch(fn: (playing: boolean) => void) {
    this.watchers.add(fn)
  }
  private tell() {
    this.watchers.forEach((fn) => fn(this.playing))
  }

  /** the arrangement: which stems are in the song. A change lands on the next bar line. */
  arrange(stems: readonly Stem[], drop = false) {
    // the drop (B3 to B4, the page says so): a bar of build first, then everything at once
    const live = this.playing && !this.ending && !!this.engine
    if (!drop) this.engine?.cancelBuild()
    const when = drop && live ? this.engine!.build(this.nextBar()) : this.nextBar()
    for (const s of STEMS) {
      const on = stems.includes(s)
      if (on === this.open[s]) continue
      this.open[s] = on
      if (this.engine && this.playing) this.engine.open(s, on, when)
      // she comes in while the song is in its piano stretch: go to her verse, so she is heard at once
      if (s === 'vox' && on && this.playing && PIANO_SOLO(Math.floor(this.n / 16) % CYCLE)) this.jumpTo = 2
    }
  }
  isOpen(stem: Stem) {
    return this.open[stem]
  }
  private nextBeat() {
    return this.next + ((4 - (this.n % 4)) % 4) * STEP
  }

  /** Fig. 6's knobs, 0..1 (see Engine.knob). Kept, so they hold when the engine is made later. */
  knob(name: Knob, v: number) {
    this.knobs[name] = v
    this.engine?.knob(name, v)
  }

  /** the pads work with the track stopped too: the engine wakes and the deck runs, nothing is sequenced */
  private async wake(holdMs = 4000) {
    await this.ensure()
    await this.ctx!.resume()
    if (this.playing && !this.ending) return
    const e = this.engine!
    const now = this.ctx!.currentTime
    for (const s of STEMS) e.open(s, this.open[s], now, true)
    e.wake(now)
    this.deck?.port.postMessage({ live: true })
    clearTimeout(this.wakeTimer)
    this.wakeTimer = window.setTimeout(() => {
      if (this.playing || !this.ctx || !this.engine) return
      this.engine.fadeOut(this.ctx.currentTime)
      this.engine.quiet(this.ctx.currentTime)
      this.deck?.port.postMessage({ brake: 0.4 })
    }, holdMs)
  }

  /**
   * A pad on Fig. 6 or a drum on Fig. 4. With the band playing it lands on the next sixteenth (her
   * lines on the next beat); stopped, at once. Resolves with the ms until it sounds.
   */
  async pad(sound: PadSound, robotChord?: number) {
    if (sound === 'again') return this.again(), 0
    if (sound === 'tape') return this.tapeStop(), 0
    const live = () => this.playing && !this.ending
    if (!live()) await this.wake()
    if (sound.startsWith('line-')) await this.voxLoaded
    const ctx = this.ctx!
    const t = live() ? (sound.startsWith('line-') ? this.nextBeat() : this.next) : ctx.currentTime + 0.01
    // a line pad with a chord pad held: she sings it as the robot, on that chord (always in key)
    if (sound.startsWith('line-') && robotChord !== undefined) this.engine!.robotLine(Number(sound.slice(5)), t, robotChord)
    else this.engine!.hit(sound, t)
    return Math.max(0, (t - ctx.currentTime) * 1000)
  }

  /** tape stop: the platter runs down in half a second, then the band picks up on the beat */
  tapeStop() {
    const d = this.deck?.port
    if (!this.playing || !d) return
    d.postMessage({ brake: 0.5 })
    window.setTimeout(() => this.playing && d.postMessage({ live: true }), (60 / BPM) * 2 * 1000)
  }

  /** the end of the record (the outro): the bar plays out, then the run-out groove, then the platter stops */
  finish() {
    // on the next four-bar line, so the song ends at the end of a phrase, never mid-sentence
    if (this.playing && !this.endAt) this.endAt = this.next + ((64 - (this.n % 64)) % 64) * STEP
  }

  private nextBar() {
    return this.next + ((16 - (this.n % 16)) % 16) * STEP
  }

  /** the faders as they stand, 0..100 */
  /** Fig. 6's knobs as they stand, 0..1 */
  knobValues() {
    return { ...this.knobs }
  }

  mix() {
    return Object.fromEntries(CH.map((c) => [c, Math.round(this.levels[c] ?? 0)])) as Record<Channel, number>
  }

  /** a stem the reader can hear: in the arrangement and its fader up */
  heard(stem: Stem) {
    return this.open[stem] && STEM_CH[stem].some((c) => (this.levels[c] ?? 0) > 0)
  }

  /**
   * Fig. 2 while the track plays: she records the next line on the next bar, in the song.
   * Returns the take, the line and how long until she sings it (ms). null when the track is not playing.
   */
  take() {
    if (!this.playing || this.ending || !this.engine || !this.ctx) return null
    const at = this.nextBar()
    const n = ++this.takes
    const l = this.engine.cue(n - 1, at)
    return { n, text: l.text, inMs: Math.max(0, (at - this.ctx.currentTime) * 1000), forMs: l.dur * 1000 }
  }

  /**
   * Fig. 3 while the track plays: "again". The record spins back for a moment (the deck), and on the
   * next beat the band goes back to the top of the phrase and plays it again.
   */
  /**
   * AGAIN. Playing: the record is pulled back about a second (the wheel-up), then the band takes the phrase
   * from the top and she sings her last line again. Stopped: she sings her last line again, on its own.
   */
  async again() {
    if (this.playing && !this.ending && this.ctx) {
      const d = this.deck?.port
      if (d) {
        d.postMessage({ grab: true })
        for (let k = 0; k < 8; k++) window.setTimeout(() => this.playing && d.postMessage({ turn: -0.15 }), k * 35)
        window.setTimeout(() => this.playing && d.postMessage({ release: true }), 300)
      }
      this.againAt = this.ctx.currentTime + 0.3
      return
    }
    const e = this.engine
    const line = e ? e.sung : 0
    await this.wake(5000)
    await this.voxLoaded
    if (this.playing && !this.ending) return
    this.engine!.cue(line, this.ctx!.currentTime + 0.05)
  }

  /** how the band plays here (Engine.look). Kept, so it holds when the engine is made later. */
  look(o: Partial<Look>) {
    Object.assign(this.looks, o)
    this.engine?.look(o)
  }

  /** the filter build (see Engine.sweep): 0 closed, 1 open. Kept, so it holds when the engine is made later. */
  sweep(x: number) {
    if (Math.abs(x - this.swept) < 0.004) return
    this.swept = x
    this.engine?.sweep(x) // during a build the engine keeps it and applies it after the drop
  }

  /** the band steps back while she sings raw in the booth */
  stepBack(on: boolean, level?: number) {
    this.engine?.stepBack(on, level)
  }

  /** the next bar line, in the track's clock (0 when it is not playing) */
  get nextBarAt() {
    return this.playing ? this.nextBar() : 0
  }

  /** start downloading the singer and the grand early (the desk calls this when it comes into view) */
  prefetch() {
    voxBytes().catch(() => {})
    pianoBytes().catch(() => {})
    bandBytes().catch(() => {})
  }
  private async load() {
    const v = current
    // the band joins the moment its samples arrive (it plays on its synths until then)
    bandBytes()
      .then((b) => this.ctx!.decodeAudioData(b.slice(0)))
      .then((b) => this.engine!.setBand(b))
      .catch(() => {})
    const [vox, piano] = await Promise.allSettled([
      voxBytes(v).then((b) => this.ctx!.decodeAudioData(b.slice(0))),
      pianoBytes().then((b) => this.ctx!.decodeAudioData(b.slice(0))),
    ])
    // if either fails, the band plays on without it
    if (vox.status === 'fulfilled' && current === v) this.engine!.setVox(vox.value, v.lines)
    if (piano.status === 'fulfilled') this.engine!.setPiano(piano.value)
  }

  /**
   * Choose the singer (a cassette in Fig. 1). With the track playing she takes over from her next line;
   * stopped, she is the one it starts with. The cassette, the mic and your record all use her.
   */
  async setVoice(id: string) {
    const v = VOICES.find((x) => x.id === id)
    if (!v || v === current) return 0
    current = v
    if (!this.ctx || !this.engine) return 0
    try {
      const buf = await this.ctx.decodeAudioData((await voxBytes(v)).slice(0))
      if (current !== v) return 0
      // playing: she takes over on the next beat, mid-line, with a tape wow; otherwise from her next line
      const live = this.playing && !this.ending
      const t = live ? this.nextBeat() : this.ctx.currentTime
      if (!(live && this.engine.swapVoice(buf, v.lines, t))) this.engine.setVox(buf, v.lines)
      return Math.max(0, (t - this.ctx.currentTime) * 1000)
    } catch {
      return 0 // she did not arrive: the last singer carries on
    }
  }

  // the mix plays off a deck, so the records on the page can be scratched like vinyl in DJ software.
  // no AudioWorklet: the music plays straight through and the record only turns.
  private async attachDeck() {
    try {
      const ctx = this.ctx!
      await ctx.audioWorklet.addModule(DECK_URL)
      const node = new AudioWorkletNode(ctx, 'deck', {
        numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit',
      })
      node.port.onmessage = (ev) => this.onRate(ev.data)
      this.engine!.insert(node)
      this.deck = node
    } catch {
      // the band plays on
    }
  }
  /** a hand on the record: it stops under the hand */
  grab() {
    if (this.playing) this.deck?.port.postMessage({ grab: true })
  }
  /** the hand turned the record by deg (clockwise is forward) */
  turn(deg: number) {
    if (this.playing) this.deck?.port.postMessage({ turn: (deg / 360) * TURN })
  }
  /** let go: the music picks up where the beat is now */
  release() {
    if (this.playing) this.deck?.port.postMessage({ release: true })
  }

  set(c: Channel, v: number) {
    this.levels[c] = v
    this.engine?.set(c, v)
  }

  setPan(c: Channel, v: number) {
    this.pans[c] = v
    this.engine?.setPan(c, v)
  }

  /** the channel knobs as they stand, -100..100 */
  panValues() {
    return Object.fromEntries(CH.map((c) => [c, Math.round(this.pans[c] ?? 0)])) as Record<Channel, number>
  }

  /** the AudioContext and the engine, made on the first click. Downloads start; nothing waits for them. */
  private ensure() {
    if (!this.ctx) {
      this.ctx = new AudioContext({ latencyHint: 'interactive' })
      this.engine = new Engine(this.ctx)
      for (const c of CH) {
        this.engine.set(c, this.levels[c] ?? 0)
        this.engine.setPan(c, this.pans[c] ?? 0)
      }
      for (const k of KNOBS) this.engine.knob(k, this.knobs[k])
      this.engine.sweep(this.swept, 0, true)
      this.engine.look(this.looks, 0)
    }
    this.voxLoaded ??= this.load()
    this.deckReady ??= this.attachDeck()
    return this.deckReady
  }

  /** start the track. Call it from a click: it makes the AudioContext there. Twice is once. */
  play() {
    if (this.playing) return Promise.resolve()
    this.wanted = true
    void this.ensure()
    this.starting ??= this.start().finally(() => (this.starting = null))
    return this.starting
  }

  private async start() {
    // the first note does not wait for the grand or the singer: they join the moment they arrive
    await this.ensure()
    await this.ctx!.resume()
    if (!this.wanted || this.playing) return // stopped while it loaded
    const e = this.engine!
    this.playing = true
    this.ending = false
    this.endAt = 0
    clearTimeout(this.endTimer)
    clearTimeout(this.wakeTimer)
    this.next = this.ctx!.currentTime + 0.08
    this.n = 0
    for (const s of STEMS) e.open(s, this.open[s], this.next, true)
    e.fadeIn(this.next - 0.02)
    e.quiet(this.next, false) // the crackle, back
    this.deck?.port.postMessage({ live: true })
    e.startCrackle(this.next)
    const tick = () => {
      const ctx = this.ctx!
      while (this.next < ctx.currentTime + 0.14) {
        // the end of the record: the phrase has played out; her last line, then the run-out groove, then stop
        if (this.endAt && this.next >= this.endAt) {
          clearInterval(this.timer)
          this.ending = true
          const groove = e.finale(this.endAt)
          this.endTimer = window.setTimeout(() => this.stop(1.6), (groove - ctx.currentTime + 3 * TURN) * 1000)
          this.endAt = 0
          return
        }
        // a jump to a bar of the song (the singer coming in), on the next bar line
        if (this.jumpTo >= 0 && this.n % 16 === 0) {
          this.n = Math.floor(this.n / (16 * CYCLE)) * 16 * CYCLE + this.jumpTo * 16
          this.jumpTo = -1
        }
        // AGAIN: on the first beat after the rewind, back to the top of the two-bar phrase
        if (this.againAt && this.next >= this.againAt && this.n % 4 === 0) {
          this.n = Math.floor(this.n / 32) * 32
          this.againAt = 0
          e.cue(e.sung, this.next) // her last line, from the top, even where the song has her resting
        }
        const hit = e.step(this.n, this.next)
        const wait = Math.max(0, (hit.time - ctx.currentTime) * 1000)
        window.setTimeout(() => this.playing && this.onHit(hit), wait)
        this.next += STEP
        this.n++
      }
    }
    tick()
    this.timer = window.setInterval(tick, 25)
    this.tell()
  }

  /** brake: seconds for the platter to run down, like a turntable switched off. 0 cuts. */
  stop(brake = 0) {
    this.wanted = false
    if (!this.playing || !this.ctx || !this.engine) return
    this.playing = false
    clearInterval(this.timer)
    clearTimeout(this.endTimer)
    this.endAt = 0
    this.engine.setStutter(false)
    this.engine.stepBack(false)
    this.ending = false
    const run = this.deck ? brake : 0
    this.deck?.port.postMessage({ brake: run || 0.001 }) // a cut stop stops the platter too
    this.engine.fadeOut(this.ctx.currentTime + run)
    this.engine.quiet(this.ctx.currentTime + run)
    this.tell()
  }

  stutter(on: boolean) {
    if (this.engine && this.playing) this.engine.setStutter(on)
  }

  /** 0..1, roughly how hard the master is working */
  meter(buf: Float32Array<ArrayBuffer>) {
    const a = this.engine?.analyser
    if (!a) return 0
    a.getFloatTimeDomainData(buf)
    let sum = 0
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
    return Math.min(1, Math.sqrt(sum / buf.length) * 3.2)
  }
}

/** The page's one track. The records, the now-playing bar and the desk all play this. */
export const track = new Player()

/* --------------------------------------------------------------- offline (previews, tests) */

export async function render(levels: Partial<Record<Channel, number>>, bars = 8, sampleRate = 44100, stutterBars: number[] = [], vox?: ArrayBuffer, from = 0, piano?: ArrayBuffer, onBar?: (done: number, of: number) => void, knobs?: Partial<Record<Knob, number>>, voxLines: Line[] = LINES, pans: Partial<Record<Channel, number>> = MY_PAN) {
  const seconds = bars * 16 * STEP + 3
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * sampleRate), sampleRate)
  const e = new Engine(ctx)
  if (vox) e.setVox(await ctx.decodeAudioData(vox.slice(0)), voxLines)
  if (piano) e.setPiano(await ctx.decodeAudioData(piano.slice(0)))
  const band = await bandBytes().catch(() => undefined)
  if (band) e.setBand(await ctx.decodeAudioData(band.slice(0)))
  for (const c of CH) {
    e.set(c, levels[c] ?? 0, 0)
    e.setPan(c, pans[c] ?? 0, 0)
  }
  e.look(FULL, 0)
  for (const k of KNOBS) if (typeof knobs?.[k] === 'number') e.knob(k, knobs[k]!, 0)
  e.startCrackle(0)
  // Schedule a bar at a time, just ahead of the render, as the live player does. Scheduling the
  // whole song up front makes the browser carry every future note through every block: 8 bars
  // took 5 s, 32 bars over a minute. A bar at a time keeps it in proportion to the length.
  let t = 0.1
  let n = from * 16
  const end = (from + bars) * 16
  const ahead = (until: number) => {
    for (; n < end && t < until; n++, t += STEP) {
      const bar = Math.floor(n / 16)
      const want = stutterBars.includes(bar) && n % 16 >= 8
      if (want !== e.stutter) e.setStutter(want, t)
      e.step(n, t)
    }
  }
  const BAR = 16 * STEP
  ahead(0.1 + BAR)
  for (let k = 1; k * BAR < seconds - 0.05 && k <= bars; k++) {
    const at = k * BAR
    ctx.suspend(at).then(() => {
      onBar?.(k, bars)
      ahead(at + 0.1 + BAR)
      void ctx.resume()
    })
  }
  return ctx.startRendering()
}
