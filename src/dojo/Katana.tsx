// The katana rack (stands where the vending machine stood, and sells the same thing: a job each).
// Five swords on a black lacquer kake in front of a gold folding screen, one per entry in
// data/experience.ts, each with that job's name on a paper tag. Click a sword (or press 1 to 5): it is
// lifted off its hooks, the blade is drawn from the scabbard and comes up to the visitor, edge up,
// glinting. Click it again (or Escape, or Put it back) and it flies home, slides into its scabbard and
// is set back on the rack.
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { EXPERIENCE } from '../data/experience';
import { sheathe, shing, tick } from '../gacha/sound';
import { SPOT } from '../arcade/layout';
import { sparkle } from '../arcade/Sparkles';
import { arcade, wantShot } from '../arcade/store';
import { rig } from '../arcade/CameraRig';
import { onImpact } from '../arcade/intro';
import { bezier, clamp01, easeInOut, easeOut, holdPoint } from '../arcade/present';
import { vendActions, vending } from '../vending/store';
import { dojo } from './materials';
import { PHONE } from '../arcade/device';
import { gripWrap, screenArt, swordTag } from './art';

const OX = SPOT.vending.x;
const N = EXPERIENCE.length;
const BLADE = 0.62, GRIP = 0.23, SORI = 0.022;      // blade and grip length, the blade's curve (m)
const CENTER = (BLADE - GRIP) / 2;                  // the sword's middle, from the guard
const DRAWN = BLADE + 0.05;                         // how far the hilt travels to clear the scabbard
const Z0 = 0.03;                                    // the swords' plane on the rack
const POST_X = 0.36;
const y0 = (i: number) => 1.22 - i * (0.8 / Math.max(1, N - 1));
const SAYA = ['#141212', '#7A1712', '#1B2A4A', '#23402B', '#5A3A1E', '#141212'];
const SILK = ['#1B2A4A', '#141212', '#7A1712', '#B8862B', '#141212', '#7A1712'];
const HOLD = { distance: 1.9, right: -0.16, down: 0.04, tilt: 0.32 };
const HOLD_PORTRAIT = { distance: 3.6, right: 0, down: -0.3, tilt: 1.35 };   // a tall, narrow screen: nearly upright

type Phase = 'rack' | 'lift' | 'draw' | 'present' | 'held' | 'return' | 'sheathe' | 'settle';

/** The blade: a long curved sliver of steel, edge up, from the guard (x = 0) to the point. */
function bladeGeometry() {
  const s = new THREE.Shape(), steps = 24, pts: [number, number][] = [], back: [number, number][] = [];
  for (let k = 0; k <= steps; k++) {
    const x = 0.012 + (k / steps) * (BLADE - 0.012), u = x / BLADE, c = SORI * u * u, w = 0.0155 - 0.0045 * u;
    pts.push([x, c + w]);      // the edge (ha), on top
    back.push([x, c - w]);     // the back (mune)
  }
  s.moveTo(0.012, back[0][1]);
  for (const [x, y] of pts) s.lineTo(x, y);
  // the point (kissaki): sweeps from the edge round to the back
  const tip = pts[pts.length - 1], tb = back[back.length - 1];
  s.quadraticCurveTo(BLADE + 0.03, tip[1] - 0.004, BLADE + 0.028, tb[1] + 0.002);
  for (let k = back.length - 1; k >= 0; k--) s.lineTo(back[k][0], back[k][1]);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.0016, bevelSize: 0.0012, bevelSegments: 2, curveSegments: 8 });
  g.translate(0, 0, -0.002);
  return g;
}

/** The scabbard: a lacquered tube following the blade's curve, slightly flattened. */
function sayaGeometry() {
  const pts = Array.from({ length: 12 }, (_, k) => { const x = 0.008 + (k / 11) * (BLADE + 0.02); const u = x / BLADE; return new THREE.Vector3(x, SORI * u * u, 0); });
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.0175, 14, false);
}

export default function Katana() {
  const { camera, gl } = useThree();
  const m = dojo();
  const geo = useMemo(() => ({
    blade: bladeGeometry(),
    saya: sayaGeometry(),
    grip: new THREE.CylinderGeometry(0.0145, 0.0155, GRIP, 16, 1, true).rotateZ(Math.PI / 2).translate(-GRIP / 2, 0, 0),
    cap: new THREE.CylinderGeometry(0.0165, 0.0165, 0.014, 16).rotateZ(Math.PI / 2),
    tsuba: new THREE.CylinderGeometry(0.038, 0.038, 0.007, 28).rotateZ(Math.PI / 2),
    rim: new THREE.TorusGeometry(0.038, 0.002, 6, 32).rotateY(Math.PI / 2),
    habaki: new THREE.BoxGeometry(0.024, 0.03, 0.012),
    end: new THREE.SphereGeometry(0.0178, 14, 10),
    tag: new THREE.PlaneGeometry(0.05, 0.1),
    hook: new THREE.CylinderGeometry(0.012, 0.012, 0.11, 10).rotateX(Math.PI / 2),
  }), []);
  const mats = useMemo(() => ({
    saya: SAYA.map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 })),
    grip: SILK.map((c) => { const t = gripWrap(c); t.repeat.set(1, 3); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.75 }); }),
    tag: EXPERIENCE.map((e) => new THREE.MeshStandardMaterial({ map: swordTag(e.title, e.dates), roughness: 0.9, side: THREE.DoubleSide, emissive: '#FFE3A8', emissiveIntensity: 0 })),
    screen: (() => {
      const art = screenArt();
      return [0, 0.5].map((offset) => {
        const t = art.clone();
        t.repeat.set(0.5, 1); t.offset.set(offset, 0);
        return new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0.35 });
      });
    })(),
  }), []);

  const saya = useRef<(THREE.Group | null)[]>([]);
  const hilt = useRef<(THREE.Group | null)[]>([]);
  const s = useRef({ t: 0, active: -1, phase: 'rack' as Phase, pt: 0, hover: -1, heldAt: 0, wobble: 0 });
  const from = useMemo(() => ({ p: new THREE.Vector3(), q: new THREE.Quaternion() }), []);
  const [v1, v2, v3, v4, hp] = useMemo(() => Array.from({ length: 5 }, () => new THREE.Vector3()), []);
  const [q1, q2] = useMemo(() => [new THREE.Quaternion(), new THREE.Quaternion()], []);
  const axisZ = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  const rest = (i: number, out: THREE.Vector3) => out.set(OX, y0(i), Z0);
  const lifted = (i: number, out: THREE.Vector3) => out.set(OX, y0(i) + 0.05, Z0 + 0.17);
  /** Where the hilt's origin goes, and how it turns, for the sword to hang in front of the camera. */
  const heldPose = (p: THREE.Vector3, q: THREE.Quaternion, since = 0) => {
    const h = (camera as THREE.PerspectiveCamera).aspect < 1 ? HOLD_PORTRAIT : HOLD;
    q.copy(camera.quaternion).multiply(q2.setFromAxisAngle(axisZ, h.tilt + Math.sin(since * 0.8) * 0.03));
    holdPoint(camera, hp, h.distance, h.right, h.down);
    hp.y += Math.sin(since * 1.3) * 0.006;
    return p.copy(hp).sub(v4.set(CENTER, 0, 0).applyQuaternion(q));
  };

  const go = (phase: Phase) => { s.current.phase = phase; s.current.pt = 0; };
  const pick = (i: number) => {
    const st = s.current;
    if (i < 0 || i >= N) return;
    if (st.phase === 'held') { putBack(); return; }
    if (st.phase !== 'rack') return;
    st.active = i;
    go('lift');
    tick(0.6);
    vending.set({ phase: 'vending' });
  };
  const putBack = () => {
    const st = s.current, h = hilt.current[st.active];
    if (st.phase !== 'held' || !h) return;
    from.p.copy(h.position); from.q.copy(h.quaternion);
    go('return');
    vending.set({ phase: 'taking', held: null });
  };
  /** Straight home, no animation: when the visitor leaves the rack with a sword in hand. */
  const reset = () => {
    const st = s.current;
    st.active = -1; go('rack');
    vending.set({ phase: 'idle', held: null });
  };
  useEffect(() => { vendActions.putBack = putBack; });
  useEffect(() => arcade.subscribe(() => { if (arcade.get().focus !== 'vending' && s.current.phase !== 'rack') reset(); }), []);
  useEffect(() => onImpact(({ machine }) => { if (machine === 'vending') s.current.wobble = 1; }), []);

  // ---------- input ----------
  useEffect(() => {
    const el = gl.domElement.parentElement ?? gl.domElement;
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const hit = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const targets = [...saya.current, ...hilt.current].filter(Boolean) as THREE.Object3D[];
      for (const h of ray.intersectObjects(targets, true)) {
        let o: THREE.Object3D | null = h.object;
        while (o && o.userData.sword === undefined) o = o.parent;
        if (o) return o.userData.sword as number;
      }
      return -1;
    };
    const down = (e: PointerEvent) => {
      if (arcade.get().focus !== 'vending' || rig.gliding) return;
      const st = s.current, i = hit(e);
      if (st.phase === 'held') { e.stopPropagation(); e.preventDefault(); putBack(); return; }
      if (i < 0) return;
      e.stopPropagation(); e.preventDefault();
      pick(i);
    };
    const move = (e: PointerEvent) => {
      if (arcade.get().focus !== 'vending' || e.buttons) { s.current.hover = -1; return; }
      const i = hit(e);
      s.current.hover = s.current.phase === 'rack' ? i : -1;
      el.style.cursor = i >= 0 || s.current.phase === 'held' ? 'pointer' : 'grab';
    };
    const key = (e: KeyboardEvent) => {
      if (arcade.get().focus !== 'vending' || e.metaKey || e.ctrlKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= N) pick(n - 1);
      else if (e.key === 'Escape') putBack();
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
  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 30), st = s.current;
    st.t += dt;
    st.wobble *= Math.exp(-3 * dt);
    if (import.meta.env.DEV) (window as unknown as { __katana: unknown }).__katana = { phase: st.phase, pt: +st.pt.toFixed(2), active: st.active, store: vending.get() };
    if (arcade.get().focus === 'vending') wantShot('vending', 'main');
    const DUR: Record<Phase, number> = { rack: 1, lift: 0.32, draw: 0.5, present: 0.8, held: 1, return: 0.7, sheathe: 0.32, settle: 0.3 };
    if (st.phase !== 'rack' && st.phase !== 'held') st.pt = Math.min(1, st.pt + dt / DUR[st.phase]);
    const k = st.pt, a = st.active;

    for (let i = 0; i < N; i++) {
      const sy = saya.current[i], hl = hilt.current[i];
      if (!sy || !hl) continue;
      const shake = Math.sin(st.t * 31 + i * 1.7) * 0.012 * st.wobble;
      const hover = i === st.hover ? 0.008 + 0.003 * Math.sin(st.t * 6) : 0;
      mats.tag[i].emissiveIntensity = i === st.hover ? 0.35 : 0;
      if (i !== a) {
        rest(i, sy.position); sy.position.y += hover; sy.rotation.set(0, 0, shake); sy.quaternion.setFromEuler(sy.rotation);
        hl.position.copy(sy.position); hl.quaternion.copy(sy.quaternion);
        continue;
      }
      rest(i, v1); lifted(i, v2);
      if (st.phase === 'lift') {
        sy.position.lerpVectors(v1, v2, easeOut(k)); sy.quaternion.identity();
        hl.position.copy(sy.position); hl.quaternion.identity();
        if (k >= 1) { go('draw'); shing(); }
      } else if (st.phase === 'draw') {
        sy.position.copy(v2);
        hl.position.copy(v2).add(v3.set(-DRAWN * easeInOut(k), 0, 0));
        hl.quaternion.identity();
        if (k > 0.3) sparkle.trail(v4.copy(hl.position).add(v3.set(0.05 + Math.random() * BLADE, 0.01, 0)), 1);
        if (k >= 1) { from.p.copy(hl.position); from.q.copy(hl.quaternion); go('present'); }
      } else if (st.phase === 'present') {
        sy.position.lerpVectors(v2, v1, easeInOut(clamp01(k * 1.6)));
        const e = easeInOut(k);
        heldPose(v3, q1, 0);
        bezier(hl.position, from.p, v4.copy(from.p).add(hp.set(-0.1, 0.25, 0.3)), v2.copy(v3).add(hp.set(0, -0.2, -0.3)), v3, e);
        hl.quaternion.copy(from.q).slerp(q1, e);
        if (k > 0.2 && k < 0.9) sparkle.trail(v4.copy(hl.position).add(v3.set(CENTER, 0, 0).applyQuaternion(hl.quaternion)), 2);
        if (k >= 1) {
          st.heldAt = st.t; go('held');
          v4.set(CENTER, 0, 0).applyQuaternion(hl.quaternion).add(hl.position);
          sparkle.burst(v4, 30, 0.3);
          vending.set({ phase: 'held', held: i });
        }
      } else if (st.phase === 'held') {
        sy.position.copy(v1);
        const since = st.t - st.heldAt;
        heldPose(hl.position, hl.quaternion, since);
        // a glint running down the steel now and then
        if (Math.random() < dt * 2.2) sparkle.twinkle(v4.set(Math.random() * BLADE, 0.012, 0.004).applyQuaternion(hl.quaternion).add(hl.position));
      } else if (st.phase === 'return') {
        sy.position.lerpVectors(v1, v2, easeOut(clamp01(k * 2)));
        v3.copy(v2).add(v4.set(-DRAWN, 0, 0));
        const e = easeInOut(k);
        bezier(hl.position, from.p, v4.copy(from.p).add(hp.set(0, 0.2, -0.2)), hp.copy(v3).add(v1.set(-0.15, 0.2, 0.25)), v3, e);
        hl.quaternion.copy(from.q).slerp(q1.identity(), e);
        if (k >= 1) go('sheathe');
      } else if (st.phase === 'sheathe') {
        sy.position.copy(v2);
        hl.position.copy(v2).add(v3.set(-DRAWN * (1 - easeInOut(k)), 0, 0));
        hl.quaternion.identity();
        if (k >= 1) { sheathe(); go('settle'); }
      } else if (st.phase === 'settle') {
        sy.position.lerpVectors(v2, v1, easeInOut(k)); sy.quaternion.identity();
        hl.position.copy(sy.position); hl.quaternion.identity();
        if (k >= 1) { tick(0.4); st.active = -1; go('rack'); vending.set({ phase: 'idle', held: null }); }
      } else {
        sy.position.copy(v1); hl.position.copy(v1); sy.quaternion.identity(); hl.quaternion.identity();
      }
    }
  });

  const posts = [-POST_X, POST_X];
  return (
    <group>
      <group position={[OX, 0, 0]}>
        {/* the gold folding screen behind: two panels, slightly folded toward each other */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.228, 0, -0.3]} rotation-y={-side * 0.14}>
            <mesh position={[0, 0.92, 0]} material={m.darkWood} castShadow receiveShadow>
              <boxGeometry args={[0.44, 1.7, 0.02]} />
            </mesh>
            <mesh position={[0, 0.92, 0.0105]} material={mats.screen[side < 0 ? 0 : 1]}>
              <planeGeometry args={[0.44, 1.7]} />
            </mesh>
            {/* lacquer frame */}
            <mesh position={[0, 1.785, 0.004]} material={m.lacquerBlack}><boxGeometry args={[0.46, 0.03, 0.03]} /></mesh>
            <mesh position={[0, 0.055, 0.004]} material={m.lacquerBlack}><boxGeometry args={[0.46, 0.03, 0.03]} /></mesh>
            <mesh position={[side * 0.22, 0.92, 0.004]} material={m.lacquerBlack}><boxGeometry args={[0.024, 1.76, 0.03]} /></mesh>
            {[0.4, 1.0, 1.6].map((y) => <mesh key={y} position={[side * 0.232, y, 0.012]} material={m.brass}><boxGeometry args={[0.012, 0.05, 0.012]} /></mesh>)}
          </group>
        ))}
        {/* the rack: plinth, two posts, a curved crest rail, a hook pair per sword */}
        <mesh position={[0, 0.06, 0]} material={m.lacquerBlack} castShadow receiveShadow><boxGeometry args={[0.9, 0.12, 0.36]} /></mesh>
        <mesh position={[0, 0.125, 0]} material={m.brass}><boxGeometry args={[0.86, 0.01, 0.32]} /></mesh>
        {posts.map((x) => (
          <group key={x}>
            <mesh position={[x, 0.75, 0]} material={m.lacquerBlack} castShadow><boxGeometry args={[0.07, 1.3, 0.1]} /></mesh>
            <mesh position={[x, 0.16, 0]} material={m.lacquerBlack}><boxGeometry args={[0.14, 0.06, 0.3]} /></mesh>
            {Array.from({ length: N }, (_, i) => (
              <group key={i} position={[x, y0(i) - 0.03, 0.06]}>
                <mesh geometry={geo.hook} material={m.lacquerBlack} castShadow />
                <mesh position={[0, 0.028, 0.048]} material={m.lacquerBlack}><boxGeometry args={[0.024, 0.06, 0.02]} /></mesh>
              </group>
            ))}
          </group>
        ))}
        <mesh position={[0, 1.43, 0]} material={m.lacquerRed} castShadow><boxGeometry args={[0.98, 0.06, 0.12]} /></mesh>
        <mesh position={[0, 1.48, 0]} material={m.lacquerBlack} castShadow><boxGeometry args={[1.04, 0.04, 0.14]} /></mesh>
        {[-0.5, 0.5].map((x) => <mesh key={x} position={[x, 1.5, 0]} rotation-z={x > 0 ? 0.35 : -0.35} material={m.lacquerBlack}><boxGeometry args={[0.1, 0.035, 0.14]} /></mesh>)}
        <mesh position={[0, 1.43, 0.062]} material={m.brass}><cylinderGeometry args={[0.03, 0.03, 0.006, 24]} /></mesh>
      </group>

      {/* the swords, posed each frame */}
      {EXPERIENCE.map((e, i) => (
        <group key={e.id}>
          <group ref={(g) => { saya.current[i] = g; }} userData={{ sword: i }} position={[OX, y0(i), Z0]}>
            <mesh geometry={geo.saya} material={mats.saya[i % SAYA.length]} scale={[1, 1, 0.72]} castShadow />
            {PHONE && <mesh position={[(BLADE - GRIP) / 2, 0, 0.02]}><boxGeometry args={[BLADE + GRIP + 0.05, 0.15, 0.1]} /><meshBasicMaterial visible={false} /></mesh>}
            <mesh geometry={geo.end} material={mats.saya[i % SAYA.length]} position={[BLADE + 0.028, SORI * 1.1, 0]} scale={[0.8, 1, 0.72]} />
            <mesh geometry={geo.cap} position={[0.012, 0, 0]} material={m.brass} scale={[0.86, 1.15, 0.86]} />
            {/* the job's paper tag, hanging from a cord */}
            <mesh position={[0.2, -0.062, 0.022]} material={mats.tag[i]} geometry={geo.tag} rotation-z={0.04} castShadow />
            <mesh position={[0.2, -0.006, 0.02]} material={m.silkWhite}><boxGeometry args={[0.003, 0.03, 0.003]} /></mesh>
          </group>
          <group ref={(g) => { hilt.current[i] = g; }} userData={{ sword: i }} position={[OX, y0(i), Z0]}>
            <mesh geometry={geo.blade} material={m.steel} castShadow />
            <mesh geometry={geo.habaki} material={m.brass} position={[0.012, 0, 0]} />
            <mesh geometry={geo.tsuba} material={m.iron} position={[-0.004, 0, 0]} castShadow />
            <mesh geometry={geo.rim} material={m.brass} position={[-0.004, 0, 0]} />
            <mesh geometry={geo.grip} material={mats.grip[i % SILK.length]} position={[-0.008, 0, 0]} castShadow />
            <mesh geometry={geo.cap} material={m.iron} position={[-0.008 - GRIP - 0.006, 0, 0]} />
          </group>
        </group>
      ))}
    </group>
  );
}
