import { describe, expect, it } from 'vitest'
import { bounce, fall, roll, topple, tumble, wobble } from './physics'

const sample = (at: (ms: number) => number, end: number) =>
  Array.from({ length: Math.ceil(end / 10) + 1 }, (_, i) => at(i * 10))

describe('topple', () => {
  const r = topple({ to: -13, height: 0.42, lean: 3 })

  it('comes to rest where it is stopped, without passing through', () => {
    expect(r.at(r.end + 100)).toBe(-13)
    expect(Math.min(...sample(r.at, r.end))).toBeGreaterThanOrEqual(-13)
  })

  it('starts slowly and accelerates, like a real fall', () => {
    expect(Math.abs(r.at(r.contact / 2))).toBeLessThan(13 / 4)
    expect(r.contact).toBeGreaterThan(150)
    expect(r.contact).toBeLessThan(700)
  })

  it('bounces off whatever stops it', () => {
    const after = sample(ms => r.at(r.contact + ms), r.end - r.contact)
    expect(Math.max(...after)).toBeGreaterThan(-13)
  })

  it('falls slower when taller', () => {
    expect(topple({ to: 90, height: 0.68 }).contact).toBeGreaterThan(topple({ to: 90, height: 0.3 }).contact)
  })

  it('reports when it passes an angle', () => {
    const q = topple({ to: 90, height: 0.68 })
    expect(q.at(q.timeTo(45))).toBeGreaterThanOrEqual(45)
    expect(q.timeTo(45)).toBeLessThan(q.contact)
  })
})

describe('bounce, fall, roll, wobble', () => {
  it('bounces down to the floor and never through it', () => {
    const b = bounce(0.8)
    expect(b.at(0)).toBe(0.8)
    expect(b.at(b.end)).toBe(0)
    expect(Math.min(...sample(b.at, b.end))).toBeGreaterThanOrEqual(0)
  })

  it('falls the whole distance, faster and faster', () => {
    const f = fall(1.6)
    expect(f.at(f.end)).toBeCloseTo(1.6)
    expect(f.at(f.end / 2)).toBeLessThan(1.6 / 2)
  })

  it('rolls to a stop', () => {
    const o = roll(0.08, 400)
    expect(o.at(400)).toBeCloseTo(0.08)
    expect(o.at(200)).toBeGreaterThan(0.04)
  })

  it('shakes, then stops', () => {
    const w = wobble(-2.5)
    expect(w.at(0)).toBe(0)
    expect(w.at(w.end)).toBe(0)
  })
})

describe('tumble', () => {
  const t = tumble({ spin: 600, size: 0.6 })

  it('lands flat on a face after whole turns', () => {
    expect(t.angle.at(t.end) % 90).toBe(0)
    expect(t.angle.at(t.end)).toBeGreaterThanOrEqual(90)
    expect(t.x.at(t.end)).toBeCloseTo(t.angle.at(t.end) / 90)
    expect(t.y.at(t.end)).toBeCloseTo(0)
  })

  it('lifts its centre going over each corner', () => {
    expect(Math.max(...sample(t.y.at, t.end))).toBeGreaterThan(0.15)
  })
})
