import Image from "next/image";
import type { CompanyLogo as CompanyLogoData } from "@/lib/experiences";
import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";

type CompanyLogoProps = {
  company: string;
  logo: CompanyLogoData | null;
  className?: string;
};

/**
 * Renders a real logo asset or an original mark when one exists. Otherwise
 * falls back to the company name as clean type — never a fabricated mark.
 * Swap in a real `logo` on the experience record in
 * `src/lib/experiences.ts` and this renders it automatically.
 */
export function CompanyLogo({ company, logo, className }: CompanyLogoProps) {
  if (!logo) {
    return (
      <span className={cn("font-mono text-label uppercase tracking-label text-fg-muted", className)}>
        {company}
      </span>
    );
  }

  if (logo.kind === "mark") {
    const Mark = logo.Component;
    return <Mark className={cn("h-7 w-auto", className)} />;
  }

  // Real external logo assets often ship on a white background — a small
  // light chip keeps their actual brand colors intact instead of forcing
  // them onto the dark site background.
  return (
    <span
      className={cn(
        logo.onLight && "inline-flex items-center rounded-sm bg-fg px-2 py-1",
        className,
      )}
    >
      <Image
        src={withBasePath(logo.src)}
        alt={logo.alt}
        width={100}
        height={30}
        className="h-[30px] w-auto object-contain"
      />
    </span>
  );
}
