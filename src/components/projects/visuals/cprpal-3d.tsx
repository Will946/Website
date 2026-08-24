"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { CprPalVisual } from "@/components/projects/visuals/cprpal-visual";

const CprPalScene = dynamic(() => import("@/components/projects/scenes/cprpal-scene").then((m) => m.CprPalScene), {
  ssr: false,
});

/**
 * Drop-in replacement for the flat CprPalVisual in the Projects grid: a
 * realistic 3D puck (modeled on the actual CAD renders) whose bezel LED
 * ring pulses at the AHA-recommended pacing tempo, with the whole body
 * giving a tiny compression "thump" on each beat, instead of a flat LED
 * ring diagram. Ignores the `active`/`reducedMotion` props ProjectEntry
 * passes (Object3DViewer tracks both itself) so it still satisfies
 * VisualProps.
 */
export function CprPal3DVisual() {
  return (
    <Object3DViewer
      Scene={CprPalScene}
      Fallback={CprPalVisual}
      ariaLabel="Interactive 3D model of CPRPal, a chest-compression pacing puck, with its bezel LED ring pulsing at the pacing tempo and the body giving a small compression thump on each beat. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
