"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { BldcmVisual } from "@/components/projects/visuals/bldcm-visual";

const BldcmScene = dynamic(() => import("@/components/projects/scenes/bldcm-scene").then((m) => m.BldcmScene), {
  ssr: false,
});

/**
 * Drop-in replacement for the flat BldcmVisual in the Projects grid: the
 * two-board round stack (modeled on the actual KiCad renders) wired to a
 * stand-in BLDC motor, with the LED ring chasing through a commutation
 * cycle, instead of a static schematic. Ignores the `active`/
 * `reducedMotion` props ProjectEntry passes (Object3DViewer tracks both
 * itself) so it still satisfies VisualProps.
 */
export function Bldcm3DVisual() {
  return (
    <Object3DViewer
      Scene={BldcmScene}
      Fallback={BldcmVisual}
      ariaLabel="Interactive 3D model of the two-board BLDC motor controller stack, MCU board on top and power board below, wired to a small stand-in motor. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
