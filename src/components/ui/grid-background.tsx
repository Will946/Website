import { cn } from "@/lib/utils";

type GridBackgroundProps = React.ComponentProps<"div"> & {
  fine?: boolean;
  /** Fades the grid toward the edges so it reads as texture, not a pattern. */
  fade?: boolean;
};

/**
 * Decorative schematic/graph-paper backdrop. Absolutely positioned to fill
 * a `relative` parent; purely visual, so it's hidden from assistive tech.
 */
export function GridBackground({ fine, fade = true, className, ...props }: GridBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0",
        fine ? "bg-grid-fine" : "bg-grid",
        fade &&
          "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]",
        className,
      )}
      {...props}
    />
  );
}
