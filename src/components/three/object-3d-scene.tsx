"use client";

import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";

type Object3DSceneProps = {
  children: ReactNode;
  cameraPosition: [number, number, number];
  target?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  /** World-space Y of the object's footprint, so the backdrop grid sits under it. */
  floorY?: number;
  reducedMotion: boolean;
};

/**
 * Shared Canvas + lighting + OrbitControls shell for the site's simpler
 * "inspect this object" 3D viewers (Work's three experience models). Not
 * used by the Pill Sorter, which needs its own camera-reset logic — this
 * is for the plain rotate/zoom case.
 *
 * Lighting recipe carried over from the Pill Sorter fix: no environment
 * map (keeps this fully self-contained, no external HDRI fetch), so
 * materials need to stay low-metalness or they read as near-black.
 */
export function Object3DScene({
  children,
  cameraPosition,
  target = [0, 0, 0],
  minDistance = 2,
  maxDistance = 8,
  floorY = -1.1,
  reducedMotion,
}: Object3DSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: cameraPosition, fov: 40, near: 0.1, far: 30 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      {/* Slightly lighter + bluer than the page's --color-void so the
          scene reads as its own lit "stage" instead of blending into the
          section background. */}
      <color attach="background" args={["#13171a"]} />
      <fog attach="fog" args={["#13171a", 7, 15]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 3, -2]} intensity={0.9} color="#eef0ec" />
      <directionalLight position={[0, 2, -5]} intensity={0.5} color="#4fd8e8" />

      <Grid
        position={[0, floorY, 0]}
        args={[20, 20]}
        cellSize={0.25}
        cellThickness={0.5}
        cellColor="#22262a"
        sectionSize={1.25}
        sectionThickness={1}
        sectionColor="#1d5c66"
        fadeDistance={11}
        fadeStrength={1.5}
        infiniteGrid
        followCamera={false}
      />

      {children}

      <OrbitControls
        enableDamping={!reducedMotion}
        dampingFactor={0.08}
        enablePan={false}
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI * 0.85}
        rotateSpeed={0.6}
        target={target}
        makeDefault
      />
    </Canvas>
  );
}
