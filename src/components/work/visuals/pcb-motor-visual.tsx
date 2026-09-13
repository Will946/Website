"use client";

import { useEffect, useRef, useState } from "react";
import { createTimeline } from "animejs";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { StatusBadge } from "@/components/ui/status-badge";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { PcbTilt } from "@/components/work/pcb-tilt";
import type { VisualProps } from "@/components/work/experience-case";

const VALIDATION_TOTAL = 40;

/**
 * Skymul: motor-driver PCB. DRV8353 highlights, three phase traces light
 * up toward the motor, the motor starts spinning, a CAN pulse fires
 * separately, then a validation counter climbs to 40/40.
 */
export function PcbMotorVisual({ active, reducedMotion }: VisualProps) {
  const boardGroupRef = useRef<SVGGElement>(null);
  const driverRef = useRef<SVGRectElement>(null);
  const phaseRefs = [useRef<SVGPathElement>(null), useRef<SVGPathElement>(null), useRef<SVGPathElement>(null)];
  const canPathRef = useRef<SVGPathElement>(null);
  const canPulseRef = useRef<SVGCircleElement>(null);

  const playedRef = useRef(false);
  const [motorActive, setMotorActive] = useState(false);
  // Reduced motion never runs the timeline that would flip motorActive, so
  // derive spinning directly from `active` in that mode instead of calling
  // setState synchronously inside the effect below.
  const spinning = reducedMotion ? active : motorActive;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!active || playedRef.current) return;
    playedRef.current = true;

    const board = boardGroupRef.current;
    const driver = driverRef.current;
    const phases = phaseRefs.map((r) => r.current).filter(Boolean) as SVGPathElement[];
    const canPath = canPathRef.current;
    const canPulse = canPulseRef.current;

    if (!board || !driver || !canPath || !canPulse) return;

    if (reducedMotion) {
      board.style.opacity = "1";
      driver.style.opacity = "1";
      phases.forEach((p) => {
        p.style.opacity = "1";
        p.setAttribute("stroke-dashoffset", "0");
      });
      canPath.style.opacity = "1";
      canPulse.style.opacity = "0";
      count.set(VALIDATION_TOTAL);
      return;
    }

    const tl = createTimeline({});
    tl.add(board, { opacity: [0, 1], duration: 500, ease: "outQuad" })
      .add(driver, { opacity: [0, 1], duration: 300 }, "-=100")
      .add(driver, { strokeWidth: [1.5, 3], duration: 250, ease: "outQuad", alternate: true, loop: 1 })
      .add(
        phases,
        {
          strokeDashoffset: [1, 0],
          opacity: [0, 1],
          duration: 600,
          ease: "outQuad",
          onComplete: () => setMotorActive(true),
        },
        "-=100",
      )
      .add(canPath, { opacity: [0, 1], duration: 300 })
      .add(canPulse, {
        opacity: [0, 1, 0],
        duration: 700,
        ease: "inOutQuad",
        onComplete: () => {
          animate(count, VALIDATION_TOTAL, { duration: 1.2, ease: "easeOut" });
        },
      });

    return () => {
      tl.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reducedMotion]);

  return (
    <div className="flex flex-col gap-6">
      <PcbTilt reducedMotion={reducedMotion} className="w-full">
        <div className="relative">
          <svg viewBox="0 0 320 200" className="h-auto w-full overflow-visible" aria-hidden="true">
            <g ref={boardGroupRef} style={{ opacity: 0 }}>
              <rect x={20} y={20} width={180} height={160} fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
              {["M40,40 L60,40", "M40,160 L70,160", "M180,140 L160,140", "M60,20 L60,50"].map((d) => (
                <path key={d} d={d} fill="none" stroke="var(--color-fg-subtle)" strokeOpacity={0.5} strokeWidth={1} />
              ))}
            </g>

            <rect
              ref={driverRef}
              x={70}
              y={80}
              width={60}
              height={40}
              fill="var(--color-surface-raised)"
              stroke="var(--color-signal)"
              strokeWidth={1.5}
              style={{ opacity: 0 }}
            />
            <text x={100} y={104} textAnchor="middle" className="fill-signal font-mono text-[9px] uppercase tracking-wide">
              DRV8353
            </text>

            {[92, 100, 108].map((y, i) => (
              <path
                key={y}
                ref={phaseRefs[i]}
                d={`M130,${y} L270,${y}`}
                fill="none"
                stroke={i === 0 ? "var(--color-signal)" : i === 1 ? "var(--color-cyan)" : "var(--color-amber)"}
                strokeWidth={2.5}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1}
                style={{ opacity: 0 }}
              />
            ))}

            <path
              ref={canPathRef}
              d="M100,120 L100,180 L20,180"
              fill="none"
              stroke="var(--color-fg-subtle)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              style={{ opacity: 0 }}
            />
            <circle ref={canPulseRef} cx={60} cy={180} r={3} fill="var(--color-fg)" style={{ opacity: 0 }} />
            <text x={35} y={195} className="fill-fg-subtle font-mono text-[8px] uppercase tracking-wide">
              CAN
            </text>

            <g transform="translate(285,100)">
              <circle r={30} fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
              <MotorBlades spinning={spinning} reducedMotion={reducedMotion} />
            </g>
            <text x={285} y={142} textAnchor="middle" className="fill-fg-subtle font-mono text-[8px] uppercase tracking-wide">
              Motor
            </text>
          </svg>
        </div>
      </PcbTilt>

      <div className="flex items-center gap-4">
        <div className="font-mono text-h3 text-fg tabular-nums">
          <motion.span>{rounded}</motion.span>
          <span className="text-fg-subtle"> / {VALIDATION_TOTAL}</span>
        </div>
        <TechnicalLabel tone="signal">40-Point Validation</TechnicalLabel>
        {spinning && <StatusBadge status="pass" />}
      </div>
    </div>
  );
}

function MotorBlades({ spinning, reducedMotion }: { spinning: boolean; reducedMotion: boolean }) {
  return (
    <motion.g
      animate={spinning && !reducedMotion ? { rotate: 360 } : { rotate: 0 }}
      transition={spinning && !reducedMotion ? { duration: 1.6, ease: "linear", repeat: Infinity } : { duration: 0 }}
      style={{ transformOrigin: "0px 0px" }}
    >
      <line x1={0} y1={0} x2={0} y2={-20} stroke="var(--color-fg-subtle)" strokeWidth={2} />
      <line x1={0} y1={0} x2={17} y2={10} stroke="var(--color-fg-subtle)" strokeWidth={2} />
      <line x1={0} y1={0} x2={-17} y2={10} stroke="var(--color-fg-subtle)" strokeWidth={2} />
      <circle r={3} fill={spinning ? "var(--color-signal)" : "var(--color-fg-subtle)"} />
    </motion.g>
  );
}
