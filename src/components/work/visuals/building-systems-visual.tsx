"use client";

import { useEffect, useRef } from "react";
import { createTimeline } from "animejs";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/work/experience-case";

/**
 * Kaohsiung: electrical/building-systems schematic. A conduit route draws
 * in, crosses an HVAC duct (the clash), then reroutes around it — a visual
 * stand-in for the Revit/Navisworks clash-detection work, not a literal
 * simulation.
 */
export function BuildingSystemsVisual({ active, reducedMotion }: VisualProps) {
  const switchgearRef = useRef<SVGGElement>(null);
  const panelboardRef = useRef<SVGGElement>(null);
  const originalPathRef = useRef<SVGPathElement>(null);
  const reroutedPathRef = useRef<SVGPathElement>(null);
  const ductRef = useRef<SVGGElement>(null);
  const clashMarkerRef = useRef<SVGGElement>(null);
  const clashLabelRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!active || playedRef.current) return;
    playedRef.current = true;

    const boxes = [switchgearRef.current, panelboardRef.current].filter(Boolean) as SVGGElement[];
    const original = originalPathRef.current;
    const rerouted = reroutedPathRef.current;
    const duct = ductRef.current;
    const clash = [clashMarkerRef.current, clashLabelRef.current].filter(Boolean) as (SVGGElement | HTMLDivElement)[];

    if (!original || !rerouted || !duct) return;

    if (reducedMotion) {
      boxes.forEach((el) => (el.style.opacity = "1"));
      duct.style.opacity = "1";
      original.style.opacity = "0";
      rerouted.style.opacity = "1";
      rerouted.setAttribute("stroke-dashoffset", "0");
      clash.forEach((el) => (el.style.opacity = "0"));
      return;
    }

    const tl = createTimeline({});
    tl.add(boxes, { opacity: [0, 1], scale: [0.96, 1], duration: 500, ease: "outQuad" })
      .add(original, { strokeDashoffset: [1, 0], opacity: [0, 1], duration: 700 }, "-=100")
      .add(duct, { opacity: [0, 1], duration: 400 }, "-=300")
      .add(clash, { opacity: [0, 1], scale: [0.9, 1], duration: 300, ease: "outBack" })
      .add(original, { opacity: [1, 0], duration: 500, ease: "inOutQuad" }, "+=500")
      .add(rerouted, { strokeDashoffset: [1, 0], opacity: [0, 1], duration: 700, ease: "inOutQuad" }, "-=500")
      .add(clash, { opacity: [1, 0], duration: 300 }, "-=400");

    return () => {
      tl.revert();
    };
  }, [active, reducedMotion]);

  return (
    <div className="relative">
      <svg viewBox="0 0 400 260" className="h-auto w-full overflow-visible" aria-hidden="true">
        <g ref={ductRef} style={{ opacity: 0 }}>
          <rect
            x={140}
            y={105}
            width={120}
            height={20}
            fill="none"
            stroke="var(--color-fg-subtle)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <text x={200} y={98} textAnchor="middle" className="fill-fg-subtle font-mono text-[9px] uppercase tracking-wide">
            HVAC
          </text>
        </g>

        <g ref={switchgearRef} style={{ opacity: 0 }}>
          <rect x={20} y={50} width={70} height={90} fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
          <text x={55} y={156} textAnchor="middle" className="fill-fg-subtle font-mono text-[9px] uppercase tracking-wide">
            Switchgear
          </text>
        </g>

        <g ref={panelboardRef} style={{ opacity: 0 }}>
          <rect x={290} y={190} width={70} height={60} fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
          <text x={325} y={266} textAnchor="middle" className="fill-fg-subtle font-mono text-[9px] uppercase tracking-wide">
            Panelboard
          </text>
        </g>

        <path
          ref={originalPathRef}
          d="M90,95 L200,95 L200,220 L290,220"
          fill="none"
          stroke="var(--color-cyan)"
          strokeWidth={2}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1}
          style={{ opacity: 0 }}
        />

        <path
          ref={reroutedPathRef}
          d="M90,95 L90,150 L310,150 L310,220 L290,220"
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth={2}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1}
          style={{ opacity: 0 }}
        />

        <g ref={clashMarkerRef} style={{ opacity: 0 }} transform="translate(200,115)">
          <circle r={7} fill="var(--color-amber)" fillOpacity={0.2} stroke="var(--color-amber)" strokeWidth={1.5} />
          <circle r={2} fill="var(--color-amber)" />
        </g>
      </svg>

      <div
        ref={clashLabelRef}
        style={{ opacity: 0, left: "50%", top: "38%" }}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
      >
        <TechnicalLabel tone="amber">HVAC × Conduit</TechnicalLabel>
      </div>
    </div>
  );
}
