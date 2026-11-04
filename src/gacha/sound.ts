// Synthesised mechanical sounds (WebAudio, no files). Muted until the visitor turns sound on.
import { gacha } from './store';

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function audio(): AudioContext | null {
  if (!gacha.get().sound) return null;
  if (!ctx) {
    ctx = new AudioContext();
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function burst(freq: number, q: number, dur: number, gain: number, when = 0) {
  const a = audio(); if (!a || !noise) return;
  const t = a.currentTime + when;
  const src = a.createBufferSource(); src.buffer = noise;
  const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  const g = a.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t, Math.random() * 0.4); src.stop(t + dur + 0.02);
}

function thump(from: number, to: number, dur: number, gain: number, when = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = a.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}

/** The room's light switch. */
export const lightSwitch = () => { burst(2400, 8, 0.02, 0.24); thump(210, 90, 0.07, 0.2); };
/** Neon tubes striking: a few ticks and a low buzz. */
export const neonHum = () => { [0.45, 0.55, 0.69, 0.93].forEach((t) => burst(3000, 2, 0.03, 0.05, t)); tone('sawtooth', 100, 0.5, 0.012, 0.5); };

/** Ratchet pawl dropping into the next tooth. */
export const ratchet = () => { burst(3200, 6, 0.03, 0.22); burst(1400, 4, 0.02, 0.08, 0.004); };
/** The dispensing wheel releasing a capsule at the end of a full turn. */
export const clunk = () => { thump(160, 55, 0.16, 0.5); burst(700, 2, 0.08, 0.2); };
/** Plastic capsule hitting plastic. */
let lastClack = 0;
export function clack(strength: number) {
  const now = performance.now(); if (now - lastClack < 45) return; lastClack = now;
  const s = Math.min(1, strength);
  burst(1800 + Math.random() * 900, 5, 0.035, 0.05 + 0.25 * s);
}
/** Flap swinging. */
export const flapSound = () => { burst(900, 3, 0.06, 0.12); thump(220, 120, 0.08, 0.12, 0.01); };

function tone(type: OscillatorType, freq: number, dur: number, gain: number, when = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator(); o.type = type; o.frequency.value = freq;
  const g = a.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}

/** Keypad key: a soft click plus the controller's confirmation beep. */
export const keyBeep = () => { burst(2600, 5, 0.02, 0.12); tone('square', 1760, 0.07, 0.04, 0.01); };
/** Error double-beep (sold out, wrong order). */
export const errorBeep = () => { tone('square', 330, 0.09, 0.05); tone('square', 262, 0.12, 0.05, 0.11); };
/** Geared motor whir for `dur` seconds (vending coil, claw gantry). */
export function motor(dur: number, pitch = 90, gain = 0.06) {
  const a = audio(); if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(pitch * 0.7, t);
  o.frequency.linearRampToValueAtTime(pitch, t + 0.15); o.frequency.setValueAtTime(pitch, t + dur - 0.15); o.frequency.linearRampToValueAtTime(pitch * 0.6, t + dur);
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
  const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.08);
  g.gain.setValueAtTime(gain, t + dur - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
/** Something light landing in a bin. */
export const thud = (strength = 1) => { thump(140, 60, 0.12, 0.35 * Math.min(1, strength)); burst(900, 2, 0.05, 0.12 * Math.min(1, strength)); };
/** Prize win jingle. */
export const jingle = () => [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, 0.22, 0.06, i * 0.09));

// ---------- the dojo ----------
/** Taiko: the big DON of a stick on the head, its skin ringing, the shell booming. */
export const don = (strength = 1) => {
  const s = Math.min(1, strength);
  thump(118, 46, 0.7, 0.95 * s);
  thump(230, 90, 0.12, 0.35 * s, 0.002);
  burst(260, 1.2, 0.22, 0.4 * s);
  burst(1600, 3, 0.02, 0.18 * s);
};
/** Taiko: the KA of a stick on the rim. */
export const ka = () => { burst(2400, 6, 0.04, 0.3); thump(900, 500, 0.03, 0.12); };
/** A blade drawn from its scabbard: the habaki leaving the koiguchi, then steel singing. */
export const shing = () => {
  burst(3400, 4, 0.08, 0.2);
  burst(6200, 10, 0.35, 0.09, 0.05);
  tone('sine', 2637, 0.9, 0.035, 0.06);
  tone('sine', 3951, 0.6, 0.02, 0.07);
};
/** The blade home in its scabbard: a soft wooden click. */
export const sheathe = () => { burst(1800, 5, 0.04, 0.22); thump(420, 200, 0.05, 0.15, 0.01); };
/** Bamboo sticks rattling inside the omikuji box. */
export const rattle = () => {
  for (let i = 0; i < 9; i++) burst(1500 + Math.random() * 1400, 6, 0.03, 0.12 + Math.random() * 0.08, i * 0.05 + Math.random() * 0.02);
};
/** A wooden stick landing on wood. */
export const tick = (strength = 1) => burst(2100 + Math.random() * 600, 7, 0.03, 0.06 + 0.2 * Math.min(1, strength));
/** The shrine bell (suzu). */
export const suzu = () => [1568, 2093, 2637].forEach((f, i) => tone('triangle', f, 0.7, 0.04, i * 0.03));

/** Sound on, from inside the visitor's click (browsers only start audio from a user gesture). */
export function unlockAudio() { gacha.set({ sound: true }); audio(); }

/** A machine landing on the floor: the floor taking the weight, the cabinet booming, its contents rattling. */
export function slam(kind: 'claw' | 'gacha' | 'vending', strength = 1) {
  const s = Math.min(1, strength), r = Math.random;
  thump(95, 32, 0.45, 0.9 * s);
  thump(185, 60, 0.18, 0.35 * s, 0.004);
  burst(320, 0.8, 0.28, 0.32 * s);
  if (kind === 'claw') {
    // The taiko on its stand: the drum's skin booming, the stand's joints knocking.
    thump(110, 44, 0.8, 0.5 * s, 0.01);
    for (let i = 0; i < 3; i++) burst(900 + r() * 400, 4, 0.05, (0.12 - i * 0.03) * s, 0.03 + i * 0.05);
  } else if (kind === 'gacha') {
    // The omikuji sticks jumping in their box, the shrine bell jangling.
    for (let i = 0; i < 12; i++) burst(1500 + r() * 1400, 6, 0.03, (0.18 - i * 0.012) * s, 0.02 + i * 0.025 + r() * 0.012);
    tone('triangle', 2093, 0.5, 0.03 * s, 0.05);
  } else {
    // The swords knocking in their rack, steel ringing.
    tone('sine', 2637, 0.6, 0.03 * s, 0.02);
    for (let i = 0; i < 5; i++) burst(1900 + r() * 700, 6, 0.04, (0.12 - i * 0.02) * s, 0.03 + i * 0.04);
  }
}
