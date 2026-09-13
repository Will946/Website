/**
 * Canonical timing scale. Mirrors the CSS custom properties in globals.css
 * (--duration-*, --ease-*) so Motion, anime.js, and React Spring configs
 * stay in sync with CSS transitions instead of drifting into their own
 * one-off numbers.
 */
export const durationMs = {
  instant: 100,
  fast: 160,
  base: 240,
  slow: 420,
  signal: 600,
} as const;

/** Same scale in seconds, for Motion's `transition.duration`. */
export const duration = {
  instant: durationMs.instant / 1000,
  fast: durationMs.fast / 1000,
  base: durationMs.base / 1000,
  slow: durationMs.slow / 1000,
  signal: durationMs.signal / 1000,
} as const;

export const ease = {
  /** A signal settling — the default for most UI motion. */
  signal: [0.22, 1, 0.36, 1],
  /** Sharper in/out, for snappier state changes (toggles, taps). */
  snap: [0.65, 0, 0.35, 1],
} as const;

/** Spring presets for React Spring — mechanical, not bouncy-by-default. */
export const spring = {
  /** Crisp, damped — for small interactive elements (toggles, dials). */
  mechanical: { tension: 380, friction: 32 },
  /** Looser — for larger physical movement (panels, articulated objects). */
  loose: { tension: 210, friction: 24 },
} as const;
