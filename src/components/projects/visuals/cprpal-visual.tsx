"use client";

import { motion } from "motion/react";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

const LED_COUNT = 12;
/** A representative tempo within the given 100–120 CPM range. */
const BEAT_SECONDS = 60 / 110;

export function CprPalVisual({ active, reducedMotion }: VisualProps) {
  const leds = Array.from({ length: LED_COUNT });
  const pulsing = active && !reducedMotion;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="h-auto w-full max-w-[220px] overflow-visible" aria-hidden="true">
        <circle cx={100} cy={100} r={70} fill="none" stroke="var(--color-border)" strokeWidth={1} />
        {leds.map((_, i) => {
          const angle = (i / LED_COUNT) * Math.PI * 2 - Math.PI / 2;
          // Rounded to avoid a server/client float-serialization hydration mismatch.
          const x = Math.round((100 + Math.cos(angle) * 70) * 100) / 100;
          const y = Math.round((100 + Math.sin(angle) * 70) * 100) / 100;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={5}
              fill="var(--color-signal)"
              initial={{ opacity: 0.25 }}
              animate={pulsing ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.25 }}
              transition={
                pulsing
                  ? { duration: BEAT_SECONDS, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            />
          );
        })}
        <motion.circle
          cx={100}
          cy={100}
          r={30}
          fill="var(--color-signal)"
          fillOpacity={0.08}
          stroke="var(--color-signal)"
          strokeOpacity={0.3}
          strokeWidth={1}
          animate={pulsing ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={pulsing ? { duration: BEAT_SECONDS, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
          style={{ transformOrigin: "100px 100px" }}
        />
      </svg>
      <TechnicalLabel tone="signal">Rhythm / 100–120 CPM</TechnicalLabel>
    </div>
  );
}
