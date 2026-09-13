"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { BuckBoostVisual } from "@/components/projects/visuals/buck-boost-visual";

const BuckBoostScene = dynamic(
  () => import("@/components/projects/scenes/buck-boost-scene").then((m) => m.BuckBoostScene),
  { ssr: false },
);

/**
 * Drop-in replacement for the flat BuckBoostVisual in the Projects grid: a
 * realistic 3D board (modeled on the actual KiCad renders) with a small
 * traveling glow tracing the Vin -> inductor -> regulator -> Vout path and
 * a lit power-good indicator, instead of a static waveform diagram.
 * Ignores the `active`/`reducedMotion` props ProjectEntry passes
 * (Object3DViewer tracks both itself) so it still satisfies VisualProps.
 */
export function BuckBoost3DVisual() {
  return (
    <Object3DViewer
      Scene={BuckBoostScene}
      Fallback={BuckBoostVisual}
      ariaLabel="Interactive 3D model of the 5V buck-boost converter board, with a glow tracing current from the input through the inductor and regulator to the output. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
