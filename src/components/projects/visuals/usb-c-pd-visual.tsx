"use client";

import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

const STEPS = ["USB-C Connected", "Negotiating", "PD Contract", "20V", "Output Ready"] as const;

export function UsbCPdVisual({ reducedMotion }: VisualProps) {
  const [step, setStep] = useState(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  function run() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const stepDelay = reducedMotion ? 0 : 500;
    let i = 0;
    setStep(0);
    const tick = () => {
      i += 1;
      if (i >= STEPS.length) return;
      setStep(i);
      timeoutRef.current = setTimeout(tick, stepDelay);
    };
    timeoutRef.current = setTimeout(tick, stepDelay);
  }

  const ready = step === STEPS.length - 1;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <svg viewBox="0 0 260 80" className="h-auto w-full max-w-sm overflow-visible" aria-hidden="true">
        <rect x={10} y={28} width={36} height={24} rx={4} fill="var(--color-surface-raised)" stroke="var(--color-cyan)" strokeWidth={1.5} />
        <text x={28} y={66} textAnchor="middle" className="fill-fg-subtle font-mono text-[9px] uppercase tracking-wide">
          USB-C
        </text>

        <path
          d="M50,40 L200,40"
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth={2}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={step >= 0 ? 0 : 1}
          style={{ transition: reducedMotion ? "none" : "stroke-dashoffset 1.6s linear" }}
        />

        <path d="M210,25 L245,25 L245,55 L210,55 Z" fill="none" stroke={ready ? "var(--color-signal)" : "var(--color-fg-subtle)"} strokeWidth={1.5} />
        <text x={227} y={70} textAnchor="middle" className="fill-fg-subtle font-mono text-[9px] uppercase tracking-wide">
          Barrel Jack
        </text>
      </svg>

      <div className="flex min-h-6 items-center gap-2">
        {step === -1 ? (
          <TechnicalLabel>Tap to negotiate</TechnicalLabel>
        ) : ready ? (
          <StatusBadge status="pass" label="Output Ready" />
        ) : (
          <TechnicalLabel tone="cyan">{STEPS[step]}</TechnicalLabel>
        )}
      </div>

      <button
        type="button"
        onClick={run}
        className="border border-border px-4 py-2 font-mono text-label uppercase tracking-label text-fg-muted outline-none transition-colors hover:border-signal hover:text-fg focus-visible:border-signal"
      >
        Negotiate
      </button>
    </div>
  );
}
