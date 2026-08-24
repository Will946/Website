"use client";

import { useEffect, useRef } from "react";
import { animate, createTimeline, cubicBezier } from "animejs";
import {
  buildPath,
  createWaveformParams,
  sampleWaveform,
  type WaveformParams,
} from "@/lib/waveform";
import type { PointerState } from "@/hooks/use-pointer";
import { ease } from "@/lib/motion";

const VIEW_W = 1000;
const VIEW_H = 280;
const SAMPLES = 160;
/** Radians/sec of continuous phase drift — the "always alive" baseline motion. */
const PHASE_SPEED = 0.34;

type WaveformProps = {
  pointer: React.RefObject<PointerState>;
  reducedMotion: boolean;
  className?: string;
};

/**
 * The hero's signal trace. Anime.js drives a JS params object through a
 * looping timeline (idle → build → transient pulse → noise → settle) —
 * see the six-step behavior this implements. A plain requestAnimationFrame
 * loop reads that object every frame to redraw the SVG path via direct
 * attribute writes (not React state) so 60fps drawing never triggers a
 * re-render. Paused via IntersectionObserver when scrolled offscreen.
 */
export function Waveform({ pointer, reducedMotion, className }: WaveformProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const ch1Ref = useRef<SVGPathElement>(null);
  const ch2Ref = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);

  const paramsRef = useRef<WaveformParams>(createWaveformParams({ amplitude: 0 }));
  const phaseRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const params = paramsRef.current;
    const baseline = VIEW_H / 2;

    function render(t: number) {
      const hasPointer = pointer.current.x !== 0 || pointer.current.y !== 0;
      const probeX = hasPointer ? (pointer.current.x + 1) / 2 : null;

      ch1Ref.current?.setAttribute("d", buildPath(SAMPLES, t, params, probeX, VIEW_W, VIEW_H, baseline));

      const ch2Params: WaveformParams = {
        ...params,
        frequency: params.frequency * 0.82,
        amplitude: params.amplitude * 0.42,
        pulseAmp: params.pulseAmp * 0.5,
      };
      ch2Ref.current?.setAttribute(
        "d",
        buildPath(SAMPLES, t * 0.9 + 1.7, ch2Params, null, VIEW_W, VIEW_H, baseline),
      );

      if (pulseRef.current) {
        if (params.pulseAmp > 0.05) {
          const y = baseline - sampleWaveform(params.pulseCenter, t, params, null) * (VIEW_H * 0.36);
          pulseRef.current.setAttribute("cx", String(params.pulseCenter * VIEW_W));
          pulseRef.current.setAttribute("cy", String(y));
          pulseRef.current.setAttribute("opacity", String(Math.min(1, params.pulseAmp)));
        } else {
          pulseRef.current.setAttribute("opacity", "0");
        }
      }
    }

    if (reducedMotion) {
      params.amplitude = 0.5;
      params.frequency = 1;
      params.noise = 0.015;
      params.pulseAmp = 0;
      render(0);
      return;
    }

    animate(params, { amplitude: 0.55, duration: 1400, ease: "outQuad" });

    const timeline = createTimeline({ loop: true });
    timeline
      .add(params, { amplitude: 0.55, frequency: 1, duration: 2200, ease: "inOutSine" })
      .add(params, { amplitude: 0.78, frequency: 1.55, duration: 900, ease: "inOutQuad" })
      .add(params, { pulseAmp: 1.2, pulseCenter: 0.08, duration: 180, ease: "outExpo" })
      .add(params, { pulseCenter: 0.92, pulseAmp: 0, duration: 520, ease: cubicBezier(...ease.signal) })
      .add(params, { noise: 0.16, duration: 260, ease: "outQuad" })
      .add(params, { noise: 0.02, amplitude: 0.5, frequency: 1, duration: 1600, ease: cubicBezier(...ease.signal) })
      .add(params, { amplitude: 0.5, duration: 2600, ease: "linear" });

    function loop(now: number) {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      phaseRef.current += dt * PHASE_SPEED;

      if (visibleRef.current) render(phaseRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timeline.revert();
    };
  }, [pointer, reducedMotion]);

  return (
    <svg
      ref={containerRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter id="hero-signal-glow" x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        ref={ch2Ref}
        fill="none"
        stroke="var(--color-cyan)"
        strokeOpacity={0.35}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <path
        ref={ch1Ref}
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        filter="url(#hero-signal-glow)"
      />
      <circle ref={pulseRef} r={4} fill="var(--color-amber)" opacity={0} filter="url(#hero-signal-glow)" />
    </svg>
  );
}
