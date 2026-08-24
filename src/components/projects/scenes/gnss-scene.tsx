"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { GnssModel } from "@/components/projects/models/gnss-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function GnssScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.7, 1.7, 1.9]}
      target={[0, 0.2, 0]}
      minDistance={1.2}
      maxDistance={5}
      floorY={-0.05}
      reducedMotion={reducedMotion}
    >
      <GnssModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
