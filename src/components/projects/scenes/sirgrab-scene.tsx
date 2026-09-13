"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { SirGrabModel } from "@/components/projects/models/sirgrab-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function SirGrabScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.5, 1.3, 1.6]}
      target={[0.1, 0.55, 0]}
      minDistance={1.0}
      maxDistance={4.5}
      floorY={0}
      reducedMotion={reducedMotion}
    >
      <SirGrabModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
