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
    id: 'gm', title: 'GM Power Performance Units', role: 'Power Electronics Intern', dates: 'May 2025 – Aug 2025',
    blurb: 'Power Electronics Intern · GM Power Performance Units', tags: ['Altium', 'BMS Design', 'Power Stage Layout'],
    bullets: [
      'Designed a single-cell Li-ion charge and protection PCB in Altium using a TP4056 CC/CV charger and a DW01A + FS8205A circuit for overcharge, over-discharge and short-circuit protection.',
      'Built a 2S USB-C boost-charging board around a CN3302 controller, laying out the inductor, Schottky and MOSFET power stage with a dedicated VCC plane.',
      'Developed a 3S (12.6 V) protection board stacking three DW01A monitors with BJT level-shifters driving shared back-to-back MOSFET disconnects.',
    ],
  },
  {
    id: 'northrop', title: 'Northrop Grumman', role: 'Electrical Engineering Intern, PMU Post-Silicon Validation', dates: 'May 2024 – Aug 2024',
    blurb: 'Electrical Engineering Intern · PMU Post-Silicon Validation · Melbourne, FL', tags: ['Multiphase Buck', 'Python Automation', 'Post-Silicon Validation'],
    bullets: [
      'Validated random load-transient performance of multiphase buck converters with a Python load generator spanning hardware configs and PVT within DUT overcurrent and thermal limits.',
      'Characterized phase-shedding behavior and automated oscilloscopes in Python to capture and process out-of-spec voltage excursions.',
      'Drove cross-functional FA on spec-violating transients, improved the test-platform hardware and applied the methodology to dynamic aging validation of power bridges.',
    ],
  },
  {
    id: 'lockheed', title: 'Lockheed Martin', role: 'Hardware Engineering Intern, Rotary and Mission Systems', dates: 'May 2023 – Aug 2023',
    blurb: 'Hardware Engineering Intern · Rotary and Mission Systems · Marietta, GA', tags: ['HDMI PCB Design', 'Validation & FA', 'SI/PI'],
    bullets: [
      'Design lead for the DC-DC power, USB and debug subsystems of an HDMI development-platform PCB, and built an electrical, mechanical and software test system to characterize IR performance.',
      'Led validation, debug and FA across HDMI CTS, PMU, SoC, SI/PI, UART, NAND and PCIe, including root-causing an internal-layer PCB failure and analyzing SoC thermal and power across PVT corners.',
      'Increased factory-line component test coverage by over 25% by auditing placement and value checks at every test station.',
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
