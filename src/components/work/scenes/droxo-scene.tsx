"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { DroxoCartModel } from "@/components/work/models/droxo-cart-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function DroxoScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[2.2, 1.1, 2.6]}
      target={[0, 0.05, 0]}
      minDistance={1.8}
      maxDistance={5.5}
      floorY={-0.53}
      reducedMotion={reducedMotion}
    >
      <DroxoCartModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
