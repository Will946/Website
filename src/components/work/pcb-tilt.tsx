"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/** Resting tilt (0..1 normalized pointer position) — gives the object a
 * settled 3D read even before anyone interacts with it. */
const REST = { x: 0.68, y: 0.32 };

type PcbTiltProps = {
  children: React.ReactNode;
  reducedMotion: boolean;
  className?: string;
};

/**
 * A lightweight CSS-3D tilt — no WebGL. Satisfies "the PCB can rotate
 * slightly in 3D" without the cost/complexity of a real scene running
 * behind three simultaneous experience cards. Desktop: follows the
 * pointer with a spring. Touch/mobile: settles at the resting tilt and
 * doesn't fight scroll gestures. Reduced motion: fixed at rest, no
 * pointer tracking at all.
 */
export function PcbTilt({ children, reducedMotion, className }: PcbTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(REST.x);
  const rawY = useMotionValue(REST.y);
  const rotateX = useSpring(useTransform(rawY, [0, 1], [10, -10]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(rawX, [0, 1], [-14, 14]), { stiffness: 180, damping: 18 });

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top) / rect.height);
  }
  function handleLeave() {
    if (reducedMotion) return;
    rawX.set(REST.x);
    rawY.set(REST.y);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ perspective: 1200 }}
      className={cn(className)}
    >
      <motion.div
        style={reducedMotion ? { rotateX: 10 - REST.y * 20, rotateY: REST.x * 28 - 14 } : { rotateX, rotateY }}
        className="[transform-style:preserve-3d]"
      >
        {children}
      </motion.div>
    </div>
  );
}
