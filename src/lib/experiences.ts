import type { ComponentType } from "react";
import { YuPingLogo } from "@/components/work/yu-ping-logo";

export type ExperienceVisual = "building-systems" | "pcb-fluid-thermal" | "pcb-motor";

export type CompanyLogo =
  | { kind: "image"; src: string; alt: string; onLight?: boolean }
  | { kind: "mark"; Component: ComponentType<{ className?: string }> };

export type Experience = {
  id: string;
  /** Use the literal string "[COMPANY NAME]" when a company is not yet known. */
  company: string;
  /** null when no logo asset exists yet — render the text-only fallback, never a fabricated mark. */
  logo: CompanyLogo | null;
  position: string;
  location: string;
  date: string;
  description: string;
  technologies: string[];
  visual: ExperienceVisual;
};

export const experiences: Experience[] = [
  {
    id: "kaohsiung",
    company: "Yu-Ping",
    logo: { kind: "mark", Component: YuPingLogo },
    position: "Electrical Design Intern",
    location: "Kaohsiung, Taiwan",
    date: "Summer 2025",
    description:
      "In Kaohsiung, I modeled switchgear, panelboards, and conduit runs in Revit against NEC clearances, ran Navisworks clash detection to resolve about 30 HVAC and plumbing conflicts, and wrote Excel macros to catch voltage and phase issues in commissioning logs.",
    technologies: ["Revit", "Navisworks", "NEC", "Clash Detection", "Commissioning", "Excel"],
    visual: "building-systems",
  },
  {
    id: "droxo",
    company: "Droxo",
    logo: { kind: "image", src: "/logos/droxo.png", alt: "Droxo Tech logo" },
    position: "Hardware Engineering Intern",
    location: "Tainan, Taiwan",
    date: "Summer 2024",
    description:
      "At Droxo I designed a spray-flow sensor board in KiCad with flowmeter input, current monitoring, and transient protection, calibrated a diaphragm pump across different nozzles, and traced 25 field failures back to a thermal hotspot that led to a copper-pour redesign.",
    technologies: [
      "KiCad",
      "Flowmeter",
      "Current Monitor",
      "Transient Protection",
      "Thermal",
      "Copper Pour",
      "25 Field Failures",
    ],
    visual: "pcb-fluid-thermal",
  },
  {
    id: "skymul",
    company: "Skymul",
    logo: { kind: "image", src: "/logos/skymul.png", alt: "SkyMul logo" },
    position: "Electrical Engineering Intern",
    location: "Peachtree Corners, GA",
    date: "Summer 2023",
    description:
      "At Skymul I designed DRV8353 gate-drive circuitry in Altium for a rebar-tying drone, sized bulk capacitance in LTspice, routed high-current motor phases and CAN on a four-layer board, then ran a 40-point validation matrix to qualify the actuator driver for flight.",
    technologies: ["Altium", "DRV8353", "LTspice", "CAN", "Motor Phase", "4-Layer PCB", "40-Point Validation"],
    visual: "pcb-motor",
  },
];
