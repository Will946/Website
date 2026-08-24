"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { CocktailMachineModel } from "@/components/projects/models/cocktail-machine-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function CocktailMachineScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[2.1, 1.7, 2.3]}
      target={[0, 0.8, 0]}
      minDistance={1.5}
      maxDistance={6}
      floorY={0}
      reducedMotion={reducedMotion}
    >
      <CocktailMachineModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
