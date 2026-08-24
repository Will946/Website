"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

const CHANNELS = [0, 1, 2, 3];

export function CocktailMachineVisual({ reducedMotion }: VisualProps) {
  const [hovered, setHovered] = useState(false);

  function dur(seconds: number) {
    return reducedMotion ? 0 : seconds;
  }

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTapStart={() => setHovered(true)}
      onTap={() => setHovered(false)}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="flex w-full flex-col items-center gap-4 outline-none"
    >
      <svg viewBox="0 0 320 200" className="h-auto w-full max-w-md overflow-visible" aria-hidden="true">
        <motion.rect
          x={20}
          y={20}
          width={70}
          height={40}
          fill="var(--color-surface-raised)"
          stroke="var(--color-signal)"
          strokeWidth={1.5}
          animate={{ opacity: hovered ? 1 : 0.6 }}
          transition={{ duration: dur(0.3) }}
        />
        <text x={55} y={76} textAnchor="middle" className="fill-fg-subtle font-mono text-[9px] uppercase tracking-wide">
          ESP32-S3
        </text>

        {CHANNELS.map((i) => (
          <motion.rect
            key={i}
            x={20}
            y={95 + i * 18}
            width={24}
            height={12}
            fill="var(--color-surface-raised)"
            stroke="var(--color-cyan)"
            strokeWidth={1.2}
            animate={{ fillOpacity: hovered ? [0.2, 0.9, 0.4] : 0.2 }}
            transition={{ duration: dur(0.4), delay: dur(0.15 * i) }}
          />
        ))}

        {CHANNELS.map((i) => (
          <motion.path
            key={i}
            d={`M44,${101 + i * 18} C 120,${101 + i * 18} 160,${170 - i * 6} 220,170`}
            fill="none"
            stroke="var(--color-fg-subtle)"
            strokeWidth={1.5}
            strokeDasharray="3 4"
            animate={{ strokeDashoffset: hovered ? [0, -28] : 0 }}
            transition={
              hovered
                ? { duration: dur(0.9), delay: dur(0.15 * i + 0.3), repeat: reducedMotion ? 0 : Infinity, ease: "linear" }
                : { duration: 0 }
            }
          />
        ))}

        {/* glass */}
        <clipPath id="cocktail-glass-clip">
          <path d="M205,150 L235,150 L228,195 L212,195 Z" />
        </clipPath>
        <path d="M205,150 L235,150 L228,195 L212,195 Z" fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1.5} />
        <motion.rect
          x={200}
          y={155}
          width={40}
          height={40}
          fill="var(--color-signal)"
          fillOpacity={0.6}
          clipPath="url(#cocktail-glass-clip)"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: hovered ? 1 : 0 }}
          transition={{ duration: dur(0.8), delay: dur(0.9) }}
          style={{ transformOrigin: "50% 100%" }}
        />
        <text x={220} y={210} textAnchor="middle" className="fill-fg-subtle font-mono text-[9px] uppercase tracking-wide">
          Output
        </text>
      </svg>

      <TechnicalLabel>Hover to run a cycle</TechnicalLabel>
    </motion.div>
  );
}
