"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { SirGrabVisual } from "@/components/projects/visuals/sirgrab-visual";

const SirGrabScene = dynamic(() => import("@/components/projects/scenes/sirgrab-scene").then((m) => m.SirGrabScene), {
  ssr: false,
});

/**
 * Drop-in replacement for the flat SirGrabVisual in the Projects grid: a
 * realistic 3D robotic arm (modeled on the actual CAD renders) that
 * autonomously reaches down, grips a cube, carries it to a new spot,
 * releases it, and returns home, on a loop, instead of the mouse-driven
 * 2D arm. Ignores the `active`/`reducedMotion` props ProjectEntry passes
 * (Object3DViewer tracks both itself) so it still satisfies VisualProps.
 */
export function SirGrab3DVisual() {
  return (
    <Object3DViewer
      Scene={SirGrabScene}
      Fallback={SirGrabVisual}
      ariaLabel="Interactive 3D model of the SirGrab robotic arm, autonomously reaching down, gripping a cube, moving it to a new spot, and releasing it, on a loop. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
