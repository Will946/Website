"use client";

import { useEffect, useRef } from "react";
import { animate, createTimeline, type JSAnimation } from "animejs";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { PcbTilt } from "@/components/work/pcb-tilt";
import type { VisualProps } from "@/components/work/experience-case";

/**
 * Droxo: spray-flow sensor PCB. Two independent animation tracks —
 * (1) a one-shot thermal story: normal board → hotspot appears →
 * highlighted → copper pour redesign → settles, and (2) a continuously
 * looping flow indicator (pump → flowmeter → nozzle) that pauses
 * whenever the card is offscreen.
 */
export function PcbFluidThermalVisual({ active, reducedMotion }: VisualProps) {
  const boardGroupRef = useRef<SVGGElement>(null);
  const thermalRef = useRef<SVGCircleElement>(null);
  const hotspotRingRef = useRef<SVGCircleElement>(null);
  const hotspotLabelRef = useRef<HTMLDivElement>(null);
  const copperBeforeRef = useRef<SVGPolygonElement>(null);
  const copperAfterRef = useRef<SVGPolygonElement>(null);
  const flowPathRef = useRef<SVGPathElement>(null);

  const playedRef = useRef(false);
  const flowAnimRef = useRef<JSAnimation | null>(null);

  // One-shot thermal narrative.
  useEffect(() => {
    if (!active || playedRef.current) return;
    playedRef.current = true;

    const board = boardGroupRef.current;
    const thermal = thermalRef.current;
    const ring = hotspotRingRef.current;
    const label = hotspotLabelRef.current;
    const before = copperBeforeRef.current;
    const after = copperAfterRef.current;

    if (!board || !thermal || !ring || !label || !before || !after) return;

    if (reducedMotion) {
      board.style.opacity = "1";
      thermal.style.opacity = "0.25";
      ring.style.opacity = "0";
      label.style.opacity = "0";
      before.style.opacity = "0";
      after.style.opacity = "1";
      return;
    }

    const tl = createTimeline({});
    tl.add(board, { opacity: [0, 1], duration: 500, ease: "outQuad" })
      .add(before, { opacity: [0, 1], duration: 300 }, "-=200")
      .add(thermal, { opacity: [0, 0.55], scale: [0.6, 1], duration: 600, ease: "outQuad" }, "+=200")
      .add(ring, { opacity: [0, 1], scale: [0.8, 1.15], duration: 400, ease: "outBack" }, "-=200")
      .add(label, { opacity: [0, 1], duration: 300 }, "-=100")
      .add(ring, { opacity: [1, 0], duration: 300 }, "+=400")
      .add(label, { opacity: [1, 0], duration: 300 }, "-=200")
      .add(before, { opacity: [1, 0], duration: 500, ease: "inOutQuad" }, "-=100")
      .add(after, { opacity: [0, 1], duration: 500, ease: "inOutQuad" }, "-=500")
      .add(thermal, { opacity: [0.55, 0.15], scale: [1, 0.7], duration: 600, ease: "inOutQuad" }, "-=300");

    return () => {
      tl.revert();
    };
  }, [active, reducedMotion]);

  // Continuous flow indicator — plays only while in view.
  useEffect(() => {
    const path = flowPathRef.current;
    if (!path || reducedMotion) return;

    if (active) {
      flowAnimRef.current = animate(path, {
        strokeDashoffset: [0, -20],
        duration: 900,
        easing: "linear",
        loop: true,
      });
    }

    return () => {
      flowAnimRef.current?.pause();
      flowAnimRef.current = null;
    };
  }, [active, reducedMotion]);

  return (
    <div className="flex flex-col gap-6">
      <svg viewBox="0 0 260 60" className="h-auto w-full max-w-xs overflow-visible" aria-hidden="true">
        <circle cx={20} cy={30} r={12} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1.5} />
        <text x={20} y={52} textAnchor="middle" className="fill-fg-subtle font-mono text-[8px] uppercase tracking-wide">
          Pump
        </text>

        <circle cx={130} cy={30} r={12} fill="none" stroke="var(--color-cyan)" strokeWidth={1.5} />
        <line x1={130} y1={22} x2={130} y2={30} stroke="var(--color-cyan)" strokeWidth={1.5} />
        <line x1={130} y1={30} x2={136} y2={26} stroke="var(--color-cyan)" strokeWidth={1.5} />
        <text x={130} y={52} textAnchor="middle" className="fill-fg-subtle font-mono text-[8px] uppercase tracking-wide">
          Flowmeter
        </text>

        <path d="M228,20 L246,30 L228,40 Z" fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1.5} />
        <text x={234} y={52} textAnchor="middle" className="fill-fg-subtle font-mono text-[8px] uppercase tracking-wide">
          Nozzle
        </text>

        <path
          ref={flowPathRef}
          d="M32,30 L118,30 M142,30 L228,30"
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth={2}
          strokeDasharray="4 6"
        />
      </svg>

      <PcbTilt reducedMotion={reducedMotion} className="w-full">
        <div className="relative">
          <svg viewBox="0 0 300 200" className="h-auto w-full overflow-visible" aria-hidden="true">
            <g ref={boardGroupRef} style={{ opacity: 0 }}>
              <rect x={20} y={20} width={260} height={160} fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
              {[
                "M40,40 L90,40 L90,70",
                "M40,160 L70,160 L70,120",
                "M260,40 L220,40 L220,80",
                "M260,150 L230,150",
                "M120,20 L120,60",
                "M180,180 L180,140",
              ].map((d) => (
                <path key={d} d={d} fill="none" stroke="var(--color-fg-subtle)" strokeOpacity={0.5} strokeWidth={1} />
              ))}
              <rect x={90} y={60} width={30} height={22} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1} />
              <rect x={190} y={50} width={26} height={18} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1} />
              <rect x={150} y={130} width={34} height={24} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1} />
            </g>

            <defs>
              <radialGradient id="pcb-thermal-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-amber)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--color-amber)" stopOpacity={0} />
              </radialGradient>
            </defs>
            <circle ref={thermalRef} cx={200} cy={60} r={36} fill="url(#pcb-thermal-gradient)" style={{ opacity: 0 }} />
            <circle
              ref={hotspotRingRef}
              cx={200}
              cy={60}
              r={16}
              fill="none"
              stroke="var(--color-amber)"
              strokeWidth={1.5}
              style={{ opacity: 0 }}
            />

            <polygon
              ref={copperBeforeRef}
              points="220,110 270,110 270,170 240,170"
              fill="var(--color-signal)"
              fillOpacity={0.18}
              stroke="var(--color-signal)"
              strokeOpacity={0.4}
              strokeWidth={1}
              style={{ opacity: 0 }}
            />
            <polygon
              ref={copperAfterRef}
              points="170,90 270,90 270,175 190,175 170,140"
              fill="var(--color-signal)"
              fillOpacity={0.22}
              stroke="var(--color-signal)"
              strokeOpacity={0.55}
              strokeWidth={1}
              style={{ opacity: 0 }}
            />
          </svg>

          <div
            ref={hotspotLabelRef}
            style={{ opacity: 0, left: "68%", top: "8%" }}
            className="pointer-events-none absolute -translate-y-full"
          >
            <TechnicalLabel tone="amber">Thermal Hotspot</TechnicalLabel>
          </div>
        </div>
      </PcbTilt>
    </div>
  );
}
