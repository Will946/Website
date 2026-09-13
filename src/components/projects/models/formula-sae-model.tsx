"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";

/**
 * Conceptual open-wheel formula car, styled after the USC Formula SAE
 * build: black bodywork with a red/yellow nose stripe, front and rear
 * wings, exposed wheels, and a tube-frame roll hoop. Illustrative, not a
 * literal CAD reproduction of the real car.
 */
const MAT = {
  body: { color: "#111214", roughness: 0.45, metalness: 0.2 },
  bodyDark: { color: "#08090a", roughness: 0.6, metalness: 0.1 },
  red: { color: "#c23b2e", roughness: 0.4, metalness: 0.1 },
  yellow: { color: "#e8b23d", roughness: 0.4, metalness: 0.1 },
  tire: { color: "#131416", roughness: 0.85, metalness: 0.05 },
  rim: { color: "#9aa3a8", roughness: 0.3, metalness: 0.6 },
  frame: { color: "#8f969b", roughness: 0.35, metalness: 0.55 },
  plate: { color: "#e9e9e4", roughness: 0.5, metalness: 0.05 },
  seat: { color: "#4a3226", roughness: 0.6, metalness: 0.05 },
} as const;

/** Cylinder mid-point/rotation/length between two arbitrary 3D points. */
function strutTransform(a: [number, number, number], b: [number, number, number]) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dir = end.clone().sub(start);
  const length = dir.length();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const euler = new THREE.Euler().setFromQuaternion(quat);
  return {
    mid: [mid.x, mid.y, mid.z] as [number, number, number],
    rotation: [euler.x, euler.y, euler.z] as [number, number, number],
    length,
  };
}

const WHEELS = [
  { x: 0.5, z: 0.68 },
  { x: -0.5, z: 0.68 },
  { x: 0.52, z: -0.6 },
  { x: -0.52, z: -0.6 },
];

const SUSPENSION_ARMS: [[number, number, number], [number, number, number]][] = [
  // front right, upper + lower
  [
    [0.25, 0.3, 0.6],
    [0.5, 0.24, 0.68],
  ],
  [
    [0.25, 0.14, 0.6],
    [0.5, 0.16, 0.68],
  ],
  // front left
  [
    [-0.25, 0.3, 0.6],
    [-0.5, 0.24, 0.68],
  ],
  [
    [-0.25, 0.14, 0.6],
    [-0.5, 0.16, 0.68],
  ],
  // rear right
  [
    [0.24, 0.28, -0.55],
    [0.52, 0.24, -0.6],
  ],
  [
    [0.24, 0.13, -0.5],
    [0.52, 0.16, -0.6],
  ],
  // rear left
  [
    [-0.24, 0.28, -0.55],
    [-0.52, 0.24, -0.6],
  ],
  [
    [-0.24, 0.13, -0.5],
    [-0.52, 0.16, -0.6],
  ],
];

const FRONT_WING_STRUTS: [[number, number, number], [number, number, number]][] = [
  [
    [0.18, 0.19, 1.28],
    [0.24, 0.28, 0.68],
  ],
  [
    [-0.18, 0.19, 1.28],
    [-0.24, 0.28, 0.68],
  ],
];

type ModelProps = { active: boolean; reducedMotion: boolean };

function Wheel({ x, z, spinning }: { x: number; z: number; spinning: boolean }) {
  const tireRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!spinning || !tireRef.current) return;
    tireRef.current.rotation.x += delta * 6;
  });
  return (
    <group position={[x, 0.2, z]}>
      <mesh ref={tireRef} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.16, 24]} />
        <meshStandardMaterial {...MAT.tire} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.172, 16]} />
        <meshStandardMaterial {...MAT.rim} />
      </mesh>
    </group>
  );
}

export function FormulaSaeModel({ active, reducedMotion }: ModelProps) {
  const spinning = active && !reducedMotion;

  return (
    <group position={[0, 0, 0]}>
      {/* chassis tub */}
      <mesh position={[0, 0.17, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.22, 1.3]} />
        <meshStandardMaterial {...MAT.body} />
      </mesh>
      {/* upper deck / spine, narrower than the tub */}
      <mesh position={[0, 0.31, -0.15]} castShadow>
        <boxGeometry args={[0.32, 0.14, 0.85]} />
        <meshStandardMaterial {...MAT.body} />
      </mesh>
      {/* cockpit opening, a darker recessed panel */}
      <mesh position={[0, 0.385, -0.12]}>
        <boxGeometry args={[0.22, 0.02, 0.4]} />
        <meshStandardMaterial {...MAT.bodyDark} />
      </mesh>
      {/* headrest */}
      <mesh position={[0, 0.42, -0.38]} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.1]} />
        <meshStandardMaterial {...MAT.seat} />
      </mesh>

      {/* nosecone */}
      <mesh position={[0, 0.2, 0.95]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.2, 0.65, 12]} />
        <meshStandardMaterial {...MAT.body} />
      </mesh>

      {/* nose/tub racing stripe */}
      <mesh position={[0, 0.345, 0.3]}>
        <boxGeometry args={[0.06, 0.008, 1.6]} />
        <meshStandardMaterial {...MAT.red} />
      </mesh>
      <mesh position={[-0.055, 0.345, 0.3]}>
        <boxGeometry args={[0.02, 0.008, 1.6]} />
        <meshStandardMaterial {...MAT.yellow} />
      </mesh>
      <mesh position={[0.055, 0.345, 0.3]}>
        <boxGeometry args={[0.02, 0.008, 1.6]} />
        <meshStandardMaterial {...MAT.yellow} />
      </mesh>

      {/* side number plates */}
      {[-0.245, 0.245].map((x) => (
        <mesh key={x} position={[x, 0.22, 0.55]} castShadow>
          <boxGeometry args={[0.015, 0.14, 0.22]} />
          <meshStandardMaterial {...MAT.plate} />
        </mesh>
      ))}

      {/* sidepods */}
      {[-0.33, 0.33].map((x) => (
        <mesh key={x} position={[x, 0.16, -0.15]} rotation={[0, x > 0 ? -0.08 : 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.2, 0.55]} />
          <meshStandardMaterial {...MAT.body} />
        </mesh>
      ))}

      {/* undertray / diffuser */}
      <mesh position={[0, 0.09, -0.85]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.4, 0.03, 0.5]} />
        <meshStandardMaterial {...MAT.bodyDark} />
      </mesh>

      {/* front roll hoop */}
      <mesh position={[0, 0.28, 0.05]} castShadow>
        <torusGeometry args={[0.13, 0.016, 8, 16, Math.PI]} />
        <meshStandardMaterial {...MAT.frame} />
      </mesh>
      {/* main roll hoop */}
      <mesh position={[0, 0.3, -0.35]} castShadow>
        <torusGeometry args={[0.17, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial {...MAT.frame} />
      </mesh>

      {/* front wing */}
      <mesh position={[0, 0.06, 1.35]} castShadow>
        <boxGeometry args={[1.15, 0.02, 0.22]} />
        <meshStandardMaterial {...MAT.body} />
      </mesh>
      {[-0.57, 0.57].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.1, 1.35]} castShadow>
            <boxGeometry args={[0.02, 0.14, 0.24]} />
            <meshStandardMaterial {...MAT.body} />
          </mesh>
          <mesh position={[x, 0.15, 1.4]}>
            <boxGeometry args={[0.022, 0.03, 0.06]} />
            <meshStandardMaterial {...(x > 0 ? MAT.red : MAT.yellow)} />
          </mesh>
        </group>
      ))}
      {FRONT_WING_STRUTS.map(([a, b]) => {
        const s = strutTransform(a, b);
        return (
          <mesh key={a.join(",")} position={s.mid} rotation={s.rotation} castShadow>
            <cylinderGeometry args={[0.012, 0.012, s.length, 8]} />
            <meshStandardMaterial {...MAT.frame} />
          </mesh>
        );
      })}

      {/* rear wing */}
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 0.41, -0.72]} castShadow>
          <boxGeometry args={[0.025, 0.42, 0.03]} />
          <meshStandardMaterial {...MAT.frame} />
        </mesh>
      ))}
      {[
        { y: 0.5, z: -0.78 },
        { y: 0.56, z: -0.74 },
        { y: 0.62, z: -0.7 },
      ].map((el) => (
        <mesh key={el.y} position={[0, el.y, el.z]} castShadow>
          <boxGeometry args={[0.85, 0.015, 0.16]} />
          <meshStandardMaterial {...MAT.body} />
        </mesh>
      ))}
      {[-0.44, 0.44].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.56, -0.74]} castShadow>
            <boxGeometry args={[0.02, 0.34, 0.32]} />
            <meshStandardMaterial {...MAT.body} />
          </mesh>
          <mesh position={[x, 0.56, -0.6]}>
            <boxGeometry args={[0.022, 0.34, 0.03]} />
            <meshStandardMaterial {...(x > 0 ? MAT.red : MAT.yellow)} />
          </mesh>
        </group>
      ))}

      {/* wheels */}
      {WHEELS.map((w) => (
        <Wheel key={`${w.x}-${w.z}`} x={w.x} z={w.z} spinning={spinning} />
      ))}

      {/* suspension arms */}
      {SUSPENSION_ARMS.map(([a, b]) => {
        const s = strutTransform(a, b);
        return (
          <mesh key={a.join(",") + b.join(",")} position={s.mid} rotation={s.rotation} castShadow>
            <cylinderGeometry args={[0.011, 0.011, s.length, 8]} />
            <meshStandardMaterial {...MAT.frame} />
          </mesh>
        );
      })}
    </group>
  );
}
