"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";

/**
 * Realistic-ish model of CPRPal: a squat, ribbed black puck with a flat
 * gray top face carrying the display, speaker grille, and status button,
 * plus the side/front details from the reference renders (two sensor
 * holes near the top edge, a mode-button notch in the middle band, and a
 * hole/port/hole cluster in the lower band). A ring of LEDs set into the
 * chrome bezel pulses at the AHA-recommended pacing tempo, and the whole
 * puck gives a tiny compression "thump" on each beat.
 */
const BODY_PROFILE = (
  [
    [0.86, 0.0],
    [0.89, 0.02],
    [0.89, 0.08],
    [0.95, 0.1],
    [0.95, 0.16],
    [0.89, 0.18],
    [0.89, 0.27],
    [0.95, 0.29],
    [0.95, 0.35],
    [0.89, 0.37],
    [0.89, 0.4],
    [0.92, 0.415],
    [0.86, 0.44],
    [0.8, 0.46],
  ] as const
).map(([x, y]) => new THREE.Vector2(x, y));

const TOP_R = 0.8;
const TOP_Y = 0.46;
const RING_R = 0.9;
const RING_Y = 0.415;
const LED_COUNT = 12;
/** A representative tempo within the write-up's 100-120 CPM range. */
const BPM = 110;
const BEAT_S = 60 / BPM;

const MAT = {
  body: { color: "#0c0d0e", roughness: 0.28, metalness: 0.3 },
  top: { color: "#8a8f92", roughness: 0.45, metalness: 0.15 },
  screen: { color: "#111214", roughness: 0.3, metalness: 0.1 },
  screenBezel: { color: "#0a0b0c", roughness: 0.35, metalness: 0.2 },
  speaker: { color: "#9aa0a4", roughness: 0.4, metalness: 0.2 },
  button: { color: "#243a7a", roughness: 0.4, metalness: 0.15 },
  screw: { color: "#3a3e42", roughness: 0.35, metalness: 0.5 },
} as const;

const SCREW_ANGLES = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
/** The front-facing angle (+Z), matching the same side the top-face
 * details (screen, button, speaker) face. */
const FRONT = Math.PI / 2;

type ModelProps = { active: boolean; reducedMotion: boolean };

export function CprPalModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;

  const puckRef = useRef<Group>(null);
  const ledRefs = useMemo(() => Array.from({ length: LED_COUNT }, () => ({ current: null as Mesh | null })), []);
  const screenGlowRef = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const phase = running ? (t % BEAT_S) / BEAT_S : 1;
    // sharp attack, quick decay within the first fifth of each beat
    const envelope = phase < 0.2 ? 1 - phase / 0.2 : 0;

    if (puckRef.current) {
      const squash = 1 - envelope * 0.05;
      puckRef.current.scale.set(1, squash, 1);
    }
    ledRefs.forEach((ref) => {
      const mesh = ref.current;
      if (!mesh) return;
      const mat = mesh.material as MeshStandardMaterial;
      mat.emissiveIntensity = running ? 0.15 + envelope * 1.3 : 0.1;
    });
    if (screenGlowRef.current) {
      screenGlowRef.current.emissiveIntensity = running ? 0.1 + envelope * 0.6 : 0.05;
    }
  });

  return (
    <group ref={puckRef}>
      {/* body: ribbed glossy shell (open top and bottom; capped below) */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[BODY_PROFILE, 32]} />
        <meshStandardMaterial {...MAT.body} side={THREE.DoubleSide} />
      </mesh>

      {/* flat top cap. Double-sided: the shell is a full 360° lathe with
          no cap of its own, so from a low angle you'd otherwise see clean
          through the "back" of this disc into the hollow interior. */}
      <mesh position={[0, TOP_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[TOP_R, 32]} />
        <meshStandardMaterial {...MAT.top} side={THREE.DoubleSide} />
      </mesh>

      {/* bottom cap, closing the shell off underneath too */}
      <mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.87, 32]} />
        <meshStandardMaterial {...MAT.body} side={THREE.DoubleSide} />
      </mesh>

      {/* screen */}
      <mesh position={[0, TOP_Y + 0.003, 0.02]} castShadow>
        <boxGeometry args={[0.5, 0.012, 0.66]} />
        <meshStandardMaterial {...MAT.screenBezel} />
      </mesh>
      <mesh position={[0, TOP_Y + 0.01, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.44, 0.6]} />
        <meshStandardMaterial ref={screenGlowRef} {...MAT.screen} emissive="#3ee587" emissiveIntensity={0.08} />
      </mesh>

      {/* speaker grille */}
      <mesh position={[0.42, TOP_Y + 0.006, 0.04]} castShadow>
        <boxGeometry args={[0.13, 0.008, 0.48]} />
        <meshStandardMaterial {...MAT.speaker} />
      </mesh>

      {/* status button */}
      <mesh position={[-0.44, TOP_Y + 0.006, 0.06]} castShadow>
        <boxGeometry args={[0.12, 0.008, 0.12]} />
        <meshStandardMaterial {...MAT.button} />
      </mesh>

      {/* rim screws */}
      {SCREW_ANGLES.map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.72, TOP_Y + 0.004, Math.sin(a) * 0.72]}>
          <cylinderGeometry args={[0.014, 0.014, 0.006, 10]} />
          <meshStandardMaterial {...MAT.screw} />
        </mesh>
      ))}

      {/* two small sensor holes on the rounded top edge, front-center */}
      {[FRONT - 0.1, FRONT + 0.1].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.83, 0.415, Math.sin(a) * 0.83]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#050506" roughness={0.4} metalness={0.1} />
        </mesh>
      ))}

      {/* mode-button notch, middle recessed band */}
      <mesh position={[Math.cos(FRONT) * 0.895, 0.225, Math.sin(FRONT) * 0.895]} castShadow>
        <boxGeometry args={[0.09, 0.07, 0.02]} />
        <meshStandardMaterial color="#050506" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* hole / port / hole cluster, lower recessed band */}
      <mesh position={[Math.cos(FRONT - 0.22) * 0.895, 0.05, Math.sin(FRONT - 0.22) * 0.895]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#050506" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[Math.cos(FRONT) * 0.895, 0.05, Math.sin(FRONT) * 0.895]} castShadow>
        <boxGeometry args={[0.09, 0.05, 0.02]} />
        <meshStandardMaterial color="#050506" roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[Math.cos(FRONT + 0.22) * 0.895, 0.05, Math.sin(FRONT + 0.22) * 0.895]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#050506" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* LED pacing ring, set into the chrome bezel */}
      {Array.from({ length: LED_COUNT }, (_, i) => {
        const a = (i / LED_COUNT) * Math.PI * 2;
        return (
          <mesh
            key={i}
            ref={(m) => {
              ledRefs[i].current = m;
            }}
            position={[Math.cos(a) * RING_R, RING_Y, Math.sin(a) * RING_R]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#3ee587" emissive="#3ee587" emissiveIntensity={0.15} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}
