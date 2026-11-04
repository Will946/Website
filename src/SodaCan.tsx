// One soda can on the fridge shelf. Grab it and shake it up and down: every change of direction adds
// pressure (shown as PSI under the can, 30 at rest, pops at 60). Let go and it settles back down.
// When it pops, the tab flips, foam sprays out (fizz.ts) and onPop sends the page to its section.
// The keyboard gets the same thing: Enter or Space shakes it for you.
import { useEffect, useRef, useState } from 'react';
import { burst } from './fizz';

export type Can = {
  id: string;        // section to open
  label: string;     // printed on the can
  flavor: string;
  color: string;
  ink: string;       // outline and shadow colour for the label
};

const REST_PSI = 30, POP_PSI = 60;
const PER_SHAKE = 0.085;     // pressure added per change of direction (12 of them pops it)
const MIN_LEG = 14;          // px the can must travel before a change of direction counts
const REACH = 80;            // px the can follows the pointer up or down
const LEAK = 0.22;           // pressure lost per second while nobody is shaking

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function SodaCan({ can, onPop }: { can: Can; onPop: (id: string) => void }) {
  const button = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const st = useRef({ dragging: false, startY: 0, lastY: 0, offset: 0, dir: 0, leg: 0, moved: 0, pressure: 0, popped: false, auto: 0 });
  const [pressure, setPressure] = useState(0);
  const [popped, setPopped] = useState(false);
  const [hint, setHint] = useState(false);

  // One loop per can: leak pressure, settle the can when let go, and jitter it as it fills up.
  useEffect(() => {
    let raf = 0, then = performance.now(), shown = -1;
    const tick = (now: number) => {
      const s = st.current, dt = Math.min(0.05, (now - then) / 1000);
      then = now;
      if (!s.dragging && !s.auto && !s.popped) s.pressure = Math.max(0, s.pressure - dt * LEAK);
      if (!s.dragging && !s.auto) s.offset *= Math.pow(0.0005, dt);
      const jitter = s.popped || reducedMotion() ? 0 : s.pressure > 0.3 ? (Math.random() - 0.5) * s.pressure * 8 : 0;
      if (body.current) body.current.style.transform = `translateY(${s.offset.toFixed(1)}px) rotate(${jitter.toFixed(2)}deg)`;
      const p = Math.round(s.pressure * 50) / 50;
      if (p !== shown) { shown = p; setPressure(p); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pop = () => {
    const s = st.current;
    if (s.popped) return;
    s.popped = true;
    s.dragging = false;
    clearInterval(s.auto); s.auto = 0;
    s.pressure = 1;
    setPopped(true);
    const r = (body.current ?? button.current)!.getBoundingClientRect();
    if (!reducedMotion()) burst(r.left + r.width / 2, r.top + r.height * 0.08, can.color);
    setTimeout(() => onPop(can.id), reducedMotion() ? 0 : 700);
    setTimeout(() => { s.popped = false; s.pressure = 0; setPopped(false); }, 2200);
  };

  const shake = (dy: number) => {
    const s = st.current;
    if (!dy) return;
    const dir = Math.sign(dy);
    if (dir !== s.dir) {
      if (s.leg >= MIN_LEG) s.pressure = Math.min(1, s.pressure + PER_SHAKE);
      s.dir = dir;
      s.leg = 0;
    }
    s.leg += Math.abs(dy);
    if (s.pressure >= 1) pop();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const s = st.current;
    if (s.popped) return;
    button.current?.setPointerCapture(e.pointerId);
    s.dragging = true;
    s.startY = e.clientY - s.offset;
    s.lastY = e.clientY;
    s.dir = 0; s.leg = 0; s.moved = 0;
    setHint(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.dragging) return;
    const dy = e.clientY - s.lastY;
    s.lastY = e.clientY;
    s.moved += Math.abs(dy);
    s.offset = Math.max(-REACH, Math.min(REACH, e.clientY - s.startY));
    shake(dy);
  };
  const onPointerUp = () => {
    const s = st.current;
    if (!s.dragging) return;
    s.dragging = false;
    if (s.moved < 6 && !s.popped) { setHint(true); setTimeout(() => setHint(false), 1600); }
  };

  // Keyboard: shake it automatically until it pops.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const s = st.current;
    if (s.popped || s.auto) return;
    if (reducedMotion()) { pop(); return; }
    let up = true;
    s.auto = window.setInterval(() => {
      const target = up ? -36 : 36;
      shake(target - s.offset);
      s.offset = target;
      up = !up;
    }, 70);
  };

  const psi = Math.round(REST_PSI + pressure * (POP_PSI - REST_PSI));
  const size = Math.min(28, 112 / (can.label.length * 0.56));

  return (
    <div className="can-slot" style={{ '--can': can.color, '--ink': can.ink } as React.CSSProperties}>
      <button
        ref={button}
        type="button"
        className={`can${popped ? ' popped' : ''}`}
        aria-label={`${can.label}: shake this can to open it`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div ref={body} className="can-body">
          <svg viewBox="0 0 100 200" aria-hidden="true">
            <defs>
              <linearGradient id={`metal-${can.id}`} x1="0" x2="1">
                <stop offset="0" stopColor="#8E959E" /><stop offset=".3" stopColor="#EEF1F4" />
                <stop offset=".55" stopColor="#B5BBC2" /><stop offset=".8" stopColor="#F4F6F8" /><stop offset="1" stopColor="#8E959E" />
              </linearGradient>
              <linearGradient id={`shade-${can.id}`} x1="0" x2="1">
                <stop offset="0" stopColor="#000" stopOpacity=".38" /><stop offset=".16" stopColor="#000" stopOpacity="0" />
                <stop offset=".28" stopColor="#fff" stopOpacity=".5" /><stop offset=".4" stopColor="#fff" stopOpacity="0" />
                <stop offset=".78" stopColor="#000" stopOpacity=".06" /><stop offset="1" stopColor="#000" stopOpacity=".42" />
              </linearGradient>
            </defs>
            <path d="M14 32 L20 18 H80 L86 32 Z" fill={`url(#metal-${can.id})`} />
            <path d="M14 32 L10 42 V174 Q10 186 22 188 H78 Q90 186 90 174 V42 L86 32 Z" fill={can.color} />
            <text
              x="50" y="104" transform="rotate(-90 50 104)" textAnchor="middle" dominantBaseline="central"
              className="can-label" fontSize={size} stroke={can.ink} strokeWidth={size * 0.16}
            >{can.label}</text>
            <text x="50" y="171" textAnchor="middle" className="can-small">355 mL</text>
            <path d="M14 32 L10 42 V174 Q10 186 22 188 H78 Q90 186 90 174 V42 L86 32 Z" fill={`url(#shade-${can.id})`} />
            <path d="M22 188 H78 Q88 187 89 181 V185 Q86 195 76 195 H24 Q14 195 11 185 V181 Q12 187 22 188 Z" fill={`url(#metal-${can.id})`} />
            <ellipse cx="50" cy="18" rx="30" ry="5" fill="#CDD2D8" stroke="#7A818A" strokeWidth="1.2" />
            <ellipse className="can-hole" cx="44" cy="18" rx="7" ry="2.6" fill="#1b1b1b" />
            <g className="can-tab">
              <rect x="40" y="13.5" width="22" height="7" rx="3.5" fill="#B4BAC1" stroke="#6E757D" strokeWidth="1" />
              <circle cx="56" cy="17" r="1.9" fill="#6E757D" />
            </g>
          </svg>
        </div>
      </button>
      <div className="psi" aria-hidden="true">
        <span className="psi-bar"><i style={{ transform: `scaleX(${pressure})` }} /></span>
        <span className="psi-num">{popped ? 'POP!' : `${psi} PSI`}</span>
      </div>
      <p className="can-flavor">{can.flavor}</p>
      {hint && <span className="can-hint" role="status">Shake it up and down</span>}
    </div>
  );
}
