"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { PillSorterModel } from "@/components/current-project/pill-sorter-model";
import type { PartId } from "@/lib/pill-sorter-parts";

const DEFAULT_POSITION: [number, number, number] = [3.4, 2.1, 3.8];
const DEFAULT_TARGET: [number, number, number] = [0, 0.15, 0];

type SceneContentsProps = {
  active: boolean;
  reducedMotion: boolean;
  exploded: boolean;
  activePart: PartId | null;
  onPartHover: (id: PartId | null) => void;
  onPartSelect: (id: PartId) => void;
  resetRef: React.RefObject<(() => void) | null>;
};

function SceneContents({
  active,
  reducedMotion,
  exploded,
  activePart,
  onPartHover,
  onPartSelect,
  resetRef,
}: SceneContentsProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const animating = useRef(false);
  const t = useRef(0);
  const fromPos = useRef(new THREE.Vector3());
  const fromTarget = useRef(new THREE.Vector3());
  const defaultPos = useRef(new THREE.Vector3(...DEFAULT_POSITION));
  const defaultTarget = useRef(new THREE.Vector3(...DEFAULT_TARGET));

  useEffect(() => {
    resetRef.current = () => {
      if (reducedMotion) {
        camera.position.copy(defaultPos.current);
        controlsRef.current?.target.copy(defaultTarget.current);
        controlsRef.current?.update();
        return;
      }
      fromPos.current.copy(camera.position);
      if (controlsRef.current) fromTarget.current.copy(controlsRef.current.target);
      t.current = 0;
      animating.current = true;
    };
  }, [camera, reducedMotion, resetRef]);

  useFrame((_, delta) => {
    if (!animating.current) return;
    t.current = Math.min(1, t.current + delta / 0.7);
    const eased = 1 - (1 - t.current) ** 3;
    camera.position.lerpVectors(fromPos.current, defaultPos.current, eased);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(fromTarget.current, defaultTarget.current, eased);
      controlsRef.current.update();
    }
    if (t.current >= 1) animating.current = false;
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 3, -2]} intensity={0.9} color="#eef0ec" />
      <directionalLight position={[0, 2, -5]} intensity={0.5} color="#4fd8e8" />
      <pointLight position={[0, 1.6, 0]} intensity={0.2} color="#3ee587" />

      <PillSorterModel
        exploded={exploded}
        activePart={activePart}
        onPartHover={onPartHover}
        onPartSelect={onPartSelect}
        spinning={active}
        reducedMotion={reducedMotion}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping={!reducedMotion}
        dampingFactor={0.08}
        enablePan={false}
        minDistance={2.2}
        maxDistance={7}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI * 0.85}
        rotateSpeed={0.6}
        target={DEFAULT_TARGET}
        makeDefault
      />
    </>
  );
}

type PillSorterSceneProps = {
  active: boolean;
  reducedMotion: boolean;
};

export function PillSorterScene({ active, reducedMotion }: PillSorterSceneProps) {
  const [exploded, setExploded] = useState(false);
  const [hoveredPart, setHoveredPart] = useState<PartId | null>(null);
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const resetRef = useRef<(() => void) | null>(null);

  const shownPart = hoveredPart ?? selectedPart;

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: DEFAULT_POSITION, fov: 38, near: 0.1, far: 30 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#08090a"]} />
        <fog attach="fog" args={["#08090a", 8, 16]} />
        <SceneContents
          active={active}
          reducedMotion={reducedMotion}
          exploded={exploded}
          activePart={shownPart}
          onPartHover={setHoveredPart}
          onPartSelect={(id) => setSelectedPart((prev) => (prev === id ? null : id))}
          resetRef={resetRef}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
        <Button
          variant={exploded ? "primary" : "secondary"}
          className="pointer-events-auto px-3 py-2"
          onClick={() => setExploded((v) => !v)}
        >
          {exploded ? "Assemble" : "Explode / Inspect"}
        </Button>
        <Button variant="ghost" className="pointer-events-auto px-3 py-2" onClick={() => resetRef.current?.()}>
          Reset View
        </Button>
      </div>
    </div>
  );
}
