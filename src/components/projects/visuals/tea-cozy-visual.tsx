"use client";

import { useState } from "react";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

const STEPS = 10;

function tempColor(frac: number): string {
  // cyan (cold) to red (hot), matching the site's cyan/signal accent pair
  const r = Math.round(79 + (232 - 79) * frac);
  const g = Math.round(216 + (81 - 216) * frac);
  const b = Math.round(232 + (79 - 232) * frac);
  return `rgb(${r}, ${g}, ${b})`;
}

export function TeaCozyVisual({ reducedMotion }: VisualProps) {
  const [setpoint, setSetpoint] = useState(3);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex items-end gap-1">
        {Array.from({ length: STEPS }, (_, i) => {
          const on = i <= setpoint;
          return (
            <div
              key={i}
              className="h-3 w-5 rounded-sm transition-opacity"
              style={{
                backgroundColor: tempColor(i / (STEPS - 1)),
                opacity: on ? 1 : 0.15,
                transition: reducedMotion ? "none" : "opacity 0.3s ease",
              }}
            />
          );
        })}
      </div>

      <TechnicalLabel tone="signal">{setpoint * 10}°C setpoint</TechnicalLabel>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setSetpoint((s) => Math.max(0, s - 1))}
          className="border border-border px-4 py-2 font-mono text-label uppercase tracking-label text-fg-muted outline-none transition-colors hover:border-signal hover:text-fg focus-visible:border-signal"
        >
          Down
        </button>
        <button
          type="button"
          onClick={() => setSetpoint((s) => Math.min(STEPS - 1, s + 1))}
          className="border border-border px-4 py-2 font-mono text-label uppercase tracking-label text-fg-muted outline-none transition-colors hover:border-signal hover:text-fg focus-visible:border-signal"
        >
          Up
        </button>
      </div>
    </div>
  );
}
