"use client";

import { useEffect, useRef } from "react";
import { animate, createTimeline, type JSAnimation } from "animejs";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

/**
 * Tractive-system low-voltage harness: pack → precharge → AIR → DC-link →
 * CAN logger. One-shot: the harness draws in, then a shutdown-validation
 * cycle plays (AIR opens, then recloses as precharge brings the DC-link
 * up) — a stand-in for "validated across 50 fault conditions," not a
 * literal simulation. The CAN pulse loops continuously while in view.
 */
export function FormulaSaeVisual({ active, reducedMotion }: VisualProps) {
  const harnessRef = useRef<SVGPathElement>(null);
  const airTopRef = useRef<SVGLineElement>(null);
  const airBottomRef = useRef<SVGLineElement>(null);
  const airLabelRef = useRef<HTMLDivElement>(null);
  const dcFillRef = useRef<SVGRectElement>(null);
  const canPulseRef = useRef<SVGCircleElement>(null);

  const playedRef = useRef(false);
  const pulseAnimRef = useRef<JSAnimation | null>(null);

  useEffect(() => {
    if (!active || playedRef.current) return;
    playedRef.current = true;

    const harness = harnessRef.current;
    const airTop = airTopRef.current;
    const airBottom = airBottomRef.current;
    const airLabel = airLabelRef.current;
    const dcFill = dcFillRef.current;
    if (!harness || !airTop || !airBottom || !airLabel || !dcFill) return;

    if (reducedMotion) {
      harness.style.opacity = "1";
      dcFill.setAttribute("width", "36");
      return;
    }

    const tl = createTimeline({});
    tl.add(harness, { strokeDashoffset: [1, 0], opacity: [0, 1], duration: 900, ease: "outQuad" })
      .add(airTop, { y1: "-=6", y2: "-=6", duration: 250, ease: "outQuad" }, "+=400")
      .add(airBottom, { y1: "+=6", y2: "+=6", duration: 250, ease: "outQuad" }, "<")
      .add(airLabel, { opacity: [0, 1], duration: 200 }, "-=150")
      .add(airTop, { y1: "+=6", y2: "+=6", duration: 300, ease: "inOutQuad" }, "+=350")
      .add(airBottom, { y1: "-=6", y2: "-=6", duration: 300, ease: "inOutQuad" }, "<")
      .add(airLabel, { opacity: [1, 0], duration: 200 }, "-=250")
      .add(dcFill, { width: [0, 36], duration: 700, ease: "outQuad" }, "-=100");

    return () => {
      tl.revert();
    };
  }, [active, reducedMotion]);

  useEffect(() => {
    const pulse = canPulseRef.current;
    if (!pulse || reducedMotion) return;
    if (active) {
      pulseAnimRef.current = animate(pulse, {
        cx: [40, 620],
        duration: 2200,
        easing: "linear",
        loop: true,
      });
    }
    return () => {
      pulseAnimRef.current?.pause();
      pulseAnimRef.current = null;
    };
  }, [active, reducedMotion]);

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 700 220" className="h-auto w-full overflow-visible" aria-hidden="true">
        <path
          ref={harnessRef}
          d="M65,110 L150,110 M230,110 L320,110 M400,110 L620,110"
          fill="none"
          stroke="var(--color-cyan)"
          strokeWidth={2}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1}
          style={{ opacity: 0 }}
        />

        {/* pack */}
        <rect x={20} y={80} width={90} height={60} fill="var(--color-surface-raised)" stroke="var(--color-border-strong)" strokeWidth={1.5} />
        <text x={65} y={158} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          Pack
        </text>

        {/* precharge resistor */}
        <path
          d="M150,110 L160,98 L170,122 L180,98 L190,122 L200,98 L210,110"
          fill="none"
          stroke="var(--color-fg-subtle)"
          strokeWidth={1.5}
        />
        <text x={180} y={140} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          Precharge
        </text>

        {/* AIR contactor */}
        <line ref={airTopRef} x1={228} y1={95} x2={228} y2={108} stroke="var(--color-amber)" strokeWidth={3} />
        <line ref={airBottomRef} x1={228} y1={112} x2={228} y2={125} stroke="var(--color-amber)" strokeWidth={3} />
        <text x={228} y={148} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          AIR
        </text>

        {/* DC-link */}
        <line x1={310} y1={85} x2={310} y2={135} stroke="var(--color-fg-subtle)" strokeWidth={2} />
        <line x1={330} y1={85} x2={330} y2={135} stroke="var(--color-fg-subtle)" strokeWidth={2} />
        <rect ref={dcFillRef} x={311} y={87} width={0} height={46} fill="var(--color-signal)" fillOpacity={0.5} />
        <text x={320} y={158} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          DC-Link
        </text>

        {/* CAN bus */}
        <line x1={40} y1={185} x2={630} y2={185} stroke="var(--color-cyan)" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="3 4" />
        <rect x={600} y={165} width={50} height={40} fill="none" stroke="var(--color-fg-subtle)" strokeWidth={1.5} />
        <text x={625} y={158} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-wide">
          CAN Log
        </text>
        <circle ref={canPulseRef} cx={40} cy={185} r={3.5} fill="var(--color-signal)" />
      </svg>

      <div
        ref={airLabelRef}
        style={{ opacity: 0, left: "32.5%", top: "30%" }}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
      >
        <TechnicalLabel tone="amber">AIR Open</TechnicalLabel>
      </div>
    </div>
  );
}
