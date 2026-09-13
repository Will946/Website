"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "motion/react";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

const BASE = { x: 70, y: 170 };
const L1 = 70;
const L2 = 65;
const DEFAULT_TARGET = { x: 170, y: 90 };

/** Standard 2-link inverse kinematics via circle-circle intersection. */
function solveArm(targetX: number, targetY: number) {
  const dx = targetX - BASE.x;
  const dy = targetY - BASE.y;
  const rawDist = Math.hypot(dx, dy);
  const maxReach = L1 + L2 - 1;
  const minReach = Math.abs(L1 - L2) + 1;
  const dist = Math.min(maxReach, Math.max(minReach, rawDist || minReach));
  const ux = dx / (rawDist || 1);
  const uy = dy / (rawDist || 1);
  const clampedTarget = { x: BASE.x + ux * dist, y: BASE.y + uy * dist };

  const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const fx = BASE.x + (a * dx) / dist;
  const fy = BASE.y + (a * dy) / dist;
  const elbow = { x: fx - (h * dy) / dist, y: fy + (h * dx) / dist };

  return { elbow, end: clampedTarget };
}

export function SirGrabVisual({ reducedMotion }: VisualProps) {
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [gripped, setGripped] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const { elbow, end } = solveArm(target.x, target.y);
  const springTransition = reducedMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 140, damping: 16 };

  function handleMove(e: ReactPointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 200;
    setTarget({ x, y });
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <svg
        ref={svgRef}
        viewBox="0 0 300 200"
        className="h-auto w-full max-w-md cursor-crosshair overflow-visible touch-none"
        onPointerMove={handleMove}
        onPointerLeave={() => setTarget(DEFAULT_TARGET)}
        onClick={() => setGripped((g) => !g)}
        role="img"
        aria-label="Robotic arm. Move the cursor to reposition it, click to open or close the gripper."
      >
        {/* vision icon */}
        <rect x={20} y={20} width={26} height={18} rx={2} fill="none" stroke="var(--color-cyan)" strokeWidth={1.3} />
        <circle cx={33} cy={29} r={5} fill="none" stroke="var(--color-cyan)" strokeWidth={1.3} />

        {/* object to grab */}
        <rect x={225} y={175} width={18} height={18} fill="none" stroke="var(--color-amber)" strokeWidth={1.3} />

        {/* base */}
        <circle cx={BASE.x} cy={BASE.y} r={8} fill="var(--color-surface-raised)" stroke="var(--color-border-strong)" strokeWidth={1.5} />

        <motion.line
          x1={BASE.x}
          y1={BASE.y}
          initial={{ x2: elbow.x, y2: elbow.y }}
          animate={{ x2: elbow.x, y2: elbow.y }}
          transition={springTransition}
          stroke="var(--color-fg-subtle)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <motion.line
          initial={{ x1: elbow.x, y1: elbow.y, x2: end.x, y2: end.y }}
          animate={{ x1: elbow.x, y1: elbow.y, x2: end.x, y2: end.y }}
          transition={springTransition}
          stroke="var(--color-fg-subtle)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <motion.circle
          initial={{ cx: elbow.x, cy: elbow.y }}
          animate={{ cx: elbow.x, cy: elbow.y }}
          transition={springTransition}
          r={4}
          fill="var(--color-signal)"
        />

        {/* gripper */}
        <motion.g initial={{ x: end.x, y: end.y }} animate={{ x: end.x, y: end.y }} transition={springTransition}>
          <motion.line
            x1={0}
            y1={0}
            initial={{ x2: 10, y2: -12 }}
            animate={{ x2: gripped ? 6 : 10, y2: gripped ? -8 : -12 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            stroke="var(--color-signal)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <motion.line
            x1={0}
            y1={0}
            initial={{ x2: -10, y2: -12 }}
            animate={{ x2: gripped ? -6 : -10, y2: gripped ? -8 : -12 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            stroke="var(--color-signal)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </motion.g>
      </svg>

      <div className="flex items-center gap-3">
        <TechnicalLabel tone="cyan">MediaPipe</TechnicalLabel>
        <TechnicalLabel tone={gripped ? "signal" : undefined}>{gripped ? "Gripped" : "Move · Click to grip"}</TechnicalLabel>
      </div>
    </div>
  );
}
