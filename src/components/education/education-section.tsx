"use client";

import { motion, type Variants } from "motion/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function EducationSection() {
  const reducedMotion = useReducedMotion();
  const initial = reducedMotion ? "show" : "hidden";

  return (
    <Section id="education" className="bg-void pt-0">
      <Container>
        <motion.div
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={reveal}
        >
          <TechnicalLabel tone="cyan">Education</TechnicalLabel>

          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body text-fg-muted">
              <span className="text-fg">University of Southern California</span>
              {" "}· Electrical Engineering
            </p>
            <p className="text-small font-mono uppercase tracking-label text-cyan">
              B.S. Electrical and Computer Engineering
              <br />
              M.S. Electrical Engineering
            </p>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
