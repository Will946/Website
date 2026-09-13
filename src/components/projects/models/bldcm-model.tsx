"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";

/**
 * Realistic-ish model of the BLDC motor controller: two round 4-layer
 * boards stacked face-to-face on a Molex board-to-board connector,
 * matching the actual KiCad 3D renders' layout (not a literal
 * trace-for-trace copy of the routed copper). The MCU board on top
 * carries the STM32F4, AS5048A encoder, and ISM330DHCX IMU; the power
 * board below carries the TMC6300 gate driver, the INA240 current-sense
 * amplifiers, the CAN transceiver, USB-C, and the two Molex Micro-Lock
 * output connectors. The stand-in BLDC motor the stack drives sits on
 * top of the MCU board, matching the real assembly where the controller
 * sits directly behind the motor it's mounted to, its shaft spinning
 * while the stack is active.
 */
const BOARD_R = 0.85;
const BOARD_T = 0.035;
const STACK_GAP = 0.42;
const POWER_Y = 0;
const MCU_Y = STACK_GAP;
const MCU_TOP_Y = MCU_Y + BOARD_T / 2;
const STANDOFF_ANGLES = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

function buildBoardShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, BOARD_R, 0, Math.PI * 2, false);
  return shape;
}

const MAT = {
  green: { color: "#173a22", roughness: 0.75, metalness: 0.05 },
  chip: { color: "#111214", roughness: 0.4, metalness: 0.2 },
  smallChip: { color: "#1a1c1e", roughness: 0.45, metalness: 0.15 },
  header: { color: "#141517", roughness: 0.5, metalness: 0.1 },
  pin: { color: "#c9a53a", roughness: 0.3, metalness: 0.7 },
  connectorBody: { color: "#3a3e42", roughness: 0.4, metalness: 0.15 },
  molex: { color: "#dfe6ea", roughness: 0.35, metalness: 0.1 },
  usb: { color: "#c7ccc6", roughness: 0.3, metalness: 0.6 },
  button: { color: "#243a7a", roughness: 0.4, metalness: 0.15 },
  motorBody: { color: "#2a2d30", roughness: 0.4, metalness: 0.4 },
  motorCap: { color: "#8a8f92", roughness: 0.3, metalness: 0.6 },
  standoff: { color: "#8a6f1f", roughness: 0.35, metalness: 0.6 },
} as const;

function P(u: number, v: number, y: number): [number, number, number] {
  return [u * BOARD_R, y, v * BOARD_R];
}

function drawSilkTitle(ctx: CanvasRenderingContext2D, px: (u: number) => number, py: (v: number) => number) {
  ctx.save();
  ctx.translate(px(-0.7), py(0.05));
  ctx.rotate(-Math.PI / 10);
  ctx.font = "22px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#e7e9e2";
  ctx.fillText("BLDCM", 0, 0);
  ctx.restore();

  // hand-drawn zigzag mark, the same personal logo stamped across the boards
  ctx.save();
  ctx.strokeStyle = "#e7e9e2";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const zx = px(-0.72);
  const zy = py(-0.08);
  ctx.moveTo(zx, zy);
  for (let i = 0; i < 4; i++) {
    ctx.lineTo(zx + (i + 0.5) * 12, zy + (i % 2 === 0 ? 16 : -16));
  }
  ctx.stroke();
  ctx.restore();
}

function createPowerTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#173a22";
  ctx.fillRect(0, 0, W, H);
  const cx = W / 2;
  const cy = H / 2;
  const scale = W / 2 / 1.05;
  const px = (u: number) => cx + u * scale;
  const py = (v: number) => cy - v * scale;

  ctx.fillStyle = "#12301c";
  ctx.beginPath();
  ctx.arc(cx, cy, BOARD_R * scale * 0.96, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#e7e9e2";
  ctx.fillStyle = "#e7e9e2";
  ctx.font = "18px monospace";
  ctx.textAlign = "center";
  const label = (u: number, v: number, text: string, dx = 0, dy = 0) => ctx.fillText(text, px(u) + dx, py(v) + dy);
  const box = (u: number, v: number, w: number, h: number) => {
    ctx.lineWidth = 2;
    ctx.strokeRect(px(u) - w / 2, py(v) - h / 2, w, h);
  };

  // U1 TMC6300 gate driver
  box(-0.35, -0.1, 90, 90);
  label(-0.35, -0.1, "TMC6300", 0, -58);

  // 3x INA240 current sense amps
  ([[-0.05, -0.35], [0.15, -0.35], [0.35, -0.35]] as const).forEach(([u, v], i) => {
    box(u, v, 40, 30);
    label(u, v, `INA240-${i + 1}`, 0, -22);
  });

  // CAN transceiver
  box(0.55, -0.45, 60, 40);
  label(0.55, -0.45, "TCAN1462", 0, 40);
  label(0.65, -0.6, "CAN", 0, 0);

  // J-Link SWD header
  box(-0.15, -0.68, 130, 30);
  label(-0.15, -0.68, "SWD", 0, -22);

  // board-to-board stack header footprint (center)
  ctx.strokeStyle = "#d8b23a";
  ctx.lineWidth = 2;
  box(0, 0.45, 200, 90);
  label(0, 0.45, "J1 STACK", 0, -58);

  drawSilkTitle(ctx, px, py);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function createMcuTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#173a22";
  ctx.fillRect(0, 0, W, H);
  const cx = W / 2;
  const cy = H / 2;
  const scale = W / 2 / 1.05;
  const px = (u: number) => cx + u * scale;
  const py = (v: number) => cy - v * scale;

  ctx.fillStyle = "#12301c";
  ctx.beginPath();
  ctx.arc(cx, cy, BOARD_R * scale * 0.96, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#e7e9e2";
  ctx.fillStyle = "#e7e9e2";
  ctx.font = "18px monospace";
  ctx.textAlign = "center";
  const label = (u: number, v: number, text: string, dx = 0, dy = 0) => ctx.fillText(text, px(u) + dx, py(v) + dy);
  const box = (u: number, v: number, w: number, h: number) => {
    ctx.lineWidth = 2;
    ctx.strokeRect(px(u) - w / 2, py(v) - h / 2, w, h);
  };

  // STM32F4 QFN
  box(0, -0.1, 120, 120);
  label(0, -0.1, "STM32F4", 0, -74);

  // AS5048A encoder, near board center over the rotor axis
  box(0.22, 0.02, 44, 44);
  label(0.22, 0.02, "AS5048A", 0, -30);

  // ISM330DHCX IMU
  box(-0.28, 0.15, 40, 40);
  label(-0.28, 0.15, "IMU", 0, -28);

  // reset button footprint
  box(0, -0.72, 40, 24);
  label(0, -0.72, "RESET", 0, 26);

  // board-to-board stack header footprint (center)
  ctx.strokeStyle = "#d8b23a";
  ctx.lineWidth = 2;
  box(0, 0.45, 200, 90);
  label(0, 0.45, "J1 STACK", 0, -58);

  drawSilkTitle(ctx, px, py);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function StackConnector() {
  // the Molex board-to-board connector bridging the gap between the two
  // boards, drawn as a header block + mating socket rather than separate
  // pins, since the gap is small
  return (
    <group position={P(0, 0.45, POWER_Y + BOARD_T / 2)}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[0.34, 0.06, 0.16]} />
        <meshStandardMaterial {...MAT.connectorBody} />
      </mesh>
      <mesh position={[0, STACK_GAP - 0.03, 0]} castShadow>
        <boxGeometry args={[0.32, 0.06, 0.14]} />
        <meshStandardMaterial {...MAT.connectorBody} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const row = i < 7 ? -1 : 1;
        const col = i % 7;
        return (
          <mesh key={i} position={[-0.24 + col * 0.08, STACK_GAP / 2, row * 0.045]}>
            <cylinderGeometry args={[0.006, 0.006, STACK_GAP - 0.05, 6]} />
            <meshStandardMaterial {...MAT.pin} />
          </mesh>
        );
      })}
    </group>
  );
}

function MolexConnector({ side }: { side: -1 | 1 }) {
  return (
    <group position={P(side * 0.95, 0, POWER_Y + BOARD_T / 2 + 0.045)}>
      <mesh castShadow>
        <boxGeometry args={[0.16, 0.09, 0.14]} />
        <meshStandardMaterial {...MAT.molex} />
      </mesh>
    </group>
  );
}

type ModelProps = { active: boolean; reducedMotion: boolean };

export function BldcmModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;
  const boardShape = useMemo(() => buildBoardShape(), []);
  const powerTexture = useMemo(() => createPowerTexture(), []);
  const mcuTexture = useMemo(() => createMcuTexture(), []);

  const shaftRef = useRef<Group>(null);

  useFrame((state, delta) => {
    const speed = running ? 4 : 0;
    if (shaftRef.current) {
      shaftRef.current.rotation.y += speed * delta;
    }
  });

  return (
    <group>
      {/* power board (bottom) */}
      <group position={[0, POWER_Y, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh receiveShadow castShadow>
            <extrudeGeometry args={[boardShape, { depth: BOARD_T, bevelEnabled: false }]} />
            <meshStandardMaterial attach="material-0" {...MAT.green} side={THREE.DoubleSide} />
            <meshStandardMaterial attach="material-1" map={powerTexture} roughness={0.55} metalness={0.05} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* TMC6300 */}
        <mesh position={P(-0.35, -0.1, BOARD_T / 2 + 0.02)} castShadow>
          <boxGeometry args={[0.15, 0.04, 0.15]} />
          <meshStandardMaterial {...MAT.chip} />
        </mesh>

        {/* 3x INA240 */}
        {([[-0.05, -0.35], [0.15, -0.35], [0.35, -0.35]] as const).map(([u, v]) => (
          <mesh key={`${u}-${v}`} position={P(u, v, BOARD_T / 2 + 0.01)} castShadow>
            <boxGeometry args={[0.065, 0.014, 0.05]} />
            <meshStandardMaterial {...MAT.smallChip} />
          </mesh>
        ))}

        {/* CAN transceiver */}
        <mesh position={P(0.55, -0.45, BOARD_T / 2 + 0.012)} castShadow>
          <boxGeometry args={[0.1, 0.012, 0.06]} />
          <meshStandardMaterial {...MAT.smallChip} />
        </mesh>

        {/* SWD header */}
        <mesh position={P(-0.15, -0.68, BOARD_T / 2 + 0.02)} castShadow>
          <boxGeometry args={[0.22, 0.05, 0.06]} />
          <meshStandardMaterial {...MAT.header} />
        </mesh>

        {/* USB-C, edge-mounted at the south edge */}
        <mesh position={P(0, -0.98, BOARD_T / 2 + 0.03)} castShadow>
          <boxGeometry args={[0.16, 0.06, 0.09]} />
          <meshStandardMaterial {...MAT.usb} />
        </mesh>

        {/* Molex Micro-Lock connectors, left / right edges */}
        <MolexConnector side={-1} />
        <MolexConnector side={1} />
      </group>

      {/* board-to-board Molex stack connector, bridging the gap */}
      <StackConnector />

      {/* standoff pins holding the stack together */}
      {STANDOFF_ANGLES.map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.65, POWER_Y + BOARD_T / 2 + STACK_GAP / 2, Math.sin(a) * 0.65]}>
          <cylinderGeometry args={[0.02, 0.02, STACK_GAP, 10]} />
          <meshStandardMaterial {...MAT.standoff} />
        </mesh>
      ))}

      {/* MCU board (top) */}
      <group position={[0, MCU_Y, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh receiveShadow castShadow>
            <extrudeGeometry args={[boardShape, { depth: BOARD_T, bevelEnabled: false }]} />
            <meshStandardMaterial attach="material-0" {...MAT.green} side={THREE.DoubleSide} />
            <meshStandardMaterial attach="material-1" map={mcuTexture} roughness={0.55} metalness={0.05} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* STM32F4 */}
        <mesh position={P(0, -0.1, BOARD_T / 2 + 0.014)} castShadow>
          <boxGeometry args={[0.2, 0.028, 0.2]} />
          <meshStandardMaterial {...MAT.chip} />
        </mesh>

        {/* AS5048A encoder */}
        <mesh position={P(0.22, 0.02, BOARD_T / 2 + 0.01)} castShadow>
          <boxGeometry args={[0.075, 0.014, 0.075]} />
          <meshStandardMaterial {...MAT.smallChip} />
        </mesh>

        {/* ISM330DHCX IMU */}
        <mesh position={P(-0.28, 0.15, BOARD_T / 2 + 0.008)} castShadow>
          <boxGeometry args={[0.06, 0.01, 0.06]} />
          <meshStandardMaterial {...MAT.smallChip} />
        </mesh>

        {/* reset button */}
        <mesh position={P(0, -0.72, BOARD_T / 2 + 0.01)} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.02, 12]} />
          <meshStandardMaterial {...MAT.button} />
        </mesh>
      </group>

      {/* stand-in BLDC motor the stack is driving, mounted on top of the
          MCU board — the same way the real controller sits directly
          behind the motor it's bolted to */}
      <group position={[0, MCU_TOP_Y + 0.26, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.34, 28]} />
          <meshStandardMaterial {...MAT.motorBody} />
        </mesh>
        <mesh position={[0, 0.19, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.02, 28]} />
          <meshStandardMaterial {...MAT.motorCap} />
        </mesh>
        <group ref={shaftRef} position={[0, 0.2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.16, 10]} />
            <meshStandardMaterial {...MAT.motorCap} />
          </mesh>
          <mesh position={[0.12, 0.05, 0]} castShadow>
            <boxGeometry args={[0.2, 0.014, 0.05]} />
            <meshStandardMaterial color="#e8514f" roughness={0.4} metalness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
