// The résumé reel's open state, shared with the 3D stage (which stops rendering while the reel
// covers the screen) and the download it starts early when the button is hovered.
import { createStore } from '../arcade/store';

/** open: the reel is up. dimmed: the arcade sits behind the loading dots. covered: it is hidden. */
export const [reel, useReel] = createStore({ open: false, dimmed: false, covered: false });

// A still of the arcade for the ripples to bend. The 3D canvas only holds its picture during the frame
// it was drawn in, so the stage copies it from inside that frame (ArcadeShot in Stage.tsx).
let wanted: ((shot: HTMLCanvasElement | null) => void) | null = null;
let redraw: (() => void) | null = null;
export const arcadeShot = {
  /** The stage says how to ask for a frame. */
  attach(fn: () => void) { redraw = fn; },
  request() {
    return new Promise<HTMLCanvasElement | null>((res) => {
      wanted = res;
      redraw?.();
      setTimeout(() => { if (wanted === res) { wanted = null; res(null); } }, 400);
    });
  },
  /** Called at the end of every frame the stage draws. */
  take(source: HTMLCanvasElement) {
    if (!wanted) return;
    const shot = document.createElement('canvas');
    shot.width = source.width; shot.height = source.height;
    const g = shot.getContext('2d');
    g?.drawImage(source, 0, 0);
    // the name and the badge are canvases of their own over the 3D one: they belong in the picture
    document.querySelectorAll<HTMLCanvasElement>('.hero-name canvas, .hero-badge canvas').forEach((over) => {
      const r = over.getBoundingClientRect(), k = source.width / innerWidth;
      g?.drawImage(over, r.left * k, r.top * k, r.width * k, r.height * k);
    });
    wanted(shot);
    wanted = null;
  },
};

/** Was: starts the clip's download ahead of the click. There is no clip now, so there is nothing to fetch. */
export function loadReel() { /* no clip */ }
