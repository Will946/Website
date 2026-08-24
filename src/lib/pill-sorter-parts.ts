export type PartId = "input" | "sorting" | "output" | "motor" | "pcb";

export type PartConfig = {
  id: PartId;
  label: string;
  /** Offset added to the part's assembled position when the model is exploded. */
  explodeOffset: readonly [number, number, number];
  tone: "signal" | "cyan" | "amber";
};

/**
 * Labels only exist for parts actually present in the model below — this
 * is a conceptual/illustrative build, not a claim about the real machine's
 * internals.
 */
export const pillSorterParts: PartConfig[] = [
  { id: "input", label: "Hopper Array", explodeOffset: [0, 1.0, -0.1], tone: "cyan" },
  { id: "sorting", label: "Dispensing Disc", explodeOffset: [0, 0.45, 0], tone: "signal" },
  { id: "output", label: "Output Chute", explodeOffset: [0, 0.1, 0.6], tone: "amber" },
  { id: "motor", label: "Motor", explodeOffset: [0, -0.55, 0], tone: "signal" },
  { id: "pcb", label: "PCB", explodeOffset: [0.8, 0, 0.1], tone: "cyan" },
];
