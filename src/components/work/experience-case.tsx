"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { Heading } from "@/components/ui/heading";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { CompanyLogo } from "@/components/work/company-logo";
import { Object3DViewer, type Object3DSceneProps } from "@/components/three/object-3d-viewer";
import type { Experience } from "@/lib/experiences";
import { cn } from "@/lib/utils";
import { BuildingSystemsVisual } from "@/components/work/visuals/building-systems-visual";
import { PcbFluidThermalVisual } from "@/components/work/visuals/pcb-fluid-thermal-visual";
import { PcbMotorVisual } from "@/components/work/visuals/pcb-motor-visual";

export type VisualProps = Object3DSceneProps;

const YuPingScene = dynamic(() => import("@/components/work/scenes/yu-ping-scene").then((m) => m.YuPingScene), {
  ssr: false,
});
const DroxoScene = dynamic(() => import("@/components/work/scenes/droxo-scene").then((m) => m.DroxoScene), {
  ssr: false,
});
const SkymulScene = dynamic(() => import("@/components/work/scenes/skymul-scene").then((m) => m.SkymulScene), {
  ssr: false,
});

const sceneConfig: Record<
  Experience["visual"],
  { Scene: ComponentType<Object3DSceneProps>; Fallback: ComponentType<Object3DSceneProps>; ariaLabel: string }
> = {
  "building-systems": {
    Scene: YuPingScene,
    Fallback: BuildingSystemsVisual,
    ariaLabel:
      "Interactive 3D model of a wall-mounted AC unit with conduit runs to an electrical panel, representing the electrical design work at Yu-Ping. Drag to rotate, scroll to zoom.",
  },
  "pcb-fluid-thermal": {
    Scene: DroxoScene,
    Fallback: PcbFluidThermalVisual,
    ariaLabel:
      "Interactive 3D model of the spray-flow cart (tank, pump housing, and sensor PCB) representing the hardware work at Droxo. Drag to rotate, scroll to zoom.",
  },
  "pcb-motor": {
    Scene: SkymulScene,
    Fallback: PcbMotorVisual,
    ariaLabel:
      "Interactive 3D model of the rebar-tying drone with its motor-driver electronics, representing the work at Skymul. Drag to rotate, scroll to zoom.",
  },
};

type ExperienceCaseProps = {
  experience: Experience;
  index: number;
};

export function ExperienceCase({ experience, index }: ExperienceCaseProps) {
  const reverse = index % 2 === 1;
  const { Scene, Fallback, ariaLabel } = sceneConfig[experience.visual];

  const textColStart = reverse ? "lg:col-start-8 lg:col-span-5" : "lg:col-start-1 lg:col-span-5";
  const visualColStart = reverse ? "lg:col-start-1 lg:col-span-7" : "lg:col-start-6 lg:col-span-7";

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10">
      <div className={cn("contents lg:flex lg:flex-col lg:gap-6 lg:row-start-1", textColStart)}>
        <div className="order-1 flex items-center gap-3 lg:order-none">
          <TechnicalLabel tone="signal">{`Work / ${String(index + 1).padStart(2, "0")}`}</TechnicalLabel>
          <CompanyLogo company={experience.company} logo={experience.logo} />
        </div>

        <Heading level="h1" as="h3" className="order-2 lg:order-none">
          {experience.position}
        </Heading>

        <p className="order-3 font-mono text-small uppercase tracking-label text-fg-muted lg:order-none">
          {experience.location} · {experience.date}
        </p>

        <p className="order-5 max-w-md text-body text-fg-muted lg:order-none">{experience.description}</p>

        <div className="order-6 flex flex-wrap gap-2 lg:order-none">
          {experience.technologies.map((tech) => (
            <TechnicalLabel key={tech}>{tech}</TechnicalLabel>
          ))}
        </div>
      </div>

      <Object3DViewer
        Scene={Scene}
        Fallback={Fallback}
        ariaLabel={ariaLabel}
        className={cn("order-4 lg:order-none lg:row-start-1", visualColStart)}
      />
    </div>
  );
}
