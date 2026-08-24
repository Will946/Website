"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { CprPalModel } from "@/components/projects/models/cprpal-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function CprPalScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.5, 1.6, 1.7]}
      target={[0, 0.2, 0]}
      minDistance={1.1}
      maxDistance={4.5}
      floorY={0}
      reducedMotion={reducedMotion}
    >
      <CprPalModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
