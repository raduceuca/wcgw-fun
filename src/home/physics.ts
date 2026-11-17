/**
 * Tiny, deterministic physics for the page's mishaps.
 * Times are in ms, lengths in em, angles in degrees.
 */

export interface Motion {
  /** Value `ms` after the motion starts. Holds the first value before it and the last after it. */
  at(ms: number): number
  /** When it comes to rest. */
  end: number
}

export const FRAME_MS = 1000 / 60
const STEP_MS = 1000 / 240
/** Cartoon gravity in em/s²: slow enough to watch a letter fall. */
const GRAVITY = 18
/** Below this speed (rad/s or em/s) a landing is too soft to bounce. */
const SETTLE = 0.6
const RAD = Math.PI / 180

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1)

function fromSamples(samples: number[]): Motion {
  const last = samples.length - 1
  return {
    end: last * FRAME_MS,
    at(ms) {
      const i = ms / FRAME_MS
      if (i <= 0) return samples[0]
      if (i >= last) return samples[last]
      const lo = Math.floor(i)
      return samples[lo] + (samples[lo + 1] - samples[lo]) * (i - lo)
    },
  }
}

export interface Topple extends Motion {
  /** When it first hits whatever stops it. */
  contact: number
  /** When it first tips past `angle`. */
  timeTo(angle: number): number
}

/**
 * Something tipping over a corner until it is stopped at `to` degrees (negative tips left).
 * `height` is how tall it is (taller falls slower); `lean` is how far past the tipping
 * point it starts (a push leans more than a teeter). Bounces and settles on impact.
 */
export function topple({ to, height, lean = 4, restitution = 0.3 }: {
  to: number
  height: number
  lean?: number
  restitution?: number
}): Topple {
  const stop = Math.abs(to) * RAD
  const k = GRAVITY / height
  const samples = [0]
  let theta = 0
  let omega = 0
  let contact = -1

  for (let ms = STEP_MS, frame = FRAME_MS; ms < 4000; ms += STEP_MS) {
    omega += k * Math.sin(theta + lean * RAD) * (STEP_MS / 1000)
    theta += omega * (STEP_MS / 1000)
    if (theta >= stop) {
      theta = stop
      if (contact < 0) contact = ms
      if (omega < SETTLE) break
      omega = -omega * restitution
    }
    if (ms >= frame) {
      samples.push((Math.sign(to) * theta) / RAD)
      frame += FRAME_MS
    }
  }
  samples.push(to)

  const motion = fromSamples(samples)
  return {
    ...motion,
    contact,
    timeTo: angle => samples.findIndex(a => Math.abs(a) >= Math.abs(angle)) * FRAME_MS,
  }
}

/** Rolling `distance`, slowed to a stop by friction over `ms`. */
export function roll(distance: number, ms: number): Motion {
  return { end: ms, at: t => distance * (1 - (1 - clamp01(t / ms)) ** 2) }
}

/** Falling freely for `distance` (positive is down). */
export function fall(distance: number): Motion {
  const end = Math.sqrt((2 * distance) / GRAVITY) * 1000
  return { end, at: t => Math.min((GRAVITY / 2) * (clamp01(t / end) * end / 1000) ** 2, distance) }
}

/** Dropped from `height` above a floor, bouncing until it settles. Returns height above the floor. */
export function bounce(height: number, restitution = 0.35): Motion {
  const samples = [height]
  let y = height
  let v = 0
  for (let ms = STEP_MS, frame = FRAME_MS; ms < 4000; ms += STEP_MS) {
    v -= GRAVITY * (STEP_MS / 1000)
    y += v * (STEP_MS / 1000)
    if (y <= 0) {
      y = 0
      if (-v < SETTLE) break
      v = -v * restitution
    }
    if (ms >= frame) {
      samples.push(y)
      frame += FRAME_MS
    }
  }
  samples.push(0)
  return fromSamples(samples)
}

/** A knock: a damped shake of `amplitude` that dies out. */
export function wobble(amplitude: number, hz = 7, damping = 7): Motion {
  const end = (Math.log(50) / damping) * 1000
  return {
    end,
    at: t => (t <= 0 || t >= end ? 0 : amplitude * Math.exp((-damping * t) / 1000) * Math.sin((2 * Math.PI * hz * t) / 1000)),
  }
}

export interface Tumble {
  angle: Motion
  /** Centre offset in side lengths, right. */
  x: Motion
  /** Centre offset in side lengths, up. */
  y: Motion
  end: number
}

/**
 * A square of `size` kicked into tumbling over its corners at `spin` deg/s.
 * It slows climbing onto each corner, speeds up going over, and loses energy at
 * every landing, until it rocks back and settles.
 */
export function tumble({ spin, size, restitution = 0.5 }: { spin: number; size: number; restitution?: number }): Tumble {
  const k = GRAVITY / size
  const angles = [0]
  const xs = [0]
  const ys = [0]
  let step = 0
  let beta = 0
  let omega = spin * RAD

  const centre = () => {
    const a = (3 * Math.PI) / 4 - beta
    return [step + 1 + Math.cos(a) / Math.SQRT2 - 0.5, Math.sin(a) / Math.SQRT2 - 0.5]
  }

  for (let ms = STEP_MS, frame = FRAME_MS; ms < 6000; ms += STEP_MS) {
    omega += k * Math.sin(beta - Math.PI / 4) * (STEP_MS / 1000)
    beta += omega * (STEP_MS / 1000)
    if (beta >= Math.PI / 2) {
      step += 1
      beta -= Math.PI / 2
      omega *= restitution
    } else if (beta <= 0 && omega < 0) {
      beta = 0
      if (-omega < SETTLE) break
      omega = -omega * restitution
    }
    if (ms >= frame) {
      const [x, y] = centre()
      angles.push((step * 90) + beta / RAD)
      xs.push(x)
      ys.push(y)
      frame += FRAME_MS
    }
  }
  beta = 0
  const [x, y] = centre()
  angles.push(step * 90)
  xs.push(x)
  ys.push(y)

  const angle = fromSamples(angles)
  return { angle, x: fromSamples(xs), y: fromSamples(ys), end: angle.end }
}
