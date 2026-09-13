"use client";

import { Object3DScene } from "@/components/three/object-3d-scene";
import { UsbCPdModel } from "@/components/projects/models/usb-c-pd-model";
import type { Object3DSceneProps } from "@/components/three/object-3d-viewer";

export function UsbCPdScene({ active, reducedMotion }: Object3DSceneProps) {
  return (
    <Object3DScene
      cameraPosition={[1.3, 1.3, 1.5]}
      target={[0, 0, 0]}
      minDistance={0.9}
      maxDistance={4}
      floorY={-0.15}
      reducedMotion={reducedMotion}
    >
      <UsbCPdModel active={active} reducedMotion={reducedMotion} />
    </Object3DScene>
  );
}
