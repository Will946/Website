"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { YuPingAcModel } from "@/components/work/models/yu-ping-ac-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function YuPingScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[2.4, 0.9, 2.8]}
      target={[0, 0.1, 0]}
      minDistance={1.8}
      maxDistance={5.5}
      floorY={-1.13}
      reducedMotion={reducedMotion}
    >
      <YuPingAcModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
