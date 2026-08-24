"use client";

import { useState } from "react";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

const PETAL_COUNT = 6;
const HINGE_R = 20;
const CENTER = { x: 100, y: 100 };

function ledColor(value: number) {
  if (value < 34) return "var(--color-fault)";
  if (value < 67) return "var(--color-amber)";
  return "var(--color-signal)";
}

export function BloomVisual({ reducedMotion }: VisualProps) {
  const [value, setValue] = useState(30);
  const openness = value / 100;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <svg viewBox="0 0 200 200" className="h-auto w-full max-w-xs overflow-visible" aria-hidden="true">
        {Array.from({ length: PETAL_COUNT }).map((_, i) => {
          const thetaDeg = (i / PETAL_COUNT) * 360;
          const theta = (thetaDeg * Math.PI) / 180;
          const hx = CENTER.x + Math.cos(theta) * HINGE_R;
          const hy = CENTER.y + Math.sin(theta) * HINGE_R;
          const closedOffset = -60;
          const angle = thetaDeg + closedOffset * (1 - openness);
          return (
            <g
              key={i}
              transform={`translate(${hx},${hy}) rotate(${angle})`}
              style={{ transition: reducedMotion ? "none" : "transform 0.5s cubic-bezier(0.22,1,0.36,1)" }}
            >
              <path
                d="M0,0 Q26,-13 52,0 Q26,13 0,0 Z"
                fill="var(--color-signal)"
                fillOpacity={0.14 + openness * 0.1}
                stroke="var(--color-signal)"
                strokeOpacity={0.5}
                strokeWidth={1.3}
              />
            </g>
          );
        })}

        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={10}
          fill={ledColor(value)}
          style={{ transition: reducedMotion ? "none" : "fill 0.4s ease" }}
        />
      </svg>

      <div className="flex w-full max-w-[220px] flex-col gap-2">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Conceptual air quality value, drives petal position and indicator color"
          className="w-full accent-signal"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-label uppercase tracking-label text-fg-subtle">Drag to demo</span>
          <TechnicalLabel tone="signal">AQI → Position</TechnicalLabel>
        </div>
      </div>
    </div>
  );
}
