import { cn } from "@/lib/utils";

type Tone = "default" | "signal" | "cyan" | "amber" | "fault";

const toneStyles: Record<Tone, string> = {
  default: "text-fg-muted border-border",
  signal: "text-signal border-signal-dim",
  cyan: "text-cyan border-cyan-dim",
  amber: "text-amber border-amber-dim",
  fault: "text-fault border-fault-dim",
};

type TechnicalLabelProps = React.ComponentProps<"span"> & {
  tone?: Tone;
};

/**
 * An instrumentation-style label — CH1, REV 01, PWM, 5.00V. Use for real
 * technical facts about a project, not as decoration.
 */
export function TechnicalLabel({
  tone = "default",
  className,
  children,
  ...props
}: TechnicalLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5",
        "font-mono text-label uppercase tracking-label",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
