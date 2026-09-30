"use client";

import { useState } from "react";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { VisualProps } from "@/components/projects/project-entry";

const RATINGS = ["Excellent", "Good", "Moderate", "Poor", "Unhealthy"] as const;
const ANGLES = [0, 90, 115, 140, 180];

function ratingColor(i: number): string {
  const hue = [120, 86, 54, 29, 0][i];
  return `hsl(${hue}, 75%, 50%)`;
}

export function OhareAirVisual({ reducedMotion }: VisualProps) {
  const [rating, setRating] = useState(1);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        className="size-24 rounded-full border border-border"
        style={{
          backgroundColor: ratingColor(rating),
          transition: reducedMotion ? "none" : "background-color 0.4s ease",
        }}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-label uppercase tracking-label text-fg">{RATINGS[rating]}</span>
        <TechnicalLabel tone="signal">AQI-UBA {rating + 1} · needle {ANGLES[rating]}°</TechnicalLabel>
      </div>

      <input
        type="range"
        min={0}
        max={4}
        step={1}
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        aria-label="Demo AQI-UBA rating, drives LED color and needle angle"
        className="w-full max-w-[220px] accent-signal"
      />
    </div>
  );
}
