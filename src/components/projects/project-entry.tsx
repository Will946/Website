"use client";

import { useRef, useState, type ComponentType } from "react";
import { motion, useInView } from "motion/react";
import { Heading } from "@/components/ui/heading";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { duration, ease } from "@/lib/motion";

export type VisualProps = {
  active: boolean;
  reducedMotion: boolean;
};

type ProjectEntryProps = {
  project: Project;
  index: number;
  reducedMotion: boolean;
  className?: string;
  visualMinHeight?: string;
  Visual: ComponentType<VisualProps>;
};

const headingLevel: Record<Project["size"], "h2" | "h3"> = {
  large: "h2",
  medium: "h3",
  compact: "h3",
};

export function ProjectEntry({
  project,
  index,
  reducedMotion,
  className,
  visualMinHeight = "min-h-[280px]",
  Visual,
}: ProjectEntryProps) {
  const [inspecting, setInspecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, margin: "0px 0px -10% 0px" });

  return (
    <div
      ref={ref}
      id={project.id}
      className={cn("flex scroll-mt-24 flex-col gap-5 border border-border bg-surface p-6 sm:p-7", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <TechnicalLabel tone="signal">{String(index + 1).padStart(2, "0")}</TechnicalLabel>
        </div>
      </div>

      <Heading level={headingLevel[project.size]} as={headingLevel[project.size]}>
        {project.title}
      </Heading>

      <p className="max-w-md text-body text-fg-muted">{project.hook}</p>

      <div className={cn("relative flex items-center justify-center overflow-hidden", visualMinHeight)}>
        <Visual active={inView} reducedMotion={reducedMotion} />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setInspecting((v) => !v)}
          aria-expanded={inspecting}
          className="inline-flex items-center gap-2 font-mono text-label uppercase tracking-label text-fg-muted transition-colors hover:text-fg"
        >
          <span className="text-signal">{inspecting ? "[–]" : "[+]"}</span>
          {inspecting ? "Close" : "Inspect Project"}
        </button>

        <motion.div
          initial={false}
          animate={{ height: inspecting ? "auto" : 0, opacity: inspecting ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : duration.base, ease: ease.signal }}
          className="overflow-hidden"
        >
          <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
            <p className="max-w-md text-small text-fg-muted">{project.detail}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <TechnicalLabel key={tech}>{tech}</TechnicalLabel>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
