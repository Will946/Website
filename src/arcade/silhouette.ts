// Line-art outline of the hero scene for the loading screen: each machine as its main blocks
// (only the faces the hero camera sees) plus the features that make it recognisable, and the name
// as the front faces of its 3D letters. Projected with the hero camera, so every outline lies
// exactly where its machine will land. Plain maths: this runs before three.js has loaded.
import { HERO_POSE, SPOT } from './layout';
import { LETTER, glyphContours, heroCam, nameLayout, nameToWorld, project, type FontData, type V3 } from './heroName';
import type { MachineId } from './store';

type Box = [number, number, number, number, number, number];            // x0 x1 y0 y1 z0 z1
type Rect = [number, number, number, number];                            // x0 x1 y0 y1 on the front face
type Spec = { boxes: Box[]; front: number; rects: Rect[]; circles: [number, number, number][] };

// Machine-local metres (x about the machine's spot), simplified from each cabinet's dims.
const SPECS: Record<MachineId, Spec> = {
  // taiko: frame posts and beam behind, the stand, the drum (its head a circle), the lantern
  claw: {
    boxes: [[-0.52, -0.44, 0, 1.84, -0.4, -0.32], [0.44, 0.52, 0, 1.84, -0.4, -0.32], [-0.55, 0.55, 1.79, 1.87, -0.41, -0.31],
      [-0.49, -0.41, 0, 1.08, -0.04, 0.04], [0.41, 0.49, 0, 1.08, -0.04, 0.04], [-0.41, 0.41, 0.59, 1.41, -0.26, 0.26], [-0.11, 0.11, 1.47, 1.71, -0.11, 0.11]],
    front: 0.26,
    rects: [],
    circles: [[0, 1.0, 0.355]],
  },
  // omikuji: the torii behind, the table, the box and the tray
  gacha: {
    boxes: [[-0.405, -0.335, 0, 1.72, -0.34, -0.26], [0.335, 0.405, 0, 1.72, -0.34, -0.26], [-0.48, 0.48, 1.66, 1.8, -0.35, -0.25],
      [-0.36, 0.36, 0, 0.8, -0.23, 0.23], [-0.25, -0.09, 0.8, 1.14, -0.14, 0.02], [-0.03, 0.27, 0.8, 0.875, -0.03, 0.19]],
    front: 0.23,
    rects: [],
    circles: [],
  },
  // katana rack: the folding screen, the plinth and posts, the crest rail; the swords as lines
  vending: {
    boxes: [[-0.46, 0.46, 0, 1.8, -0.34, -0.29], [-0.45, 0.45, 0, 0.12, -0.18, 0.18], [-0.395, -0.325, 0, 1.4, -0.05, 0.05], [0.325, 0.395, 0, 1.4, -0.05, 0.05], [-0.52, 0.52, 1.4, 1.5, -0.07, 0.07]],
    front: 0.05,
    rects: [0, 1, 2, 3, 4].map((i) => [-0.26, 0.66, 1.21 - i * 0.2, 1.235 - i * 0.2] as Rect),
    circles: [],
  },
};

export type Pt = [number, number];                                       // normalised screen coordinates
export type Part = { id: MachineId | 'name'; depth: number; faces: Pt[][]; lines: Pt[][] };

function machinePart(id: MachineId, aspect: number): Part {
  const c = heroCam(aspect), ox = SPOT[id].x, sp = SPECS[id], pose = HERO_POSE[id];
  const cos = Math.cos(pose.yaw), sin = Math.sin(pose.yaw);
  // Machine frame to world, in its hero pose.
  const W = ([x, y, z]: V3): V3 => [ox + pose.x + cos * x + sin * z, y, pose.z - sin * x + cos * z];
  const P = (p: V3): Pt => { const q = project(c, W(p)); return [q[0], q[1]]; };
  const faces: Pt[][] = [];
  for (const [x0, x1, y0, y1, z0, z1] of sp.boxes) {
    const quads: [V3, V3[]][] = [
      [[0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
      [[0, 0, -1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]]],
      [[1, 0, 0], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]]],
      [[-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]],
      [[0, 1, 0], [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]]],
    ];
    for (const [n, q] of quads) {
      // Only the faces turned toward the camera.
      const mid = W(q.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4, a[2] + p[2] / 4] as V3, [0, 0, 0] as V3));
      const wn: V3 = [cos * n[0] + sin * n[2], n[1], -sin * n[0] + cos * n[2]];
      const toCam = [c.pos[0] - mid[0], c.pos[1] - mid[1], c.pos[2] - mid[2]];
      if (wn[0] * toCam[0] + wn[1] * toCam[1] + wn[2] * toCam[2] > 0) faces.push(q.map(P));
    }
  }
  const z = sp.front + 0.002;
  const lines = [
    ...sp.rects.map(([x0, x1, y0, y1]) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]].map(([x, y]) => P([x, y, z]))),
    ...sp.circles.map(([cx, cy, r]) => Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return P([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]); })),
  ];
  const d = project(c, W([0, 0.9, 0]))[2];
  return { id, depth: d, faces, lines };
}

/** The name: the outline of each 3D letter's front face. */
function namePart(font: FontData, aspect: number): Part {
  const c = heroCam(aspect), L = nameLayout(font, aspect), unit = 1 / font.resolution;
  const zFront = LETTER.depth + LETTER.bevelThickness;
  const lines = L.letters.flatMap((l) => glyphContours(font, l.ch).map((contour) => {
    const pts = contour.map(([gx, gy]) => { const q = project(c, nameToWorld(L, l.x + gx * unit, l.y + gy * unit, zFront)); return [q[0], q[1]] as Pt; });
    return [...pts, pts[0]];
  }));
  return { id: 'name', depth: 0, faces: [], lines };
}

/** Every outline in the hero, far to near (so nearer blocks can cover farther ones). */
export function heroOutline(aspect: number, font: FontData | null): Part[] {
  const parts = (['claw', 'gacha', 'vending'] as MachineId[]).map((m) => machinePart(m, aspect)).sort((a, b) => b.depth - a.depth);
  return font ? [...parts, namePart(font, aspect)] : parts;
}
