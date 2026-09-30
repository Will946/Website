"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, MeshStandardMaterial } from "three";

/**
 * Model of O'Hare Air: a ribbed cylindrical base holding an ENS161 +
 * ENS210 sensor pair, a 28BYJ-48 stepper, and an RGB LED, under a
 * 3D-printed two-layer translucent petal shell. The real enclosure's
 * petals are fixed — they don't open or close — so unlike the site's
 * other animated models this one doesn't move anything external. What's
 * actually cycling is the ENS161's own onboard AQI-UBA rating (1–5,
 * Excellent → Unhealthy), which drives two things on the real device:
 * the LED's green-to-red gradient, and a stepper needle sweeping 0°–180°
 * inside the base (0/90/115/140/180 for the five ratings). The needle
 * isn't visible from outside the finished unit, so it's rendered here as
 * a faint rotating indicator glimpsed through the translucent center —
 * true to the mechanism, not just the LED.
 */
const RATING_COUNT = 5;
const RATING_ANGLES = [0, 90, 115, 140, 180]; // degrees, matches the real firmware's BAND_ANGLE table
const RATING_HUE = [0.33, 0.24, 0.15, 0.08, 0.0]; // green -> yellow -> orange -> red, HSL hue 0..1
const CYCLE_S = 12;

const BASE_R = 0.42;
const BASE_H = 0.34;
const RIB_COUNT = 28;
const OUTER_PETALS = 7;
const INNER_PETALS = 6;

const MAT = {
  baseGreen: { color: "#2c5c34", roughness: 0.65, metalness: 0.05 },
  rib: { color: "#234a2a", roughness: 0.7, metalness: 0.05 },
  petal: { color: "#b23a4a", roughness: 0.35, metalness: 0.0, transparent: true, opacity: 0.55 },
  petalInner: { color: "#c94f5a", roughness: 0.3, metalness: 0.0, transparent: true, opacity: 0.6 },
  disc: { color: "#e8e6df", roughness: 0.4, metalness: 0.1 },
} as const;

/** A single tapered, slightly cupped petal outline, extruded to a thin shell. */
function petalGeometry(length: number, width: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(width * 0.55, length * 0.35, 0, length);
  shape.quadraticCurveTo(-width * 0.55, length * 0.35, 0, 0);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false });
}

function ratingColor(t: number): THREE.Color {
  // t in [0, RATING_COUNT-1], continuous — interpolates hue between the
  // nearest two ratings so the transition reads as a fade, same as the
  // firmware's own hue easing between AQI-UBA steps.
  const i = Math.min(RATING_COUNT - 2, Math.floor(t));
  const frac = t - i;
  const hue = THREE.MathUtils.lerp(RATING_HUE[i], RATING_HUE[i + 1], frac);
  return new THREE.Color().setHSL(hue, 0.75, 0.5);
}

type ModelProps = { active: boolean; reducedMotion: boolean };

export function OhareAirModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;

  const outerPetalGeo = useMemo(() => petalGeometry(0.62, 0.34), []);
  const innerPetalGeo = useMemo(() => petalGeometry(0.46, 0.26), []);

  const discRef = useRef<Mesh>(null);
  const discMatRef = useRef<MeshStandardMaterial>(null);
  const needleRef = useRef<Mesh>(null);
  const petalMatRefs = useMemo(
    () => Array.from({ length: OUTER_PETALS + INNER_PETALS }, () => ({ current: null as MeshStandardMaterial | null })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const phase = running ? (t % CYCLE_S) / CYCLE_S : 0.15;
    const rating = phase * (RATING_COUNT - 1); // 0..4, continuous
    const color = ratingColor(rating);

    if (discMatRef.current) {
      discMatRef.current.emissive.copy(color);
      discMatRef.current.emissiveIntensity = running ? 1.1 : 0.7;
    }
    petalMatRefs.forEach((ref) => {
      if (!ref.current) return;
      ref.current.emissive.copy(color);
      ref.current.emissiveIntensity = running ? 0.35 : 0.2;
    });

    if (needleRef.current) {
      // Interpolate through the real BAND_ANGLE steps, not a plain 0-180
      // sweep, so the needle actually eases through the same five stops
      // the stepper does on the real board.
      const i = Math.min(RATING_COUNT - 2, Math.floor(rating));
      const frac = rating - i;
      const deg = THREE.MathUtils.lerp(RATING_ANGLES[i], RATING_ANGLES[i + 1], frac);
      needleRef.current.rotation.y = THREE.MathUtils.degToRad(deg - 90);
    }
  });

  return (
    <group position={[0, -0.05, 0]}>
      {/* ribbed base */}
      <mesh castShadow receiveShadow position={[0, BASE_H / 2, 0]}>
        <cylinderGeometry args={[BASE_R, BASE_R * 1.05, BASE_H, 40]} />
        <meshStandardMaterial {...MAT.baseGreen} />
      </mesh>
      {Array.from({ length: RIB_COUNT }, (_, i) => {
        const a = (i / RIB_COUNT) * Math.PI * 2;
        return (
          <mesh
            key={i}
            castShadow
            position={[Math.cos(a) * (BASE_R + 0.006), BASE_H / 2, Math.sin(a) * (BASE_R + 0.006)]}
            rotation={[0, -a, 0]}
          >
            <boxGeometry args={[0.014, BASE_H * 0.92, 0.02]} />
            <meshStandardMaterial {...MAT.rib} />
          </mesh>
        );
      })}

      {/* internal needle, visible only as a faint glint through the center disc */}
      <mesh ref={needleRef} position={[0, BASE_H - 0.02, 0]}>
        <boxGeometry args={[0.24, 0.01, 0.02]} />
        <meshStandardMaterial color="#8a8f86" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* center diffuser disc, glows in the current AQI-UBA color */}
      <mesh ref={discRef} position={[0, BASE_H + 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.17, 0.03, 28]} />
        <meshStandardMaterial ref={discMatRef} {...MAT.disc} emissive="#3fae55" emissiveIntensity={0.7} />
      </mesh>

      {/* outer petal ring */}
      {Array.from({ length: OUTER_PETALS }, (_, i) => {
        const a = (i / OUTER_PETALS) * Math.PI * 2;
        const hingeR = BASE_R * 0.55;
        return (
          <group key={`o${i}`} position={[Math.cos(a) * hingeR, BASE_H, Math.sin(a) * hingeR]} rotation={[0, -a + Math.PI / 2, 0]}>
            <mesh geometry={outerPetalGeo} rotation={[-Math.PI * 0.34, 0, 0]} castShadow>
              <meshStandardMaterial
                ref={(m) => {
                  petalMatRefs[i].current = m;
                }}
                {...MAT.petal}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* inner petal ring, offset and slightly more upright */}
      {Array.from({ length: INNER_PETALS }, (_, i) => {
        const a = (i / INNER_PETALS) * Math.PI * 2 + Math.PI / INNER_PETALS;
        const hingeR = BASE_R * 0.3;
        return (
          <group key={`i${i}`} position={[Math.cos(a) * hingeR, BASE_H + 0.04, Math.sin(a) * hingeR]} rotation={[0, -a + Math.PI / 2, 0]}>
            <mesh geometry={innerPetalGeo} rotation={[-Math.PI * 0.22, 0, 0]} castShadow>
              <meshStandardMaterial
                ref={(m) => {
                  petalMatRefs[OUTER_PETALS + i].current = m;
                }}
                {...MAT.petalInner}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
