"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, MeshStandardMaterial } from "three";

/**
 * Realistic-ish model of the GNSS carrier board: a round PCB with a
 * notched edge, the shielded ZED-F9P module in the center, its status
 * LEDs (PWR / PPS / RTK / FENCE), a coin-cell RTC backup battery, the
 * DSEL jumper, and the UART/SPI/I2C headers around the edge, matching the
 * actual KiCad 3D renders' layout. Not a literal trace-for-trace copy of
 * the routed copper.
 */
const BOARD_R = 1;
const NOTCH_START_DEG = 145;
const NOTCH_END_DEG = 215;

const MAT = {
  green: { color: "#173a22", roughness: 0.75, metalness: 0.05 },
  module: { color: "#8a8f92", roughness: 0.35, metalness: 0.55 },
  moduleTop: { color: "#3a3e42", roughness: 0.4, metalness: 0.3 },
  chip: { color: "#1a1c1e", roughness: 0.45, metalness: 0.15 },
  header: { color: "#141517", roughness: 0.5, metalness: 0.1 },
  pin: { color: "#c9a53a", roughness: 0.3, metalness: 0.7 },
  battery: { color: "#c7ccc6", roughness: 0.3, metalness: 0.6 },
  jumper: { color: "#e8b23d", roughness: 0.4, metalness: 0.2 },
} as const;

const LED_COLORS = {
  PWR: "#3ee587",
  PPS: "#4fd8e8",
  RTK: "#e8a33d",
  FENCE: "#e8514f",
} as const;

function P(u: number, v: number, y: number): [number, number, number] {
  return [u, y, v];
}

function buildBoardShape() {
  const shape = new THREE.Shape();
  const startRad = THREE.MathUtils.degToRad(NOTCH_END_DEG);
  const endRad = THREE.MathUtils.degToRad(NOTCH_START_DEG) + Math.PI * 2;
  shape.absarc(0, 0, BOARD_R, startRad, endRad, false);

  const holes: [number, number][] = [
    [0, 0.88],
    [0.82, 0.42],
    [0.7, -0.62],
    [-0.15, -0.85],
  ];
  holes.forEach(([cx, cy]) => {
    const hole = new THREE.Path();
    hole.absarc(cx, cy, 0.045, 0, Math.PI * 2, false);
    shape.holes.push(hole);
  });

  return shape;
}

function createBoardTexture(): THREE.CanvasTexture {
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
  ctx.arc(cx, cy, BOARD_R * scale * 0.94, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#e7e9e2";
  ctx.fillStyle = "#e7e9e2";
  ctx.textAlign = "center";
  ctx.font = "20px monospace";
  const label = (u: number, v: number, text: string, dx = 0, dy = 0) => {
    ctx.fillText(text, px(u) + dx, py(v) + dy);
  };
  const padRow = (u0: number, v: number, count: number, spacing: number, horizontal: boolean) => {
    ctx.fillStyle = "#d8b23a";
    ctx.strokeStyle = "#8a6f1f";
    for (let i = 0; i < count; i++) {
      const u = horizontal ? u0 + i * spacing : u0;
      const vv = horizontal ? v : v + i * spacing;
      ctx.beginPath();
      ctx.arc(px(u), py(vv), 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "#e7e9e2";
  };

  // U3 module footprint outline
  ctx.strokeStyle = "#e7e9e2";
  ctx.lineWidth = 2;
  ctx.strokeRect(px(-0.34), py(0.28), 0.68 * scale, 0.5 * scale);
  label(0, 0.32, "U3", 0, -6);

  // header J7 (top edge, 9-pin)
  padRow(-0.32, 0.78, 9, 0.08, true);
  label(0, 0.78, "J7", 60, -6);

  // header J3 (bottom edge, 10-pin)
  padRow(-0.36, -0.78, 10, 0.08, true);
  label(0, -0.78, "J3", 0, 26);

  // header J1 (left, vertical, 6-pin)
  padRow(-0.6, -0.1, 6, -0.09, false);
  label(-0.6, -0.1, "J1", -34, 0);

  // small headers
  padRow(-0.28, 0.63, 4, 0.07, true);
  label(-0.14, 0.63, "J4", 0, -16);
  padRow(-0.34, -0.36, 4, 0.07, true);
  label(-0.2, -0.36, "J2", 0, 22);

  // resistor field near U3
  ctx.strokeStyle = "#e7e9e2";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const u = 0.42 + (i % 4) * 0.06;
    const v = 0.32 - Math.floor(i / 4) * 0.09;
    ctx.strokeRect(px(u) - 8, py(v) - 5, 16, 10);
  }

  // LED / status column
  ["PWR", "PPS", "RTK", "FENCE"].forEach((t, i) => {
    label(0.5, 0.1 - i * 0.12, t, 46, 4);
  });

  // battery
  ctx.strokeStyle = "#e7e9e2";
  ctx.beginPath();
  ctx.arc(px(0.58), py(-0.5), 0.09 * scale, 0, Math.PI * 2);
  ctx.stroke();
  label(0.58, -0.5, "B1", 0, 42);

  // DSEL jumper
  ctx.strokeRect(px(0.02) - 14, py(0.02) - 10, 28, 20);
  label(0.02, 0.02, "DSEL", 0, -18);

  // silkscreen title
  ctx.font = "26px monospace";
  ctx.textAlign = "left";
  label(-0.78, 0.08, "GNSS", 0, -14);
  label(-0.78, 0.08, "Board", 0, 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

const SATELLITES = [
  { radius: 0.85, height: 0.7, speed: 0.5, phase: 0 },
  { radius: 1.05, height: 0.55, speed: 0.35, phase: 2.1 },
  { radius: 0.7, height: 0.9, speed: 0.65, phase: 4.2 },
];

// point on the board the signal waves converge on (roughly the module's
// antenna feed point)
const RECEIVER_POINT = new THREE.Vector3(0, 0.34, 0);
const WAVE_CYCLE = 1.6;
const WAVE_UP_AXIS = new THREE.Vector3(0, 0, 1);

type ModelProps = { active: boolean; reducedMotion: boolean };

export function GnssModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;
  const boardShape = useMemo(() => buildBoardShape(), []);
  const texture = useMemo(() => createBoardTexture(), []);

  const ppsRef = useRef<MeshStandardMaterial>(null);
  const rtkRef = useRef<MeshStandardMaterial>(null);
  const satRefs = [useRef<Mesh>(null), useRef<Mesh>(null), useRef<Mesh>(null)];
  const waveRefs = [useRef<Mesh>(null), useRef<Mesh>(null), useRef<Mesh>(null)];
  const waveMatRefs = [
    useRef<MeshStandardMaterial>(null),
    useRef<MeshStandardMaterial>(null),
    useRef<MeshStandardMaterial>(null),
  ];
  const tmpDir = useRef(new THREE.Vector3());
  const tmpQuat = useRef(new THREE.Quaternion());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ppsRef.current) {
      // pulse-per-second: a sharp blink once every second, the literal
      // meaning of PPS on a real GNSS module
      ppsRef.current.emissiveIntensity = running ? (t % 1 < 0.12 ? 1.6 : 0.1) : 0.06;
    }
    if (rtkRef.current) {
      rtkRef.current.emissiveIntensity = running ? 0.5 + Math.sin(t * 1.6) * 0.4 : 0.06;
    }
    satRefs.forEach((ref, i) => {
      const s = SATELLITES[i];
      if (!ref.current) return;
      if (!running) return;
      const angle = t * s.speed + s.phase;
      ref.current.position.set(Math.cos(angle) * s.radius, s.height, Math.sin(angle) * s.radius);
    });

    // signal waves: a ring travels from each satellite's current position
    // down to the receiver, growing and fading as it goes
    waveRefs.forEach((ref, i) => {
      const wave = ref.current;
      const mat = waveMatRefs[i].current;
      const sat = satRefs[i].current;
      if (!wave || !mat) return;
      if (!running || !sat) {
        wave.visible = false;
        return;
      }
      wave.visible = true;
      const localT = ((t + i * (WAVE_CYCLE / SATELLITES.length)) % WAVE_CYCLE) / WAVE_CYCLE;
      wave.position.lerpVectors(sat.position, RECEIVER_POINT, localT);
      tmpDir.current.subVectors(RECEIVER_POINT, sat.position).normalize();
      tmpQuat.current.setFromUnitVectors(WAVE_UP_AXIS, tmpDir.current);
      wave.quaternion.copy(tmpQuat.current);
      const scale = 0.5 + localT * 2.2;
      wave.scale.setScalar(scale);
      mat.opacity = (1 - localT) * 0.7;
    });
  });

  return (
    <group>
      {/* board */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh receiveShadow castShadow>
          <extrudeGeometry args={[boardShape, { depth: 0.035, bevelEnabled: false }]} />
          <meshStandardMaterial attach="material-0" {...MAT.green} side={THREE.DoubleSide} />
          <meshStandardMaterial attach="material-1" map={texture} roughness={0.55} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* U3: shielded GNSS module can */}
      <mesh position={P(0, 0.32, 0.03)} castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.06, 0.5]} />
        <meshStandardMaterial {...MAT.module} />
      </mesh>
      <mesh position={P(0, 0.32, 0.061)}>
        <boxGeometry args={[0.6, 0.001, 0.42]} />
        <meshStandardMaterial {...MAT.moduleTop} />
      </mesh>

      {/* resistor field */}
      {Array.from({ length: 8 }, (_, i) => {
        const u = 0.42 + (i % 4) * 0.06;
        const v = 0.32 - Math.floor(i / 4) * 0.09;
        return (
          <mesh key={i} position={P(u, v, 0.019)} castShadow>
            <boxGeometry args={[0.035, 0.008, 0.02]} />
            <meshStandardMaterial {...MAT.chip} />
          </mesh>
        );
      })}

      {/* status LEDs */}
      {(["PWR", "PPS", "RTK", "FENCE"] as const).map((name, i) => {
        const pos = P(0.5, 0.1 - i * 0.12, 0.024);
        const isPps = name === "PPS";
        const isRtk = name === "RTK";
        return (
          <mesh key={name} position={pos}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial
              ref={isPps ? ppsRef : isRtk ? rtkRef : undefined}
              color={LED_COLORS[name]}
              emissive={LED_COLORS[name]}
              emissiveIntensity={name === "PWR" ? (running ? 1 : 0.1) : 0.1}
              roughness={0.35}
            />
          </mesh>
        );
      })}

      {/* coin-cell battery holder */}
      <mesh position={P(0.58, -0.5, 0.025)} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.014, 20]} />
        <meshStandardMaterial {...MAT.battery} />
      </mesh>

      {/* DSEL jumper */}
      <mesh position={P(0.02, 0.02, 0.028)} castShadow>
        <boxGeometry args={[0.03, 0.018, 0.05]} />
        <meshStandardMaterial {...MAT.jumper} />
      </mesh>

      {/* headers */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`j7-${i}`} position={P(-0.32 + i * 0.08, 0.78, 0.028)}>
          <cylinderGeometry args={[0.006, 0.006, 0.03, 6]} />
          <meshStandardMaterial {...MAT.pin} />
        </mesh>
      ))}
      <mesh position={P(-0.32 + 4 * 0.08 * 0.5, 0.78, 0.013)} castShadow>
        <boxGeometry args={[0.72, 0.014, 0.03]} />
        <meshStandardMaterial {...MAT.header} />
      </mesh>

      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`j3-${i}`} position={P(-0.36 + i * 0.08, -0.78, 0.028)}>
          <cylinderGeometry args={[0.006, 0.006, 0.03, 6]} />
          <meshStandardMaterial {...MAT.pin} />
        </mesh>
      ))}
      <mesh position={P(-0.36 + 4.5 * 0.08 - 0.04, -0.78, 0.013)} castShadow>
        <boxGeometry args={[0.8, 0.014, 0.03]} />
        <meshStandardMaterial {...MAT.header} />
      </mesh>

      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`j1-${i}`} position={P(-0.6, -0.1 - i * 0.09, 0.028)}>
          <cylinderGeometry args={[0.006, 0.006, 0.03, 6]} />
          <meshStandardMaterial {...MAT.pin} />
        </mesh>
      ))}
      <mesh position={P(-0.6, -0.1 - 2.5 * 0.09, 0.013)} castShadow>
        <boxGeometry args={[0.03, 0.014, 0.5]} />
        <meshStandardMaterial {...MAT.header} />
      </mesh>

      {/* orbiting satellites: a decorative signal-reception cue, not to
          scale or to any real orbital geometry */}
      {SATELLITES.map((s, i) => (
        <mesh key={i} ref={satRefs[i]} position={[s.radius, s.height, 0]} visible={running}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color="#4fd8e8" emissive="#4fd8e8" emissiveIntensity={1.1} roughness={0.3} />
        </mesh>
      ))}

      {/* signal waves traveling from each satellite down to the receiver */}
      {SATELLITES.map((_, i) => (
        <mesh key={`wave-${i}`} ref={waveRefs[i]} visible={false}>
          <torusGeometry args={[0.045, 0.004, 8, 20]} />
          <meshStandardMaterial
            ref={waveMatRefs[i]}
            color="#4fd8e8"
            emissive="#4fd8e8"
            emissiveIntensity={1.2}
            roughness={0.3}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
}
