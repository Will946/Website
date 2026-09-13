"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { MotorDriverModel } from "@/components/projects/models/motor-driver-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function MotorDriverScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.5, 1.1, 1.6]}
      target={[0.25, 0.15, 0]}
      minDistance={1.0}
      maxDistance={4}
      floorY={-0.15}
      reducedMotion={reducedMotion}
    >
      <MotorDriverModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
