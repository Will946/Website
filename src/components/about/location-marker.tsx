import { cn } from "@/lib/utils";

/** Stylized, simplified Georgia outline — not a literal geographic trace. */
const GA_OUTLINE =
  "20,5 55,8 62,15 78,45 85,70 90,95 88,102 75,112 45,115 25,112 15,100 12,70 10,40 14,15";

type LocationMarkerProps = {
  className?: string;
};

/** "ORIGIN / ATLANTA, GA" — a small technical readout, not a map embed. */
export function LocationMarker({ className }: LocationMarkerProps) {
  return (
    <div
      className={cn(
        "inline-flex w-fit flex-col items-center gap-3 border border-border bg-surface px-6 py-5",
        className,
      )}
    >
      <svg viewBox="0 0 100 120" className="h-20 w-auto" aria-hidden="true">
        <polygon
          points={GA_OUTLINE}
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth={1.5}
        />
        {/* Approximate position, not a literal coordinate. */}
        <circle cx={38} cy={28} r={2.5} fill="var(--color-signal)" />
        <circle
          cx={38}
          cy={28}
          r={5}
          fill="none"
          stroke="var(--color-signal)"
          strokeOpacity={0.5}
          className="animate-signal-pulse"
          style={{ transformOrigin: "38px 28px" }}
        />
      </svg>
      <span className="font-mono text-label uppercase tracking-label text-fg-muted">
        Origin / Atlanta, GA
      </span>
    </div>
  );
}
