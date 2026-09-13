"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { GnssVisual } from "@/components/projects/visuals/gnss-visual";

const GnssScene = dynamic(() => import("@/components/projects/scenes/gnss-scene").then((m) => m.GnssScene), {
  ssr: false,
});

/**
 * Drop-in replacement for the flat GnssVisual in the Projects grid: a
 * realistic 3D carrier board (modeled on the actual KiCad renders) with a
 * PPS LED that blinks once a second, a breathing RTK-fix LED, and three
 * small satellites orbiting overhead, instead of a static schematic.
 * Ignores the `active`/`reducedMotion` props ProjectEntry passes
 * (Object3DViewer tracks both itself) so it still satisfies VisualProps.
 */
export function Gnss3DVisual() {
  return (
    <Object3DViewer
      Scene={GnssScene}
      Fallback={GnssVisual}
      ariaLabel="Interactive 3D model of the GNSS carrier board, with a shielded receiver module, status LEDs, and small satellites orbiting overhead. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
