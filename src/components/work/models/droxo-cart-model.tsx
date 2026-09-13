"use client";

/**
 * Conceptual model of the spray-flow cart: tank, wheeled frame, twin front
 * spray columns with outward-facing nozzles, a diaphragm pump, battery
 * pack, and a PCB housing for the sensor board — informed by real
 * reference photos of the cart, but simplified/illustrative, not a
 * literal CAD reproduction.
 */
const MAT = {
  tank: { color: "#e6e4da", roughness: 0.4, metalness: 0.05 },
  cap: { color: "#5a2a2a", roughness: 0.5, metalness: 0.1 },
  frame: { color: "#2a2d30", roughness: 0.5, metalness: 0.35 },
  wheel: { color: "#181a1c", roughness: 0.6, metalness: 0.15 },
  hub: { color: "#6a6f72", roughness: 0.35, metalness: 0.5 },
  pump: { color: "#1c1f22", roughness: 0.55, metalness: 0.2 },
  pcb: { color: "#0e3d24", roughness: 0.65, metalness: 0.1 },
  hose: { color: "#14171a", roughness: 0.6, metalness: 0.1 },
  boom: { color: "#33373a", roughness: 0.4, metalness: 0.4 },
  nozzle: { color: "#b8862f", roughness: 0.35, metalness: 0.6 },
} as const;

const WHEEL_POSITIONS: [number, number][] = [
  [0.62, 0.36],
  [0.62, -0.36],
  [-0.62, 0.36],
  [-0.62, -0.36],
];

const SPRAY_COLUMNS = [
  { x: -0.5, sign: -1 },
  { x: 0.5, sign: 1 },
] as const;
const SPRAY_HEIGHTS = [-0.15, 0.1, 0.35];

type ModelProps = { active: boolean; reducedMotion: boolean };

export function DroxoCartModel({ active, reducedMotion }: ModelProps) {
  const running = active && !reducedMotion;

  return (
    <group position={[0, 0.1, 0]}>
      {/* frame */}
      <mesh position={[0, -0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.06, 0.85]} />
        <meshStandardMaterial {...MAT.frame} />
      </mesh>

      {/* axles, a small realism detail under the frame */}
      {[0.36, -0.36].map((z) => (
        <mesh key={z} position={[0, -0.46, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.24, 8]} />
          <meshStandardMaterial {...MAT.hub} />
        </mesh>
      ))}

      {/* wheels, with a hub cap so they don't read as flat discs */}
      {WHEEL_POSITIONS.map(([x, z]) => (
        <group key={`${x}-${z}`}>
          <mesh position={[x, -0.46, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 20]} />
            <meshStandardMaterial {...MAT.wheel} />
          </mesh>
          <mesh position={[x + (x > 0 ? 0.042 : -0.042), -0.46, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.01, 16]} />
            <meshStandardMaterial {...MAT.hub} />
          </mesh>
        </group>
      ))}

      {/* tank */}
      <mesh position={[0.05, 0.15, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.55, 0.5]} />
        <meshStandardMaterial {...MAT.tank} />
      </mesh>
      <mesh position={[0.05, 0.45, 0.05]}>
        <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
        <meshStandardMaterial {...MAT.cap} />
      </mesh>
      {/* fill-level band + tank rib lines for surface detail */}
      <mesh position={[0.05, 0.05, 0.31]}>
        <boxGeometry args={[0.72, 0.05, 0.005]} />
        <meshStandardMaterial color="#4fd8e8" roughness={0.5} metalness={0.05} />
      </mesh>
      {[0.05, -0.05].map((yy) => (
        <mesh key={yy} position={[0.05, 0.15 + yy, 0.301]}>
          <boxGeometry args={[0.68, 0.006, 0.004]} />
          <meshStandardMaterial color="#c8c6bc" roughness={0.5} metalness={0.05} />
        </mesh>
      ))}

      {/* push-handle */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.0, -0.42]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.65, 10]} />
          <meshStandardMaterial {...MAT.frame} />
        </mesh>
      ))}
      <mesh position={[0, 0.32, -0.42]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.1, 10]} />
        <meshStandardMaterial {...MAT.frame} />
      </mesh>
      {/* control box on the handle */}
      <mesh position={[0, 0.14, -0.42]} castShadow>
        <boxGeometry args={[0.16, 0.1, 0.05]} />
        <meshStandardMaterial {...MAT.pump} />
      </mesh>
      <mesh position={[0, 0.14, -0.395]}>
        <boxGeometry args={[0.1, 0.05, 0.005]} />
        <meshStandardMaterial
          color="#3ee587"
          emissive="#3ee587"
          emissiveIntensity={running ? 0.8 : 0.1}
          roughness={0.5}
        />
      </mesh>

      {/* PCB housing: an enclosure (not a bare board) with a raised rim
          framing the window where the sensor PCB shows through */}
      <mesh position={[-0.45, -0.05, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.28, 0.32]} />
        <meshStandardMaterial {...MAT.pump} />
      </mesh>
      {/* corner screws on the enclosure lid */}
      {[
        [-0.6, 0.09, -0.24],
        [-0.3, 0.09, -0.24],
        [-0.6, 0.09, 0.04],
        [-0.3, 0.09, 0.04],
      ].map((p) => (
        <mesh key={p.join(",")} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.009, 0.009, 0.01, 8]} />
          <meshStandardMaterial {...MAT.hub} />
        </mesh>
      ))}
      <mesh position={[-0.45, 0.1, 0.07]}>
        <boxGeometry args={[0.22, 0.02, 0.16]} />
        <meshStandardMaterial {...MAT.pcb} emissive="#4fd8e8" emissiveIntensity={running ? 0.3 : 0} />
      </mesh>
      {/* raised rim framing the PCB window */}
      <mesh position={[-0.45, 0.1, -0.02]}>
        <boxGeometry args={[0.24, 0.018, 0.012]} />
        <meshStandardMaterial {...MAT.hub} />
      </mesh>
      <mesh position={[-0.45, 0.1, 0.16]}>
        <boxGeometry args={[0.24, 0.018, 0.012]} />
        <meshStandardMaterial {...MAT.hub} />
      </mesh>
      <mesh position={[-0.57, 0.1, 0.07]}>
        <boxGeometry args={[0.012, 0.018, 0.18]} />
        <meshStandardMaterial {...MAT.hub} />
      </mesh>
      <mesh position={[-0.33, 0.1, 0.07]}>
        <boxGeometry args={[0.012, 0.018, 0.18]} />
        <meshStandardMaterial {...MAT.hub} />
      </mesh>
      {[-0.5, -0.4].map((x, i) => (
        <mesh key={x} position={[x, 0.115, 0.02 + i * 0.06]}>
          <boxGeometry args={[0.03, 0.02, 0.03]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#3ee587" : "#4fd8e8"}
            emissive={i % 2 === 0 ? "#3ee587" : "#4fd8e8"}
            emissiveIntensity={running ? 0.6 : 0.15}
          />
        </mesh>
      ))}

      {/* diaphragm pump, mounted rear-center between the tank and the
          electronics enclosure */}
      <mesh position={[-0.05, -0.18, -0.28]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.16, 16]} />
        <meshStandardMaterial {...MAT.pump} />
      </mesh>
      {/* diaphragm head, facing the tank */}
      <mesh position={[-0.05, -0.18, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.06, 16]} />
        <meshStandardMaterial {...MAT.hub} />
      </mesh>
      {/* inlet / outlet ports on the diaphragm head */}
      {[-0.03, 0.03].map((dx) => (
        <mesh key={dx} position={[-0.05 + dx, -0.14, -0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
          <meshStandardMaterial {...MAT.hose} />
        </mesh>
      ))}
      {/* motor cap on the rear */}
      <mesh position={[-0.05, -0.18, -0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
        <meshStandardMaterial {...MAT.hub} />
      </mesh>

      {/* battery pack, rear-right, opposite the electronics enclosure */}
      <mesh position={[0.42, -0.16, -0.32]} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.16, 0.14]} />
        <meshStandardMaterial color="#0e1012" roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0.42, -0.09, -0.32]}>
        <boxGeometry args={[0.2, 0.015, 0.1]} />
        <meshStandardMaterial color="#3a3e42" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0.42, -0.16, -0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
        <meshStandardMaterial {...MAT.hub} />
      </mesh>
      <mesh position={[0.51, -0.12, -0.28]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial
          color="#3ee587"
          emissive="#3ee587"
          emissiveIntensity={running ? 1 : 0.2}
          roughness={0.4}
        />
      </mesh>

      {/* inlet hose from tank to the diaphragm pump */}
      <mesh position={[-0.22, 0.02, -0.03]} rotation={[0, 0, 1.0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.42, 10]} />
        <meshStandardMaterial {...MAT.hose} />
      </mesh>
      <mesh position={[-0.02, -0.11, -0.22]} rotation={[0.6, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.22, 8]} />
        <meshStandardMaterial {...MAT.hose} />
      </mesh>

      {/* front spray columns: two vertical wands at the front corners, each
          with nozzle heads that spray outward (away from the cart
          centerline), not downward at the ground */}
      {SPRAY_COLUMNS.map(({ x, sign }) => (
        <group key={x}>
          {/* vertical column */}
          <mesh position={[x, 0.1, 0.44]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 10]} />
            <meshStandardMaterial {...MAT.boom} />
          </mesh>
          {/* feed hose from the pump area up to the column base */}
          <mesh position={[x * 0.6, -0.15, 0.2]} rotation={[0.9, 0, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.55, 8]} />
            <meshStandardMaterial {...MAT.hose} />
          </mesh>

          {SPRAY_HEIGHTS.map((y) => (
            <group key={y}>
              {/* nozzle arm sticking outward from the column */}
              <mesh
                position={[x + sign * 0.05, y, 0.44]}
                rotation={[0, 0, -sign * (Math.PI / 2)]}
                castShadow
              >
                <cylinderGeometry args={[0.009, 0.012, 0.1, 8]} />
                <meshStandardMaterial {...MAT.nozzle} />
              </mesh>
              {/* nozzle tip cap */}
              <mesh position={[x + sign * 0.1, y, 0.44]}>
                <sphereGeometry args={[0.014, 8, 8]} />
                <meshStandardMaterial {...MAT.nozzle} />
              </mesh>
              {/* fan-shaped mist, only implied while "running" — narrow at the
                  nozzle, widening outward, so the cone's apex faces inward */}
              <mesh position={[x + sign * 0.16, y, 0.44]} rotation={[0, 0, sign * (Math.PI / 2)]}>
                <coneGeometry args={[0.09, 0.14, 12, 1, false, 0, Math.PI]} />
                <meshStandardMaterial
                  color="#4fd8e8"
                  transparent
                  opacity={running ? 0.14 : 0}
                  roughness={1}
                  depthWrite={false}
                  side={2}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
