import Link from "next/link";
import { cn } from "@/lib/utils";

type TextLinkProps = React.ComponentProps<typeof Link>;

/**
 * A link whose underline traces in on hover, like a signal sweeping across
 * a scope. Pure CSS (background-size transition) — no JS animation needed
 * for an effect this simple.
 */
export function TextLink({ className, children, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "text-cyan bg-[linear-gradient(currentColor,currentColor)]",
        "bg-[length:0%_1px] bg-no-repeat bg-left-bottom",
        "transition-[background-size] duration-(--duration-base) ease-(--ease-signal)",
        "hover:bg-[length:100%_1px]",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
