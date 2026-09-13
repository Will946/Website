"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { GridBackground } from "@/components/ui/grid-background";
import { Waveform } from "@/components/hero/waveform";
import { HeroCta } from "@/components/hero/hero-cta";
import { usePointer } from "@/hooks/use-pointer";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { withBasePath } from "@/lib/base-path";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const pointer = usePointer(heroRef);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // As the user scrolls past the hero: the signal thins and slides toward
  // the edge, labels fade, content lifts slightly — a handoff to the
  // signal divider at the bottom, not a generic cross-fade.
  const waveformOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const waveformScaleY = useTransform(scrollYProgress, [0, 1], [1, 0.1]);
  const waveformX = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -32]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.15]);

  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  useAnimationFrame(() => {
    if (reducedMotion) return;
    parallaxX.set(pointer.current.x * 6);
    parallaxY.set(pointer.current.y * 4);
  });

  return (
    <section ref={heroRef} className="relative min-h-dvh overflow-hidden bg-void">
      <motion.div
        style={{ x: parallaxX, y: parallaxY, opacity: gridOpacity }}
        className="absolute inset-0"
      >
        <GridBackground fine />
      </motion.div>

      <motion.div
        style={{ opacity: waveformOpacity, scaleY: waveformScaleY, x: waveformX }}
        className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 origin-center items-center"
      >
        <Waveform pointer={pointer} reducedMotion={reducedMotion} className="h-[30vh] w-full sm:h-[38vh] md:h-[46vh]" />
      </motion.div>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex min-h-dvh flex-col"
      >
        <Container className="pt-8 sm:pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span
              role="img"
              aria-label="William Wong logo"
              className="block h-8 w-16 bg-fg sm:h-10 sm:w-20"
              style={{
                WebkitMaskImage: `url(${withBasePath("/logo-ww.png")})`,
                maskImage: `url(${withBasePath("/logo-ww.png")})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "left center",
                maskPosition: "left center",
              }}
            />
            <div className="hidden items-center gap-3 sm:flex">
              <TechnicalLabel tone="signal">CH1</TechnicalLabel>
              <TechnicalLabel tone="cyan">CH2</TechnicalLabel>
              <TechnicalLabel>5.00V</TechnicalLabel>
              <TechnicalLabel>100Hz</TechnicalLabel>
            </div>
          </div>
        </Container>

        <Container className="flex flex-1 flex-col justify-center">
          <div className="max-w-4xl">
            <Heading level="display" as="h1" className="select-none">
              <span className="block bg-[length:250%_100%] bg-clip-text text-transparent [background-image:linear-gradient(110deg,var(--color-fg)_42%,var(--color-signal)_50%,var(--color-fg)_58%)] animate-name-sweep">
                William
              </span>
              <span className="block bg-[length:250%_100%] bg-clip-text text-transparent [background-image:linear-gradient(110deg,var(--color-fg)_42%,var(--color-signal)_50%,var(--color-fg)_58%)] animate-name-sweep">
                Wong
              </span>
            </Heading>

            <div className="mt-5 flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-border-strong" />
              <p className="text-h3 font-medium tracking-display text-fg-muted sm:text-h2">
                Soldering Samurai
              </p>
            </div>

            <div className="mt-10">
              <HeroCta />
            </div>
          </div>
        </Container>

        <div className="flex justify-center pb-6">
          <div className="flex flex-col items-center gap-2 font-mono text-label uppercase tracking-label text-fg-subtle">
            <span>Scroll</span>
            <span className="h-6 w-px animate-signal-pulse bg-fg-subtle" />
          </div>
        </div>
      </motion.div>

      <Divider tone="signal" className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
