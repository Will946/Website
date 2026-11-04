// Work, school and life outside it, from the resume. The katana rack holds one sword per entry (its title,
// blurb and tags show when it is drawn), and the Experience and About sections list them in full.
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
    id: 'yu-ping', title: 'Yu-Ping', role: 'Electrical Design Intern', dates: 'May 2025 – Aug 2025',
    blurb: 'Electrical Design Intern · Yu Ping Enterprise · Kaohsiung, TW', tags: ['Excel VBA', 'Revit', 'Navisworks'],
    bullets: [
      'Modeled switchgear lineups, panelboards, and conduit routing for one floor in Revit, verified NEC clearances, and used Navisworks to resolve 30 HVAC and plumbing conflicts before installation.',
      'Developed LV relay control circuits and BAS interface points for 2 AHUs and 24 VAVs, producing wiring diagrams and I/O point lists for mechanical and controls lead markup.',
      'Built Excel VBA macros to parse commissioning logs, flag voltage deviations above 5%, and tabulate phase imbalance by zone, streamlining a 6-hour weekly review.',
    ],
  },
  {
    id: 'droxo', title: 'Droxo', role: 'Hardware Engineering Intern', dates: 'May 2024 – Aug 2024',
    blurb: 'Hardware Engineering Intern · Droxo Tech · Tainan, TW', tags: ['PCB Design', 'Test & Validation', 'KiCad'],
    bullets: [
      'Designed a spray-flow sensor interface board in KiCad, integrating a Hall flowmeter input with a 4.7 kΩ pull-up, 1 kHz RC filter, INA219 monitor on a 0.033 Ω shunt, and a 24 V TVS at the harness connector.',
      'Characterized a PWM-controlled pump across three nozzle configurations, generating duty-cycle-to-flow calibration curves from 0.4–2.1 L/min with ±5% flow accuracy.',
      'Investigated 25 returned motor driver boards, tracing failures to electrochemical migration, MOSFET overheating, and connector fretting; measured a 118 °C hotspot at 8 A that justified a copper-pour increase.',
    ],
  },
  {
    id: 'skymul', title: 'Skymul', role: 'Electrical Engineering Intern', dates: 'May 2023 – Aug 2023',
    blurb: 'Electrical Engineering Intern · Skymul · Peachtree Corners, GA', tags: ['Altium', 'LTspice', 'PCB Layout'],
    bullets: [
      'Designed DRV8353 gate-drive and power-input blocks in Altium, selecting 10 Ω gate resistors, 1 µF VCP, and 47 nF bypass caps.',
      'Simulated a 24 V input transient in LTspice to size bulk capacitance for a 5 A load step, then routed high-current motor phases and a 120 Ω CAN pair on a four-layer PCB.',
      'Ran a 40-point validation matrix across 0–6 A locked-rotor limits, 20–26 V input, and 0–55 °C to qualify actuator-driver builds.',
    ],
  },
  {
    id: 'usc', title: 'USC', role: 'Electrical Engineering', dates: 'May 2026', about: true,
    blurb: 'University of Southern California · B.S. ECE, M.S. EE', tags: ['B.S. ECE', 'M.S. EE'],
    bullets: [
      'B.S. in Electrical and Computer Engineering, University of Southern California.',
      'M.S. in Electrical Engineering, University of Southern California.',
      'USC Formula SAE: Electronics Team · USC RPL: Avionics Team.',
      'Capstone Project: CPRPal, a CPR feedback device on a custom PCB that fuses a load cell, an IMU and a PPG sensor to coach compression depth and rate in real time.',
    ],
  },
  {
    id: 'off-the-clock', title: 'Off the clock', role: 'From Atlanta, Georgia', dates: '100% human', about: true,
    blurb: 'Golf, tennis, fishing, Elden Ring, movies, eating', tags: ['Golf', 'Elden Ring', 'Top 40 Beli'],
    bullets: [
      'Golf, tennis, fishing and the occasional spikeball.',
      'Video games: currently Elden Ring and MW4.',
      'Top 40 Beli eater in Georgia.',
      'Avid movie goblin.',
    ],
  },
];

export const SKILLS: { group: string; items: string[] }[] = [
  { group: 'EDA & PCB design', items: ['Altium', 'KiCad', 'LTspice', 'ANSYS', '4-layer stackups', 'Thermal sizing'] },
  { group: 'Power & motor drive', items: ['DRV8353 gate drivers', 'TMC6300', 'TB6612FNG', 'TPS63070 buck-boost', 'HUSB238 USB-PD', 'Ideal diodes', 'Buck converters', 'LDOs', 'Gate drivers', 'H-bridges'] },
  { group: 'Embedded', items: ['STM32F4 / F103', 'ESP32-S3 / H2', 'FreeRTOS', 'Arduino Uno R4'] },
  { group: 'Communication protocols', items: ['SPI', 'I2C', 'CAN / CAN FD', 'UART', 'USB Power Delivery', 'RS-485'] },
  { group: 'CAD & building systems', items: ['AutoCAD', 'Revit', 'Navisworks clash detection', 'NEC clearances', 'BAS I/O point lists', 'LV relay control circuits'] },
  { group: 'Programming & scripting', items: ['Python', 'C++', 'MATLAB', 'Excel VBA', 'LabVIEW'] },
];
