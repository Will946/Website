/**
 * Pure signal-generation math for the hero waveform. Kept separate from the
 * rendering component so the sampling function can be unit-reasoned about
 * on its own: given x (0..1 across the trace) and t (elapsed seconds) and
 * a params snapshot, what's the y value (roughly -1.3..1.3)?
 *
 * `params` is mutated in place by an anime.js timeline (see waveform.tsx) —
 * this module only reads it.
 */

export type WaveformParams = {
  amplitude: number;
  frequency: number;
  noise: number;
  pulseCenter: number;
  pulseAmp: number;
  pulseWidth: number;
};

export function createWaveformParams(overrides: Partial<WaveformParams> = {}): WaveformParams {
  return {
    amplitude: 0,
    frequency: 1,
    noise: 0.02,
    pulseCenter: 0.5,
    pulseAmp: 0,
    pulseWidth: 0.05,
    ...overrides,
  };
}

/** Cheap multi-octave sine "noise" — organic jitter without a noise library. */
function pseudoNoise(x: number, t: number) {
  return (
    Math.sin(x * 97 + t * 1.7) *
    Math.sin(x * 53 - t * 0.6) *
    Math.sin(x * 13.3 + t * 2.3)
  );
}

const TWO_PI = Math.PI * 2;

export function sampleWaveform(
  x: number,
  t: number,
  p: WaveformParams,
  probeX: number | null,
): number {
  let y = 0;
  // Carrier
  y += Math.sin(TWO_PI * p.frequency * x + t) * p.amplitude;
  // Harmonic, for a richer line than a pure sine
  y += Math.sin(TWO_PI * p.frequency * 2.7 * x + t * 1.35) * p.amplitude * 0.15;
  // Texture
  y += pseudoNoise(x, t) * p.noise;
  // Transient spike
  if (p.pulseAmp !== 0) {
    const d = x - p.pulseCenter;
    y += p.pulseAmp * Math.exp(-(d * d) / (2 * p.pulseWidth * p.pulseWidth));
  }
  // Cursor "probe" — a gentle local bump near the pointer
  if (probeX !== null) {
    const d = x - probeX;
    y += 0.12 * Math.exp(-(d * d) / (2 * 0.0018));
  }
  return y;
}

export function buildPath(
  samples: number,
  t: number,
  p: WaveformParams,
  probeX: number | null,
  width: number,
  height: number,
  baseline: number,
): string {
  const amp = height * 0.36;
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    const y = baseline - sampleWaveform(x, t, p, probeX) * amp;
    d += i === 0 ? `M${(x * width).toFixed(2)},${y.toFixed(2)}` : `L${(x * width).toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}
