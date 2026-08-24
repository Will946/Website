import { TechnicalLabel } from "@/components/ui/technical-label";

/**
 * Static elevation-view line drawing, shown when WebGL is unavailable.
 * Same conceptual object as the 3D model: base, standoffs, deck, disc,
 * hopper array, output chute, motor, PCB, just flattened into a schematic.
 */
export function WebglFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8">
      <svg viewBox="0 0 400 300" className="h-auto w-full max-w-lg overflow-visible" role="img" aria-labelledby="pill-sorter-fallback-title">
        <title id="pill-sorter-fallback-title">
          Elevation diagram of the automatic pill dispenser: hopper array, dispensing disc, output chute, motor, and PCB.
        </title>

        {/* base */}
        <rect x={40} y={250} width={320} height={12} fill="var(--color-surface-raised)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
        {/* standoffs */}
        {[70, 330].map((x) => (
          <rect key={x} x={x - 4} y={180} width={8} height={70} fill="var(--color-border-strong)" />
        ))}
        {/* deck */}
        <rect x={50} y={170} width={300} height={10} fill="var(--color-surface-raised)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
        {/* disc */}
        <ellipse cx={200} cy={160} rx={70} ry={14} fill="none" stroke="var(--color-signal)" strokeWidth={1.5} />
        {/* hopper */}
        <path d="M170,150 L230,150 L210,95 L190,95 Z" fill="none" stroke="var(--color-cyan)" strokeWidth={1.5} strokeDasharray="4 3" />
        {/* motor */}
        <rect x={185} y={200} width={30} height={45} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1.5} />
        <line x1={200} y1={200} x2={200} y2={170} stroke="var(--color-fg-subtle)" strokeWidth={1.5} />
        {/* output trays */}
        {[240, 275, 310].map((x) => (
          <rect key={x} x={x} y={165} width={26} height={10} fill="none" stroke="var(--color-amber)" strokeWidth={1.5} />
        ))}
        {/* pcb */}
        <rect x={75} y={225} width={55} height={22} fill="none" stroke="var(--color-cyan)" strokeWidth={1.5} />

        <text x={200} y={80} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          Hoppers
        </text>
        <text x={200} y={145} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          Dispensing
        </text>
        <text x={276} y={158} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          Output
        </text>
        <text x={200} y={260} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          Motor
        </text>
        <text x={102} y={220} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          PCB
        </text>
      </svg>

      <TechnicalLabel>3D View Unavailable / Static Diagram</TechnicalLabel>
    </div>
  );
}
