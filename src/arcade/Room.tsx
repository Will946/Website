// The dojo the three pieces stand in, one of two looks on the same floor and wall.
// Light: polished floorboards, a wall of shoji screens under a slatted transom and plaster, dark posts,
// two hanging scrolls and the dojo's name board. Dark: the same room at night, the paper gone blue-grey,
// and lantern light coming on along the transom one strip at a time after the lights go out.
//
// Both are unlit by the studio's reflections on purpose (Lambert ignores them): what lights them is a fixed
// glow plus the key light, so the emissive level alone sets how dark a shadow falls.
// RoomLight is the key light and how bright the reflections are, which go with the look.
// MachineGround is what each machine carries with it: a soft dark footprint that sits it on the floor
// wherever the scroll takes it, and the colour its lights spill in front.
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { canvas, finish, rng } from '../gacha/textures';
import { plaqueArt, scrollArt } from '../dojo/art';
import { neonHum } from '../gacha/sound';
import { intro } from './intro';
import { FOOTPRINT } from './layout';
import type { MachineId } from './store';
import { theme, useTheme } from './theme';
import { PHONE } from './device';

// The floor runs past the camera: on a narrow window it backs off a long way (heroEye in layout.ts).
const WALL_Z = -3.2, FRONT_Z = 34, HALF_W = 26, WALL_H = 13;
const SHADOW_LIFT = { light: 0.5, dark: 0.9 };   // the glow: what a shadow bottoms out at (lower is darker)
const KEY = { light: { intensity: 2.4, color: '#fffaf2', reflections: 1 }, dark: { intensity: 1.15, color: '#C9B8FF', reflections: 0.62 } };
const FLASH = 0.7, FLASH_DECAY = 3.5;   // the light coming back on overshoots, then settles
const SPILL: Record<MachineId, string> = { claw: '#FFD9A8', gacha: '#FFF3C4', vending: '#FFEFC2' };
const SPILL_DARK: Record<MachineId, string> = { claw: '#FF8A3A', gacha: '#FFB347', vending: '#FFC870' };
const TUBES = [{ y: 2.35, color: '#FFB45A' }];   // lantern light through the transom
const TUBE_DELAY = 0.45, TUBE_STAGGER = 0.24;    // s after the lights go out
const STUTTER = [1, 0, 0.7, 0, 0, 1, 0.25, 1, 0, 1];   // a tube striking, one step per STUTTER_S
const STUTTER_S = 0.05;

/** Polished dojo floorboards running away from the wall, butt joints staggered: one 2.88 m square, repeated. */
const PLANK_TILE = 2.88;
function boards(tones: string[], grain: string, joint: string, seed: number) {
  const [c, g] = canvas(512, 512);
  const r = rng(seed), W = 512 / 16;   // sixteen boards of 18 cm
  for (let i = 0; i < 16; i++) {
    const x = i * W;
    let y = -r() * 512;
    while (y < 512) {
      const len = 160 + r() * 260;
      g.fillStyle = tones[Math.floor(r() * tones.length)];
      g.fillRect(x, y, W, len);
      g.strokeStyle = grain; g.lineWidth = 1;
      for (let k = 0; k < 5; k++) {
        const gx = x + 3 + r() * (W - 6);
        g.globalAlpha = 0.25 + r() * 0.35;
        g.beginPath(); g.moveTo(gx, y);
        for (let yy = y; yy < y + len; yy += 24) g.lineTo(gx + Math.sin(yy * 0.03 + k) * 1.6, yy);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.fillStyle = joint; g.fillRect(x, y + len - 1.5, W, 1.5);
      y += len;
    }
    g.fillStyle = joint; g.fillRect(x + W - 1.5, 0, 1.5, 512);
  }
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((HALF_W * 2) / PLANK_TILE, (FRONT_Z - WALL_Z) / PLANK_TILE); t.anisotropy = 16;
  return t;
}

/** One 3.2 m bay of the dojo wall, floor to ceiling: four shoji screens under a transom, plaster above,
 * dark posts at either side. Repeated along the wall. 160 px a metre. */
const BAY = 3.2, PX = 160;
function shojiWall(night: boolean) {
  const W = BAY * PX, H = WALL_H * PX;
  const [c, g] = canvas(W, H);
  const y = (m: number) => H - m * PX;            // metres up the wall to canvas y
  const wood = night ? '#24170F' : '#5A3A22', woodLight = night ? '#3A2618' : '#8A5E38';
  const paper = night ? '#2A3046' : '#F7F0DE', plaster = night ? '#1A1B26' : '#EADFC8';
  g.fillStyle = plaster; g.fillRect(0, 0, W, H);
  // plaster texture
  const r = rng(night ? 9 : 4);
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${night ? '255,255,255' : '120,90,50'},${0.02 + r() * 0.03})`; g.fillRect(r() * W, r() * y(2.8), 2 + r() * 3, 2 + r() * 3); }
  // the shoji: four panels, each a frame with a kumiko grid of 3 x 6 over paper
  const top = 2.0, bottom = 0.12, pw = BAY / 4;
  for (let k = 0; k < 4; k++) {
    const x0 = k * pw * PX;
    g.fillStyle = paper; g.fillRect(x0, y(top), pw * PX, (top - bottom) * PX);
    if (!night) { const glow = g.createLinearGradient(0, y(top), 0, y(bottom)); glow.addColorStop(0, 'rgba(255,250,235,0)'); glow.addColorStop(1, 'rgba(230,214,180,.35)'); g.fillStyle = glow; g.fillRect(x0, y(top), pw * PX, (top - bottom) * PX); }
    g.fillStyle = woodLight;
    for (let i = 1; i < 3; i++) g.fillRect(x0 + (i * pw * PX) / 3 - 1.5, y(top), 3, (top - bottom) * PX);
    for (let j = 1; j < 6; j++) g.fillRect(x0, y(bottom + (j * (top - bottom)) / 6) - 1.5, pw * PX, 3);
    g.fillStyle = wood;
    g.fillRect(x0, y(top), 7, (top - bottom) * PX); g.fillRect(x0 + pw * PX - 7, y(top), 7, (top - bottom) * PX);
    g.fillRect(x0, y(bottom) - 14, pw * PX, 14);   // the kick rail
  }
  // skirting, the lintel (kamoi), a slatted transom (ranma), the upper beam (nageshi)
  g.fillStyle = wood; g.fillRect(0, y(bottom), W, bottom * PX);
  g.fillRect(0, y(2.1), W, 0.1 * PX);
  g.fillStyle = paper; g.fillRect(0, y(2.6), W, 0.5 * PX);
  g.fillStyle = woodLight; for (let x = 6; x < W; x += 14) g.fillRect(x, y(2.6), 4, 0.5 * PX);
  g.fillStyle = wood; g.fillRect(0, y(2.78), W, 0.18 * PX);
  g.fillStyle = woodLight; g.fillRect(0, y(2.78), W, 3);
  // ceiling beam far up, and the posts at both ends of the bay
  g.fillStyle = wood; g.fillRect(0, y(4.4), W, 0.22 * PX);
  g.fillRect(0, 0, 10, H); g.fillRect(W - 10, 0, 10, H);
  g.fillStyle = woodLight; g.fillRect(10, 0, 3, H); g.fillRect(W - 13, 0, 3, H);
  // an inked line where the wall meets the floor, as before
  g.fillStyle = '#141414'; g.fillRect(0, H - 3, W, 3);
  const t = finish(c);
  t.wrapS = THREE.RepeatWrapping; t.repeat.set((HALF_W * 2) / BAY, 1); t.offset.x = 0.5; t.anisotropy = 16;
  return t;
}

/** A soft vertical bar, brightest along its middle: a tube and the glow round it. */
function tubeGlow() {
  const [c, g] = canvas(4, 256);
  const fade = g.createLinearGradient(0, 0, 0, 256);
  [[0, 0], [0.4, 0.07], [0.47, 0.3], [0.495, 1], [0.505, 1], [0.53, 0.3], [0.6, 0.07], [1, 0]].forEach(([at, a]) => fade.addColorStop(at, `rgba(255,255,255,${a})`));
  g.fillStyle = fade; g.fillRect(0, 0, 4, 256);
  return finish(c);
}

/** The tubes' light lying on the floor, fading away from the wall. */
function floorGlow() {
  const [c, g] = canvas(4, 256);
  const fade = g.createLinearGradient(0, 0, 0, 256);
  fade.addColorStop(0, 'rgba(255,255,255,.32)'); fade.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = fade; g.fillRect(0, 0, 4, 256);
  return finish(c);
}

const glowing = (map: THREE.Texture, color: string) => new THREE.MeshBasicMaterial({ map, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });

export default function Room() {
  const mode = useTheme((s) => s.mode);
  const gl = useThree((s) => s.gl);
  const look = useMemo(() => {
    const surface = () => new THREE.MeshLambertMaterial({ color: '#fff', emissive: '#fff' });
    const tube = tubeGlow(), spill = floorGlow();
    return {
      floor: surface(), wall: surface(),
      maps: {
        light: { floor: boards(['#C9945C', '#D19D63', '#C08852', '#D6A86F', '#BB8550'], 'rgba(110,60,20,.5)', 'rgba(70,40,15,.55)', 3), wall: shojiWall(false) },
        dark: { floor: boards(['#3A2618', '#432C1C', '#33221A', '#4A3020', '#2E1F15'], 'rgba(0,0,0,.45)', 'rgba(0,0,0,.6)', 3), wall: shojiWall(true) },
      },
      tubes: TUBES.map((t) => glowing(tube, t.color)),
      spill: glowing(spill, '#FFB45A'),
      scrolls: ['侍', '道'].map((ch) => new THREE.MeshLambertMaterial({ map: scrollArt(ch), emissive: '#fff', emissiveMap: scrollArt(ch) })),
      plaque: new THREE.MeshLambertMaterial({ map: plaqueArt(), emissive: '#fff', emissiveMap: plaqueArt() }),
    };
  }, []);

  // Sent to the card up front, so the first switch has nothing to upload.
  useEffect(() => { Object.values(look.maps).forEach((m) => { gl.initTexture(m.floor); gl.initTexture(m.wall); }); }, [gl, look]);

  useLayoutEffect(() => {
    const m = look.maps[mode];
    look.floor.map = look.floor.emissiveMap = m.floor;
    look.wall.map = look.wall.emissiveMap = m.wall;
    look.floor.emissiveIntensity = look.wall.emissiveIntensity = SHADOW_LIFT[mode];
    [...look.scrolls, look.plaque].forEach((m) => { m.emissiveIntensity = SHADOW_LIFT[mode] * (mode === 'dark' ? 0.35 : 1); });
  }, [look, mode]);

  // Each tube strikes on its own: dark from the switch (or the loader opening), then the stutter, then on.
  const struck = useRef<number | null>(null);
  useEffect(() => {
    const strike = () => { struck.current = performance.now() / 1000; neonHum(); };
    if (mode !== 'dark') { struck.current = null; return undefined; }
    if (intro.get().phase === 'dropping' || intro.get().phase === 'done') { strike(); return undefined; }
    return intro.subscribe(() => { if (struck.current === null && intro.get().phase === 'dropping') strike(); });
  }, [mode]);
  useFrame(() => {
    if (struck.current === null) return;
    const t = performance.now() / 1000 - struck.current;
    let lit = 0;
    look.tubes.forEach((m, i) => {
      const step = Math.floor((t - TUBE_DELAY - i * TUBE_STAGGER) / STUTTER_S);
      m.opacity = step < 0 ? 0 : step < STUTTER.length ? STUTTER[step] : 1;
      lit += m.opacity;
    });
    look.spill.opacity = lit / TUBES.length;
  });

  return (
    <group>
      <mesh material={look.floor} rotation-x={-Math.PI / 2} position={[0, 0, (FRONT_Z + WALL_Z) / 2]} receiveShadow><planeGeometry args={[HALF_W * 2, FRONT_Z - WALL_Z]} /></mesh>
      <mesh material={look.wall} position={[0, WALL_H / 2, WALL_Z]} receiveShadow><planeGeometry args={[HALF_W * 2, WALL_H]} /></mesh>
      {/* two hanging scrolls either side, the dojo's name board above the middle */}
      {[[-3.2, 0], [5.0, 1]].map(([x, i]) => (
        <group key={x} position={[x, 0, WALL_Z + 0.02]}>
          <mesh material={look.scrolls[i]} position={[0, 1.42, 0]}><planeGeometry args={[0.5, 1.45]} /></mesh>
          <mesh position={[0, 2.16, 0.012]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.014, 0.014, 0.6, 10]} /><meshStandardMaterial color="#3A2618" roughness={0.5} /></mesh>
          <mesh position={[0, 0.69, 0.012]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.016, 0.016, 0.62, 10]} /><meshStandardMaterial color="#3A2618" roughness={0.5} /></mesh>
        </group>
      ))}
      <mesh material={look.plaque} position={[0.1, 2.93, WALL_Z + 0.03]}><planeGeometry args={[1.12, 0.42]} /></mesh>
      <group visible={mode === 'dark'}>
        {TUBES.map((t, i) => <mesh key={t.y} material={look.tubes[i]} position={[0, t.y, WALL_Z + 0.01 * (i + 1)]} scale={[HALF_W * 2, 1, 1]} renderOrder={1}><planeGeometry /></mesh>)}
        <mesh material={look.spill} rotation-x={-Math.PI / 2} position={[0, 0.002, WALL_Z + 2]} scale={[HALF_W * 2, 4, 1]} renderOrder={1}><planeGeometry /></mesh>
      </group>
    </group>
  );
}

/** The key light, from high on the left and in front: shadows fall short and back, and stay on the floor. */
export function RoomLight() {
  const mode = useTheme((s) => s.mode);
  const scene = useThree((s) => s.scene);
  const key = useRef<THREE.DirectionalLight>(null);
  const on = useRef(-1e9);
  useEffect(() => theme.subscribe(() => { if (theme.get().mode === 'light') on.current = performance.now() / 1000; }), []);
  useFrame(() => {
    const k = KEY[mode];
    scene.environmentIntensity = k.reflections;
    if (!key.current) return;
    key.current.color.set(k.color);
    const since = performance.now() / 1000 - on.current;
    key.current.intensity = k.intensity * (mode === 'light' ? 1 + FLASH * Math.exp(-since * FLASH_DECAY) : 1);
  });
  return (
    <directionalLight
      ref={key} position={[-1.6, 7.5, 3.6]} castShadow
      shadow-mapSize={PHONE ? [1024, 1024] : [2048, 2048]} shadow-bias={-0.0002} shadow-normalBias={0.012}
      shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={4.2} shadow-camera-bottom={-4.2} shadow-camera-far={16}
    />
  );
}

let footTex: THREE.CanvasTexture | null = null, spillTex: THREE.CanvasTexture | null = null;

/** A soft-edged dark rectangle: the machine's footprint. */
function foot() {
  if (footTex) return footTex;
  const [c, ctx] = canvas(256, 256);
  // Drawn off the canvas, so only its blurred shadow lands on it.
  ctx.shadowColor = '#2a1a00'; ctx.shadowBlur = 42; ctx.shadowOffsetX = 512;
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(52 - 512, 52, 152, 152, 18); ctx.fill();
  return (footTex = finish(c));
}

function spill() {
  if (spillTex) return spillTex;
  const [c, ctx] = canvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  return (spillTex = finish(c));
}

const FOOT_OPACITY = 0.8, SPILL_OPACITY = { light: 0.2, dark: 0.34 };
export type Ground = { lift: (height: number) => void };

/** Lies on the floor under a machine, however high it is: it fades and spreads as the machine rises. */
export const MachineGround = forwardRef<Ground, { machine: MachineId }>(function MachineGround({ machine }, ref) {
  const [w, d] = FOOTPRINT[machine];
  const mode = useTheme((s) => s.mode);
  const height = useRef(0);
  const { shade, glow } = useMemo(() => ({
    shade: new THREE.MeshBasicMaterial({ map: foot(), transparent: true, depthWrite: false, opacity: FOOT_OPACITY }),
    glow: new THREE.MeshBasicMaterial({ map: spill(), color: SPILL[machine], transparent: true, depthWrite: false }),
  }), [machine]);
  const place = useRef(() => {});
  place.current = () => {
    const k = Math.max(0, 1 - height.current / 1.4);
    shade.opacity = FOOT_OPACITY * k * k;
    glow.opacity = SPILL_OPACITY[mode] * k;
    glow.color.set(mode === 'dark' ? SPILL_DARK[machine] : SPILL[machine]);
  };
  useImperativeHandle(ref, () => ({ lift(h) { height.current = h; place.current(); } }), []);
  useEffect(() => place.current(), [mode]);
  return (
    <group rotation-x={-Math.PI / 2}>
      <mesh material={shade} position={[0, 0, 0.003]} scale={[w * 1.7, d * 1.7, 1]} renderOrder={1}><planeGeometry /></mesh>
      <mesh material={glow} position={[0, -d / 2 - 0.42, 0.004]} scale={[w * 1.9, 1.1, 1]} renderOrder={1}><planeGeometry /></mesh>
    </group>
  );
});
