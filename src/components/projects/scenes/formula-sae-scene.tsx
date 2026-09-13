"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { FormulaSaeModel } from "@/components/projects/models/formula-sae-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function FormulaSaeScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[2.6, 1.1, 2.8]}
      target={[0, 0.22, 0]}
      minDistance={1.8}
      maxDistance={7}
      floorY={0}
      reducedMotion={reducedMotion}
    >
      <FormulaSaeModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
