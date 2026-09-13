"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, type Variants } from "motion/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { Divider } from "@/components/ui/divider";
import { SceneLoading } from "@/components/three/scene-loading";
import { WebglFallback } from "@/components/current-project/webgl-fallback";
import { currentProject } from "@/lib/current-project";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useWebGLSupport } from "@/hooks/use-webgl-support";

const PillSorterScene = dynamic(
  () => import("@/components/current-project/pill-sorter-scene").then((m) => m.PillSorterScene),
  { ssr: false, loading: () => <SceneLoading /> },
);

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function CurrentProject() {
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupport();
  const sceneRef = useRef<HTMLDivElement>(null);
  // Re-triggers each time the section enters/exits view — pauses the
  // continuous animation (disc/motor spin) when scrolled away.
  const inView = useInView(sceneRef, { amount: 0.25, margin: "0px 0px -10% 0px" });
  // Latches true the first time the section gets near the viewport — gates
  // the dynamic import itself, so the ~900KB three.js/R3F/drei chunk isn't
  // fetched on initial page load just because this section exists further
  // down the page.
  const hasBeenNear = useInView(sceneRef, { once: true, amount: 0, margin: "600px 0px 600px 0px" });
  // Passing `initial={undefined}` doesn't reliably disable Motion's variant
  // resolution — it can still statically apply the "hidden" variant with no
  // whileInView target to ever resolve it. Starting already at "show" under
  // reduced motion is unambiguous: nothing to animate, nothing to get stuck.
  const initial = reducedMotion ? "show" : "hidden";
  const whileInView = "show";

  return (
    <Section id="current-project" className="bg-void">
      <Container>
        <motion.div
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, amount: 0.4 }}
          variants={reveal}
          className="flex items-center gap-3"
        >
          <TechnicalLabel tone="signal">Current Project</TechnicalLabel>
          <TechnicalLabel tone="amber">Status / {currentProject.statusLabel}</TechnicalLabel>
        </motion.div>

        <motion.div
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, amount: 0.4 }}
          variants={reveal}
          className="mt-6"
        >
          <Heading level="display" as="h2">
            <span className="block">Automatic</span>
            <span className="block text-fg-muted">Pill Sorter</span>
          </Heading>
        </motion.div>
      </Container>

      <div ref={sceneRef} className="relative mt-12">
        <div
          role="img"
          aria-label="Interactive 3D model of the automatic pill sorter. Drag to rotate, scroll to zoom, use the on-screen controls to explode the assembly or reset the view."
          className="relative h-[65vh] w-full border-y border-border bg-surface sm:h-[78vh]"
        >
          {!hasBeenNear ? null : webglSupported === false ? (
            <WebglFallback />
          ) : webglSupported === null ? (
            <SceneLoading />
          ) : (
            <PillSorterScene active={inView} reducedMotion={reducedMotion} />
          )}

          <div className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-6">
            <TechnicalLabel>Drag to rotate · Scroll to zoom</TechnicalLabel>
          </div>
        </div>
      </div>

      <Container>
        <motion.div
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          className="mt-12 max-w-xl"
        >
          <p className="text-body-lg text-fg-muted">{currentProject.description}</p>
        </motion.div>

        <motion.div
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          className="mt-10 max-w-xl border-l-2 border-amber-dim pl-5"
        >
          <TechnicalLabel tone="amber">Current Challenge</TechnicalLabel>
          <p className="mt-4 text-body text-fg-muted">{currentProject.challenge}</p>
        </motion.div>

        <div className="mt-16 flex items-center justify-center gap-4">
          <Divider className="flex-1" />
          <TechnicalLabel>Next: Projects</TechnicalLabel>
          <Divider className="flex-1" />
        </div>
      </Container>
    </Section>
  );
}
