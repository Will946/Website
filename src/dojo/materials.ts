// Materials for the dojo pieces (katana rack, omikuji stand, taiko drum): urushi lacquer, hinoki and
// keyaki wood, brass fittings, polished steel, washi paper and rice-straw rope. Built once, shared.
import * as THREE from 'three';
import { canvas, finish, rng } from '../gacha/textures';

let cache: ReturnType<typeof build> | null = null;
export const dojo = () => (cache ??= build());

/** Wood grain: long streaks along the texture's x axis. */
function grain(base: string, dark: string, seed: number) {
  const [c, g] = canvas(512, 128);
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 70; i++) {
    const y = r() * 128, w = 0.6 + r() * 2.2;
    g.strokeStyle = dark; g.globalAlpha = 0.08 + r() * 0.22; g.lineWidth = w;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.012 + i) * (2 + r() * 4));
    g.stroke();
  }
  g.globalAlpha = 1;
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Washi: off-white with a few long fibres. */
export function washiCanvas(w: number, h: number, seed = 3): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const [c, g] = canvas(w, h);
  const r = rng(seed);
  g.fillStyle = '#FBF7EC'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < (w * h) / 900; i++) {
    g.strokeStyle = `rgba(150,130,95,${0.05 + r() * 0.1})`; g.lineWidth = 0.6 + r();
    const x = r() * w, y = r() * h, a = r() * Math.PI, l = 6 + r() * 22;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  return [c, g];
}

function build() {
  const hinokiMap = grain('#E2C493', '#9C7440', 7);
  const keyakiMap = grain('#7A3A1E', '#3A160A', 11);
  const darkWoodMap = grain('#4A2E1C', '#1F120A', 13);

  const lacquerBlack = new THREE.MeshPhysicalMaterial({ color: '#141212', roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
  const lacquerRed = new THREE.MeshPhysicalMaterial({ color: '#B8231B', roughness: 0.36, clearcoat: 1, clearcoatRoughness: 0.1 });
  const vermilion = new THREE.MeshPhysicalMaterial({ color: '#D9381E', roughness: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  const hinoki = new THREE.MeshStandardMaterial({ map: hinokiMap, roughness: 0.62 });
  const keyaki = new THREE.MeshPhysicalMaterial({ map: keyakiMap, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.18 });
  const darkWood = new THREE.MeshStandardMaterial({ map: darkWoodMap, roughness: 0.55 });
  const brass = new THREE.MeshPhysicalMaterial({ color: '#D4A548', metalness: 1, roughness: 0.28 });
  const iron = new THREE.MeshStandardMaterial({ color: '#2B2A2A', metalness: 0.85, roughness: 0.45 });
  const steel = new THREE.MeshPhysicalMaterial({ color: '#EEF2F5', metalness: 1, roughness: 0.09 });
  const hide = new THREE.MeshStandardMaterial({ color: '#EADBB8', roughness: 0.8 });
  const paper = new THREE.MeshStandardMaterial({ color: '#FBF7EC', roughness: 0.95, side: THREE.DoubleSide });
  const straw = new THREE.MeshStandardMaterial({ color: '#CDB36E', roughness: 0.9 });
  const silkWhite = new THREE.MeshStandardMaterial({ color: '#F4F0E6', roughness: 0.7 });
  const glow = new THREE.MeshBasicMaterial({ color: '#FFE3A8', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });

  return { lacquerBlack, lacquerRed, vermilion, hinoki, keyaki, darkWood, brass, iron, steel, hide, paper, straw, silkWhite, glow };
}
