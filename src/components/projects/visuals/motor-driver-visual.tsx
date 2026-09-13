"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

type Direction = "forward" | "reverse" | "stop";
const NEXT: Record<Direction, Direction> = { stop: "forward", forward: "reverse", reverse: "stop" };
const LABEL: Record<Direction, string> = { stop: "Stop", forward: "Forward", reverse: "Reverse" };
const TONE: Record<Direction, "signal" | "cyan" | "amber"> = { stop: "amber", forward: "signal", reverse: "cyan" };

function Channel({ label, reducedMotion }: { label: string; reducedMotion: boolean }) {
  const [dir, setDir] = useState<Direction>("stop");

  const spin = dir !== "stop" && !reducedMotion;
  const rotate = dir === "forward" ? 360 : dir === "reverse" ? -360 : 0;

  return (
    <button
      type="button"
      onClick={() => setDir((d) => NEXT[d])}
      className="flex flex-col items-center gap-3 border border-border bg-surface-raised px-5 py-4 outline-none transition-colors hover:border-fg-subtle focus-visible:border-signal"
    >
      <svg viewBox="0 0 80 80" className="h-16 w-16 overflow-visible" aria-hidden="true">
        <circle cx={40} cy={40} r={28} fill="none" stroke="var(--color-border-strong)" strokeWidth={1.5} />
        <motion.g
          animate={spin ? { rotate } : { rotate: 0 }}
          transition={spin ? { duration: 1.2, ease: "linear", repeat: Infinity } : { duration: 0.2 }}
          style={{ transformOrigin: "40px 40px" }}
        >
          <line x1={40} y1={40} x2={40} y2={16} stroke="var(--color-fg-subtle)" strokeWidth={2.5} />
          <line x1={40} y1={40} x2={60} y2={52} stroke="var(--color-fg-subtle)" strokeWidth={2.5} />
          <line x1={40} y1={40} x2={20} y2={52} stroke="var(--color-fg-subtle)" strokeWidth={2.5} />
        </motion.g>
        <circle cx={40} cy={40} r={4} fill={dir === "stop" ? "var(--color-fg-subtle)" : "var(--color-signal)"} />
      </svg>
      <span className="font-mono text-label text-fg-subtle">{label}</span>
      <TechnicalLabel tone={TONE[dir]}>{LABEL[dir]}</TechnicalLabel>
    </button>
  );
}

export function MotorDriverVisual({ reducedMotion }: VisualProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex gap-6">
        <Channel label="Ch A" reducedMotion={reducedMotion} />
        <Channel label="Ch B" reducedMotion={reducedMotion} />
      </div>
      <span className="font-mono text-label uppercase tracking-label text-fg-subtle">Click a channel to cycle</span>
    </div>
  );
}
