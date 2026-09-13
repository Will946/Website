"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, MeshStandardMaterial } from "three";

/**
 * Realistic-ish model of the Tea Cozy Hotplate: a rectangular board whose
 * left two-thirds is the spiral PCB heater coil itself (etched copper,
 * no separate heating element), with the STM32F103, driver FETs, and the
 * ten-segment WS2812B temperature dial along the right edge, matching
 * the actual KiCad 3D renders' layout. The dial climbs and falls between
 * setpoints, and the coil glows faintly hotter the higher the setpoint
 * climbs, echoing the closed PWM control loop.
 */
const BOARD_W = 1.7;
const BOARD_D = 1.05;
const BOARD_T = 0.045;
const TOP_Y = BOARD_T / 2;
const COIL_R = 0.42;
const LED_COUNT = 10;
const SETPOINT_CYCLE_S = 9;

function P(u: number, v: number, y: number): [number, number, number] {
  return [(u - 0.5) * BOARD_W, y, (v - 0.5) * BOARD_D];
}

const MAT = {
  green: { color: "#173a22", roughness: 0.75, metalness: 0.05 },
  chip: { color: "#111214", roughness: 0.4, metalness: 0.2 },
  smallChip: { color: "#1a1c1e", roughness: 0.45, metalness: 0.15 },
  header: { color: "#141517", roughness: 0.5, metalness: 0.1 },
  pin: { color: "#c9a53a", roughness: 0.3, metalness: 0.7 },
  usb: { color: "#c7ccc6", roughness: 0.3, metalness: 0.6 },
  button: { color: "#243a7a", roughness: 0.4, metalness: 0.15 },
  mount: { color: "#8a6f1f", roughness: 0.35, metalness: 0.6 },
  coilCopper: { color: "#b8792f", roughness: 0.35, metalness: 0.6 },
} as const;

/** Cold-to-hot color for a given fraction 0..1 up the temperature dial. */
function tempColor(frac: number): string {
  const cold = new THREE.Color("#4fd8e8");
  const hot = new THREE.Color("#e8514f");
  return cold.clone().lerp(hot, frac).getStyle();
}

function createBoardTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 634;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#173a22";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#12301c";
  ctx.fillRect(W * 0.02, H * 0.03, W * 0.96, H * 0.94);

  const px = (u: number) => u * W;
  const py = (v: number) => v * H;

  // corner + edge mounting holes
  ctx.fillStyle = "#0a1810";
  ctx.strokeStyle = "#c9cdc7";
  ctx.lineWidth = 3;
  ([[0.06, 0.08], [0.94, 0.08], [0.06, 0.92], [0.94, 0.92]] as const).forEach(([u, v]) => {
    ctx.beginPath();
    ctx.arc(px(u), py(v), 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // spiral heater coil, drawn as concentric rings matching the JLCPCB
  // coil-generator trace this board actually uses
  const coilCx = px(0.19);
  const coilCy = py(0.5);
  const maxR = Math.min(W, H) * 0.34;
  ctx.strokeStyle = "#c9863d";
  ctx.lineWidth = 3;
  for (let r = 14; r < maxR; r += 9) {
    ctx.beginPath();
    ctx.arc(coilCx, coilCy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#e7e9e2";
  ctx.strokeStyle = "#e7e9e2";
  ctx.textAlign = "center";
  ctx.font = "16px monospace";
  const label = (u: number, v: number, text: string, dx = 0, dy = 0) => ctx.fillText(text, px(u) + dx, py(v) + dy);
  const box = (u: number, v: number, w: number, h: number) => {
    ctx.lineWidth = 2;
    ctx.strokeRect(px(u) - w / 2, py(v) - h / 2, w, h);
  };

  // STM32F103C8T6
  box(0.63, 0.42, 90, 90);
  label(0.63, 0.42, "STM32F103", 0, -56);

  // driver FETs + flyback diode
  box(0.54, 0.68, 24, 34);
  label(0.54, 0.68, "Q3", 0, -24);
  box(0.6, 0.68, 24, 34);
  label(0.6, 0.68, "Q4", 0, -24);
  box(0.67, 0.68, 20, 14);
  label(0.67, 0.68, "D1", 0, -14);

  // thermistors
  box(0.78, 0.6, 20, 20);
  label(0.78, 0.6, "T-coil", 0, -18);
  box(0.87, 0.6, 20, 20);
  label(0.87, 0.6, "T-fet", 0, -18);

  // buttons
  box(0.7, 0.85, 26, 20);
  label(0.7, 0.85, "UP", 0, 22);
  box(0.78, 0.85, 26, 20);
  label(0.78, 0.85, "DN", 0, 22);

  // SWD / UART header block, top edge
  box(0.68, 0.14, 180, 40);
  label(0.68, 0.1, "SWD / UART", 0, -16);

  // silkscreen title + zigzag mark, matching the board's real silkscreen
  ctx.font = "30px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Tea Cozy", px(0.5), py(0.28));
  ctx.fillText("Hotplate", px(0.5), py(0.36));
  ctx.beginPath();
  ctx.lineWidth = 3;
  const zx = px(0.53);
  const zy = py(0.48);
  ctx.moveTo(zx, zy);
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(zx + (i + 0.5) * 16, zy + (i % 2 === 0 ? 18 : -18));
  }
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

type ModelProps = { active: boolean; reducedMotion: boolean };

export function TeaCozyModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;
  const texture = useMemo(() => createBoardTexture(), []);

  const ledRefs = useMemo(() => Array.from({ length: LED_COUNT }, () => ({ current: null as Mesh | null })), []);
  const coilGlowRef = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // triangle wave climbing and falling between setpoints, like someone
    // nudging the Up/Down buttons every few seconds
    const phase = running ? (t % SETPOINT_CYCLE_S) / SETPOINT_CYCLE_S : 0;
    const climb = phase < 0.5 ? phase * 2 : 2 - phase * 2;
    const setpoint = running ? Math.round(climb * (LED_COUNT - 1)) : -1;

    ledRefs.forEach((ref, i) => {
      const mesh = ref.current;
      if (!mesh) return;
      const mat = mesh.material as MeshStandardMaterial;
      mat.emissiveIntensity = i <= setpoint ? 1.1 : 0.06;
    });

    if (coilGlowRef.current) {
      const heat = running ? setpoint / (LED_COUNT - 1) : 0;
      coilGlowRef.current.emissiveIntensity = 0.05 + heat * 0.55;
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

      {/* heater coil glow, a soft disc sitting just above the copper
          spiral, warming with the setpoint */}
      <mesh position={P(0.19, 0.5, TOP_Y + 0.002)} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[COIL_R, 40]} />
        <meshStandardMaterial
          ref={coilGlowRef}
          color={MAT.coilCopper.color}
          emissive="#e8514f"
          emissiveIntensity={0.05}
          roughness={0.5}
          metalness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* STM32F103 */}
      <mesh position={P(0.63, 0.42, TOP_Y + 0.014)} castShadow>
        <boxGeometry args={[0.13, 0.028, 0.13]} />
        <meshStandardMaterial {...MAT.chip} />
      </mesh>

      {/* driver FETs */}
      {([0.54, 0.6] as const).map((u) => (
        <mesh key={u} position={P(u, 0.68, TOP_Y + 0.008)} castShadow>
          <boxGeometry args={[0.03, 0.016, 0.045]} />
          <meshStandardMaterial {...MAT.smallChip} />
        </mesh>
      ))}
      {/* flyback diode */}
      <mesh position={P(0.67, 0.68, TOP_Y + 0.006)} castShadow>
        <boxGeometry args={[0.025, 0.012, 0.018]} />
        <meshStandardMaterial {...MAT.smallChip} />
      </mesh>

      {/* thermistors */}
      {([
        [0.78, 0.6],
        [0.87, 0.6],
      ] as const).map(([u, v]) => (
        <mesh key={`${u}-${v}`} position={P(u, v, TOP_Y + 0.006)} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.012, 10]} />
          <meshStandardMaterial {...MAT.smallChip} />
        </mesh>
      ))}

      {/* up/down buttons */}
      {([0.7, 0.78] as const).map((u) => (
        <mesh key={u} position={P(u, 0.85, TOP_Y + 0.01)} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.018, 12]} />
          <meshStandardMaterial {...MAT.button} />
        </mesh>
      ))}

      {/* SWD / UART header */}
      <mesh position={P(0.68, 0.14, TOP_Y + 0.02)} castShadow>
        <boxGeometry args={[0.3, 0.05, 0.06]} />
        <meshStandardMaterial {...MAT.header} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={P(0.55 + i * 0.045, 0.14, TOP_Y + 0.05)}>
          <cylinderGeometry args={[0.005, 0.005, 0.05, 6]} />
          <meshStandardMaterial {...MAT.pin} />
        </mesh>
      ))}

      {/* USB-C, mounted on the left edge */}
      <mesh position={[-BOARD_W / 2 - 0.03, TOP_Y - 0.01, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.09, 0.06, 0.16]} />
        <meshStandardMaterial {...MAT.usb} />
      </mesh>

      {/* ten-segment WS2812B temperature dial, right edge */}
      {Array.from({ length: LED_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            ledRefs[i].current = m;
          }}
          position={P(0.94, 0.12 + i * 0.078, TOP_Y + 0.012)}
        >
          <capsuleGeometry args={[0.014, 0.03, 4, 8]} />
          <meshStandardMaterial
            color="#1a1c1e"
            emissive={tempColor(i / (LED_COUNT - 1))}
            emissiveIntensity={0.06}
            roughness={0.35}
          />
        </mesh>
      ))}

      {/* mounting-ear tabs, left / right edges */}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * (BOARD_W / 2 + 0.03), 0, 0]} castShadow>
          <boxGeometry args={[0.06, BOARD_T, 0.18]} />
          <meshStandardMaterial {...MAT.green} />
        </mesh>
      ))}
    </group>
  );
}
