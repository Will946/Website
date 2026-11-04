// The omikuji stand (where the gacha machine stood, and it deals the same thing: a project each).
// A shrine table under a little torii: a hexagonal box of numbered bamboo sticks, a tray, a bell.
// Click the box (or press Enter): it is lifted, turned over and shaken, and one stick slides out of
// the hole and drops into the tray, a real body (Rapier) that bounces and settles. Click the stick: it
// comes up to the visitor. Click it again and its fortune slip unfolds beside it (the project, with
// a fortune from its rarity: 大吉 for the legendary ones). Once more, or Put it back, and it goes home
// into the box. The bell rope rings the bell.
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CuboidCollider, RigidBody, type CollisionEnterPayload, type RapierRigidBody } from '@react-three/rapier';
import { PROJECTS } from '../data/projects';
import { jingle, rattle, suzu, tick } from '../gacha/sound';
import { gacha } from '../gacha/store';
import { SPOT } from '../arcade/layout';
import { sparkle } from '../arcade/Sparkles';
import { arcade, wantShot } from '../arcade/store';
import { rig } from '../arcade/CameraRig';
import { onImpact } from '../arcade/intro';
import { bezier, clamp01, easeInOut, easeOut, easeOutBack, holdPoint } from '../arcade/present';
import { dojo } from './materials';
import { fortuneSlip, omikujiSign } from './art';

const OX = SPOT.gacha.x;
const TABLE_Y = 0.8;                                     // the table top
const BOX = { r: 0.085, h: 0.34, x: -0.17, z: -0.06 };   // the hexagonal box, at rest
const TRAY = { x: 0.12, z: 0.08, w: 0.3, d: 0.22, floor: TABLE_Y + 0.03, wall: 0.045 };
const STICK = { w: 0.01, l: 0.17 };
const MAX_STICKS = 5;
const OVER = new THREE.Vector3(OX + TRAY.x, TABLE_Y + 0.4, TRAY.z);   // the box's middle while it is shaken over the tray
const HOLD = { distance: 0.6, right: -0.05, down: 0.0 };

// A fixed pool of stick bodies, made once with the scene and switched on and off: Rapier must not have
// bodies added or removed while the visitor plays, and Drop.tsx needs every body there at mount.
type Stick = { slot: number; project: number; used: boolean; order: number };
type Phase = 'rest' | 'lift' | 'shake' | 'back';
type Hand = 'none' | 'up' | 'held' | 'opening' | 'open' | 'home';

/** Projects in a shuffled order, dealt one at a time; reshuffled when they run out. */
function dealer() {
  let bag: number[] = [];
  return () => {
    if (!bag.length) bag = PROJECTS.map((_, i) => i).sort(() => Math.random() - 0.5);
    return bag.pop()!;
  };
}

export default function Omikuji() {
  const { camera, gl } = useThree();
  const m = dojo();
  const deal = useMemo(dealer, []);
  const pool = useRef<Stick[]>(Array.from({ length: MAX_STICKS }, (_, slot) => ({ slot, project: 0, used: false, order: 0 })));
  const bodies = useRef<(RapierRigidBody | null)[]>([]);
  const stickMeshes = useRef<(THREE.Object3D | null)[]>([]);
  const used = () => pool.current.filter((k) => k.used);
  const newest = () => used().sort((a, b) => b.order - a.order)[0];
  const box = useRef<THREE.Group>(null), bell = useRef<THREE.Group>(null), bellRope = useRef<THREE.Mesh>(null);
  const hand = useRef<THREE.Group>(null), slip = useRef<THREE.Mesh>(null);
  const slipMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.92, side: THREE.DoubleSide }), []);
  const sign = useMemo(() => omikujiSign(), []);
  const s = useRef({
    t: 0, phase: 'rest' as Phase, pt: 0, spawned: false, nextId: 1,
    hand: 'none' as Hand, ht: 0, heldAt: 0, holding: null as null | Stick,
    from: new THREE.Vector3(), fromQ: new THREE.Quaternion(), bellSwing: 0, settleAt: -1, hover: '',
  });
  const [v1, v2, v3, v4] = useMemo(() => Array.from({ length: 4 }, () => new THREE.Vector3()), []);
  const [q1, q2] = useMemo(() => [new THREE.Quaternion(), new THREE.Quaternion()], []);
  const e1 = useMemo(() => new THREE.Euler(), []);
  const restPos = useMemo(() => new THREE.Vector3(OX + BOX.x, TABLE_Y + BOX.h / 2, BOX.z), []);

  // ---------- actions ----------
  const shake = () => {
    const st = s.current;
    if (st.phase !== 'rest' || st.hand !== 'none') return;
    st.phase = 'lift'; st.pt = 0; st.spawned = false;
    gacha.set({ phase: 'turning' });
  };
  const spawnStick = () => {
    const st = s.current, r = () => Math.random() - 0.5;
    // a free slot, or the oldest stick in the tray goes back into the box
    const k = pool.current.find((x) => !x.used) ?? [...pool.current].sort((a, b) => a.order - b.order)[0];
    const b = bodies.current[k.slot], mesh = stickMeshes.current[k.slot];
    if (!b) return;
    if (k.used) sparkle.burst(b.translation(), 10, 0.15);
    k.used = true; k.project = deal(); k.order = st.nextId++;
    b.setEnabled(true);
    b.setTranslation({ x: OVER.x + r() * 0.01, y: OVER.y - BOX.h / 2 - STICK.l / 2 + 0.02, z: OVER.z }, true);
    b.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 0.2, 0, Math.PI + r() * 0.2)), true);
    b.setLinvel({ x: 0, y: -0.5, z: 0 }, true);
    b.setAngvel({ x: r() * 2, y: 0, z: r() * 2 }, true);
    if (mesh) mesh.visible = true;
    st.settleAt = -1;
    gacha.set({ phase: 'dispensing' });
  };
  const pickUp = (slot: number) => {
    const st = s.current, b = bodies.current[slot], g = hand.current;
    const stick = pool.current[slot];
    if (!b || !g || !stick?.used || st.hand !== 'none' || st.phase !== 'rest') return;
    const p = b.translation(), q = b.rotation();
    st.from.set(p.x, p.y, p.z); st.fromQ.set(q.x, q.y, q.z, q.w);
    st.holding = stick; st.hand = 'up'; st.ht = 0;
    g.position.copy(st.from); g.quaternion.copy(st.fromQ); g.visible = true;
    if (slip.current) slip.current.scale.set(0.001, 1, 1);
    slipMat.map?.dispose();
    slipMat.map = fortuneSlip(stick.project + 1, PROJECTS[stick.project].rarity, PROJECTS[stick.project].title);
    slipMat.needsUpdate = true;
    stick.used = false;
    b.setEnabled(false);
    const mesh = stickMeshes.current[slot];
    if (mesh) mesh.visible = false;
    tick(0.5);
    gacha.set({ phase: 'taking' });
  };
  const open = () => {
    const st = s.current;
    if (st.hand !== 'held') return;
    st.hand = 'opening'; st.ht = 0;
    tick(0.3);
  };
  const putBack = () => {
    const st = s.current, g = hand.current;
    if ((st.hand !== 'held' && st.hand !== 'open') || !g) return;
    st.from.copy(g.position); st.fromQ.copy(g.quaternion);
    st.hand = 'home'; st.ht = 0;
    gacha.set({ phase: 'idle', held: null, opened: false });
  };
  const ring = () => { s.current.bellSwing = 1; suzu(); };
  const reset = () => {
    const st = s.current;
    if (hand.current) hand.current.visible = false;
    st.hand = 'none'; st.holding = null;
    if (gacha.get().held !== null) gacha.set({ phase: 'idle', held: null, opened: false });
  };
  useEffect(() => { gacha.actions.putBack = putBack; });
  useEffect(() => { bodies.current.forEach((b) => b?.setEnabled(false)); }, []);
  useEffect(() => arcade.subscribe(() => { if (arcade.get().focus !== 'gacha' && s.current.hand !== 'none') reset(); }), []);
  useEffect(() => onImpact(({ machine }) => {
    if (machine !== 'gacha') return;
    s.current.bellSwing = 0.8;
    used().forEach((k) => bodies.current[k.slot]?.applyImpulse({ x: (Math.random() - 0.5) * 0.0004, y: 0.0008, z: 0 }, true));
  }), []);

  const onHit = (slot: number) => (p: CollisionEnterPayload) => {
    const v = bodies.current[slot]?.linvel();
    const speed = v ? Math.hypot(v.x, v.y, v.z) : 0;
    if (speed > 0.15) tick(speed / 1.5);
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
      const targets: THREE.Object3D[] = stickMeshes.current.filter((o): o is THREE.Object3D => !!o && o.visible);
      if (box.current) targets.push(box.current);
      if (bell.current) targets.push(bell.current);
      if (bellRope.current) targets.push(bellRope.current);
      if (hand.current?.visible) targets.push(hand.current);
      for (const h of ray.intersectObjects(targets, true)) {
        let o: THREE.Object3D | null = h.object;
        while (o) {
          if (o.userData.stick !== undefined) return { kind: 'stick' as const, id: o.userData.stick as number };
          if (o.userData.okBox) return { kind: 'box' as const };
          if (o.userData.okBell) return { kind: 'bell' as const };
          if (o.userData.okHand) return { kind: 'hand' as const };
          o = o.parent;
        }
      }
      return null;
    };
    const down = (e: PointerEvent) => {
      if (arcade.get().focus !== 'gacha' || rig.gliding) return;
      const st = s.current, h = hit(e);
      if (st.hand === 'held' || st.hand === 'open') {
        e.stopPropagation(); e.preventDefault();
        if (st.hand === 'held') open(); else putBack();
        return;
      }
      if (!h) return;
      e.stopPropagation(); e.preventDefault();
      if (h.kind === 'box') shake();
      else if (h.kind === 'stick') pickUp(h.id);
      else if (h.kind === 'bell') ring();
    };
    const move = (e: PointerEvent) => {
      if (arcade.get().focus !== 'gacha' || e.buttons) { s.current.hover = ''; return; }
      const h = hit(e), st = s.current;
      st.hover = h?.kind ?? '';
      el.style.cursor = h || st.hand === 'held' || st.hand === 'open' ? 'pointer' : 'grab';
    };
    const key = (e: KeyboardEvent) => {
      if (arcade.get().focus !== 'gacha' || e.metaKey || e.ctrlKey) return;
      const st = s.current;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (st.hand === 'held') open();
        else if (st.hand === 'open') putBack();
        else if (st.hand === 'none') {
          const last = newest();
          if (last && gacha.get().phase === 'ready') pickUp(last.slot); else shake();
        }
      } else if (e.key === 'Escape') putBack();
    };
    el.addEventListener('pointerdown', down, { capture: true });
    window.addEventListener('pointermove', move);
    window.addEventListener('keydown', key);
    return () => {
      el.removeEventListener('pointerdown', down, { capture: true });
      window.removeEventListener('pointermove', move);
      window.removeEventListener('keydown', key);
    };
  });

  // ---------- each frame ----------
  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 30), st = s.current;
    st.t += dt;
    if (import.meta.env.DEV) (window as unknown as { __omikuji: unknown }).__omikuji = { phase: st.phase, pt: +st.pt.toFixed(2), hand: st.hand, sticks: used().length, store: gacha.get().phase, bodies: used().map((k) => { const p = bodies.current[k.slot]!.translation(); return [+(p.x - OX).toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)]; }) };
    if (arcade.get().focus === 'gacha') wantShot('gacha', 'main');

    // The box: lifted over the tray and turned over, shaken until a stick falls out, set back down.
    const b = box.current;
    if (b) {
      const DUR: Record<Phase, number> = { rest: 1, lift: 0.5, shake: 0.85, back: 0.5 };
      if (st.phase !== 'rest') st.pt = Math.min(1, st.pt + dt / DUR[st.phase]);
      const k = st.pt;
      if (st.phase === 'rest') {
        const bob = st.hover === 'box' ? 0.006 + 0.004 * Math.sin(st.t * 6) : 0;
        b.position.copy(restPos); b.position.y += bob; b.rotation.set(0, Math.PI / 6, 0);
      } else if (st.phase === 'lift' || st.phase === 'back') {
        const e = easeInOut(k), up = st.phase === 'lift';
        const a = up ? restPos : OVER, z = up ? OVER : restPos;
        bezier(b.position, a, v1.copy(a).add(v3.set(0, 0.25, 0.05)), v2.copy(z).add(v3.set(0, 0.2, 0.05)), z, e);
        const turn = up ? e : 1 - e;
        b.rotation.set(0, Math.PI / 6, Math.PI * turn);
        if (k >= 1) {
          if (up) { st.phase = 'shake'; st.pt = 0; rattle(); }
          else { st.phase = 'rest'; st.pt = 0; tick(0.6); if (gacha.get().phase === 'turning') gacha.set({ phase: 'idle' }); }
        }
      } else if (st.phase === 'shake') {
        const amp = 0.035 * Math.sin(Math.PI * k);
        b.position.copy(OVER); b.position.y += Math.sin(st.t * 70) * amp; b.position.x += Math.sin(st.t * 43) * amp * 0.3;
        b.rotation.set(0, Math.PI / 6, Math.PI + Math.sin(st.t * 37) * 0.08 * Math.sin(Math.PI * k));
        if (k > 0.45 && !st.spawned) { st.spawned = true; rattle(); spawnStick(); }
        if (k >= 1) { st.phase = 'back'; st.pt = 0; }
      }
    }

    // The newest stick: once it has stopped in the tray, it is ready to take.
    const ph = gacha.get().phase;
    if (ph === 'dispensing') {
      const nk = newest(), last = nk ? bodies.current[nk.slot] : null, v = last?.linvel();
      if (v && Math.hypot(v.x, v.y, v.z) < 0.03) {
        if (st.settleAt < 0) st.settleAt = st.t;
        if (st.t - st.settleAt > 0.35) { gacha.set({ phase: 'ready' }); sparkle.burst(last!.translation(), 14, 0.2); }
      } else st.settleAt = -1;
    }

    // The stick in hand.
    const g = hand.current, sl = slip.current;
    if (g && g.visible) {
      holdPoint(camera, v4, HOLD.distance, HOLD.right, HOLD.down);
      q1.copy(camera.quaternion).multiply(q2.setFromEuler(e1.set(0, 0, 0.12)));
      st.ht += dt;
      if (st.hand === 'up') {
        const k = clamp01(st.ht / 0.75), e = easeOut(k);
        bezier(g.position, st.from, v1.copy(st.from).add(v3.set(0, 0.2, 0.1)), v2.copy(v4).add(v3.set(0, -0.1, -0.15)), v4, e);
        g.quaternion.copy(st.fromQ).slerp(q1, easeInOut(k));
        if (k < 0.9) sparkle.trail(g.position, 1);
        if (k >= 1) {
          st.hand = 'held'; st.heldAt = st.t;
          gacha.set({ phase: 'held', held: st.holding!.project, opened: false });
        }
      } else if (st.hand === 'held' || st.hand === 'opening' || st.hand === 'open') {
        const since = st.t - st.heldAt;
        g.position.copy(v4); g.position.y += Math.sin(since * 1.5) * 0.002;
        g.quaternion.copy(q1).multiply(q2.setFromEuler(e1.set(0, Math.sin(since * 0.8) * 0.12, 0)));
        if (st.hand === 'opening' && sl) {
          const k = clamp01(st.ht / 0.55);
          sl.scale.set(Math.max(0.001, easeOutBack(k, 1.2)), 1, 1);
          if (k >= 1) {
            st.hand = 'open';
            jingle();
            sparkle.burst(v3.set(-0.045, 0, 0).applyQuaternion(g.quaternion).add(g.position), 26, 0.2);
            gacha.set({ opened: true });
          }
        }
      } else if (st.hand === 'home') {
        const k = clamp01(st.ht / 0.6), e = easeInOut(k);
        v2.copy(restPos).add(v3.set(0, BOX.h / 2 + 0.05, 0));
        bezier(g.position, st.from, v1.copy(st.from).add(v3.set(0, 0.15, -0.1)), v3.copy(v2).add(v1.set(0, 0.3, 0.1)), v2, e);
        g.scale.setScalar(Math.max(0.001, 1 - e * e));
        if (k >= 1) { sparkle.burst(v2, 18, 0.2); tick(0.4); g.visible = false; g.scale.setScalar(1); st.hand = 'none'; st.holding = null; }
      }
      if (st.hand === 'held' && Math.random() < dt * 1.5) sparkle.twinkle(v3.set(0.03, STICK.l * 0.4, 0.006).applyQuaternion(g.quaternion).add(g.position));
    }

    // The bell swings on its rope.
    if (bell.current) {
      st.bellSwing *= Math.exp(-1.6 * dt);
      bell.current.rotation.z = Math.sin(st.t * 7) * 0.35 * st.bellSwing;
    }
  });

  // ---------- the stand ----------
  const geo = useMemo(() => ({
    hex: new THREE.CylinderGeometry(BOX.r, BOX.r, BOX.h, 6),
    band: new THREE.CylinderGeometry(BOX.r + 0.003, BOX.r + 0.003, 0.03, 6),
    stick: new THREE.BoxGeometry(STICK.w, STICK.l, STICK.w),
    tip: new THREE.BoxGeometry(STICK.w * 1.08, 0.03, STICK.w * 1.08),
    rope: new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.37, 1.36], [-0.18, 1.29], [0, 1.27], [0.18, 1.29], [0.37, 1.36]].map(([x, y]) => new THREE.Vector3(x, y, 0))), 40, 0.024, 10, false),
  }), []);
  const stickMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E8D49A', roughness: 0.6 }), []);
  const faceZ = BOX.r * Math.cos(Math.PI / 6) + 0.0012;

  return (
    <group>
      <group position={[OX, 0, 0]}>
        {/* the torii behind */}
        {[-0.37, 0.37].map((x) => (
          <group key={x} position={[x, 0, -0.3]}>
            <mesh position={[0, 0.86, 0]} material={m.vermilion} castShadow><cylinderGeometry args={[0.033, 0.038, 1.72, 18]} /></mesh>
            <mesh position={[0, 0.06, 0]} material={m.lacquerBlack} castShadow><cylinderGeometry args={[0.048, 0.05, 0.12, 18]} /></mesh>
          </group>
        ))}
        <mesh position={[0, 1.5, -0.3]} material={m.vermilion} castShadow><boxGeometry args={[0.9, 0.05, 0.05]} /></mesh>
        <mesh position={[0, 1.69, -0.3]} material={m.vermilion} castShadow><boxGeometry args={[0.92, 0.06, 0.07]} /></mesh>
        <mesh position={[0, 1.75, -0.3]} material={m.lacquerBlack} castShadow><boxGeometry args={[0.96, 0.05, 0.1]} /></mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.5, 1.775, -0.3]} rotation-z={side * 0.3} material={m.lacquerBlack}><boxGeometry args={[0.12, 0.045, 0.1]} /></mesh>
        ))}
        <mesh position={[0, 1.6, -0.27]} material={m.lacquerBlack}><boxGeometry args={[0.1, 0.15, 0.02]} /></mesh>
        <mesh position={[0, 1.6, -0.259]}><planeGeometry args={[0.08, 0.13]} /><meshStandardMaterial map={sign} roughness={0.8} /></mesh>
        {/* the shimenawa rope and its paper zigzags */}
        <mesh geometry={geo.rope} material={m.straw} position={[0, 0, -0.28]} castShadow />
        {[-0.2, 0, 0.2].map((x) => (
          <group key={x} position={[x, x === 0 ? 1.245 : 1.265, -0.26]}>
            {[0, 1, 2].map((k) => (
              <mesh key={k} material={m.paper} position={[(k % 2) * 0.012, -0.02 - k * 0.03, 0]}><planeGeometry args={[0.022, 0.03]} /></mesh>
            ))}
          </group>
        ))}
        {/* the bell, hung from the tie beam, with its rope */}
        <group ref={bell} position={[0.24, 1.475, -0.27]} userData={{ okBell: true }}>
          <mesh position={[0, -0.05, 0]} material={m.brass} castShadow><sphereGeometry args={[0.045, 24, 16]} /></mesh>
          <mesh position={[0, -0.05, 0.04]} material={m.iron}><boxGeometry args={[0.05, 0.006, 0.01]} /></mesh>
          <mesh ref={bellRope} position={[0, -0.33, 0]} material={m.lacquerRed} userData={{ okBell: true }} castShadow><cylinderGeometry args={[0.011, 0.011, 0.5, 8]} /></mesh>
          {[-0.2, -0.3, -0.4].map((y) => <mesh key={y} position={[0, y - 0.05, 0]} material={m.silkWhite}><cylinderGeometry args={[0.0125, 0.0125, 0.03, 8]} /></mesh>)}
        </group>

        {/* the table */}
        <mesh position={[0, TABLE_Y - 0.02, 0]} material={m.hinoki} castShadow receiveShadow><boxGeometry args={[0.72, 0.04, 0.46]} /></mesh>
        <mesh position={[0, TABLE_Y - 0.08, 0.215]} material={m.lacquerRed} castShadow><boxGeometry args={[0.7, 0.09, 0.02]} /></mesh>
        <mesh position={[0, TABLE_Y - 0.08, -0.215]} material={m.lacquerRed}><boxGeometry args={[0.7, 0.09, 0.02]} /></mesh>
        {[[-0.33, -0.2], [0.33, -0.2], [-0.33, 0.2], [0.33, 0.2]].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, (TABLE_Y - 0.04) / 2, z]} material={m.hinoki} castShadow><boxGeometry args={[0.045, TABLE_Y - 0.04, 0.045]} /></mesh>
        ))}
        <mesh position={[0, 0.12, 0]} material={m.hinoki}><boxGeometry args={[0.62, 0.03, 0.03]} /></mesh>
        <mesh position={[0, 0.006, 0]} material={m.lacquerBlack} receiveShadow><boxGeometry args={[0.8, 0.012, 0.56]} /></mesh>

        {/* the tray */}
        <group position={[TRAY.x, TABLE_Y, TRAY.z]}>
          <mesh position={[0, 0.015, 0]} material={m.hinoki} receiveShadow castShadow><boxGeometry args={[TRAY.w, 0.03, TRAY.d]} /></mesh>
          {[[0, TRAY.d / 2, TRAY.w, 0.012], [0, -TRAY.d / 2, TRAY.w, 0.012], [TRAY.w / 2, 0, 0.012, TRAY.d], [-TRAY.w / 2, 0, 0.012, TRAY.d]].map(([x, z, w, d]) => (
            <mesh key={`${x}${z}`} position={[x, 0.03 + TRAY.wall / 2, z]} material={m.lacquerRed} castShadow><boxGeometry args={[w, TRAY.wall, d]} /></mesh>
          ))}
        </group>
      </group>

      {/* the box of sticks, moved each frame */}
      <group ref={box} position={restPos} rotation={[0, Math.PI / 6, 0]} userData={{ okBox: true }}>
        <mesh geometry={geo.hex} material={m.hinoki} castShadow />
        <mesh geometry={geo.band} material={m.lacquerRed} position={[0, BOX.h / 2 - 0.02, 0]} />
        <mesh geometry={geo.band} material={m.lacquerRed} position={[0, -BOX.h / 2 + 0.02, 0]} />
        <mesh position={[0, BOX.h / 2 + 0.001, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.012, 16]} /><meshBasicMaterial color="#1a1208" /></mesh>
        {/* the sign on the front face (the hexagon is turned so a flat face is toward the visitor) */}
        <group rotation-y={-Math.PI / 6}>
          <mesh position={[0, 0, faceZ]}><planeGeometry args={[0.07, 0.22]} /><meshStandardMaterial map={sign} roughness={0.8} /></mesh>
        </group>
      </group>

      {/* the stick in hand, and its fortune */}
      <group ref={hand} visible={false} userData={{ okHand: true }}>
        <mesh geometry={geo.stick} material={stickMat} position={[0.03, 0, 0]} />
        <mesh geometry={geo.tip} material={m.lacquerRed} position={[0.03, STICK.l / 2 - 0.015, 0]} />
        <mesh ref={slip} material={slipMat} position={[-0.045, 0, 0]} scale={[0.001, 1, 1]}><planeGeometry args={[0.09, 0.158]} /></mesh>
      </group>

      {/* physics: the table, the tray, the floor around, and the sticks */}
      <RigidBody type="fixed" colliders={false} position={[OX, 0, 0]}>
        <CuboidCollider args={[0.36, 0.02, 0.23]} position={[0, TABLE_Y - 0.02, 0]} />
        <CuboidCollider args={[TRAY.w / 2, 0.015, TRAY.d / 2]} position={[TRAY.x, TABLE_Y + 0.015, TRAY.z]} />
        <CuboidCollider args={[TRAY.w / 2, TRAY.wall / 2 + 0.03, 0.006]} position={[TRAY.x, TABLE_Y + 0.03, TRAY.z + TRAY.d / 2]} />
        <CuboidCollider args={[TRAY.w / 2, TRAY.wall / 2 + 0.03, 0.006]} position={[TRAY.x, TABLE_Y + 0.03, TRAY.z - TRAY.d / 2]} />
        <CuboidCollider args={[0.006, TRAY.wall / 2 + 0.03, TRAY.d / 2]} position={[TRAY.x + TRAY.w / 2, TABLE_Y + 0.03, TRAY.z]} />
        <CuboidCollider args={[0.006, TRAY.wall / 2 + 0.03, TRAY.d / 2]} position={[TRAY.x - TRAY.w / 2, TABLE_Y + 0.03, TRAY.z]} />
        <CuboidCollider args={[0.55, 0.05, 0.55]} position={[0, -0.05, 0]} />
      </RigidBody>
      {pool.current.map((k) => (
        <RigidBody
          key={k.slot}
          ref={(r) => { bodies.current[k.slot] = r; }}
          colliders={false}
          position={[OX + 0.42 - k.slot * 0.03, 0.1, -0.45]}
          linearDamping={0.3}
          angularDamping={0.6}
          ccd
          onCollisionEnter={onHit(k.slot)}
        >
          <CuboidCollider args={[STICK.w / 2, STICK.l / 2, STICK.w / 2]} friction={0.8} restitution={0.25} />
          <group visible={false} userData={{ stick: k.slot }} ref={(o) => { stickMeshes.current[k.slot] = o; }}>
            <mesh geometry={geo.stick} material={stickMat} castShadow />
            <mesh geometry={geo.tip} material={m.lacquerRed} position={[0, STICK.l / 2 - 0.015, 0]} />
          </group>
        </RigidBody>
      ))}
    </group>
  );
}
