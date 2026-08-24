"use client";

import { Html } from "@react-three/drei";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { PartConfig } from "@/lib/pill-sorter-parts";

type PartLabelProps = {
  part: PartConfig;
  position: [number, number, number];
};

export function PartLabel({ part, position }: PartLabelProps) {
  return (
    <Html position={position} center distanceFactor={8} occlude={false} zIndexRange={[10, 0]}>
      <div className="pointer-events-none -translate-y-full pb-2">
        <TechnicalLabel tone={part.tone}>{part.label}</TechnicalLabel>
      </div>
    </Html>
  );
}
