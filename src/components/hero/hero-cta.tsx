import Link from "next/link";
import { cn } from "@/lib/utils";

type CtaLinkProps = {
  index: string;
  label: string;
  href: string;
  className?: string;
};

function CtaLink({ index, label, href, className }: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 font-mono text-label uppercase tracking-label text-fg-muted transition-colors hover:text-fg",
        className,
      )}
    >
      <span className="text-signal">[{index}]</span>
      <span
        className={cn(
          "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-no-repeat bg-left-bottom",
          "transition-[background-size] duration-(--duration-base) ease-(--ease-signal)",
          "group-hover:bg-[length:100%_1px]",
        )}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="transition-transform duration-(--duration-base) ease-(--ease-signal) group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

/**
 * Understated hero navigation — placeholders until Projects/About exist.
 * `#projects` / `#about` are the anchor contract those sections should
 * fulfill (add a matching `id`) when they're built.
 */
export function HeroCta() {
  return (
    <nav aria-label="Explore" className="flex flex-wrap items-center gap-x-8 gap-y-3">
      <CtaLink index="01" label="View Projects" href="#projects" />
      <CtaLink index="02" label="About Me" href="#about" />
    </nav>
  );
}
