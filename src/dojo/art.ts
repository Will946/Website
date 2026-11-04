// Painted artwork for the dojo pieces, drawn on canvases (no image files): the folding screen behind
// the katana rack, the sword tags, the omikuji box sign and fortune slip, the drum's mitsudomoe, the
// lantern and the Daruma face. Lettering waits for the page's fonts, then repaints.
import * as THREE from 'three';
import { canvas, finish, fontsReady, rng } from '../gacha/textures';
import { washiCanvas } from './materials';

export const JP = "'Shippori Mincho B1', 'Hiragino Mincho ProN', 'Yu Mincho', serif";
const TITLE = (px: number) => `400 ${px}px 'Lilita One', 'Arial Black', sans-serif`;
const BODY = (px: number, w = 800) => `${w} ${px}px Nunito, sans-serif`;
const ready = Promise.all([fontsReady(`800 60px ${JP}`), fontsReady(TITLE(60)), fontsReady(BODY(30))]);

/** A texture painted now with fallback fonts, and again once the real ones are in. */
function painted(w: number, h: number, paint: (g: CanvasRenderingContext2D, c: HTMLCanvasElement) => void, base?: () => [HTMLCanvasElement, CanvasRenderingContext2D]) {
  const [c, g] = base ? base() : canvas(w, h);
  const snapshot = document.createElement('canvas');
  snapshot.width = c.width; snapshot.height = c.height;
  snapshot.getContext('2d')!.drawImage(c, 0, 0);
  paint(g, c);
  const t = finish(c);
  void ready.then(() => {
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(snapshot, 0, 0);
    paint(g, c);
    t.needsUpdate = true;
  });
  return t;
}

/** Fit a line of text into a width, shrinking the font from `px`. */
function fit(g: CanvasRenderingContext2D, text: string, font: (px: number) => string, px: number, max: number) {
  let size = px;
  g.font = font(size);
  while (size > 8 && g.measureText(text).width > max) { size -= 2; g.font = font(size); }
  return size;
}

/** Gold-leaf folding screen with sumi mountains, clouds and a red sun. Two panels side by side. */
export function screenArt() {
  const W = 1024, H = 1024;
  return painted(W, H, (g) => {
    const r = rng(21);
    const leaf = g.createLinearGradient(0, 0, W, H);
    leaf.addColorStop(0, '#E9C66A'); leaf.addColorStop(0.5, '#F3D88A'); leaf.addColorStop(1, '#D9AE4E');
    g.fillStyle = leaf; g.fillRect(0, 0, W, H);
    // the squares of gold leaf
    for (let y = 0; y < H; y += 64) for (let x = 0; x < W; x += 64) {
      g.fillStyle = `rgba(${r() > 0.5 ? '255,240,190' : '170,120,40'},${0.04 + r() * 0.08})`;
      g.fillRect(x, y, 64, 64);
      g.strokeStyle = 'rgba(140,95,30,0.12)'; g.strokeRect(x + 0.5, y + 0.5, 64, 64);
    }
    // the sun
    g.fillStyle = '#C8321F'; g.beginPath(); g.arc(W * 0.72, H * 0.24, 92, 0, Math.PI * 2); g.fill();
    // mountains, back to front
    const ridge = (y0: number, amp: number, color: string, seed: number) => {
      const q = rng(seed);
      g.fillStyle = color; g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) g.lineTo(x, y0 - Math.abs(Math.sin(x * 0.006 + seed) * amp) - q() * 14);
      g.lineTo(W, H); g.fill();
    };
    ridge(H * 0.62, 180, 'rgba(40,40,46,0.35)', 2);
    ridge(H * 0.74, 130, 'rgba(25,25,30,0.6)', 5);
    ridge(H * 0.86, 70, 'rgba(15,15,18,0.85)', 9);
    // cloud bands
    g.fillStyle = 'rgba(255,248,225,0.75)';
    for (const [x, y, w] of [[60, 380, 360], [520, 470, 420], [200, 560, 300]] as const) {
      g.beginPath(); g.roundRect(x, y, w, 34, 17); g.fill();
    }
    // the fold between the two panels
    g.fillStyle = 'rgba(90,60,20,0.35)'; g.fillRect(W / 2 - 3, 0, 6, H);
    // the dojo's name, brushed down the left panel
    g.fillStyle = '#141212'; g.font = `800 120px ${JP}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('道', 140, 190); g.fillText('場', 140, 330);
  });
}

/** The paper tag on a sword's scabbard: the job's name, brushed on washi. */
export function swordTag(title: string, dates: string) {
  return painted(256, 512, (g) => {
    g.fillStyle = '#B8231B'; g.fillRect(0, 0, 256, 18); g.fillRect(0, 494, 256, 18);
    g.fillStyle = '#141212'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save(); g.translate(128, 256); g.rotate(Math.PI / 2);
    fit(g, title.toUpperCase(), TITLE, 120, 440);
    g.fillText(title.toUpperCase(), 0, -26);
    g.font = BODY(44, 900); g.fillStyle = '#6B5B45';
    fit(g, dates, (px) => BODY(px, 900), 44, 440);
    g.fillText(dates, 0, 70);
    g.restore();
  }, () => washiCanvas(256, 512, title.length));
}

/** The front of the omikuji box: a paper sign reading おみくじ. */
export function omikujiSign() {
  return painted(256, 512, (g) => {
    g.fillStyle = '#B8231B'; g.fillRect(14, 14, 228, 484);
    g.fillStyle = '#FBF7EC'; g.fillRect(28, 28, 200, 456);
    g.fillStyle = '#141212'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 96px ${JP}`;
    ['お', 'み', 'く', 'じ'].forEach((ch, i) => g.fillText(ch, 128, 100 + i * 104));
  });
}

/** The fortune slip for a drawn stick: its number, a fortune drawn at random, the project. */
const FORTUNES = [['大吉', 'Great blessing'], ['中吉', 'Middle blessing'], ['小吉', 'Small blessing'], ['末吉', 'Future blessing']];
export function fortuneSlip(n: number, title: string) {
  const [fortune, english] = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  return painted(512, 896, (g) => {
    g.strokeStyle = '#B8231B'; g.lineWidth = 10; g.strokeRect(22, 22, 468, 852);
    g.lineWidth = 3; g.strokeRect(38, 38, 436, 820);
    g.fillStyle = '#141212'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `800 64px ${JP}`; g.fillText('おみくじ', 256, 110);
    g.font = `800 52px ${JP}`; g.fillText(`第 ${n} 番`, 256, 200);
    g.fillStyle = '#B8231B'; g.font = `800 200px ${JP}`; g.fillText(fortune, 256, 410);
    g.fillStyle = '#6B5B45'; g.font = BODY(34, 900); g.fillText(english.toUpperCase(), 256, 560);
    g.fillStyle = '#141212';
    // the project's name, on up to two lines
    const words = title.split(' '), lines: string[] = [];
    g.font = TITLE(64);
    for (const w of words) {
      const cur = lines[lines.length - 1];
      if (cur && g.measureText(`${cur} ${w}`).width < 420) lines[lines.length - 1] = `${cur} ${w}`; else lines.push(w);
    }
    lines.slice(0, 2).forEach((l, i) => { fit(g, l, TITLE, 64, 420); g.fillText(l, 256, 680 + i * 72); });
  }, () => washiCanvas(512, 896, n + 40));
}

/** The drum head: hide with a mitsudomoe (three swirling commas) in black and red. */
export function drumHead() {
  const [c, g] = canvas(512, 512);
  const grd = g.createRadialGradient(256, 256, 40, 256, 256, 256);
  grd.addColorStop(0, '#F1E4C4'); grd.addColorStop(0.85, '#E3CFA3'); grd.addColorStop(1, '#B89A64');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
  g.translate(256, 256);
  for (let k = 0; k < 3; k++) {
    g.save(); g.rotate((k * Math.PI * 2) / 3);
    g.fillStyle = k === 0 ? '#B8231B' : '#141212';
    g.beginPath();
    g.arc(0, -62, 56, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(56, -62);
    g.quadraticCurveTo(70, 40, -40, 110);
    g.quadraticCurveTo(10, 30, -56, -62);
    g.fill();
    g.restore();
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return finish(c);
}

/** A red paper lantern's skin: ribs and 侍 (samurai) on the front. Wraps round a cylinder. */
export function lanternArt() {
  return painted(1024, 512, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#A51D16'); grd.addColorStop(0.5, '#E2412C'); grd.addColorStop(1, '#A51D16');
    g.fillStyle = grd; g.fillRect(0, 0, 1024, 512);
    g.strokeStyle = 'rgba(60,8,4,0.35)'; g.lineWidth = 3;
    for (let y = 18; y < 512; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    g.fillStyle = '#141212'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 300px ${JP}`;
    g.fillText('侍', 256, 270);
    g.fillText('侍', 768, 270);
  });
}

/** A Daruma's face, centred on the sphere's front (+z is u = 0.25): white face, black brows, one eye filled in. */
export function darumaArt() {
  const [c, g] = canvas(512, 256);
  g.fillStyle = '#C8241A'; g.fillRect(0, 0, 512, 256);
  const cx = 128, cy = 118;
  g.fillStyle = '#FFF8EC'; g.beginPath(); g.ellipse(cx, cy, 52, 46, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#141212';
  // brows like cranes, beard like a turtle
  g.lineWidth = 7; g.strokeStyle = '#141212'; g.lineCap = 'round';
  g.beginPath(); g.arc(cx - 22, cy - 10, 18, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  g.beginPath(); g.arc(cx + 22, cy - 10, 18, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#141212'; g.lineWidth = 3;
  for (const dx of [-20, 20]) { g.beginPath(); g.arc(cx + dx, cy + 2, 11, 0, Math.PI * 2); g.fill(); g.stroke(); }
  g.fillStyle = '#141212'; g.beginPath(); g.arc(cx - 20, cy + 2, 6, 0, Math.PI * 2); g.fill();   // one eye: the wish is made
  g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 14, cy + 26); g.quadraticCurveTo(cx, cy + 34, cx + 14, cy + 26); g.stroke();
  // gold belly lettering
  g.fillStyle = '#E9C66A'; g.font = `800 40px ${JP}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('吉', cx, cy + 86);
  const t = finish(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/** Tsuka-ito: the diamond-wrapped silk over white rayskin on a sword's grip. */
export function gripWrap(silk: string) {
  const [c, g] = canvas(128, 512);
  g.fillStyle = '#F2EDE2'; g.fillRect(0, 0, 128, 512);
  g.fillStyle = silk;
  for (let y = -64; y < 576; y += 64) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(64, y + 32); g.lineTo(0, y + 64); g.fill();
    g.beginPath(); g.moveTo(128, y + 32); g.lineTo(64, y + 64); g.lineTo(128, y + 96); g.fill();
  }
  const t = finish(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
