"use client";

import { motion, type Variants } from "motion/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { LocationMarker } from "@/components/about/location-marker";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function About() {
  const reducedMotion = useReducedMotion();
  // Passing `initial={undefined}` doesn't reliably disable Motion's variant
  // resolution — it can still statically apply the "hidden" variant with no
  // whileInView target to ever resolve it. Starting already at "show" under
  // reduced motion is unambiguous: nothing to animate, nothing to get stuck.
  const initial = reducedMotion ? "show" : "hidden";
  const whileInView = "show";

  return (
    <Section id="about" className="bg-void pb-12">
      <Container>
        <div className="relative flex items-start justify-between gap-4">
          <TechnicalLabel tone="cyan">Mode / Off The Clock</TechnicalLabel>
          <LocationMarker className="hidden sm:block" />
        </div>

        <motion.div
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, amount: 0.4 }}
          variants={reveal}
          className="mt-4 max-w-xl"
        >
          <p className="text-body-lg text-fg-muted">
            Hi, I&apos;m William! I&apos;m 100% human, not AI (I think).
          </p>
          <p className="mt-4 text-body text-fg-muted">
            I&apos;m from Atlanta, Georgia. I studied electrical engineering
            at the University of Southern California, where I picked up a
            B.S. and an M.S. in EE. Outside of building whatever
            thingamabob I&apos;ve come up with next, I play golf, fish, and
            the occasional spikeball (won 2nd place once in a middle school
            tournament), and grind video games (currently Elden Ring).
            I&apos;m also a board game enthusiast: Risk and Ticket to Ride
            are my go-tos. And of course, I eat: top 40 Beli eater in
            Georgia.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}
