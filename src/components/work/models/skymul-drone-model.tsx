"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Conceptual quadcopter model for the rebar-tying drone work — four
 * angled carbon-fiber-style legs doubling as arms (matching the real
 * reference photos' wide stance), a yellow top housing, and a claw-like
 * gripper actuator hanging below in place of a payload camera.
 * Illustrative, not a literal CAD reproduction.
 */
const MAT = {
  frame: { color: "#111214", roughness: 0.4, metalness: 0.3 },
  housing: { color: "#e8a33d", roughness: 0.55, metalness: 0.1 },
  motor: { color: "#3a3e42", roughness: 0.4, metalness: 0.4 },
  motorCap: { color: "#6a6f72", roughness: 0.3, metalness: 0.6 },
  blade: { color: "#26292c", roughness: 0.35, metalness: 0.3 },
  claw: { color: "#9198a0", roughness: 0.3, metalness: 0.55 },
  battery: { color: "#1c1f22", roughness: 0.5, metalness: 0.15 },
} as const;

/** Cylinder position/rotation/length between two points in the XY plane. */
function legTransform(start: [number, number], end: [number, number]) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(-dx, dy);
  const mid: [number, number] = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
  return { mid, angle, length };
}

const LEG = legTransform([0.1, 0.12], [0.78, -0.38]);
const LEG_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

/** Claw fingers: hinge point above, tips splayed outward below. */
const CLAW_PIVOT: [number, number, number] = [0, -0.2, 0.02];
const CLAW_ANGLE = 0.5;
const CLAW_LENGTH = 0.21;
const CLAW_OFFSET_X = CLAW_LENGTH * Math.sin(CLAW_ANGLE);
const CLAW_OFFSET_Y = CLAW_LENGTH * Math.cos(CLAW_ANGLE);
const CLAW_FINGERS = [1, -1].map((sign) => ({
  rotationZ: sign * CLAW_ANGLE,
  position: [
    CLAW_PIVOT[0] + (sign * CLAW_OFFSET_X) / 2,
    CLAW_PIVOT[1] - CLAW_OFFSET_Y / 2,
    CLAW_PIVOT[2],
  ] as [number, number, number],
  // hooked tip pad, angled back inward so the pair reads as a gripper
  tip: [CLAW_PIVOT[0] + sign * CLAW_OFFSET_X, CLAW_PIVOT[1] - CLAW_OFFSET_Y, CLAW_PIVOT[2]] as [
    number,
    number,
    number,
  ],
  tipRotationZ: sign * (CLAW_ANGLE + 1.1),
}));

type ModelProps = { active: boolean; reducedMotion: boolean };

function Propeller({ spinning }: { spinning: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!spinning || !ref.current) return;
    ref.current.rotation.y += delta * 9;
  });
  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.007, 0.024]} />
        <meshStandardMaterial {...MAT.blade} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.32, 0.007, 0.024]} />
        <meshStandardMaterial {...MAT.blade} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.018, 12]} />
        <meshStandardMaterial {...MAT.motorCap} />
      </mesh>
    </group>
  );
}

export function SkymulDroneModel({ active, reducedMotion }: ModelProps) {
  const spinning = active && !reducedMotion;

  return (
    <group position={[0, 0.15, 0]}>
      {/* core frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.1, 0.24]} />
        <meshStandardMaterial {...MAT.frame} />
      </mesh>

      {/* battery pack, tucked under the core frame */}
      <mesh position={[0, -0.08, 0]} castShadow>
        <boxGeometry args={[0.16, 0.06, 0.2]} />
        <meshStandardMaterial {...MAT.battery} />
      </mesh>

      {/* yellow top housing */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.34, 0.15, 0.26]} />
        <meshStandardMaterial {...MAT.housing} />
      </mesh>
      {/* antenna */}
      <mesh position={[-0.1, 0.24, -0.08]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.1, 8]} />
        <meshStandardMaterial {...MAT.frame} />
      </mesh>
      <mesh position={[-0.1, 0.29, -0.08]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#e8514f" roughness={0.4} />
      </mesh>
      {/* status LED strip on the housing */}
      <mesh position={[0.17, 0.12, 0]}>
        <boxGeometry args={[0.005, 0.03, 0.1]} />
        <meshStandardMaterial
          color="#3ee587"
          emissive="#3ee587"
          emissiveIntensity={spinning ? 1 : 0.2}
          roughness={0.4}
        />
      </mesh>

      {/* wrist mount connecting body to the claw */}
      <mesh position={[0, -0.14, 0.02]} castShadow>
        <boxGeometry args={[0.1, 0.08, 0.08]} />
        <meshStandardMaterial {...MAT.housing} />
      </mesh>
      {/* claw actuator — two hinged fingers in an open gripper stance */}
      {CLAW_FINGERS.map((finger) => (
        <mesh
          key={finger.rotationZ}
          position={finger.position}
          rotation={[0, 0, finger.rotationZ]}
          castShadow
        >
          <boxGeometry args={[0.036, CLAW_LENGTH, 0.06]} />
          <meshStandardMaterial {...MAT.claw} />
        </mesh>
      ))}
      {CLAW_FINGERS.map((finger) => (
        <mesh key={`tip-${finger.rotationZ}`} position={finger.tip} rotation={[0, 0, finger.tipRotationZ]} castShadow>
          <boxGeometry args={[0.036, 0.06, 0.06]} />
          <meshStandardMaterial {...MAT.claw} />
        </mesh>
      ))}
      <mesh position={CLAW_PIVOT}>
        <cylinderGeometry args={[0.02, 0.02, 0.06, 10]} />
        <meshStandardMaterial {...MAT.motorCap} />
      </mesh>

      {/* 4 legs, each with a motor + prop at the tip */}
      {LEG_ANGLES.map((angle) => (
        <group key={angle} rotation={[0, angle, 0]}>
          <mesh position={[LEG.mid[0], LEG.mid[1], 0]} rotation={[0, 0, LEG.angle]} castShadow>
            <cylinderGeometry args={[0.018, 0.024, LEG.length, 10]} />
            <meshStandardMaterial {...MAT.frame} />
          </mesh>
          <mesh position={[0.78, -0.38, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.055, 16]} />
            <meshStandardMaterial {...MAT.motor} />
          </mesh>
          <group position={[0.78, -0.34, 0]}>
            <Propeller spinning={spinning} />
          </group>
        </group>
      ))}
    </group>
  );
}
