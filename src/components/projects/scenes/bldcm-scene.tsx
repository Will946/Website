"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { BldcmModel } from "@/components/projects/models/bldcm-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function BldcmScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.7, 1.1, 1.9]}
      target={[0, 0.38, 0]}
      minDistance={1.2}
      maxDistance={5}
      floorY={-0.15}
      reducedMotion={reducedMotion}
    >
      <BldcmModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
