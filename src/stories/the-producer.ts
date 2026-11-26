/* The producer: the session behind the record. Used by the story (its liner notes count from it)
   and by its making-of page, which shows it. */

export const base = '/stories/the-producer'
export const makingOf = '/stories/the-producer/making-of'

/** The pictures. Source: the Amplifiers image sessions, 23 November 2026. In the order they were made. */
export const shots = [
  ['01-again-v1', 'The AGAIN button, angled, on a black module'],
  ['02-studio-v1', 'The studio, all black'],
  ['03-cassette-v1', 'A black cassette'],
  ['04-mic-v1', 'A black mic on a cable'],
  ['05-button-v1', 'AGAIN, straight on, black bezel'],
  ['06-knob-v1', 'An amp knob turned to 11'],
  ['07-vinyl-v1', 'A black record, blue label'],
  ['08-vinyl-v2', 'The same record, rounder'],
  ['09-mic-v2', 'The mic, hanging from a rod'],
  ['10-mix-v1', 'Eight faders, one blue'],
  ['11-cassette-blue', 'The cassette, blue'],
  ['12-mic-blue', 'The mic, blue mount'],
  ['13-studio-blue', 'The studio, blue speakers'],
  ['14-mix-blue', 'Eight blue faders'],
  ['15-vinyl-blue', 'The record, blue'],
  ['16-mic-blue2', 'The mic, blue all over'],
  ['17-studio-blue2', 'The studio, every plastic blue'],
  ['18-button-blue', 'AGAIN, blue bezel'],
] as const
export const kept = new Set<string>(['11-cassette-blue', '14-mix-blue', '15-vinyl-blue', '16-mic-blue2', '17-studio-blue2', '18-button-blue'])
export const renders = { made: shots.length, kept: kept.size, drawnRounds: 2 }

/** What I typed while the pictures were made, in order. As typed, Bucharest time; spelling fixed. */
export const notes = [
  { at: '10:50', said: 'create visuals for it, maintaining a consistent and beautifully simple aesthetic, NOT SLOP' },
  { at: '11:14', said: 'Okay, these illustrations are not terrible.' },
  { at: '11:14', said: 'That’s not a studio microphone. That is a podcast microphone.' },
  { at: '11:20', said: 'Okay, perhaps we need to do images for all of them.' },
  { at: '11:20', said: 'I don’t like the angle. I want the angle to be simple. I want the camera to look straight at the button.' },
  { at: '11:33', said: 'It feels a bit unfinished, to be honest.' },
  { at: '11:44', said: 'Can we make all plastics blue? That beautiful blue we use on the AGAIN button?' },
  { at: '11:50', said: 'Make the microphone blue plastics.' },
]

export const mics = [
  { n: 1, how: 'Drawn in code.', verdict: '“That is a podcast microphone.”', alt: 'A flat drawing of a pill-shaped microphone on a desk stand.' },
  { n: 2, how: 'Drawn again.', verdict: 'A studio mic now. Still a drawing.', alt: 'A flat drawing of a condenser microphone in a shock mount behind a pop filter.' },
  { n: 3, how: 'Rendered.', verdict: 'Hangs from a rod.', alt: 'A black studio microphone hanging upside down in a shock mount from a rod.' },
  { n: 4, how: 'Rendered again.', verdict: 'Every plastic part blue.', alt: 'The same microphone, its body and shock mount in cobalt blue.' },
]
