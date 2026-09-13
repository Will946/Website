"use client";

import { useEffect, useRef } from "react";
import { animate, type JSAnimation } from "animejs";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

/**
 * The concept: input varies, output stays flat 5V. The input waveform's
 * amplitude is scaled continuously (a battery sagging, then a supply
 * running hot) while the output trace never moves — the contrast is the
 * whole point, not a claim about real measured voltages.
 */
export function BuckBoostVisual({ active, reducedMotion }: VisualProps) {
  const inputGroupRef = useRef<SVGGElement>(null);
  const animRef = useRef<JSAnimation | null>(null);

  useEffect(() => {
    const group = inputGroupRef.current;
    if (!group || reducedMotion) return;

    if (active) {
      animRef.current = animate(group, {
        scaleY: [1, 0.35, 1.3, 0.6, 1.15, 1],
        duration: 3600,
        easing: "inOutSine",
        loop: true,
      });
    }
    return () => {
      animRef.current?.pause();
      animRef.current = null;
    };
  }, [active, reducedMotion]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <svg viewBox="0 0 320 120" className="h-auto w-full max-w-sm overflow-visible" aria-hidden="true">
        <g ref={inputGroupRef} style={{ transformOrigin: "50px 60px" }}>
          <path
            d="M10,60 Q25,20 40,60 T70,60 T100,60"
            fill="none"
            stroke="var(--color-amber)"
            strokeWidth={2}
          />
        </g>
        <text x={50} y={100} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          Input
        </text>

        <rect x={130} y={40} width={60} height={40} fill="var(--color-surface-raised)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
        <path d="M140,50 L150,50 L150,45 L155,55 L160,45 L165,55 L170,50 L180,50" fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1} />
        <text x={160} y={100} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          Buck / Boost
        </text>

        <line x1={220} y1={60} x2={310} y2={60} stroke="var(--color-signal)" strokeWidth={2} />
        <text x={265} y={100} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          Output
        </text>

        <path d="M110,60 L130,60" fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1.5} markerEnd="url(#bb-arrow)" />
        <path d="M190,60 L220,60" fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1.5} markerEnd="url(#bb-arrow)" />
        <defs>
          <marker id="bb-arrow" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-fg-subtle)" />
          </marker>
        </defs>
      </svg>

      <TechnicalLabel tone="signal">5V Output</TechnicalLabel>
    </div>
  );
}
