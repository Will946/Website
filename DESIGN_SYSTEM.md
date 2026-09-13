# Design system

Source of truth for tokens/primitives established in this pass. Read this
before building any section (Hero, About, Work, Projects, Current Project,
Contact) — it's the contract those sections build on.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4
  (CSS-first config — no `tailwind.config.js`, tokens live in
  `src/app/globals.css` under `@theme`).
- Installed animation libs: `motion` (`motion/react`), `animejs` v4, and —
  as of the Current Project section — `three`, `@react-three/fiber`,
  `@react-three/drei`, `@react-spring/three` for the pill-sorter 3D scene.
  Still not installed: `@react-spring/web` (only the `/three` bindings were
  needed so far; add the web variant only if a future section needs
  spring physics outside a Canvas).
- `clsx` + `tailwind-merge` via the `cn()` helper in `src/lib/utils.ts`.

## Tokens (`src/app/globals.css`)

All under `@theme` unless noted, so they're both CSS variables and Tailwind
utilities (`bg-signal`, `text-h2`, `ease-signal`, etc).

- **Color** — `void`/`surface`/`surface-raised` (dark surfaces),
  `fg`/`fg-muted`/`fg-subtle` (off-white text), `border`/`border-strong`.
  Accents: `signal` (green — active/success/primary interactive), `cyan`
  (secondary accent — links, measurements), `amber` (warning/readout),
  `fault` (red — **reserved for actual error/fault states, never
  decorative**). Each accent has a `-dim` variant for subtle
  backgrounds/borders.
- **Type** — `--font-sans` (IBM Plex Sans) for statements and body,
  `--font-mono` (IBM Plex Mono) for technical labels. Fluid sizes:
  `text-display` → `text-h1` → `text-h2` → `text-h3` → `text-body-lg` →
  `text-body` → `text-small` → `text-label`.
- **Radius** — `radius-sm` (2px), `radius-md` (4px). No pill shapes.
- **Motion** — `ease-signal` / `ease-snap` (Tailwind + `src/lib/motion.ts`),
  duration scale `--duration-instant/fast/base/slow/signal` (plain CSS
  vars, mirrored in `src/lib/motion.ts` as `duration`/`durationMs` for
  Motion/anime/spring configs — one number, two representations).
- **Rhythm** — `--space-section-y` (fluid vertical section padding),
  `--container-max` (76rem). Not every section should use the same
  density — `Section` and `Container` set the rhythm, content density is a
  per-section decision.

## Primitives (`src/components/ui/`)

`Container`, `Section` (optional `grid` prop for the schematic backdrop —
use sparingly, not on every section), `Heading` (`level="display|h1|h2|h3"`),
`Button` (`variant="primary|secondary|ghost"`, Motion-driven hover/tap,
respects reduced motion), `TextLink` (CSS-only underline trace),
`TechnicalLabel` (mono instrumentation chip — CH1/REV 01/PWM; only for real
technical facts, not decoration), `StatusBadge`
(`status="ready|pass|warn|fail"`), `Divider` (ruler-tick hairline),
`GridBackground` (decorative, `aria-hidden`), `VisuallyHidden`.

## Conventions for future sections

- **Reduced motion**: branch on `useReducedMotion()`
  (`src/hooks/use-reduced-motion.ts`) before running any nonessential
  Motion/anime/spring animation — don't rely on the library's own handling,
  this hook is the shared source of truth across all three.
- **Never do `initial={reducedMotion ? undefined : "hidden"}` on a Motion
  `whileInView` reveal.** This was a real, site-wide bug found while
  building Contact: it silently left About, Current Project, Projects, and
  Contact's entrance text **permanently invisible** under
  `prefers-reduced-motion` — Motion doesn't treat an explicitly-`undefined`
  `initial` as "no animation, render normally"; with a `variants` prop
  present it can still statically apply the `hidden` variant with nothing
  ever telling it to resolve to `show`. The fix (already applied
  everywhere it occurred): under reduced motion, set `initial` to the
  same value as the target state (`initial={reducedMotion ? "show" :
  "hidden"}`, `whileInView="show"` unconditionally) so there's nothing to
  animate and nothing to get stuck. Same logic applies to any
  `staggerChildren`/entrance `duration` — gate the number to `0`, don't
  try to remove the prop.
- **3D/heavy scenes**: when R3F shows up, load it via `next/dynamic` with
  `ssr: false` + `Suspense`, gated by `IntersectionObserver` so offscreen
  canvases don't render. Lightweight preview → full interactive scene on
  demand, per the brief's performance requirement.
- **Animation library choice per job**: Motion for UI transitions/hover/
  scroll/layout, React Spring for physical/mechanical movement, anime.js
  for SVG/waveform/timeline work, plain CSS whenever it can do the job
  alone (see `TextLink`, `Divider`).
- **Color discipline**: `fault`/red only for actual error states. `signal`
  green is the default "active" accent; `cyan` is secondary; don't let
  every element reach for the same accent.
- **No pill buttons, no generic rounded cards.** Sharp/near-sharp corners
  throughout — it's an instrument panel, not a SaaS dashboard.
- **`cn()` / tailwind-merge gotcha**: `tailwind-merge` doesn't know about
  custom `@theme` keys like `text-display`/`text-h1`. It can misclassify
  `text-display` as a color utility and silently strip it when merged
  alongside `text-transparent` (this actually happened — the hero name
  rendered at body-text size until traced down). If you need a gradient/
  clipped-text effect on an element that also carries a custom `text-*`
  size class, put the `bg-clip-text`/`text-transparent`/background classes
  on a child element instead of merging them onto the same className.

- **CSS-3D over WebGL, when "slight rotation" is all that's needed**:
  `src/components/work/pcb-tilt.tsx` gives a flat SVG/illustration a
  perspective tilt (resting angle + pointer-follow on desktop, static on
  touch, frozen under reduced motion) using plain CSS `perspective` +
  `rotateX`/`rotateY`, no `three`/`@react-three/fiber`. Reach for this
  before standing up a real WebGL scene when the brief says an object
  should "rotate slightly in 3D" — it's most of the visual payoff at a
  fraction of the performance/complexity cost. Save real R3F for when an
  object needs actual depth/geometry, not just a tilt.
- **Never fabricate a logo.** `src/components/work/company-logo.tsx`
  renders a real logo image when `experience.logo` is set, otherwise
  falls back to clean type — no invented marks, ever, even for real,
  well-known companies, if no asset was provided.
- **anime.js targeting a `ref.current`**: TypeScript needs an explicit
  non-null guard (`if (!el) return;`) before passing refs into
  `createTimeline().add(el, ...)` — `.current` is typed `X | null` and
  anime.js's `TargetsParam` rejects `null`.
- **Motion `animate` prop needs both branches to cover every field.** If
  one branch of a conditional `animate={cond ? {a,b} : {a}}` omits a key
  the other branch has, Motion may try to animate that field from
  `undefined` and warn/no-op. Keep both branches symmetric (see the
  About interest-tile visuals and Work's motor-phase animation for the
  pattern).
- **`@react-three/fiber` breaks generic `React.ElementType` props.**
  Importing it globally augments `JSX.IntrinsicElements` with every
  three.js primitive (`mesh`, `group`, `boxGeometry`, …), which balloons
  `React.ElementType` enough that TypeScript can infer `never` for a
  component's `children` when a prop like `as?: React.ElementType` is
  distributed over that huge union (this broke `Heading`'s `as` prop —
  fixed by narrowing it to a literal tag-name union instead of the full
  `ElementType`). Any other polymorphic `as`-style prop should use the
  same narrow-union pattern, not `React.ElementType`, once r3f is in the
  project.
- **Lazy R3F imports need the mount itself gated, not just the animation.**
  `next/dynamic(..., { ssr: false })` code-splits correctly, but if the
  component that renders it mounts unconditionally (e.g. it's just part
  of the page's normal top-to-bottom section list), the chunk still
  fetches on initial page load — gating *only* an `active`/spin boolean
  via `useInView` doesn't stop the import. Gate the render itself behind
  `useInView(ref, { once: true, margin: "600px 0px 600px 0px" })` (or
  similar) so the fetch is deferred until the user has actually scrolled
  near. See `src/components/current-project/current-project.tsx`
  (`hasBeenNear`) — this pattern caught a real ~900KB unnecessary fetch
  on every page load before it was fixed.
- **High-metalness PBR materials need an environment map, or they read as
  near-black.** Without `<Environment>` (skipped here to avoid an
  external HDRI fetch — keeps the 3D scene fully self-contained/offline
  -safe), `metalness > ~0.5` collapses most of a surface to black except
  one blown-out specular hotspot under a directional light. Keep
  metalness low (~0.1–0.35) with moderate roughness for anything lit only
  by plain directional/ambient lights — see `MAT` in
  `pill-sorter-model.tsx`. This also happens to match the brief's own
  "avoid excessive reflections" material guidance.
- **Motion treats `x`/`y` on SVG elements as a CSS transform
  (`translate`), not the raw SVG attribute.** Animating `x`/`y` on a
  `motion.rect` silently moved the element via `transform: translateY()`
  instead of changing its `y` position attribute — the rect's actual
  attribute never changed, so it visually detached from where the fill
  was supposed to grow. Use `cx`/`cy`, `x1`/`y1`/`x2`/`y2`, or `scaleY`
  with an explicit `transformOrigin` for attribute-like SVG animation;
  reserve `x`/`y` for when you actually want transform-based translation
  (e.g. moving a whole `<g>`, as SirGrab's gripper does intentionally).
- **Anime.js property values don't accept a per-target function** (only
  `delay` does — its signature is `(target, index, total) => number`).
  To give two targets in the same `.add()` call different relative
  offsets (e.g. one contact opening up, the other down), split into two
  `.add()` calls and use the `"<"` position token to start them together,
  rather than trying to branch inside a value function.
- **Trig-computed SVG coordinates can hydration-mismatch.** Passing a
  raw `Math.cos(...)`-derived float as a numeric prop on a `motion.*`
  element can serialize slightly differently between SSR and client
  (Motion's own prop pipeline vs. React's default attribute
  stringification), producing a "didn't match" hydration warning even
  though the underlying value is identical. Round to ~2 decimals before
  rendering (see `cprpal-visual.tsx`).
- **CSS `text-transform: uppercase` case-folds `µ` (micro sign) to
  Greek capital Mu**, which most monospace fonts render distinctly from
  Latin M — "400µF" becomes a visually odd "400ΜF" inside any uppercase
  label. `TechnicalLabel` always uppercases, so avoid `µ` in strings
  passed to it; write `uF` instead (a normal EE convention) and reserve
  `µF` for prose that isn't run through text-transform.

## What's still missing

All seven sections (Hero, About, Work, Current Project, Projects, Contact)
are built. Outstanding items:

- **Resume file** — `src/lib/contact.ts`'s `resume.href` is `null` by
  design (no fabricated placeholder file). Drop the real PDF at
  `public/resume.pdf` and set `href: "/resume.pdf"` to go live; the
  Contact row already renders correctly either way (a dimmed "Pending"
  state vs. a working link).
- Real logo assets for Yu-Ping/Droxo/Skymul, if you want them shown —
  currently text-only per the no-fabrication rule.
- Any factual technical specifics on the Automatic Pill Sorter (pill
  count, sensors, microcontroller, mechanism) — `src/lib/current-project.ts`
  intentionally has no spec fields yet since none were provided; the 3D
  model is illustrative/conceptual, not a rendering of the real design.
- Any existing brand mark/logo, if you have one you want kept.
