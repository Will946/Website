// The taiko drum (where the claw machine stood). A barrel drum on its stand under a frame with a red
// paper lantern. Click the drum's head (or press Enter): the bachi come down on it, DON, the head
// ripples, and a Daruma doll jumps out of the drum, a real body (Rapier) weighted at the bottom, so it
// tumbles across the floor and rocks itself upright. Hit the rim for a KA. Up to ten dolls stay out.
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { BallCollider, CuboidCollider, CylinderCollider, RigidBody, type CollisionEnterPayload, type RapierRigidBody } from '@react-three/rapier';
import { don, ka, thud } from '../gacha/sound';
import { SPOT } from '../arcade/layout';
import { sparkle } from '../arcade/Sparkles';
import { arcade, wantShot } from '../arcade/store';
import { rig } from '../arcade/CameraRig';
import { onImpact } from '../arcade/intro';
import { dojo } from './materials';
import { PHONE } from '../arcade/device';
import { darumaArt, drumHead, lanternArt } from './art';

const OX = SPOT.claw.x;
const DRUM = { y: 1.0, r: 0.355, belly: 0.41, half: 0.26 };   // centre height, head radius, widest radius, half length
const HEAD_Z = DRUM.half + 0.002;
const MAX_DOLLS = PHONE ? 4 : 10;   // fewer bodies for a phone's CPU
const DOLL_R = 0.055;
const STRIKE = 0.22;   // seconds, a full stroke

const MAT = { z0: 0.4, z1: 0.92, x: 0.5, top: 0.1, rim: 0.06 };   // the tatami platform the dolls land on

export default function Taiko() {
  const { camera, gl } = useThree();
  const m = dojo();
  // A fixed pool of doll bodies, made with the scene and switched on as they are thrown (bodies must not
  // be added or removed while the physics runs; Drop.tsx needs them all there at mount).
  const bodies = useRef<(RapierRigidBody | null)[]>([]);
  const dollMeshes = useRef<(THREE.Object3D | null)[]>([]);
  const order = useRef<number[]>(Array(MAX_DOLLS).fill(0));
  const drum = useRef<THREE.Group>(null), head = useRef<THREE.Mesh>(null), shell = useRef<THREE.Mesh>(null);
  const ripple = useRef<THREE.Mesh>(null);
  const sticks = useRef<(THREE.Group | null)[]>([]);
  const s = useRef({ t: 0, next: 1, side: 0, strike: [-1, -1], ready: 0, shudder: 0, rippleAt: -9, hover: '' });

  const geo = useMemo(() => {
    const prof: THREE.Vector2[] = [];
    for (let k = 0; k <= 16; k++) { const u = k / 16, y = -DRUM.half + u * 2 * DRUM.half; prof.push(new THREE.Vector2(DRUM.r + (DRUM.belly - DRUM.r) * Math.sin(Math.PI * u), y)); }
    const tack = new THREE.SphereGeometry(0.008, 8, 6);
    const lanternProf: THREE.Vector2[] = [];
    for (let k = 0; k <= 12; k++) { const u = k / 12; lanternProf.push(new THREE.Vector2(0.06 + 0.055 * Math.sin(Math.PI * u), -0.12 + u * 0.24)); }
    return {
      shell: new THREE.LatheGeometry(prof, 48).rotateX(Math.PI / 2),
      head: new THREE.CircleGeometry(DRUM.r - 0.004, 48),
      rim: new THREE.TorusGeometry(DRUM.r, 0.012, 8, 48),
      tack,
      handle: new THREE.TorusGeometry(0.05, 0.009, 8, 24).rotateY(Math.PI / 2),
      ring: new THREE.RingGeometry(0.9, 1, 48),
      bachi: new THREE.CylinderGeometry(0.0115, 0.0145, 0.4, 12).translate(0, 0.2, 0),
      lantern: new THREE.LatheGeometry(lanternProf, 32),
      doll: new THREE.SphereGeometry(DOLL_R, 28, 20),
    };
  }, []);
  const mats = useMemo(() => {
    const lantern = lanternArt();
    return {
      head: new THREE.MeshStandardMaterial({ map: drumHead(), roughness: 0.78 }),
      ripple: new THREE.MeshBasicMaterial({ color: '#FFF4D6', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      lantern: new THREE.MeshStandardMaterial({ map: lantern, emissive: '#FF6A3A', emissiveMap: lantern, emissiveIntensity: 0.45, roughness: 0.85, side: THREE.DoubleSide }),
      doll: new THREE.MeshPhysicalMaterial({ map: darumaArt(), roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
    };
  }, []);
  const tacks = useMemo(() => {
    const out: [number, number, number][] = [];
    for (const z of [-DRUM.half + 0.02, DRUM.half - 0.02]) for (let k = 0; k < 36; k++) { const a = (k / 36) * Math.PI * 2; out.push([Math.cos(a) * (DRUM.r + 0.012), Math.sin(a) * (DRUM.r + 0.012), z]); }
    return out;
  }, []);

  // The sticks: where each rests when nobody is playing, the raised ready pose, and the stroke.
  const poses = useMemo(() => [-1, 1].map((side) => {
    const pivot = new THREE.Vector3(OX + side * 0.2, DRUM.y + 0.36, 0.66);
    const hit = new THREE.Vector3(OX + side * 0.07, DRUM.y + 0.04, HEAD_Z);
    const dir = hit.clone().sub(pivot).normalize();
    const qHit = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.multiplyScalar(1));
    const side3 = new THREE.Vector3(1, 0, 0);
    const qReady = new THREE.Quaternion().setFromAxisAngle(side3, 1.0).multiply(qHit);
    const restP = new THREE.Vector3(OX + side * 0.04, MAT.top + MAT.rim + 0.012, MAT.z1 - 0.02);
    const qRest = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(side, 0, 0));
    return { pivot, qHit, qReady, restP, qRest };
  }), []);

  // ---------- actions ----------
  const strike = (rim = false) => {
    const st = s.current;
    const k = st.side; st.side = 1 - st.side;
    st.strike[k] = st.t;
    setTimeout(() => {
      if (rim) { ka(); st.shudder = 0.3; return; }
      don();
      st.shudder = 1; st.rippleAt = s.current.t;
      sparkle.burst({ x: OX, y: DRUM.y + 0.05, z: HEAD_Z + 0.04 }, 18, 0.35);
      const r = () => Math.random() - 0.5;
      const slot = order.current.indexOf(Math.min(...order.current)), b = bodies.current[slot];
      if (!b) return;
      if (order.current[slot]) sparkle.burst(b.translation(), 12, 0.2);   // the oldest one vanishes for the new one
      order.current[slot] = st.next++;
      b.setEnabled(true);
      b.setTranslation({ x: OX, y: DRUM.y + 0.05, z: HEAD_Z + DOLL_R + 0.02 }, true);
      b.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      b.setLinvel({ x: r() * 0.9, y: 1.5 + Math.random() * 0.4, z: 0.12 + Math.random() * 0.22 }, true);
      b.setAngvel({ x: r() * 8, y: r() * 8, z: r() * 8 }, true);
      const mesh = dollMeshes.current[slot];
      if (mesh) mesh.visible = true;
    }, STRIKE * 0.35 * 1000);
  };
  useEffect(() => onImpact(({ machine }) => { if (machine === 'claw') s.current.shudder = 0.8; }), []);
  useEffect(() => { bodies.current.forEach((b) => b?.setEnabled(false)); }, []);
  const onHit = (slot: number) => (p: CollisionEnterPayload) => {
    const v = bodies.current[slot]?.linvel();
    const speed = v ? Math.hypot(v.x, v.y, v.z) : 0;
    if (speed > 0.6) thud(speed / 4);
    void p;
  };

  // ---------- input ----------
  useEffect(() => {
    const el = gl.domElement.parentElement ?? gl.domElement;
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const hit = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const targets = [head.current, shell.current].filter(Boolean) as THREE.Object3D[];
      const h = ray.intersectObjects(targets, false)[0];
      if (!h) return '';
      return h.object === head.current ? 'head' : 'rim';
    };
    const down = (e: PointerEvent) => {
      if (arcade.get().focus !== 'claw' || rig.gliding) return;
      const h = hit(e);
      if (!h) return;
      e.stopPropagation(); e.preventDefault();
      strike(h === 'rim');
    };
    const move = (e: PointerEvent) => {
      if (arcade.get().focus !== 'claw' || e.buttons) { s.current.hover = ''; return; }
      const h = hit(e);
      s.current.hover = h;
      el.style.cursor = h ? 'pointer' : 'grab';
    };
    const key = (e: KeyboardEvent) => {
      if (arcade.get().focus !== 'claw' || e.metaKey || e.ctrlKey) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); strike(false); }
      else if (e.key.toLowerCase() === 'k') strike(true);
    };
    el.addEventListener('pointerdown', down, { capture: true });
    window.addEventListener('pointermove', move);
    window.addEventListener('keydown', key);
    return () => {
      el.removeEventListener('pointerdown', down, { capture: true });
      window.removeEventListener('pointermove', move);
      window.removeEventListener('keydown', key);
    };
  }, [camera, gl]);

  // ---------- each frame ----------
  const q = useMemo(() => new THREE.Quaternion(), []);
  const fwd = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 30), st = s.current;
    st.t += dt;
    if (import.meta.env.DEV) (window as unknown as { __taiko: unknown }).__taiko = { dolls: order.current.filter(Boolean).length, bodies: bodies.current.filter((b, i) => b && order.current[i]).map((b) => { const p = b!.translation(); return [+(p.x - OX).toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)]; }), strike: st.strike };
    const focused = arcade.get().focus === 'claw';
    if (focused) wantShot('claw', 'main');
    st.ready += ((focused ? 1 : 0) - st.ready) * (1 - Math.exp(-6 * dt));

    // The bachi: from resting on the ledge up to the ready pose, and the stroke down onto the head.
    sticks.current.forEach((g, k) => {
      if (!g) return;
      const p = poses[k], since = st.t - st.strike[k];
      let down = 0;
      if (st.strike[k] >= 0 && since < STRIKE) {
        const u = since / STRIKE;
        down = u < 0.35 ? (u / 0.35) ** 2 : 1 - (1 - (1 - (u - 0.35) / 0.65) ** 3);
      }
      q.copy(p.qReady).slerp(p.qHit, down);
      const hover = st.hover === 'head' ? 0.06 * (0.5 + 0.5 * Math.sin(st.t * 5 + k * 2)) : 0;
      if (hover) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -hover));
      g.position.lerpVectors(p.restP, p.pivot, st.ready);
      g.quaternion.copy(p.qRest).slerp(q, st.ready);
    });

    // A doll that has come to rest turns, slowly, to show its face (front is +z) to the visitor.
    bodies.current.forEach((b, i) => {
      if (!b || !order.current[i]) return;
      const v = b.linvel(), w = b.angvel();
      if (Math.hypot(v.x, v.y, v.z) > 0.08) return;
      const r = b.rotation();
      fwd.set(0, 0, 1).applyQuaternion(q.set(r.x, r.y, r.z, r.w));
      const yaw = Math.atan2(fwd.x, fwd.z) - 0.2;   // a little toward the camera, which stands to the right
      const turn = Math.atan2(Math.sin(yaw), Math.cos(yaw));
      if (Math.abs(turn) > 0.06) b.setAngvel({ x: w.x, y: THREE.MathUtils.clamp(-turn * 2.5, -2, 2), z: w.z }, true);
    });

    // The drum shudders on its stand; a ring runs out across the head.
    st.shudder *= Math.exp(-7 * dt);
    if (drum.current) {
      drum.current.position.set(OX, DRUM.y, 0);
      drum.current.position.z = -0.006 * st.shudder * Math.sin(st.t * 60);
      drum.current.rotation.x = 0.004 * st.shudder * Math.sin(st.t * 47);
    }
    const since = st.t - st.rippleAt;
    if (ripple.current) {
      const k = since / 0.45;
      ripple.current.visible = k < 1;
      ripple.current.scale.setScalar(0.04 + (DRUM.r - 0.04) * Math.min(1, k));
      mats.ripple.opacity = 0.55 * Math.max(0, 1 - k);
    }
    mats.lantern.emissiveIntensity = 0.45 + 0.5 * Math.max(0, 1 - since / 0.3);
  });

  return (
    <group>
      <group position={[OX, 0, 0]}>
        {/* the stand: runners on the floor, two posts holding the drum by its rings */}
        {[-0.45, 0.45].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.04, 0]} material={m.darkWood} castShadow receiveShadow><boxGeometry args={[0.08, 0.08, 0.72]} /></mesh>
            <mesh position={[0, 0.56, 0]} material={m.darkWood} castShadow><boxGeometry args={[0.07, 1.04, 0.08]} /></mesh>
            <mesh position={[0, 0.3, 0.16]} rotation-x={-0.5} material={m.darkWood}><boxGeometry args={[0.05, 0.5, 0.05]} /></mesh>
            <mesh position={[0, 0.3, -0.16]} rotation-x={0.5} material={m.darkWood}><boxGeometry args={[0.05, 0.5, 0.05]} /></mesh>
            <mesh position={[0, DRUM.y, 0]} rotation-z={Math.PI / 2} material={m.brass}><cylinderGeometry args={[0.03, 0.03, 0.09, 16]} /></mesh>
          </group>
        ))}
        <mesh position={[0, 0.26, -0.03]} material={m.darkWood} castShadow><boxGeometry args={[0.9, 0.06, 0.06]} /></mesh>
        {/* the tatami platform in front, where the dolls land (the sticks rest on its front rim) */}
        <mesh position={[0, MAT.top / 2, (MAT.z0 + MAT.z1) / 2]} material={m.darkWood} castShadow receiveShadow><boxGeometry args={[MAT.x * 2, MAT.top, MAT.z1 - MAT.z0]} /></mesh>
        <mesh position={[0, MAT.top + 0.004, (MAT.z0 + MAT.z1) / 2]} receiveShadow><boxGeometry args={[MAT.x * 2 - 0.08, 0.008, MAT.z1 - MAT.z0 - 0.08]} /><meshStandardMaterial color="#C9C07A" roughness={0.9} /></mesh>
        {[[0, MAT.z1 - 0.02, MAT.x * 2, 0.04], [0, MAT.z0 + 0.02, MAT.x * 2, 0.04], [MAT.x - 0.02, (MAT.z0 + MAT.z1) / 2, 0.04, MAT.z1 - MAT.z0], [-MAT.x + 0.02, (MAT.z0 + MAT.z1) / 2, 0.04, MAT.z1 - MAT.z0]].map(([x, z, w, d]) => (
          <mesh key={`${x}${z}`} position={[x, MAT.top + MAT.rim / 2, z]} material={m.lacquerRed} castShadow receiveShadow><boxGeometry args={[w, MAT.rim, d]} /></mesh>
        ))}

        {/* the frame over it, and the lantern */}
        {[-0.48, 0.48].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.92, -0.36]} material={m.lacquerBlack} castShadow><boxGeometry args={[0.07, 1.84, 0.07]} /></mesh>
            <mesh position={[x, 0.05, -0.36]} material={m.lacquerBlack}><boxGeometry args={[0.12, 0.1, 0.12]} /></mesh>
          </group>
        ))}
        <mesh position={[0, 1.83, -0.36]} material={m.lacquerBlack} castShadow><boxGeometry args={[1.1, 0.07, 0.09]} /></mesh>
        <mesh position={[0, 1.74, -0.36]} material={m.lacquerRed} castShadow><boxGeometry args={[0.96, 0.05, 0.06]} /></mesh>
        <mesh position={[0, 1.83, -0.17]} material={m.lacquerBlack} castShadow><boxGeometry args={[0.06, 0.05, 0.38]} /></mesh>
        <mesh position={[0, 1.755, 0]} material={m.iron}><cylinderGeometry args={[0.004, 0.004, 0.1, 6]} /></mesh>
        <group position={[0, 1.59, 0]}>
          <mesh geometry={geo.lantern} material={mats.lantern} castShadow />
          <mesh position={[0, 0.128, 0]} material={m.lacquerBlack}><cylinderGeometry args={[0.065, 0.065, 0.022, 24]} /></mesh>
          <mesh position={[0, -0.128, 0]} material={m.lacquerBlack}><cylinderGeometry args={[0.065, 0.065, 0.022, 24]} /></mesh>
          {[0.2, 0.0, -0.2].map((x) => <mesh key={x} position={[x * 0.25, -0.18, 0]} material={m.straw}><cylinderGeometry args={[0.003, 0.003, 0.08, 4]} /></mesh>)}
        </group>
      </group>

      {/* the drum */}
      <group ref={drum} position={[OX, DRUM.y, 0]}>
        <mesh ref={shell} geometry={geo.shell} material={m.keyaki} castShadow receiveShadow />
        <mesh ref={head} geometry={geo.head} material={mats.head} position={[0, 0, HEAD_Z]} />
        <mesh geometry={geo.head} material={mats.head} position={[0, 0, -HEAD_Z]} rotation-y={Math.PI} />
        <mesh ref={ripple} geometry={geo.ring} material={mats.ripple} position={[0, 0, HEAD_Z + 0.003]} visible={false} />
        <mesh geometry={geo.rim} material={m.lacquerBlack} position={[0, 0, DRUM.half - 0.004]} />
        <mesh geometry={geo.rim} material={m.lacquerBlack} position={[0, 0, -DRUM.half + 0.004]} />
        {tacks.map((p, i) => <mesh key={i} geometry={geo.tack} material={m.brass} position={p} />)}
        {[-1, 1].map((side) => <mesh key={side} geometry={geo.handle} material={m.brass} position={[side * (DRUM.belly - 0.005), 0, 0]} />)}
      </group>

      {/* the bachi */}
      {[0, 1].map((k) => (
        <group key={k} ref={(g) => { sticks.current[k] = g; }} position={poses[k].restP} quaternion={poses[k].qRest}>
          <mesh geometry={geo.bachi} material={m.hinoki} castShadow />
        </group>
      ))}

      {/* physics: the floor in front, low walls round it, the drum and its stand */}
      <RigidBody type="fixed" colliders={false} position={[OX, 0, 0]}>
        <CuboidCollider args={[0.95, 0.05, 0.85]} position={[0, -0.05, 0.35]} />
        <CuboidCollider args={[MAT.x, MAT.top / 2, (MAT.z1 - MAT.z0) / 2]} position={[0, MAT.top / 2, (MAT.z0 + MAT.z1) / 2]} />
        {/* the rim, and a little higher than it looks, so a lively doll stays on the mat */}
        <CuboidCollider args={[MAT.x, 0.2, 0.02]} position={[0, MAT.top + 0.2, MAT.z1 - 0.02]} />
        <CuboidCollider args={[MAT.x, 0.2, 0.02]} position={[0, MAT.top + 0.2, MAT.z0 + 0.02]} />
        <CuboidCollider args={[0.02, 0.2, (MAT.z1 - MAT.z0) / 2]} position={[MAT.x - 0.02, MAT.top + 0.2, (MAT.z0 + MAT.z1) / 2]} />
        <CuboidCollider args={[0.02, 0.2, (MAT.z1 - MAT.z0) / 2]} position={[-MAT.x + 0.02, MAT.top + 0.2, (MAT.z0 + MAT.z1) / 2]} />
        <CuboidCollider args={[0.95, 0.4, 0.02]} position={[0, 0.4, 1.2]} />
        <CuboidCollider args={[0.02, 0.4, 0.85]} position={[-0.95, 0.4, 0.35]} />
        <CuboidCollider args={[0.02, 0.4, 0.85]} position={[0.95, 0.4, 0.35]} />
        <CuboidCollider args={[0.95, 0.9, 0.02]} position={[0, 0.9, -0.42]} />
        <CylinderCollider args={[DRUM.half, DRUM.belly - 0.01]} position={[0, DRUM.y, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <CuboidCollider args={[0.04, 0.52, 0.04]} position={[-0.45, 0.52, 0]} />
        <CuboidCollider args={[0.04, 0.52, 0.04]} position={[0.45, 0.52, 0]} />
        <CuboidCollider args={[0.04, 0.04, 0.36]} position={[-0.45, 0.04, 0]} />
        <CuboidCollider args={[0.04, 0.04, 0.36]} position={[0.45, 0.04, 0]} />
      </RigidBody>
      {Array.from({ length: MAX_DOLLS }, (_, i) => (
        <RigidBody
          key={i}
          ref={(r) => { bodies.current[i] = r; }}
          colliders={false}
          position={[OX - 0.3 + i * 0.06, MAT.top + 0.1, (MAT.z0 + MAT.z1) / 2]}
          angularDamping={0.8}
          linearDamping={0.05}
          ccd
          onCollisionEnter={onHit(i)}
        >
          {/* light round body, heavy base: it always rocks back upright */}
          <BallCollider args={[DOLL_R]} density={0.4} friction={0.7} restitution={0.35} />
          <BallCollider args={[DOLL_R * 0.45]} position={[0, -DOLL_R * 0.5, 0]} density={12} />
          <group visible={false} ref={(o) => { dollMeshes.current[i] = o; }}>
            <mesh geometry={geo.doll} material={mats.doll} scale={[1, 1.06, 1]} castShadow />
          </group>
        </RigidBody>
      ))}
    </group>
  );
}
