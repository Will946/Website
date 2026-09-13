"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { TeaCozyVisual } from "@/components/projects/visuals/tea-cozy-visual";

const TeaCozyScene = dynamic(() => import("@/components/projects/scenes/tea-cozy-scene").then((m) => m.TeaCozyScene), {
  ssr: false,
});

/**
 * Drop-in replacement for the flat TeaCozyVisual in the Projects grid: the
 * rectangular board (modeled on the actual KiCad renders) with its spiral
 * heater coil warming and its ten-segment LED dial climbing and falling
 * between setpoints, instead of a static schematic. Ignores the
 * `active`/`reducedMotion` props ProjectEntry passes (Object3DViewer
 * tracks both itself) so it still satisfies VisualProps.
 */
export function TeaCozy3DVisual() {
  return (
    <Object3DViewer
      Scene={TeaCozyScene}
      Fallback={TeaCozyVisual}
      ariaLabel="Interactive 3D model of the Tea Cozy Hotplate board, showing the spiral PCB heater coil and the ten-segment temperature dial climbing and falling. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
