"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { TeaCozyModel } from "@/components/projects/models/tea-cozy-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function TeaCozyScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.6, 1.2, 1.7]}
      target={[0, 0, 0]}
      minDistance={1.1}
      maxDistance={4.5}
      floorY={-0.15}
      reducedMotion={reducedMotion}
    >
      <TeaCozyModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
