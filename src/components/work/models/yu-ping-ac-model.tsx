"use client";

/**
 * Conceptual model for the Kaohsiung electrical-design work: a wall-mounted
 * AC unit with conduit runs down to a panelboard — illustrative, not a
 * literal rendering of a specific real installation.
 */
const MAT = {
  wall: { color: "#1c1f22", roughness: 0.8, metalness: 0.05 },
  acBody: { color: "#d8dbd6", roughness: 0.5, metalness: 0.12 },
  acShell: { color: "#c3c7c2", roughness: 0.4, metalness: 0.15 },
  grille: { color: "#a7aca8", roughness: 0.4, metalness: 0.2 },
  vent: { color: "#8b918c", roughness: 0.45, metalness: 0.15 },
  panel: { color: "#26292c", roughness: 0.6, metalness: 0.2 },
  panelDoor: { color: "#2f3336", roughness: 0.4, metalness: 0.35 },
  breakerOn: { color: "#9aa39c", roughness: 0.4, metalness: 0.2 },
  breakerOff: { color: "#4a4f4c", roughness: 0.5, metalness: 0.2 },
  conduit: { color: "#3a3e42", roughness: 0.45, metalness: 0.3 },
  fitting: { color: "#4a4f54", roughness: 0.4, metalness: 0.4 },
  outlet: { color: "#e2e4de", roughness: 0.5, metalness: 0.05 },
  bracket: { color: "#5a5f62", roughness: 0.35, metalness: 0.45 },
} as const;

type ModelProps = { active: boolean; reducedMotion: boolean };

export function YuPingAcModel({ active, reducedMotion }: ModelProps) {
  const ledOn = active && !reducedMotion;

  return (
    <group position={[0, -0.15, 0]}>
      {/* wall */}
      <mesh position={[0, 0.3, -0.35]} receiveShadow>
        <boxGeometry args={[3.2, 2.4, 0.06]} />
        <meshStandardMaterial {...MAT.wall} />
      </mesh>

      {/* AC unit body — layered shell so it reads as a molded enclosure, not a slab */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.42, 0.3]} />
        <meshStandardMaterial {...MAT.acBody} />
      </mesh>
      <mesh position={[0, 0.65, 0.16]} castShadow>
        <boxGeometry args={[1.5, 0.34, 0.03]} />
        <meshStandardMaterial {...MAT.acShell} />
      </mesh>
      {/* top intake vent + end caps for a less slab-like silhouette */}
      <mesh position={[0, 0.865, 0]} castShadow>
        <boxGeometry args={[1.55, 0.02, 0.28]} />
        <meshStandardMaterial {...MAT.vent} />
      </mesh>
      {[-0.79, 0.79].map((x) => (
        <mesh key={x} position={[x, 0.65, 0]} castShadow>
          <boxGeometry args={[0.02, 0.4, 0.28]} />
          <meshStandardMaterial {...MAT.acShell} />
        </mesh>
      ))}

      {/* front grille slats — alternating depth so they catch light like real fins */}
      {[-0.13, -0.078, -0.026, 0.026, 0.078, 0.13].map((offset, i) => (
        <mesh key={offset} position={[0, 0.65 + offset, i % 2 === 0 ? 0.165 : 0.158]} castShadow>
          <boxGeometry args={[1.38, 0.02, 0.02]} />
          <meshStandardMaterial {...MAT.grille} />
        </mesh>
      ))}
      {/* vertical louver flap under the grille, angled like a real swing flap */}
      <mesh position={[0, 0.46, 0.14]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[1.4, 0.05, 0.015]} />
        <meshStandardMaterial {...MAT.acShell} />
      </mesh>

      {/* status LED + small IR receiver dot */}
      <mesh position={[0.7, 0.55, 0.16]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial
          color="#3ee587"
          emissive="#3ee587"
          emissiveIntensity={ledOn ? 1.2 : 0.3}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.63, 0.55, 0.165]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#111214" roughness={0.3} metalness={0.3} />
      </mesh>

      {/* wall mounting brackets under the unit */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.42, -0.08]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 0.16, 0.02]} />
          <meshStandardMaterial {...MAT.bracket} />
        </mesh>
      ))}

      {/* condensate drain line, offset from the conduit run */}
      <mesh position={[0.62, 0.05, 0.08]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.15, 10]} />
        <meshStandardMaterial {...MAT.conduit} />
      </mesh>
      <mesh position={[0.62, -0.53, 0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 10]} />
        <meshStandardMaterial {...MAT.conduit} />
      </mesh>

      {/* conduit runs down to the panel, with fittings at each bend */}
      {[-0.65, -0.55].map((x) => (
        <mesh key={x} position={[x, 0.0, 0.08]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 12]} />
          <meshStandardMaterial {...MAT.conduit} />
        </mesh>
      ))}
      {[-0.65, -0.55].map((x) => (
        <group key={`fitting-${x}`}>
          <mesh position={[x, 0.44, 0.08]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.05, 12]} />
            <meshStandardMaterial {...MAT.fitting} />
          </mesh>
          <mesh position={[x, -0.44, 0.08]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.05, 12]} />
            <meshStandardMaterial {...MAT.fitting} />
          </mesh>
        </group>
      ))}

      {/* panelboard */}
      <mesh position={[-0.6, -0.55, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.75, 0.12]} />
        <meshStandardMaterial {...MAT.panel} />
      </mesh>
      <mesh position={[-0.6, -0.55, 0.115]} castShadow>
        <boxGeometry args={[0.42, 0.65, 0.01]} />
        <meshStandardMaterial {...MAT.panelDoor} />
      </mesh>
      {/* door hinge + latch details */}
      <mesh position={[-0.6, -0.87, 0.125]}>
        <boxGeometry args={[0.06, 0.02, 0.015]} />
        <meshStandardMaterial {...MAT.bracket} />
      </mesh>
      {[0.22, 0.11, 0, -0.11, -0.22].map((y, i) => (
        <group key={y}>
          <mesh position={[-0.6, -0.55 + y, 0.13]}>
            <boxGeometry args={[0.3, 0.06, 0.015]} />
            <meshStandardMaterial {...(i % 3 === 0 ? MAT.breakerOff : MAT.breakerOn)} />
          </mesh>
          {/* toggle nub */}
          <mesh position={[-0.71, -0.55 + y, 0.14]}>
            <boxGeometry args={[0.02, 0.03, 0.01]} />
            <meshStandardMaterial color="#e8514f" roughness={0.4} metalness={0.1} />
          </mesh>
        </group>
      ))}

      {/* nearby wall outlet, flush against the wall so it doesn't read as floating */}
      <mesh position={[0.95, -0.75, -0.315]} castShadow>
        <boxGeometry args={[0.14, 0.2, 0.02]} />
        <meshStandardMaterial {...MAT.outlet} />
      </mesh>
      <mesh position={[0.91, -0.79, -0.3]}>
        <boxGeometry args={[0.02, 0.05, 0.005]} />
        <meshStandardMaterial color="#111214" roughness={0.5} />
      </mesh>
      <mesh position={[0.99, -0.79, -0.3]}>
        <boxGeometry args={[0.02, 0.05, 0.005]} />
        <meshStandardMaterial color="#111214" roughness={0.5} />
      </mesh>

      {/* floor */}
      <mesh position={[0, -0.98, 0.3]} receiveShadow>
        <boxGeometry args={[2.4, 0.05, 1.3]} />
        <meshStandardMaterial {...MAT.wall} />
      </mesh>
    </group>
  );
}
