"use client";

import { motion } from "motion/react";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

const LED_COUNT = 12;

export function BldcmVisual({ active, reducedMotion }: VisualProps) {
  const spin = active && !reducedMotion;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <svg viewBox="0 0 200 200" className="h-40 w-40 overflow-visible" aria-hidden="true">
        {/* power board */}
        <circle cx={100} cy={130} r={62} fill="var(--color-surface-raised)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
        {/* MCU board */}
        <circle cx={100} cy={70} r={62} fill="var(--color-surface-raised)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
        {/* stack connector */}
        <rect x={85} y={95} width={30} height={12} fill="var(--color-fg-subtle)" />

        {Array.from({ length: LED_COUNT }, (_, i) => {
          const a = (i / LED_COUNT) * Math.PI * 2 - Math.PI / 2;
          return (
            <motion.circle
              key={i}
              cx={100 + Math.cos(a) * 56}
              cy={70 + Math.sin(a) * 56}
              r={4}
              fill="var(--color-cyan)"
              animate={spin ? { opacity: [0.15, 1, 0.15] } : { opacity: 0.15 }}
              transition={
                spin
                  ? { duration: 1.4, repeat: Infinity, ease: "linear", delay: (i / LED_COUNT) * 1.4 }
                  : { duration: 0.2 }
              }
            />
          );
        })}
      </svg>
      <TechnicalLabel tone="cyan">MCU / Power stack · CAN daisy-chain</TechnicalLabel>
    </div>
  );
}
