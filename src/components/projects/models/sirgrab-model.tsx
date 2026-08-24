"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh } from "three";

/**
 * Realistic-ish model of the SirGrab robotic arm: a 5-legged star base, a
 * base-yaw servo housing, three pitch joints (shoulder/elbow/wrist), a
 * wrist-roll fork, and a parallel-jaw gripper, matching the actual CAD
 * renders' proportions and joint layout. Illustrative, not a literal CAD
 * reproduction, and the 8 TD-8120MG servos mentioned in the write-up are
 * represented as 6 animated hinge stages (some joints are servo-paired for
 * torque in the real arm) rather than 8 literal motor bodies.
 *
 * There's no live mouse-driven IK here (drag-to-pose the arm like the 2D
 * fallback) — that would fight the same drag gesture OrbitControls already
 * uses for rotate, and a robust IK solver is a lot more failure-prone than
 * a scripted motion. Instead this runs an autonomous pick-and-place loop
 * that exercises every hinge.
 */
const MAT = {
  body: { color: "#0d0e10", roughness: 0.3, metalness: 0.25 },
  bodyLight: { color: "#17191b", roughness: 0.25, metalness: 0.3 },
  screw: { color: "#3a3e42", roughness: 0.35, metalness: 0.5 },
  jaw: { color: "#8f969b", roughness: 0.3, metalness: 0.4 },
  cube: { color: "#e8a33d", roughness: 0.4, metalness: 0.1 },
} as const;

const LEG_COUNT = 5;
const LEG_LENGTH = 0.62;
const HUB_TOP_Y = 0.28;
const SHOULDER_H = 0.16;
const UPPER_LINK_H = 0.28;
const ELBOW_H = 0.12;
const FOREARM_H = 0.22;
const WRIST_H = 0.12;
const ROLL_TO_GRIPPER = 0.09;
const FINGER_LEN = 0.11;

/** [t, value] keyframes, linearly interpolated over a 0..1 cycle. */
type Keys = [number, number][];

function interp(keys: Keys, t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) {
      const localT = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * localT;
    }
  }
  return keys[keys.length - 1][1];
}

const SHOULDER_KEYS: Keys = [
  [0, 0.1],
  [0.15, 0.75],
  [0.25, 0.75],
  [0.45, 0.3],
  [0.65, 0.3],
  [0.75, 0.75],
  [0.85, 0.75],
  [1, 0.1],
];
const ELBOW_KEYS: Keys = [
  [0, 0.25],
  [0.15, 1.05],
  [0.25, 1.05],
  [0.45, 0.55],
  [0.65, 0.55],
  [0.75, 1.05],
  [0.85, 1.05],
  [1, 0.25],
];
const WRIST_KEYS: Keys = [
  [0, -0.25],
  [0.15, -0.55],
  [0.25, -0.55],
  [0.45, -0.35],
  [0.65, -0.35],
  [0.75, -0.55],
  [0.85, -0.55],
  [1, -0.25],
];
const ROLL_KEYS: Keys = [
  [0, 0],
  [0.45, 0],
  [0.55, 0.7],
  [0.65, 0.7],
  [1, 0],
];
const YAW_KEYS: Keys = [
  [0, 0],
  [0.45, 0],
  [0.65, 1.0],
  [0.85, 1.0],
  [1, 0],
];
const GRIP_KEYS: Keys = [
  [0, 0],
  [0.15, 0],
  [0.25, 1],
  [0.85, 1],
  [1, 0],
];

const CYCLE = 7;
const PICKUP = new THREE.Vector3(0.42, 0.02, 0);

type ModelProps = { active: boolean; reducedMotion: boolean };

export function SirGrabModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;

  const yawRef = useRef<Group>(null);
  const shoulderRef = useRef<Group>(null);
  const elbowRef = useRef<Group>(null);
  const wristRef = useRef<Group>(null);
  const rollRef = useRef<Group>(null);
  const gripCenterRef = useRef<Group>(null);
  const fingerLRef = useRef<Mesh>(null);
  const fingerRRef = useRef<Mesh>(null);
  const cubeRef = useRef<Mesh>(null);

  const restPos = useRef(PICKUP.clone());
  const prevT = useRef(0);
  const tmpWorld = useRef(new THREE.Vector3());

  const legs = useMemo(
    () =>
      Array.from({ length: LEG_COUNT }, (_, i) => (i * Math.PI * 2) / LEG_COUNT),
    [],
  );

  useFrame((state) => {
    const t = running ? (state.clock.elapsedTime % CYCLE) / CYCLE : 0;

    if (yawRef.current) yawRef.current.rotation.y = interp(YAW_KEYS, t);
    if (shoulderRef.current) shoulderRef.current.rotation.x = interp(SHOULDER_KEYS, t);
    if (elbowRef.current) elbowRef.current.rotation.x = -interp(ELBOW_KEYS, t);
    if (wristRef.current) wristRef.current.rotation.x = interp(WRIST_KEYS, t);
    if (rollRef.current) rollRef.current.rotation.y = interp(ROLL_KEYS, t);

    const grip = interp(GRIP_KEYS, t);
    const open = 0.028 * (1 - grip) + 0.012;
    if (fingerLRef.current) fingerLRef.current.position.x = -open;
    if (fingerRRef.current) fingerRRef.current.position.x = open;

    const grabbed = grip > 0.5;
    if (cubeRef.current && gripCenterRef.current) {
      if (grabbed) {
        gripCenterRef.current.getWorldPosition(tmpWorld.current);
        cubeRef.current.parent?.worldToLocal(tmpWorld.current);
        cubeRef.current.position.copy(tmpWorld.current);
        restPos.current.copy(tmpWorld.current);
      } else {
        cubeRef.current.position.copy(restPos.current);
      }
    }

    if (t < prevT.current) restPos.current.copy(PICKUP);
    prevT.current = t;
  });

  return (
    <group>
      {/* 5-legged star base. The tilt (Z) has to be applied in the leg's
          own local frame before the yaw (Y) sweeps it out to its
          position — combining both on one object in a single Euler would
          apply them in the wrong order and skew legs asymmetrically. */}
      {legs.map((angle) => (
        <group key={angle} rotation={[0, -angle, 0]}>
          <mesh position={[LEG_LENGTH * 0.5, 0.05, 0]} rotation={[0, 0, 0.28]} castShadow receiveShadow>
            <boxGeometry args={[LEG_LENGTH, 0.03, 0.05]} />
            <meshStandardMaterial {...MAT.body} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.19, 0.1, 24]} />
        <meshStandardMaterial {...MAT.body} />
      </mesh>

      {/* base-yaw servo housing (static shell; everything above rotates) */}
      <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.15, 0.18, 24]} />
        <meshStandardMaterial {...MAT.bodyLight} />
      </mesh>

      <group ref={yawRef} position={[0, HUB_TOP_Y, 0]}>
        {/* shoulder housing */}
        <mesh position={[0, SHOULDER_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.22, SHOULDER_H, 0.19]} />
          <meshStandardMaterial {...MAT.body} />
        </mesh>
        {[-0.06, 0.06].map((dx) => (
          <mesh key={dx} position={[dx, SHOULDER_H - 0.03, 0.096]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial {...MAT.screw} />
          </mesh>
        ))}

        <group ref={shoulderRef} position={[0, SHOULDER_H, 0]}>
          {/* upper link */}
          <mesh position={[0, UPPER_LINK_H / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.065, 0.07, UPPER_LINK_H, 16]} />
            <meshStandardMaterial {...MAT.body} />
          </mesh>
          {/* elbow housing */}
          <mesh position={[0, UPPER_LINK_H + ELBOW_H / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, ELBOW_H, 0.17]} />
            <meshStandardMaterial {...MAT.body} />
          </mesh>
          <mesh position={[0.105, UPPER_LINK_H + ELBOW_H / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.012, 20]} />
            <meshStandardMaterial {...MAT.screw} />
          </mesh>

          <group ref={elbowRef} position={[0, UPPER_LINK_H + ELBOW_H, 0]}>
            {/* forearm link */}
            <mesh position={[0, FOREARM_H / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.055, 0.06, FOREARM_H, 16]} />
              <meshStandardMaterial {...MAT.body} />
            </mesh>
            {/* wrist housing */}
            <mesh position={[0, FOREARM_H + WRIST_H / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.17, WRIST_H, 0.15]} />
              <meshStandardMaterial {...MAT.body} />
            </mesh>
            {[-0.05, 0.05].map((dx) => (
              <mesh key={dx} position={[dx, FOREARM_H + WRIST_H - 0.025, 0.076]}>
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshStandardMaterial {...MAT.screw} />
              </mesh>
            ))}

            <group ref={wristRef} position={[0, FOREARM_H + WRIST_H, 0]}>
              <group ref={rollRef}>
                {/* wrist-roll fork bracket */}
                <mesh position={[0, 0.035, 0]} castShadow>
                  <boxGeometry args={[0.13, 0.05, 0.1]} />
                  <meshStandardMaterial {...MAT.bodyLight} />
                </mesh>

                <group ref={gripCenterRef} position={[0, ROLL_TO_GRIPPER, 0]}>
                  {/* gripper body */}
                  <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.03, 0.08]} />
                    <meshStandardMaterial {...MAT.body} />
                  </mesh>
                  <mesh ref={fingerLRef} position={[-0.02, FINGER_LEN / 2, 0]} castShadow>
                    <boxGeometry args={[0.018, FINGER_LEN, 0.05]} />
                    <meshStandardMaterial {...MAT.jaw} />
                  </mesh>
                  <mesh ref={fingerRRef} position={[0.02, FINGER_LEN / 2, 0]} castShadow>
                    <boxGeometry args={[0.018, FINGER_LEN, 0.05]} />
                    <meshStandardMaterial {...MAT.body} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* cube the arm picks up and moves */}
      <mesh ref={cubeRef} position={PICKUP} castShadow receiveShadow>
        <boxGeometry args={[0.07, 0.07, 0.07]} />
        <meshStandardMaterial {...MAT.cube} />
      </mesh>
    </group>
  );
}
