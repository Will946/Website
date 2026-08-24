"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, MeshStandardMaterial } from "three";

/**
 * Realistic-ish model of the cocktail machine's ingredient barrel: a tall,
 * slim wood-stave barrel body with a metal hoop and a narrow control tower
 * (display) on top. Matching the reference CAD renders, the barrel wall is
 * open at the front, revealing a hollow interior with a floor and a cup
 * that catches the pour, not a solid keg.
 */
const MAT = {
  band: { color: "#9aa0a4", roughness: 0.3, metalness: 0.7 },
  panel: { color: "#c7ccc6", roughness: 0.4, metalness: 0.1 },
  led: { color: "#e7e9e2", roughness: 0.3, metalness: 0.2 },
  floor: { color: "#c9b48a", roughness: 0.7, metalness: 0.05 },
  nozzle: { color: "#2a2d30", roughness: 0.5, metalness: 0.3 },
} as const;

function createWoodTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#6b4a30";
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * W;
    ctx.strokeStyle = `rgba(30,16,8,${0.03 + Math.random() * 0.05})`;
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() * 6 - 3), H);
    ctx.stroke();
  }

  const staves = 16;
  ctx.strokeStyle = "rgba(28,16,9,0.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < staves; i++) {
    const x = (i / staves) * W;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Tall, gently bulging barrel silhouette, matching the reference renders'
 * height-to-width ratio (roughly 2:1 for the barrel body alone). */
const BARREL_PROFILE = (
  [
    [0.26, 0.0],
    [0.3, 0.05],
    [0.27, 0.12],
    [0.315, 0.55],
    [0.3, 0.85],
    [0.255, 1.05],
    [0.225, 1.2],
    [0.2, 1.32],
  ] as const
).map(([x, y]) => new THREE.Vector2(x, y));

// The barrel wall sweeps only partway around, leaving a gap (facing the
// camera's default angle) so the hollow interior and the cup inside it
// are visible, matching the reference CAD renders' cutaway.
const BARREL_PHI_START = THREE.MathUtils.degToRad(80);
const BARREL_PHI_LENGTH = THREE.MathUtils.degToRad(290);

const BAND_Y = 1.0;
const BAND_RADIUS = 0.265;
const TOWER_RADIUS = 0.15;
const TOWER_HEIGHT = 0.5;
const TOWER_Y = 1.28 + TOWER_HEIGHT / 2 - 0.04;
const PANEL_Y = TOWER_Y + 0.05;

const INTERIOR_FLOOR_Y = 0.1;
const CUP_RADIUS = 0.09;
const CUP_HEIGHT = 0.16;
const CUP_Y = INTERIOR_FLOOR_Y + CUP_HEIGHT / 2;
const LIQUID_RADIUS = 0.075;
const LIQUID_MAX_HEIGHT = 0.13;
const LIQUID_BASE_Y = INTERIOR_FLOOR_Y + 0.01;
const NOZZLE_Y = 0.82;

type ModelProps = { active: boolean; reducedMotion: boolean };

export function CocktailMachineModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;
  const woodTexture = useMemo(() => createWoodTexture(), []);

  const dropRef = useRef<Mesh>(null);
  const liquidRef = useRef<Mesh>(null);
  const ledMatRef = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ledMatRef.current) {
      ledMatRef.current.emissiveIntensity = running ? (Math.sin(t * 4) > 0.5 ? 1.3 : 0.15) : 0.08;
    }

    const fillCycle = 3.0;
    const fillT = running ? (t % fillCycle) / fillCycle : 0;
    if (liquidRef.current) {
      const h = Math.max(fillT, 0.001);
      liquidRef.current.scale.y = h;
      liquidRef.current.position.y = LIQUID_BASE_Y + (LIQUID_MAX_HEIGHT * h) / 2;
    }
    if (dropRef.current) {
      if (!running) {
        dropRef.current.visible = false;
        return;
      }
      dropRef.current.visible = true;
      const dropCycle = 0.5;
      const dt = (t % dropCycle) / dropCycle;
      const topY = NOZZLE_Y - 0.04;
      const liquidTopY = LIQUID_BASE_Y + LIQUID_MAX_HEIGHT * fillT;
      const bottomY = Math.max(liquidTopY, INTERIOR_FLOOR_Y + 0.02);
      dropRef.current.position.set(0, topY - dt * (topY - bottomY), 0);
    }
  });

  return (
    <group>
      {/* barrel body: open at the front so the hollow interior + cup show through */}
        <mesh castShadow receiveShadow>
          <latheGeometry args={[BARREL_PROFILE, 24, BARREL_PHI_START, BARREL_PHI_LENGTH]} />
          <meshStandardMaterial map={woodTexture} roughness={0.6} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* interior floor */}
        <mesh position={[0, INTERIOR_FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial {...MAT.floor} />
        </mesh>

        {/* cup sitting inside, catching the pour */}
        <mesh position={[0, CUP_Y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[CUP_RADIUS, CUP_RADIUS * 0.9, CUP_HEIGHT, 20, 1, true]} />
          <meshStandardMaterial color="#dfe6e4" roughness={0.15} metalness={0} transparent opacity={0.32} side={THREE.DoubleSide} />
        </mesh>

        {/* liquid filling the cup, anchored to the floor and growing upward */}
        <mesh ref={liquidRef} position={[0, LIQUID_BASE_Y, 0]}>
          <cylinderGeometry args={[LIQUID_RADIUS, LIQUID_RADIUS * 0.92, LIQUID_MAX_HEIGHT, 16]} />
          <meshStandardMaterial color="#e8b23d" emissive="#e8b23d" emissiveIntensity={0.25} roughness={0.25} transparent opacity={0.85} />
        </mesh>

        {/* internal dispensing nozzle, hanging above the cup */}
        <mesh position={[0, NOZZLE_Y, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.06, 10]} />
          <meshStandardMaterial {...MAT.nozzle} />
        </mesh>

        {/* dispensing droplet, falls from the nozzle to the rising liquid surface */}
        <mesh ref={dropRef} visible={false}>
          <sphereGeometry args={[0.011, 8, 8]} />
          <meshStandardMaterial color="#e8b23d" emissive="#e8b23d" emissiveIntensity={0.6} roughness={0.3} transparent opacity={0.85} />
        </mesh>

        {/* metal hoop */}
        <mesh position={[0, BAND_Y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[BAND_RADIUS, 0.011, 8, 28]} />
          <meshStandardMaterial {...MAT.band} />
        </mesh>

        {/* control tower */}
        <mesh position={[0, TOWER_Y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[TOWER_RADIUS, TOWER_RADIUS, TOWER_HEIGHT, 20]} />
          <meshStandardMaterial map={woodTexture} roughness={0.6} metalness={0.05} />
        </mesh>

        {/* LCD display, rotated to face the barrel's open front. The gap
            (BARREL_PHI_START..+LENGTH) is centered at phi=45°; the panel's
            unrotated position faces phi=90° (local +Z), so it needs -45°
            to land exactly on the opening. */}
        <group rotation={[0, THREE.MathUtils.degToRad(-45), 0]}>
          <mesh position={[0.01, PANEL_Y, TOWER_RADIUS + 0.005]} castShadow>
            <boxGeometry args={[0.14, 0.1, 0.01]} />
            <meshStandardMaterial {...MAT.panel} />
          </mesh>

          {/* status LEDs / mounting screws */}
          <mesh position={[-0.06, PANEL_Y + 0.055, TOWER_RADIUS + 0.015]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshStandardMaterial
              ref={ledMatRef}
              {...MAT.led}
              emissive="#3ee587"
              emissiveIntensity={0.08}
            />
          </mesh>
          {[
            [0.08, PANEL_Y + 0.055],
            [-0.06, PANEL_Y - 0.055],
            [0.08, PANEL_Y - 0.055],
          ].map(([x, y]) => (
            <mesh key={`${x}-${y}`} position={[x, y, TOWER_RADIUS + 0.015]}>
              <sphereGeometry args={[0.006, 8, 8]} />
              <meshStandardMaterial {...MAT.led} />
            </mesh>
          ))}
      </group>
    </group>
  );
}
