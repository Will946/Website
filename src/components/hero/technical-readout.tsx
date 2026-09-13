import { cn } from "@/lib/utils";

type Tone = "signal" | "cyan";

const toneDot: Record<Tone, string> = {
  signal: "bg-signal",
  cyan: "bg-cyan",
};
const toneText: Record<Tone, string> = {
  signal: "text-signal",
  cyan: "text-cyan",
};

type StatusIndicatorProps = {
  label: string;
  tone?: Tone;
  className?: string;
};

/** "SYSTEM / ONLINE" style readout with a pulsing status dot. */
export function StatusIndicator({ label, tone = "signal", className }: StatusIndicatorProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 font-mono text-label uppercase tracking-label", toneText[tone], className)}>
      <span className="relative flex size-1.5">
        <span className={cn("absolute inset-0 rounded-full animate-signal-pulse", toneDot[tone])} />
        <span className={cn("relative size-1.5 rounded-full", toneDot[tone])} />
      </span>
      {label}
    </div>
  );
}
