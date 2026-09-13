"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { CocktailMachineVisual } from "@/components/projects/visuals/cocktail-machine-visual";

const CocktailMachineScene = dynamic(
  () => import("@/components/projects/scenes/cocktail-machine-scene").then((m) => m.CocktailMachineScene),
  { ssr: false },
);

/**
 * Drop-in replacement for the flat CocktailMachineVisual in the Projects
 * grid: a realistic 3D barrel dispenser (modeled on the actual CAD
 * renders) on its fan-shaped base, with a blinking status LED and a
 * dispensing droplet instead of a static schematic. Ignores the
 * `active`/`reducedMotion` props ProjectEntry passes (Object3DViewer
 * tracks both itself) so it still satisfies VisualProps.
 */
export function CocktailMachine3DVisual() {
  return (
    <Object3DViewer
      Scene={CocktailMachineScene}
      Fallback={CocktailMachineVisual}
      ariaLabel="Interactive 3D model of the cocktail machine's wood-stave dispenser barrel, with a status LED and a dispensing droplet. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
