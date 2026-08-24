"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { SkymulDroneModel } from "@/components/work/models/skymul-drone-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function SkymulScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.9, 1.1, 2.2]}
      target={[0, -0.05, 0]}
      minDistance={1.4}
      maxDistance={4.5}
      floorY={-0.55}
      reducedMotion={reducedMotion}
    >
      <SkymulDroneModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
