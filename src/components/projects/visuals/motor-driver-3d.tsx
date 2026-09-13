"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { MotorDriverVisual } from "@/components/projects/visuals/motor-driver-visual";

const MotorDriverScene = dynamic(
  () => import("@/components/projects/scenes/motor-driver-scene").then((m) => m.MotorDriverScene),
  { ssr: false },
);

/**
 * Drop-in replacement for the flat MotorDriverVisual in the Projects grid:
 * a realistic 3D board (modeled on the actual KiCad renders) wired to a
 * stand-in DC motor whose shaft spins forward, slows, reverses, and
 * repeats, instead of a static schematic. Ignores the `active`/
 * `reducedMotion` props ProjectEntry passes (Object3DViewer tracks both
 * itself) so it still satisfies VisualProps.
 */
export function MotorDriver3DVisual() {
  return (
    <Object3DViewer
      Scene={MotorDriverScene}
      Fallback={MotorDriverVisual}
      ariaLabel="Interactive 3D model of the TB6612FNG motor driver board wired to a small DC motor, whose shaft spins forward and reverse. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
