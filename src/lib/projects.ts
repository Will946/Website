export type ProjectId =
  | "formula-sae"
  | "buck-boost"
  | "cocktail-machine"
  | "gnss"
  | "motor-driver"
  | "usb-c-pd"
  | "sirgrab"
  | "cprpal"
  | "bloom";

export type ProjectSize = "large" | "medium" | "compact";

export type Project = {
  id: ProjectId;
  title: string;
  /** Short form for the sticky index — full titles truncate awkwardly there. */
  navLabel: string;
  /** Shown always — the personality line. */
  hook: string;
  /** Shown on "Inspect Project" — the technical follow-through. */
  detail: string;
  technologies: string[];
  size: ProjectSize;
};

export const projects: Project[] = [
  {
    id: "formula-sae",
    title: "USC Formula SAE · Electronics Team",
    navLabel: "Formula SAE",
    hook: "The car doesn't move until every wire on this list checks out.",
    detail:
      "I designed the tractive-system low-voltage harness (120 sealed contacts, twisted-pair CAN), validated the shutdown circuit across 50 simulated fault conditions with the AIR opening in under 10ms, sized the precharge resistor to limit inrush to 8A into the 400µF DC-link, and logged pack voltage, phase current, and brake pressure over CAN at 100Hz.",
    technologies: [
      "120 Sealed Contacts",
      "Twisted-Pair CAN",
      "50 Fault Conditions",
      "AIR < 10ms",
      "8A Inrush",
      "400uF DC-Link",
      "100Hz CAN Log",
    ],
    size: "large",
  },
  {
    id: "buck-boost",
    title: "5V Buck-Boost Converter",
    navLabel: "Buck-Boost",
    hook: "Feed it a dying battery or an overachieving wall adapter, it hands back the same unbothered 5V either way.",
    detail:
      "Built around TI's TPS63070 single-inductor buck-boost, regulating anywhere from 3V to 16V input down (or up) to a steady 5V, with a TI LM66200 ideal-diode controller in front for reverse-polarity protection instead of the usual Schottky-diode voltage drop, and a status LED wired straight off the regulator's power-good pin.",
    technologies: ["TPS63070", "LM66200", "3-16V Input", "Ideal Diode", "5V Output"],
    size: "compact",
  },
  {
    id: "cocktail-machine",
    title: "Cocktail Machine",
    navLabel: "Cocktail Machine",
    hook: "Built so I never have to make eye contact with anyone at 2am.",
    detail:
      "An ESP32-S3 brain, four TB6612FNG motor drivers, and just enough plumbing to keep the whole thing from flooding my desk.",
    technologies: ["ESP32-S3", "4× TB6612FNG"],
    size: "large",
  },
  {
    id: "gnss",
    title: "GNSS Receiver",
    navLabel: "GNSS Receiver",
    hook: "A GNSS receiver project built around the u-blox ZED-F9P, patient enough to wait for enough satellites to agree on where it actually is.",
    detail:
      "Breaks out a u-blox ZED-F9P onto a carrier board with UART, SPI, and I2C headers, a coin-cell-backed RTC for faster fixes on power-up, and a DSEL jumper to flip the module between SPI and UART. Onboard LEDs track power, PPS timing pulses, RTK fix status, and the geofence output, with SAFE and INT lines broken out for whatever needs to react to them. Still working out exactly how precise \"precise\" turns out to be.",
    technologies: ["u-blox ZED-F9P", "RTK", "PPS", "UART / SPI / I2C", "Geofence", "Battery-Backed RTC"],
    size: "medium",
  },
  {
    id: "motor-driver",
    title: "12V Motor Driver",
    navLabel: "Motor Driver",
    hook: "Just enough decoupling to keep the magic smoke where it belongs.",
    detail:
      "A TB6612FNG breakout for driving a 12V DC motor forward, reverse, and everywhere in between, across two independent channels.",
    technologies: ["TB6612FNG", "12V DC Motor", "2 Channels"],
    size: "medium",
  },
  {
    id: "usb-c-pd",
    title: "USB-C PD Trigger",
    navLabel: "USB-C PD",
    hook: "Politely asks a USB-C charger for way more power than it should reasonably hand over, and usually gets it.",
    detail: "Negotiates up through the PD voltage ladder to 20V, then holds it steady out to a barrel jack for whatever needs feeding.",
    technologies: ["USB-C PD", "20V"],
    size: "compact",
  },
  {
    id: "sirgrab",
    title: "SirGrab",
    navLabel: "SirGrab",
    hook: "A multi-joint robotic arm that reaches down, grips whatever's in front of it, and moves it somewhere else, which is either the beginning of automation or the beginning of a very expensive game of fetch.",
    detail:
      "Seven degrees of freedom driven by eight TD-8120MG servos off a custom PWM driver board built on Adafruit's design, with an Arduino Uno R4 as the brain and Google MediaPipe doing the actual hand-tracking that tells it where to reach.",
    technologies: ["Arduino Uno R4", "MediaPipe", "7-DOF", "8x TD-8120MG", "Custom PWM Driver"],
    size: "large",
  },
  {
    id: "cprpal",
    title: "CPRPal",
    navLabel: "CPRPal",
    hook: "Keeps better rhythm than most drummers I know.",
    detail:
      "My USC capstone project: CPRPal sits on the chest during compressions and paces you with its LED ring at the AHA-recommended 100 to 120 compressions per minute.",
    technologies: ["100–120 CPM", "LED Ring"],
    size: "compact",
  },
  {
    id: "bloom",
    title: "Bloom",
    navLabel: "Bloom",
    hook: "Genuinely impressive when it works. A little sad when it only half-opens.",
    detail:
      "Bloom is an air quality monitor where the reading is the mechanism: a servo-driven petal linkage that opens or closes continuously with AQI, so the openness of the flower is the analog readout, with a center LED as a secondary green / yellow / red indicator.",
    technologies: ["Servo-Driven Linkage", "AQI → Position", "RGB Indicator"],
    size: "large",
  },
];
