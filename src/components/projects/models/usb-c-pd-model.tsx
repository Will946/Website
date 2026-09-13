"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, MeshStandardMaterial } from "three";

/**
 * Realistic-ish model of the USB-C PD trigger board: the USB-C input
 * connector, the PD controller IC, the voltage-select DIP switch, and the
 * barrel-jack output, matching the actual KiCad 3D renders' layout. Not a
 * literal trace-for-trace copy of the routed copper.
 */
const BOARD_W = 1;
const BOARD_D = 1.45;
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
  usbShell: { color: "#c7ccc6", roughness: 0.3, metalness: 0.6 },
  usbSlot: { color: "#0a0b0c", roughness: 0.6, metalness: 0.1 },
  switchBody: { color: "#141517", roughness: 0.5, metalness: 0.1 },
  switchLever: { color: "#e7e9e2", roughness: 0.4, metalness: 0.1 },
  jack: { color: "#8a8f92", roughness: 0.3, metalness: 0.6 },
  jackDark: { color: "#1a1c1e", roughness: 0.5, metalness: 0.2 },
  testPoint: { color: "#d8b23a", roughness: 0.4, metalness: 0.3 },
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
  ctx.fillRect(W * 0.05, H * 0.04, W * 0.9, H * 0.92);

  const px = (u: number) => u * W;
  const py = (v: number) => v * H;

  ctx.fillStyle = "#0a1810";
  ctx.strokeStyle = "#c9cdc7";
  ctx.lineWidth = 3;
  ([[0.09, 0.05], [0.91, 0.05], [0.09, 0.95], [0.91, 0.95]] as const).forEach(([u, v]) => {
    ctx.beginPath();
    ctx.arc(px(u), py(v), 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.strokeStyle = "#e7e9e2";
  ctx.fillStyle = "#e7e9e2";
  ctx.textAlign = "center";
  ctx.font = "18px monospace";
  const box = (u: number, v: number, w: number, h: number) => {
    ctx.lineWidth = 2;
    ctx.strokeRect(px(u) - w / 2, py(v) - h / 2, w, h);
  };
  const label = (u: number, v: number, text: string, dx = 0, dy = -18) => {
    ctx.fillText(text, px(u) + dx, py(v) + dy);
  };

  box(0.5, 0.12, 200, 90);
  label(0.5, 0.12, "J1", 110, 6);
  box(0.32, 0.4, 40, 40);
  label(0.32, 0.4, "U1", 0, -30);
  box(0.78, 0.33, 60, 40);
  label(0.78, 0.33, "U2", 0, -28);
  box(0.28, 0.78, 260, 190);
  label(0.28, 0.68, "SW1", 0, -8);
  box(0.72, 0.82, 180, 180);
  label(0.72, 0.72, "J4", 0, -8);

  ctx.save();
  ctx.translate(px(0.08), py(0.06));
  ctx.font = "22px monospace";
  ctx.textAlign = "left";
  ctx.fillText("USB-C", 0, 0);
  ctx.fillText("PD", 0, 26);
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
        <cylinderGeometry args={[0.017, 0.017, 0.045, 12]} />
        <meshStandardMaterial {...MAT.cap} />
      </mesh>
      <mesh position={[0, 0.021, 0]}>
        <cylinderGeometry args={[0.017, 0.017, 0.004, 12]} />
        <meshStandardMaterial {...MAT.capCap} />
      </mesh>
    </group>
  );
}

const RUNG_LABELS = ["5V", "9V", "12V", "15V", "20V"];
const RUNGS = RUNG_LABELS.map((_, i) => ({ u: 0.14, v: 0.24 + i * 0.045 }));

const J1_POS = new THREE.Vector3(...P(0.5, 0.1, TOP_Y + 0.06));
const J4_POS = new THREE.Vector3(...P(0.72, 0.82, TOP_Y + 0.03));

type ModelProps = { active: boolean; reducedMotion: boolean };

export function UsbCPdModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;
  const texture = useMemo(() => createBoardTexture(), []);

  const rungRefs = [
    useRef<MeshStandardMaterial>(null),
    useRef<MeshStandardMaterial>(null),
    useRef<MeshStandardMaterial>(null),
    useRef<MeshStandardMaterial>(null),
    useRef<MeshStandardMaterial>(null),
  ];
  const pulseRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cycle = 3.2;
    const ct = running ? t % cycle : -1;

    rungRefs.forEach((ref, i) => {
      if (!ref.current) return;
      const onAt = i * 0.4;
      const lit = ct >= onAt && ct < 2.2;
      ref.current.emissiveIntensity = lit ? (i === RUNGS.length - 1 ? 1.4 : 0.7) : 0.06;
    });

    if (pulseRef.current) {
      if (ct < 2.2) {
        pulseRef.current.visible = false;
      } else {
        pulseRef.current.visible = true;
        const pt = (ct - 2.2) / (cycle - 2.2);
        pulseRef.current.position.lerpVectors(J1_POS, J4_POS, pt);
      }
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

      {/* J1: USB-C connector shell */}
      <mesh position={P(0.5, 0.09, TOP_Y + 0.035)} castShadow>
        <boxGeometry args={[0.36, 0.07, 0.16]} />
        <meshStandardMaterial {...MAT.usbShell} />
      </mesh>
      <mesh position={P(0.5, 0.06, TOP_Y + 0.06)}>
        <boxGeometry args={[0.22, 0.03, 0.01]} />
        <meshStandardMaterial {...MAT.usbSlot} />
      </mesh>

      {/* U1: PD controller IC */}
      <mesh position={P(0.32, 0.4, TOP_Y + 0.012)} castShadow>
        <boxGeometry args={[0.08, 0.024, 0.08]} />
        <meshStandardMaterial {...MAT.ic} />
      </mesh>

      {/* U2: load-switch IC */}
      <mesh position={P(0.78, 0.33, TOP_Y + 0.012)} castShadow>
        <boxGeometry args={[0.11, 0.022, 0.08]} />
        <meshStandardMaterial {...MAT.chip} />
      </mesh>

      {/* small chip resistors */}
      {[
        [0.44, 0.4],
        [0.53, 0.35],
        [0.48, 0.53],
        [0.14, 0.58],
        [0.22, 0.58],
        [0.3, 0.58],
        [0.38, 0.58],
      ].map(([u, v]) => (
        <mesh key={`${u}-${v}`} position={P(u, v, TOP_Y + 0.006)} castShadow>
          <boxGeometry args={[0.025, 0.012, 0.016]} />
          <meshStandardMaterial {...MAT.chip} />
        </mesh>
      ))}

      {/* output filter caps */}
      {[
        [0.8, 0.42],
        [0.8, 0.47],
        [0.8, 0.52],
      ].map(([u, v]) => (
        <TantalumCap key={`${u}-${v}`} u={u} v={v} />
      ))}

      {/* test point */}
      <mesh position={P(0.12, 0.5, TOP_Y + 0.006)}>
        <cylinderGeometry args={[0.016, 0.016, 0.006, 12]} />
        <meshStandardMaterial {...MAT.testPoint} />
      </mesh>

      {/* JP1 jumper */}
      <mesh position={P(0.62, 0.58, TOP_Y + 0.014)} castShadow>
        <boxGeometry args={[0.03, 0.018, 0.05]} />
        <meshStandardMaterial {...MAT.testPoint} />
      </mesh>

      {/* SW1: voltage-select DIP switch, one lever set to the 20V position */}
      <group position={P(0.28, 0.78, TOP_Y)}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.25, 0.024, 0.18]} />
          <meshStandardMaterial {...MAT.switchBody} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[-0.09 + i * 0.045, 0.036, i === 4 ? 0.03 : -0.02]} castShadow>
            <boxGeometry args={[0.03, 0.014, 0.05]} />
            <meshStandardMaterial {...MAT.switchLever} />
          </mesh>
        ))}
      </group>

      {/* voltage-negotiation ladder, lights bottom-to-top as the PD
          contract climbs toward 20V */}
      {RUNGS.map((r, i) => (
        <mesh key={i} position={P(r.u, r.v, TOP_Y + 0.01)}>
          <boxGeometry args={[0.05, 0.014, 0.03]} />
          <meshStandardMaterial
            ref={rungRefs[i]}
            color="#1a1c1e"
            emissive={i === RUNGS.length - 1 ? "#3ee587" : "#4fd8e8"}
            emissiveIntensity={0.06}
            roughness={0.35}
          />
        </mesh>
      ))}

      {/* J4: barrel jack output */}
      <mesh position={P(0.72, 0.85, TOP_Y + 0.03)} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 20]} />
        <meshStandardMaterial {...MAT.jack} />
      </mesh>
      <mesh position={P(0.72, 0.79, TOP_Y + 0.03)} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.06, 16]} />
        <meshStandardMaterial {...MAT.jackDark} />
      </mesh>

      {/* delivered-power pulse, travels from the USB-C input to the barrel
          jack once the ladder reaches 20V */}
      <mesh ref={pulseRef} visible={false}>
        <sphereGeometry args={[0.016, 10, 10]} />
        <meshStandardMaterial color="#3ee587" emissive="#3ee587" emissiveIntensity={1.4} roughness={0.3} />
      </mesh>
    </group>
  );
}
