// Work, school and contests, from the résumé. The vending machine sells these as cards (so each is
// also a Project: title, blurb, rarity and tags print on the card), and the Experience section
// below the arcade lists them in full.
import type { Project } from './projects';

export interface Experience extends Project {
  role: string;
  dates: string;
  bullets: string[];
  /** Listed under About instead of Experience. */
  about?: boolean;
}

export const EXPERIENCE: Experience[] = [
  {
    id: 'yu-ping', title: 'Yu-Ping', role: 'Electrical Design Intern', dates: 'Summer 2025',
    blurb: 'Electrical Design Intern · Kaohsiung, Taiwan', rarity: 'LEGENDARY', tags: ['Revit', 'Navisworks', 'NEC'],
    bullets: [
      'Modeled switchgear, panelboards and conduit runs in Revit against NEC clearances.',
      'Ran Navisworks clash detection to resolve about 30 HVAC and plumbing conflicts.',
      'Wrote Excel macros to catch voltage and phase issues in commissioning logs.',
    ],
  },
  {
    id: 'droxo', title: 'Droxo', role: 'Hardware Engineering Intern', dates: 'Summer 2024',
    blurb: 'Hardware Engineering Intern · Tainan, Taiwan', rarity: 'RARE', tags: ['KiCad', 'Thermal', 'Copper pour'],
    bullets: [
      'Designed a spray-flow sensor board in KiCad with flowmeter input, current monitoring and transient protection.',
      'Calibrated a diaphragm pump across different nozzles.',
      'Traced 25 field failures back to a thermal hotspot, which led to a copper-pour redesign.',
    ],
  },
  {
    id: 'skymul', title: 'Skymul', role: 'Electrical Engineering Intern', dates: 'Summer 2023',
    blurb: 'Electrical Engineering Intern · Peachtree Corners, GA', rarity: 'RARE', tags: ['Altium', 'DRV8353', 'LTspice'],
    bullets: [
      'Designed DRV8353 gate-drive circuitry in Altium for a rebar-tying drone.',
      'Sized bulk capacitance in LTspice and routed high-current motor phases and CAN on a four-layer board.',
      'Ran a 40-point validation matrix to qualify the actuator driver for flight.',
    ],
  },
  {
    id: 'usc', title: 'USC', role: 'Electrical Engineering', dates: 'B.S. + M.S.', about: true,
    blurb: 'University of Southern California · B.S. ECE, M.S. EE', rarity: 'COMMON', tags: ['B.S. ECE', 'M.S. EE', 'Formula SAE'],
    bullets: [
      'B.S. in Electrical and Computer Engineering, University of Southern California.',
      'M.S. in Electrical Engineering, University of Southern California.',
      'USC Formula SAE electronics team. Capstone: CPRPal.',
    ],
  },
  {
    id: 'off-the-clock', title: 'Off the clock', role: 'From Atlanta, Georgia', dates: '100% human', about: true,
    blurb: 'Golf, fishing, Elden Ring, board games, eating', rarity: 'SHINY', tags: ['Golf', 'Elden Ring', 'Top 40 Beli'],
    bullets: [
      'Golf, fishing and the occasional spikeball (2nd place once, middle school tournament).',
      'Video games, currently Elden Ring.',
      'Board games: Risk and Ticket to Ride are my go-tos.',
      'Top 40 Beli eater in Georgia.',
    ],
  },
];

export const SKILLS: { group: string; items: string[] }[] = [
  { group: 'PCB & EDA', items: ['KiCad', 'Altium', 'LTspice', '4-layer PCB', 'Copper pour', 'Thermal design'] },
  { group: 'Microcontrollers', items: ['STM32F4', 'STM32F103', 'ESP32-S3', 'ESP32-H2', 'Arduino Uno R4'] },
  { group: 'Power & motors', items: ['Buck-boost', 'USB-C PD', 'Gate drivers', 'BLDC commutation', 'TB6612FNG', 'Ideal diodes'] },
  { group: 'Buses & sensors', items: ['CAN / CAN FD', 'SPI', 'I2C', 'UART', 'GNSS / RTK', 'Magnetic encoders', 'IMUs'] },
  { group: 'Building systems', items: ['Revit', 'Navisworks', 'NEC', 'Clash detection', 'Commissioning', 'Excel'] },
];
