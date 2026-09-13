"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { ContactLinkRow } from "@/components/contact/contact-link";
import { contactLinks } from "@/lib/contact";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Contact() {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Passing `initial={undefined}` doesn't reliably disable Motion's variant
  // resolution — it can still statically apply the "hidden" variant with no
  // whileInView target to ever resolve it. Starting already at "show" under
  // reduced motion is unambiguous: nothing to animate, nothing to get stuck.
  const initial = reducedMotion ? "show" : "hidden";
  const whileInView = "show";

  const dotPercent = activeIndex === null ? null : ((activeIndex + 0.5) / contactLinks.length) * 100;

  return (
    <Section id="contact" className="bg-void">
      <Container>
        <motion.div
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, amount: 0.4 }}
          variants={reveal}
          className="flex items-center gap-3"
        >
          <TechnicalLabel tone="signal">Contact</TechnicalLabel>
        </motion.div>

        <motion.div
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, amount: 0.4 }}
          variants={reveal}
          className="mt-6"
        >
          <Heading level="h1" as="h2">
            You can reach me here.
          </Heading>
        </motion.div>

        <motion.div
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          className="relative mt-14"
        >
          <div>
            {contactLinks.map((link, i) => (
              <ContactLinkRow
                key={link.id}
                link={link}
                index={i}
                onActivate={() => setActiveIndex(i)}
                onDeactivate={() => setActiveIndex(null)}
              />
            ))}
          </div>

          <div className="relative mt-1 h-px w-full bg-gradient-to-r from-transparent via-signal/50 to-transparent">
            {!reducedMotion && (
              <motion.div
                aria-hidden="true"
                className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-signal"
                animate={{
                  left: dotPercent === null ? "0%" : `${dotPercent}%`,
                  opacity: dotPercent === null ? 0 : 1,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                style={{ x: "-50%" }}
              />
            )}
          </div>
        </motion.div>

        <div className="mt-20 flex flex-col items-center gap-6 text-center">
          <p className="font-mono text-small text-fg-subtle">© 2026 William Wong · Rev 01</p>
        </div>
      </Container>
    </Section>
  );
}
