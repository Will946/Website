"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/projects";

type ProjectIndexProps = {
  projects: Project[];
  className?: string;
};

/** Sticky desktop-only scroll-spy index. Independent of each project's own
 * animation-visibility logic — just watches the DOM ids each entry renders. */
export function ProjectIndex({ projects, className }: ProjectIndexProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = projects
      .map((p) => document.getElementById(p.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [projects]);

  return (
    <nav aria-label="Projects" className={cn("hidden lg:block", className)}>
      <ul className="flex flex-col gap-2">
        {projects.map((p, i) => (
          <li key={p.id}>
            <a
              href={`#${p.id}`}
              className={cn(
                "block truncate font-mono text-label uppercase tracking-label transition-colors",
                activeId === p.id ? "text-signal" : "text-fg-subtle hover:text-fg-muted",
              )}
            >
              {String(i + 1).padStart(2, "0")} {p.navLabel}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
