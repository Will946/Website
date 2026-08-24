"use client";

import { motion, type Variants } from "motion/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { ProjectEntry } from "@/components/projects/project-entry";
import { ProjectIndex } from "@/components/projects/project-index";
import { projects } from "@/lib/projects";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { FormulaSae3DVisual } from "@/components/projects/visuals/formula-sae-3d";
import { BuckBoost3DVisual } from "@/components/projects/visuals/buck-boost-3d";
import { CocktailMachine3DVisual } from "@/components/projects/visuals/cocktail-machine-3d";
import { Gnss3DVisual } from "@/components/projects/visuals/gnss-3d";
import { MotorDriver3DVisual } from "@/components/projects/visuals/motor-driver-3d";
import { UsbCPd3DVisual } from "@/components/projects/visuals/usb-c-pd-3d";
import { SirGrab3DVisual } from "@/components/projects/visuals/sirgrab-3d";
import { CprPal3DVisual } from "@/components/projects/visuals/cprpal-3d";
import { BloomVisual } from "@/components/projects/visuals/bloom-visual";
import type { ProjectId } from "@/lib/projects";
import type { VisualProps } from "@/components/projects/project-entry";
import type { ComponentType } from "react";

const visualComponents: Record<ProjectId, ComponentType<VisualProps>> = {
  "formula-sae": FormulaSae3DVisual,
  "buck-boost": BuckBoost3DVisual,
  "cocktail-machine": CocktailMachine3DVisual,
  gnss: Gnss3DVisual,
  "motor-driver": MotorDriver3DVisual,
  "usb-c-pd": UsbCPd3DVisual,
  sirgrab: SirGrab3DVisual,
  cprpal: CprPal3DVisual,
  bloom: BloomVisual,
};

const layout: Record<ProjectId, { span: string; height: string }> = {
  "formula-sae": { span: "lg:col-span-12", height: "min-h-[320px]" },
  "buck-boost": { span: "lg:col-span-5", height: "min-h-[260px]" },
  "cocktail-machine": { span: "lg:col-span-7", height: "min-h-[320px]" },
  gnss: { span: "lg:col-span-6", height: "min-h-[280px]" },
  "motor-driver": { span: "lg:col-span-6", height: "min-h-[260px]" },
  "usb-c-pd": { span: "lg:col-span-5", height: "min-h-[260px]" },
  sirgrab: { span: "lg:col-span-7", height: "min-h-[340px]" },
  cprpal: { span: "lg:col-span-4", height: "min-h-[260px]" },
  bloom: { span: "lg:col-span-8", height: "min-h-[360px]" },
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Projects() {
  const reducedMotion = useReducedMotion();
  // Passing `initial={undefined}` doesn't reliably disable Motion's variant
  // resolution — it can still statically apply the "hidden" variant with no
  // whileInView target to ever resolve it. Starting already at "show" under
  // reduced motion is unambiguous: nothing to animate, nothing to get stuck.
  const initial = reducedMotion ? "show" : "hidden";
  const whileInView = "show";

  return (
    <Section id="projects" className="bg-void">
      <Container>
        <motion.div initial={initial} whileInView={whileInView} viewport={{ once: true, amount: 0.4 }} variants={reveal}>
          <Heading level="display" as="h2" className="max-w-3xl">
            <span className="block">Things I built</span>
            <span className="block text-fg-muted">because I&apos;m bored</span>
            <span className="block text-fg-muted">and can.</span>
          </Heading>
          <p className="mt-6 max-w-md text-body-lg text-fg-muted">
            More details can be found on my GitHub, linked at the bottom.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-x-8 lg:grid-cols-[12rem_1fr]">
          <ProjectIndex projects={projects} className="sticky top-24 self-start" />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {projects.map((project, i) => {
              const Visual = visualComponents[project.id];
              const { span, height } = layout[project.id];
              return (
                <ProjectEntry
                  key={project.id}
                  project={project}
                  index={i}
                  reducedMotion={reducedMotion}
                  Visual={Visual}
                  visualMinHeight={height}
                  className={span}
                />
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
