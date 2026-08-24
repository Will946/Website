"use client";

import { useRef } from "react";
import { animated, useSpring } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { pillSorterParts, type PartId } from "@/lib/pill-sorter-parts";
import { PartLabel } from "@/components/current-project/part-label";

const ZERO: readonly [number, number, number] = [0, 0, 0];
const offsetOf = (id: PartId) => pillSorterParts.find((p) => p.id === id)!.explodeOffset;

/**
 * Deliberately low metalness across the board: with no environment map
 * (kept out to avoid an external HDRI fetch), high-metalness PBR surfaces
 * read as near-black everywhere except one blown-out specular hotspot.
 * Low metalness + moderate roughness reads as brushed metal/matte plastic
 * under plain directional lights — which also happens to match the
 * brief's own material guidance ("avoid excessive reflections").
 */
const MAT = {
  housing: { color: "#1c1f22", roughness: 0.7, metalness: 0.08 },
  aluminum: { color: "#a4a9ad", roughness: 0.5, metalness: 0.3 },
  darkMetal: { color: "#3a3e42", roughness: 0.55, metalness: 0.25 },
  pcb: { color: "#0e3d24", roughness: 0.65, metalness: 0.1 },
  motor: { color: "#151719", roughness: 0.5, metalness: 0.3 },
} as const;

type PillSorterModelProps = {
  exploded: boolean;
  activePart: PartId | null;
  onPartHover: (id: PartId | null) => void;
  onPartSelect: (id: PartId) => void;
  spinning: boolean;
  reducedMotion: boolean;
};

export function PillSorterModel({
  exploded,
  activePart,
  onPartHover,
  onPartSelect,
  spinning,
  reducedMotion,
}: PillSorterModelProps) {
  const discRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!spinning || reducedMotion || !discRef.current) return;
    discRef.current.rotation.y += delta * 0.5;
  });

  const spring = useSpring({
    inputPos: exploded ? offsetOf("input") : ZERO,
    inputGlow: activePart === "input" ? 0.5 : 0,
    sortingPos: exploded ? offsetOf("sorting") : ZERO,
    sortingGlow: activePart === "sorting" ? 0.5 : 0,
    outputPos: exploded ? offsetOf("output") : ZERO,
    outputGlow: activePart === "output" ? 0.5 : 0,
    motorPos: exploded ? offsetOf("motor") : ZERO,
    motorGlow: activePart === "motor" ? 0.5 : 0,
    pcbPos: exploded ? offsetOf("pcb") : ZERO,
    pcbGlow: activePart === "pcb" ? 0.5 : 0,
    config: { tension: 170, friction: 24 },
  });

  function handlers(id: PartId) {
    return {
      onPointerOver: (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onPartHover(id);
      },
      onPointerOut: (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onPartHover(null);
      },
      onClick: (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onPartSelect(id);
      },
    };
  }

  return (
    <group position={[0, -0.4, 0]}>
      {/* Base plate */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[1.7, 0.06, 1.25]} />
        <meshStandardMaterial {...MAT.aluminum} />
      </mesh>

      {/* Standoffs */}
      {[
        [0.62, -0.42],
        [0.62, 0.42],
        [-0.62, -0.42],
        [-0.62, 0.42],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.3, z]}>
          <cylinderGeometry args={[0.025, 0.025, 0.55, 12]} />
          <meshStandardMaterial {...MAT.darkMetal} />
        </mesh>
      ))}

      {/* Deck */}
      <mesh position={[0, 0.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 1.0]} />
        <meshStandardMaterial {...MAT.housing} />
      </mesh>

      {/* Motor — mounted below the deck, visible from the side */}
      <animated.group position={spring.motorPos as unknown as [number, number, number]} {...handlers("motor")}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.3, 24]} />
          <animated.meshStandardMaterial
            {...MAT.motor}
            emissive="#3ee587"
            emissiveIntensity={spring.motorGlow}
          />
        </mesh>
        {/* Shaft up through the deck to the disc */}
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
          <meshStandardMaterial {...MAT.darkMetal} />
        </mesh>
      </animated.group>

      {/* Sorting mechanism — rotating disc on the deck */}
      <animated.group position={spring.sortingPos as unknown as [number, number, number]} {...handlers("sorting")}>
        <group ref={discRef} position={[0, 0.64, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.08, 32]} />
            <animated.meshStandardMaterial
              {...MAT.aluminum}
              emissive="#3ee587"
              emissiveIntensity={spring.sortingGlow}
            />
          </mesh>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const r = 0.42;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * r, 0.09, Math.sin(angle) * r]}
                rotation={[0, -angle, 0]}
              >
                <boxGeometry args={[0.03, 0.1, 0.3]} />
                <meshStandardMaterial {...MAT.darkMetal} />
              </mesh>
            );
          })}
        </group>
      </animated.group>

      {/* Input hopper — inverted cone above the disc */}
      <animated.group position={spring.inputPos as unknown as [number, number, number]} {...handlers("input")}>
        <mesh position={[0, 1.15, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.32, 0.5, 24, 1, true]} />
          <animated.meshPhysicalMaterial
            color="#dfe6e0"
            transparent
            opacity={0.35}
            roughness={0.15}
            metalness={0}
            side={2}
            emissive="#4fd8e8"
            emissiveIntensity={spring.inputGlow}
          />
        </mesh>
      </animated.group>

      {/* Output trays — front edge of the deck */}
      <animated.group position={spring.outputPos as unknown as [number, number, number]} {...handlers("output")}>
        {[-0.32, 0, 0.32].map((x) => (
          <mesh key={x} position={[x, 0.63, 0.52]} castShadow>
            <boxGeometry args={[0.26, 0.08, 0.2]} />
            <animated.meshStandardMaterial
              {...MAT.darkMetal}
              emissive="#e8a33d"
              emissiveIntensity={spring.outputGlow}
            />
          </mesh>
        ))}
      </animated.group>

      {/* PCB — mounted on the base plate, exposed (open-frame build) */}
      <animated.group position={spring.pcbPos as unknown as [number, number, number]} {...handlers("pcb")}>
        <mesh position={[-0.58, 0.1, -0.25]} castShadow>
          <boxGeometry args={[0.4, 0.03, 0.3]} />
          <animated.meshStandardMaterial {...MAT.pcb} emissive="#4fd8e8" emissiveIntensity={spring.pcbGlow} />
        </mesh>
        {[
          [-0.7, -0.34],
          [-0.5, -0.18],
          [-0.62, -0.12],
          [-0.46, -0.32],
        ].map(([x, z], i) => (
          <mesh key={x} position={[x, 0.13, z]}>
            <boxGeometry args={[0.04, 0.03, 0.04]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#3ee587" : "#4fd8e8"}
              emissive={i % 2 === 0 ? "#3ee587" : "#4fd8e8"}
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}
      </animated.group>

      {activePart && (
        <PartLabel
          part={pillSorterParts.find((p) => p.id === activePart)!}
          position={labelPosition(activePart, exploded)}
        />
      )}
    </group>
  );
}

function labelPosition(id: PartId, exploded: boolean): [number, number, number] {
  const base: Record<PartId, [number, number, number]> = {
    input: [0, 1.35, 0],
    sorting: [0, 0.95, 0],
    output: [0, 0.85, 0.52],
    motor: [0, 0.1, 0],
    pcb: [-0.58, 0.3, -0.25],
  };
  const [x, y, z] = base[id];
  if (!exploded) return [x, y, z];
  const [ex, ey, ez] = offsetOf(id);
  return [x + ex, y + ey, z + ez];
}
