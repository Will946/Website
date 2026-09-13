"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { FormulaSaeVisual } from "@/components/projects/visuals/formula-sae-visual";

const FormulaSaeScene = dynamic(
  () => import("@/components/projects/scenes/formula-sae-scene").then((m) => m.FormulaSaeScene),
  { ssr: false },
);

/**
 * Drop-in replacement for the flat FormulaSaeVisual in the Projects grid:
 * an interactive 3D car instead of the harness schematic. Ignores the
 * `active`/`reducedMotion` props ProjectEntry passes (Object3DViewer
 * tracks both itself) so it still satisfies the shared VisualProps shape.
 */
export function FormulaSae3DVisual() {
  return (
    <Object3DViewer
      Scene={FormulaSaeScene}
      Fallback={FormulaSaeVisual}
      ariaLabel="Interactive 3D model of the USC Formula SAE car: black bodywork with a red and yellow nose stripe, front and rear wings, and open wheels. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
