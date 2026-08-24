export type CurrentProject = {
  title: string;
  description: string;
  challenge: string;
  status: "in-progress" | "complete";
  statusLabel: string;
};

export const currentProject: CurrentProject = {
  title: "Automatic Pill Sorter",
  description:
    "An automatic pill dispenser that fills a weekly pill organizer for you. Load each hopper with one specific pill, enter what you need to take that day, and the disc rotates each loaded hopper into position to dispense it instead of you sorting pills into the organizer by hand. A custom PCB I designed drives the motor and tracks which hopper is lined up.",
  challenge:
    "Getting the correct pill out of the correct hopper is solved. What's not solved is the next step: routing that pill into a specific compartment of a weekly pill organizer instead of one shared output, at a size that still fits on a nightstand. I don't have a pick-and-place mechanism worked out yet for that part.",
  status: "in-progress",
  statusLabel: "In Progress",
};
