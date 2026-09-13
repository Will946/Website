"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, MeshStandardMaterial } from "three";

/**
 * Realistic-ish model of the 5V buck-boost board, laid out to match the
 * actual KiCad 3D renders (component references, header/test-point
 * positions, silkscreen title): a canvas-baked texture carries the
 * solder-mask, copper pads, and reference-designator text, while the
 * visually significant parts (inductor, regulator IC, tantalum caps,
 * headers) get real raised 3D bodies on top. Not a literal trace-for-trace
 * copy of the routed copper.
 */
const BOARD_W = 1;
const BOARD_D = 1.14;
const BOARD_T = 0.045;
const TOP_Y = BOARD_T / 2;

/** Normalized (u,v) board position, matching the reference image layout, to world space. */
function P(u: number, v: number, y: number): [number, number, number] {
  return [(u - 0.5) * BOARD_W, y, (v - 0.5) * BOARD_D];
}

const MAT = {
  green: { color: "#173a22", roughness: 0.75, metalness: 0.05 },
  silver: { color: "#c7ccc6", roughness: 0.35, metalness: 0.5 },
  ic: { color: "#111214", roughness: 0.4, metalness: 0.2 },
  chip: { color: "#1a1c1e", roughness: 0.45, metalness: 0.15 },
  cap: { color: "#7a4a30", roughness: 0.4, metalness: 0.1 },
  capCap: { color: "#d8d6cc", roughness: 0.3, metalness: 0.3 },
  header: { color: "#141517", roughness: 0.5, metalness: 0.1 },
  pin: { color: "#c9a53a", roughness: 0.3, metalness: 0.7 },
  white: { color: "#e7e9e2", roughness: 0.4, metalness: 0.05 },
} as const;

function createBoardTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = Math.round(W * BOARD_D);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#173a22";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#12301c";
  ctx.fillRect(W * 0.07, H * 0.06, W * 0.86, H * 0.88);

  const px = (u: number) => u * W;
  const py = (v: number) => v * H;

  ctx.fillStyle = "#0a1810";
  ctx.strokeStyle = "#c9cdc7";
  ctx.lineWidth = 3;
  ([[0.1, 0.07], [0.9, 0.07], [0.1, 0.93], [0.9, 0.93]] as const).forEach(([u, v]) => {
    ctx.beginPath();
    ctx.arc(px(u), py(v), 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.strokeStyle = "#0e2717";
  ctx.lineWidth = 4;
  (
    [
      [0.14, 0.4, 0.51, 0.44],
      [0.51, 0.44, 0.53, 0.19],
      [0.51, 0.44, 0.88, 0.4],
      [0.51, 0.44, 0.58, 0.85],
    ] as const
  ).forEach(([u1, v1, u2, v2]) => {
    ctx.beginPath();
    ctx.moveTo(px(u1), py(v1));
    ctx.lineTo(px(u2), py(v2));
    ctx.stroke();
  });

  ctx.strokeStyle = "#e7e9e2";
  ctx.fillStyle = "#e7e9e2";
  ctx.textAlign = "center";
  const box = (u: number, v: number, w: number, h: number) => {
    ctx.lineWidth = 2;
    ctx.strokeRect(px(u) - w / 2, py(v) - h / 2, w, h);
  };
  const label = (u: number, v: number, text: string, dx = 0, dy = -26) => {
    ctx.fillText(text, px(u) + dx, py(v) + dy);
  };
  const padRing = (u: number, v: number) => {
    ctx.fillStyle = "#d8b23a";
    ctx.beginPath();
    ctx.arc(px(u), py(v), 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6f1f";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#e7e9e2";
    ctx.strokeStyle = "#e7e9e2";
  };

  ctx.font = "22px monospace";

  box(0.2, 0.24, 90, 40);
  label(0.2, 0.24, "J4", 0, -30);
  ([[0.175, 0.24], [0.205, 0.24], [0.235, 0.24]] as const).forEach(([u, v]) => padRing(u, v));

  box(0.14, 0.4, 40, 90);
  label(0.14, 0.4, "J2", -38, 6);
  ([[0.14, 0.37], [0.14, 0.43]] as const).forEach(([u, v]) => padRing(u, v));

  box(0.88, 0.4, 40, 90);
  label(0.88, 0.4, "J1", 38, 6);
  ([[0.88, 0.37], [0.88, 0.43]] as const).forEach(([u, v]) => padRing(u, v));

  box(0.58, 0.85, 90, 40);
  label(0.58, 0.85, "J3", 0, 40);
  ([[0.545, 0.85], [0.575, 0.85], [0.605, 0.85]] as const).forEach(([u, v]) => padRing(u, v));

  box(0.53, 0.19, 100, 70);
  label(0.53, 0.19, "L1", 76, 6);

  box(0.51, 0.44, 60, 60);
  label(0.51, 0.44, "U1", 0, -42);

  (
    [
      ["C7", 0.64, 0.32],
      ["C6", 0.74, 0.32],
      ["C5", 0.64, 0.48],
      ["C1", 0.38, 0.32],
      ["C3", 0.28, 0.48],
      ["C2", 0.38, 0.48],
    ] as const
  ).forEach(([t, u, v]) => {
    box(u, v, 26, 40);
    label(u, v, t, 0, -26);
  });

  ([[0.3, "R1"], [0.38, "R7"], [0.46, "C4"], [0.54, "R2"], [0.62, "R4"], [0.7, "R6"]] as const).forEach(
    ([u]) => box(u, 0.68, 22, 14),
  );
  ctx.font = "16px monospace";
  label(0.5, 0.68, "R1 R7 C4 R2 R4 R6", 0, 30);
  ctx.font = "22px monospace";

  box(0.8, 0.68, 26, 14);
  label(0.8, 0.68, "D1", 0, -16);
  box(0.83, 0.58, 40, 30);
  label(0.83, 0.58, "U2", 0, -24);
  box(0.8, 0.62, 14, 10);
  box(0.72, 0.6, 18, 26);
  label(0.72, 0.6, "C8", 0, -20);

  ctx.save();
  ctx.translate(px(0.17), py(0.87));
  ctx.rotate(-Math.PI / 2.6);
  ctx.font = "34px monospace";
  ctx.textAlign = "left";
  ctx.fillText("BckBoost 5V", 0, 0);
  ctx.restore();

  ctx.font = "14px monospace";
  ctx.fillStyle = "#9fb0a4";
  ctx.textAlign = "center";
  label(0.14, 0.4, "VIN", 0, 26);
  label(0.88, 0.4, "VO", 0, 26);
  label(0.58, 0.85, "EN  PS  PG", 0, -30);
  label(0.2, 0.24, "VIN2 5VOUT ST", 0, 34);

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
  const span = 0.03 * (pins - 1);
  const w = horizontal ? span + 0.03 : 0.04;
  const d = horizontal ? 0.04 : span + 0.03;
  return (
    <group position={P(u, v, TOP_Y)}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[w, 0.05, d]} />
        <meshStandardMaterial {...MAT.header} />
      </mesh>
      {Array.from({ length: pins }, (_, i) => {
        const offset = i * 0.03 - span / 2;
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

export function BuckBoostModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;
  const texture = useMemo(() => createBoardTexture(), []);

  const waypoints = useMemo(
    () => [
      new THREE.Vector3(...P(0.14, 0.4, TOP_Y + 0.05)),
      new THREE.Vector3(...P(0.53, 0.19, TOP_Y + 0.08)),
      new THREE.Vector3(...P(0.51, 0.44, TOP_Y + 0.05)),
      new THREE.Vector3(...P(0.88, 0.4, TOP_Y + 0.05)),
    ],
    [],
  );

  const pulseRef = useRef<Mesh>(null);
  const tRef = useRef(0);
  const u1MatRef = useRef<MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    if (u1MatRef.current) {
      u1MatRef.current.emissiveIntensity = running ? 0.14 + Math.sin(state.clock.elapsedTime * 3) * 0.1 : 0.03;
    }
    if (!running || !pulseRef.current) return;
    tRef.current += delta * 0.3;
    const segments = waypoints.length - 1;
    const t = tRef.current % 1;
    const segF = t * segments;
    const seg = Math.min(Math.floor(segF), segments - 1);
    const localT = segF - seg;
    pulseRef.current.position.lerpVectors(waypoints[seg], waypoints[seg + 1], localT);
    pulseRef.current.visible = true;
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

      {/* inductor L1: two-pad power inductor */}
      {[-0.028, 0.028].map((dx) => {
        const [lx, , lz] = P(0.53, 0.19, 0);
        return (
          <mesh key={dx} position={[lx + dx, TOP_Y + 0.03, lz]} castShadow>
            <boxGeometry args={[0.04, 0.06, 0.05]} />
            <meshStandardMaterial {...MAT.silver} />
          </mesh>
        );
      })}

      {/* U1 regulator IC, with a pulsing glow to suggest switching activity */}
      <mesh position={P(0.51, 0.44, TOP_Y + 0.0125)} castShadow>
        <boxGeometry args={[0.09, 0.025, 0.09]} />
        <meshStandardMaterial ref={u1MatRef} {...MAT.ic} emissive="#4fd8e8" emissiveIntensity={0.04} />
      </mesh>

      {/* tantalum capacitor bank */}
      {(
        [
          [0.64, 0.32],
          [0.74, 0.32],
          [0.64, 0.48],
          [0.38, 0.32],
          [0.28, 0.48],
          [0.38, 0.48],
        ] as const
      ).map(([u, v]) => (
        <TantalumCap key={`${u}-${v}`} u={u} v={v} />
      ))}

      {/* small chip resistors/caps */}
      {[0.3, 0.38, 0.46, 0.54, 0.62, 0.7].map((u) => (
        <mesh key={u} position={P(u, 0.68, TOP_Y + 0.006)} castShadow>
          <boxGeometry args={[0.025, 0.012, 0.016]} />
          <meshStandardMaterial {...MAT.chip} />
        </mesh>
      ))}

      {/* D1 diode */}
      <mesh position={P(0.8, 0.68, TOP_Y + 0.006)} castShadow>
        <boxGeometry args={[0.026, 0.012, 0.016]} />
        <meshStandardMaterial {...MAT.chip} />
      </mesh>

      {/* U2 supervisor IC + nearby R3/C8 */}
      <mesh position={P(0.83, 0.58, TOP_Y + 0.01)} castShadow>
        <boxGeometry args={[0.045, 0.02, 0.032]} />
        <meshStandardMaterial {...MAT.ic} />
      </mesh>
      <mesh position={P(0.8, 0.62, TOP_Y + 0.005)}>
        <boxGeometry args={[0.014, 0.01, 0.01]} />
        <meshStandardMaterial {...MAT.chip} />
      </mesh>
      <mesh position={P(0.72, 0.6, TOP_Y + 0.01)} castShadow>
        <boxGeometry args={[0.016, 0.02, 0.022]} />
        <meshStandardMaterial {...MAT.chip} />
      </mesh>

      {/* headers */}
      <Header u={0.2} v={0.24} pins={3} horizontal />
      <Header u={0.14} v={0.4} pins={2} horizontal={false} />
      <Header u={0.88} v={0.4} pins={2} horizontal={false} />
      <Header u={0.58} v={0.85} pins={3} horizontal />

      {/* power-good indicator, lit while the converter is "running" */}
      <mesh position={P(0.58, 0.8, TOP_Y + 0.02)}>
        <sphereGeometry args={[0.013, 10, 10]} />
        <meshStandardMaterial
          color="#3ee587"
          emissive="#3ee587"
          emissiveIntensity={running ? 1.1 : 0.15}
          roughness={0.4}
        />
      </mesh>

      {/* traveling energy pulse: Vin -> inductor -> regulator -> Vout */}
      <mesh ref={pulseRef} position={waypoints[0]} visible={running}>
        <sphereGeometry args={[0.015, 10, 10]} />
        <meshStandardMaterial color="#4fd8e8" emissive="#4fd8e8" emissiveIntensity={1.4} roughness={0.3} />
      </mesh>
    </group>
  );
}
