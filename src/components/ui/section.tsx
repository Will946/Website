import { cn } from "@/lib/utils";

type SectionProps = React.ComponentProps<"section"> & {
  /** Decorative schematic grid behind the section content. Off by default —
   * every section should not look the same. */
  grid?: boolean;
};

export function Section({ className, grid, children, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        "relative py-(--space-section-y)",
        grid && "bg-grid",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
