"use client";

import { useEffect, useRef } from "react";
import { createTimeline } from "animejs";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

const SATS: [number, number][] = [
  [60, 20],
  [160, 15],
  [260, 25],
];

/**
 * Conceptual only — signal lines converging on a receiver and a location
 * marker resolving. Not a claim about real positioning accuracy or mode.
 */
export function GnssVisual({ active, reducedMotion }: VisualProps) {
  const signalRefs = [useRef<SVGPathElement>(null), useRef<SVGPathElement>(null), useRef<SVGPathElement>(null)];
  const receiverRef = useRef<SVGRectElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!active || playedRef.current) return;
    playedRef.current = true;

    const signals = signalRefs.map((r) => r.current).filter(Boolean) as SVGPathElement[];
    const receiver = receiverRef.current;
    const marker = markerRef.current;
    if (!receiver || !marker) return;

    if (reducedMotion) {
      signals.forEach((s) => {
        s.style.opacity = "1";
        s.setAttribute("stroke-dashoffset", "0");
      });
      receiver.style.opacity = "1";
      marker.style.opacity = "1";
      return;
    }

    const tl = createTimeline({});
    tl.add(signals[0], { strokeDashoffset: [1, 0], opacity: [0, 1], duration: 700, ease: "outQuad" })
      .add(signals[1], { strokeDashoffset: [1, 0], opacity: [0, 1], duration: 700, ease: "outQuad" }, "-=550")
      .add(signals[2], { strokeDashoffset: [1, 0], opacity: [0, 1], duration: 700, ease: "outQuad" }, "-=550")
      .add(receiver, { opacity: [0.4, 1], duration: 300 }, "-=200")
      .add(marker, { opacity: [0, 1], scale: [0.5, 1], duration: 400, ease: "outBack" });

    return () => {
      tl.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reducedMotion]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <svg viewBox="0 0 320 160" className="h-auto w-full max-w-sm overflow-visible" aria-hidden="true">
        {SATS.map(([x, y], i) => (
          <g key={x}>
            <path d={`M${x - 6},${y} L${x + 6},${y} L${x},${y - 10} Z`} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1.3} />
            <path
              ref={signalRefs[i]}
              d={`M${x},${y + 2} L160,110`}
              fill="none"
              stroke="var(--color-cyan)"
              strokeWidth={1.5}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1}
              style={{ opacity: 0 }}
            />
          </g>
        ))}

        <rect ref={receiverRef} x={140} y={110} width={40} height={16} fill="var(--color-surface-raised)" stroke="var(--color-signal)" strokeWidth={1.5} style={{ opacity: 0.4 }} />
        <text x={160} y={145} textAnchor="middle" className="fill-fg-subtle font-mono text-[9px] uppercase tracking-wide">
          ZED-F9P
        </text>

        <g ref={markerRef} transform="translate(160,90)" style={{ opacity: 0 }}>
          <path d="M0,-14 C7,-14 12,-9 12,-2 C12,7 0,16 0,16 C0,16 -12,7 -12,-2 C-12,-9 -7,-14 0,-14 Z" fill="var(--color-signal)" fillOpacity={0.25} stroke="var(--color-signal)" strokeWidth={1.3} />
          <circle r={3} fill="var(--color-signal)" />
        </g>
      </svg>

      <TechnicalLabel tone="cyan">u-blox ZED-F9P</TechnicalLabel>
    </div>
  );
}
