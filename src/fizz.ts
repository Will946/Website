// The spray when a can pops: foam and droplets drawn on one full-window canvas that lets clicks through.
// burst() adds particles at a point; the loop runs only while some are still in the air.

type Drop = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; color: string };

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let drops: Drop[] = [];
let running = false;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'fizz-layer';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas!.width = innerWidth * dpr;
    canvas!.height = innerHeight * dpr;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);
}

/** Spray from (x, y) in window px. `color` tints the droplets; the foam is always white. */
export function burst(x: number, y: number, color: string, amount = 1) {
  ensureCanvas();
  const n = Math.round(150 * amount);
  for (let i = 0; i < n; i++) {
    const foam = i % 3 !== 0;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (foam ? 0.9 : 1.4);
    const speed = (foam ? 6 : 8) + Math.random() * (foam ? 7 : 10);
    const max = 50 + Math.random() * 60;
    drops.push({
      x: x + (Math.random() - 0.5) * 18, y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r: foam ? 3 + Math.random() * 7 : 1.5 + Math.random() * 3,
      life: max, max,
      color: foam ? 'rgba(255,255,255,' : color,
    });
  }
  if (!running) { running = true; requestAnimationFrame(step); }
}

function step() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const d of drops) {
    d.vy += 0.38;
    d.vx *= 0.985;
    d.x += d.vx;
    d.y += d.vy;
    d.life -= 1;
    const a = Math.max(0, d.life / d.max);
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * (0.6 + 0.4 * a), 0, Math.PI * 2);
    if (d.color.startsWith('rgba')) {
      ctx.fillStyle = `${d.color}${(0.9 * a).toFixed(3)})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(20,20,20,${(0.18 * a).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.globalAlpha = a;
      ctx.fillStyle = d.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  drops = drops.filter((d) => d.life > 0 && d.y < innerHeight + 40);
  if (drops.length) requestAnimationFrame(step);
  else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}
