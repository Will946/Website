"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, MeshStandardMaterial } from "three";

/**
 * Realistic-ish model of the TB6612FNG motor driver board: the driver IC,
 * status LED, tantalum caps, pin headers, and the green screw-terminal
 * output block, matching the actual KiCad 3D renders' layout, wired to a
 * small stand-in DC motor whose shaft spins forward and reverse to show
 * the two-channel H-bridge actually doing something.
 */
const BOARD_W = 1;
const BOARD_D = 1;
const BOARD_T = 0.045;
const TOP_Y = BOARD_T / 2;

function P(u: number, v: number, y: number): [number, number, number] {
  return [(u - 0.5) * BOARD_W, y, (v - 0.5) * BOARD_D];
}

const MAT = {
  green: { color: "#173a22", roughness: 0.75, metalness: 0.05 },
  ic: { color: "#111214", roughness: 0.4, metalness: 0.2 },
  chip: { color: "#1a1c1e", roughness: 0.45, metalness: 0.15 },
  cap: { color: "#7a4a30", roughness: 0.4, metalness: 0.1 },
  capCap: { color: "#d8d6cc", roughness: 0.3, metalness: 0.3 },
  header: { color: "#141517", roughness: 0.5, metalness: 0.1 },
  pin: { color: "#c9a53a", roughness: 0.3, metalness: 0.7 },
  terminal: { color: "#1fae4a", roughness: 0.4, metalness: 0.3 },
  motorBody: { color: "#2a2d30", roughness: 0.4, metalness: 0.4 },
  motorCap: { color: "#8a8f92", roughness: 0.3, metalness: 0.6 },
  wire: { color: "#141517", roughness: 0.6, metalness: 0.1 },
} as const;

function createBoardTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#173a22";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#12301c";
  ctx.fillRect(W * 0.05, H * 0.05, W * 0.9, H * 0.9);

  const px = (u: number) => u * W;
  const py = (v: number) => v * H;

  ctx.fillStyle = "#0a1810";
  ctx.strokeStyle = "#c9cdc7";
  ctx.lineWidth = 3;
  ([[0.08, 0.08], [0.92, 0.08], [0.08, 0.92], [0.92, 0.92]] as const).forEach(([u, v]) => {
    ctx.beginPath();
    ctx.arc(px(u), py(v), 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.strokeStyle = "#e7e9e2";
  ctx.fillStyle = "#e7e9e2";
  ctx.textAlign = "center";
  const box = (u: number, v: number, w: number, h: number) => {
    ctx.lineWidth = 2;
    ctx.strokeRect(px(u) - w / 2, py(v) - h / 2, w, h);
  };
  const label = (u: number, v: number, text: string, dx = 0, dy = -22) => {
    ctx.fillText(text, px(u) + dx, py(v) + dy);
  };
  const padRing = (u: number, v: number) => {
    ctx.fillStyle = "#d8b23a";
    ctx.beginPath();
    ctx.arc(px(u), py(v), 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6f1f";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#e7e9e2";
  };

  ctx.font = "20px monospace";

  // U1 IC footprint
  box(0.48, 0.5, 170, 170);
  label(0.48, 0.5, "U1", 0, -100);

  // D2 LED + R2
  box(0.26, 0.22, 30, 46);
  label(0.26, 0.22, "D2", 0, -34);
  box(0.4, 0.26, 34, 20);
  label(0.4, 0.26, "R2", 0, -18);

  // caps
  ([["C8", 0.72, 0.32], ["C9", 0.72, 0.42], ["C6", 0.68, 0.62], ["C7", 0.76, 0.62]] as const).forEach(([t, u, v]) => {
    box(u, v, 26, 40);
    label(u, v, t, 0, -26);
  });

  // J1: left vertical 5-pin
  box(0.14, 0.5, 40, 220);
  label(0.14, 0.5, "J1", -32, 0);
  [0, 1, 2, 3, 4].forEach((i) => padRing(0.14, 0.32 + i * 0.09));

  // J2: right vertical 5-pin (screw terminal footprint)
  box(0.86, 0.5, 40, 220);
  label(0.86, 0.5, "J2", 32, 0);

  // J3: bottom 5-pin
  box(0.55, 0.86, 220, 40);
  label(0.55, 0.86, "J3", 0, 40);
  [0, 1, 2, 3, 4].forEach((i) => padRing(0.4 + i * 0.075, 0.86));

  // J6: small 2-pin
  box(0.5, 0.16, 60, 30);
  label(0.5, 0.16, "J6", 0, -22);

  ctx.save();
  ctx.translate(px(0.1), py(0.14));
  ctx.rotate(-Math.PI / 8);
  ctx.font = "22px monospace";
  ctx.textAlign = "left";
  ctx.fillText("TB6612FNG", 0, 0);
  ctx.fillText("Motor Driver", 0, 26);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function TantalumCap({ u, v }: { u: number; v: number }) {
  return (
    <group position={P(u, v, TOP_Y + 0.0225)}>
      <mesh castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.045, 12]} />
        <meshStandardMaterial {...MAT.cap} />
      </mesh>
      <mesh position={[0, 0.021, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.004, 12]} />
        <meshStandardMaterial {...MAT.capCap} />
      </mesh>
    </group>
  );
}

function Header({ u, v, pins, horizontal }: { u: number; v: number; pins: number; horizontal: boolean }) {
  const span = 0.045 * (pins - 1);
  const w = horizontal ? span + 0.03 : 0.04;
  const d = horizontal ? 0.04 : span + 0.03;
  return (
    <group position={P(u, v, TOP_Y)}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[w, 0.05, d]} />
        <meshStandardMaterial {...MAT.header} />
      </mesh>
      {Array.from({ length: pins }, (_, i) => {
        const offset = i * 0.045 - span / 2;
        return (
          <mesh key={i} position={horizontal ? [offset, 0.065, 0] : [0, 0.065, offset]}>
            <cylinderGeometry args={[0.004, 0.004, 0.05, 6]} />
            <meshStandardMaterial {...MAT.pin} />
          </mesh>
        );
      })}
    </group>
  );
}

type ModelProps = { active: boolean; reducedMotion: boolean };

export function MotorDriverModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;
  const texture = useMemo(() => createBoardTexture(), []);

  const shaftRef = useRef<Group>(null);
  const ledMatRef = useRef<MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const speed = running ? Math.sin(t * 0.4) * 9 : 0;
    if (shaftRef.current) {
      // spin around the shaft's own natural (Y) axis, not the parent's
      // static Z tilt used to lay the motor on its side — mixing the two
      // axes would make the fin wobble instead of cleanly circling
      shaftRef.current.rotation.y += speed * delta;
    }
    if (ledMatRef.current) {
      ledMatRef.current.emissiveIntensity = running ? 0.4 + Math.abs(Math.sin(t * 0.4)) * 0.9 : 0.08;
    }
  });

  return (
    <group>
      {/* board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BOARD_W, BOARD_T, BOARD_D]} />
        <meshStandardMaterial attach="material-0" {...MAT.green} />
        <meshStandardMaterial attach="material-1" {...MAT.green} />
        <meshStandardMaterial attach="material-2" map={texture} roughness={0.55} metalness={0.05} />
        <meshStandardMaterial attach="material-3" {...MAT.green} />
        <meshStandardMaterial attach="material-4" {...MAT.green} />
        <meshStandardMaterial attach="material-5" {...MAT.green} />
      </mesh>

      {/* U1: TB6612FNG driver IC, with visible pin rows */}
      <mesh position={P(0.48, 0.5, TOP_Y + 0.014)} castShadow>
        <boxGeometry args={[0.17, 0.028, 0.17]} />
        <meshStandardMaterial {...MAT.ic} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i}>
          <mesh position={P(0.4 - 0.005, 0.5 + (i - 3.5) * 0.018, TOP_Y + 0.01)}>
            <boxGeometry args={[0.014, 0.005, 0.01]} />
            <meshStandardMaterial {...MAT.pin} />
          </mesh>
          <mesh position={P(0.56 + 0.005, 0.5 + (i - 3.5) * 0.018, TOP_Y + 0.01)}>
            <boxGeometry args={[0.014, 0.005, 0.01]} />
            <meshStandardMaterial {...MAT.pin} />
          </mesh>
        </group>
      ))}

      {/* D2 status LED */}
      <mesh position={P(0.26, 0.22, TOP_Y + 0.012)} castShadow>
        <capsuleGeometry args={[0.014, 0.02, 4, 8]} />
        <meshStandardMaterial
          ref={ledMatRef}
          color="#1a1c1e"
          emissive="#3ee587"
          emissiveIntensity={0.08}
          roughness={0.35}
        />
      </mesh>

      {/* R2 */}
      <mesh position={P(0.4, 0.26, TOP_Y + 0.006)} castShadow>
        <boxGeometry args={[0.03, 0.012, 0.018]} />
        <meshStandardMaterial {...MAT.chip} />
      </mesh>

      {/* tantalum caps */}
      {([["C8", 0.72, 0.32], ["C9", 0.72, 0.42], ["C6", 0.68, 0.62], ["C7", 0.76, 0.62]] as const).map(([, u, v]) => (
        <TantalumCap key={`${u}-${v}`} u={u} v={v} />
      ))}

      {/* headers */}
      <Header u={0.14} v={0.5} pins={5} horizontal={false} />
      <Header u={0.55} v={0.86} pins={5} horizontal />
      <Header u={0.5} v={0.16} pins={2} horizontal />

      {/* green screw-terminal output block */}
      <group position={P(0.87, 0.5, TOP_Y)}>
        <mesh position={[0, 0.035, 0]} castShadow>
          <boxGeometry args={[0.09, 0.07, 0.26]} />
          <meshStandardMaterial {...MAT.terminal} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0.02, 0.072, -0.1 + i * 0.05]}>
            <cylinderGeometry args={[0.012, 0.012, 0.01, 10]} />
            <meshStandardMaterial color="#5a5f62" roughness={0.3} metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* wires to the motor: span from the terminal block's edge to the
          motor body's near face, no gap */}
      {[-0.09, 0.09].map((dz) => (
        <mesh key={dz} position={[0.655, TOP_Y + 0.05, dz]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.47, 8]} />
          <meshStandardMaterial {...MAT.wire} />
        </mesh>
      ))}

      {/* stand-in DC motor, wired to the driver's output terminals */}
      <group position={P(1.55, 0.5, TOP_Y + 0.05)} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.32, 24]} />
          <meshStandardMaterial {...MAT.motorBody} />
        </mesh>
        <mesh position={[0, 0.19, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 24]} />
          <meshStandardMaterial {...MAT.motorCap} />
        </mesh>
        <group ref={shaftRef} position={[0, 0.2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.16, 10]} />
            <meshStandardMaterial {...MAT.motorCap} />
          </mesh>
          <mesh position={[0.05, 0.05, 0]} rotation={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.09, 0.012, 0.03]} />
            <meshStandardMaterial color="#e8514f" roughness={0.4} metalness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
