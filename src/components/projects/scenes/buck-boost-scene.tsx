"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { BuckBoostModel } from "@/components/projects/models/buck-boost-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function BuckBoostScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.1, 0.9, 1.2]}
      target={[0, 0, 0]}
      minDistance={0.7}
      maxDistance={3}
      floorY={-0.15}
      reducedMotion={reducedMotion}
    >
      <BuckBoostModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
