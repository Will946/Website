"use client";

import { useRef, type ComponentType } from "react";
import { useInView } from "motion/react";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { SceneLoading } from "@/components/three/scene-loading";
import { useWebGLSupport } from "@/hooks/use-webgl-support";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export type Object3DSceneProps = { active: boolean; reducedMotion: boolean };

type Object3DViewerProps = {
  Scene: ComponentType<Object3DSceneProps>;
  Fallback: ComponentType<Object3DSceneProps>;
  label?: string;
  ariaLabel: string;
  className?: string;
};

/**
 * Shared lazy-mount gate for a Work/project 3D viewer: the ~900KB
 * three.js/R3F/drei chunk isn't fetched until the card is actually
 * scrolled near (same pattern that fixed an unnecessary fetch-on-every-
 * page-load bug in Current Project), falls back to a static diagram when
 * WebGL is unavailable, and pauses continuous animation when scrolled
 * away without unmounting the canvas.
 */
export function Object3DViewer({ Scene, Fallback, label = "Drag to rotate · Scroll to zoom", ariaLabel, className }: Object3DViewerProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25, margin: "0px 0px -10% 0px" });
  const hasBeenNear = useInView(ref, { once: true, amount: 0, margin: "600px 0px 600px 0px" });
  const webglSupported = useWebGLSupport();

  const showScene = hasBeenNear && webglSupported === true;
  const showFallback = hasBeenNear && webglSupported === false;
  const showLoading = hasBeenNear && webglSupported === null;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      className={cn("relative h-[320px] w-full border border-border bg-surface sm:h-[380px]", className)}
    >
      {showScene && <Scene active={inView} reducedMotion={reducedMotion} />}
      {showFallback && <Fallback active={inView} reducedMotion={reducedMotion} />}
      {showLoading && <SceneLoading />}

      {showScene && (
        <div className="pointer-events-none absolute left-3 top-3">
          <TechnicalLabel>{label}</TechnicalLabel>
        </div>
      )}
    </div>
  );
}
