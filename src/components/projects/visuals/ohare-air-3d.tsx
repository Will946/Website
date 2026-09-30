"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { OhareAirVisual } from "@/components/projects/visuals/ohare-air-visual";

const OhareAirScene = dynamic(() => import("@/components/projects/scenes/ohare-air-scene").then((m) => m.OhareAirScene), {
  ssr: false,
});

/**
 * Drop-in replacement for the flat OhareAirVisual in the Projects grid:
 * the two-layer petal shell (modeled on the actual 3D-printed enclosure)
 * with its center LED and internal stepper needle cycling through the
 * ENS161's five AQI-UBA ratings, instead of a static swatch. Ignores the
 * `active`/`reducedMotion` props ProjectEntry passes (Object3DViewer
 * tracks both itself) so it still satisfies VisualProps.
 */
export function OhareAir3DVisual() {
  return (
    <Object3DViewer
      Scene={OhareAirScene}
      Fallback={OhareAirVisual}
      ariaLabel="Interactive 3D model of O'Hare Air, a flower-shaped desktop air quality monitor, showing its petal shell, center LED, and internal needle cycling through the sensor's five AQI-UBA ratings. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
