import { cn } from "@/lib/utils";

type DividerProps = React.ComponentProps<"div"> & {
  /** `signal` renders a glowing accent seam instead of a ruler-tick hairline
   * — for a section boundary a trace visually "arrives at", e.g. the end
   * of the hero. */
  tone?: "hairline" | "signal";
};

export function Divider({ className, tone = "hairline", ...props }: DividerProps) {
  if (tone === "signal") {
    return (
      <div
        role="separator"
        className={cn(
          "h-px w-full bg-gradient-to-r from-transparent via-signal/50 to-transparent",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <div
      role="separator"
      className={cn(
        "h-px w-full bg-[repeating-linear-gradient(to_right,var(--color-border-strong)_0,var(--color-border-strong)_1px,transparent_1px,transparent_8px)]",
        className,
      )}
      {...props}
    />
  );
}
