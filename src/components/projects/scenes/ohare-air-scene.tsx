"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { OhareAirModel } from "@/components/projects/models/ohare-air-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function OhareAirScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.3, 0.95, 1.4]}
      target={[0, 0.25, 0]}
      minDistance={0.9}
      maxDistance={3.5}
      floorY={-0.05}
      reducedMotion={reducedMotion}
    >
      <OhareAirModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
