export interface Project {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  url?: string;
  /** What it is, shown on the project's card: a board, a whole build, or software. */
  kind?: 'PCB' | 'Full Build' | 'Software';
  /** Left out of the Projects section (the pranks): false. */
  listed?: boolean;
}

// The gacha dispenses these (capsule index modulo the count); some are pranks.
export const PROJECTS: Project[] = [
  { id: 'pill-sorter', kind: 'Full Build', title: 'Automatic Pill Sorter', blurb: 'In progress. Fills a weekly pill organizer for you: each hopper holds one pill, and a disc rotates the right one into place. Custom PCB drives the motor.', tags: ['Motor driver PCB', 'Hopper position sensing', 'Dispense mechanism design'] },
  { id: 'formula-sae', kind: 'Full Build', title: 'USC Formula SAE', blurb: 'The car doesn’t move until every wire on this list checks out. 120-contact LV harness, shutdown circuit opening in under 10ms.', tags: ['CAN layout', 'Test & Validation', 'LabVIEW'] },
  { id: 'bldcm-driver', kind: 'PCB', title: 'BLDC Motor Controller', blurb: 'Two round boards that only agree on one thing: exactly where the rotor is, a hundred thousand times a second.', tags: ['BLDC commutation', 'Phase current sensing', 'CAN FD daisy-chain'], url: 'https://github.com/Will946/BLDCM_Driver' },
  { id: 'sirgrab', kind: 'Full Build', title: 'SirGrab', blurb: 'A 7-DOF robotic arm that follows your hand. Either the beginning of automation or a very expensive game of fetch.', tags: ['PWM servo driver PCB', 'MediaPipe hand tracking', '7-DOF arm control'], url: 'https://github.com/Will946/SirGrab' },
  { id: 'ohare-air', kind: 'Full Build', title: 'O’Hare Air', blurb: 'A flower-shaped air quality monitor with a stepper-driven needle and its own Wi-Fi dashboard. No app, no cloud.', tags: ['I2C sensor integration', 'Stepper gauge control', 'Embedded web dashboard'], url: 'https://github.com/Will946/O-hareAir' },
  { id: 'cocktail-machine', kind: 'Full Build', title: 'Cocktail Machine', blurb: 'A bartender that never cards you or cuts you off. It asks an AI what to make from your cabinet, then measures each pour by pump time across eight peristaltic channels.', tags: ['H-bridge pump control', 'ESP32-S3 firmware', 'Fluid routing'], url: 'https://github.com/Will946/Cocktail-Machine' },
  { id: 'tea-cozy-hotplate', kind: 'PCB', title: 'Tea Cozy Hotplate', blurb: 'The heating element is the PCB itself, etched into a spiral and told to misbehave a little. Holds ±2°C.', tags: ['PCB trace heater design', 'Closed-loop temperature control', 'Thermistor sensing'], url: 'https://github.com/Will946/TeaCupHotPlate' },
  { id: 'gnss', kind: 'PCB', title: 'GNSS Receiver', blurb: 'A u-blox ZED-F9P carrier board, patient enough to wait for enough satellites to agree on where it is.', tags: ['RTK positioning', 'Carrier board layout', 'Battery-backed RTC'], url: 'https://github.com/Will946/GNSS' },
  { id: 'cprpal', kind: 'Full Build', title: 'CPRPal', blurb: 'USC capstone: a CPR feedback device on a custom PCB fusing an HX711 load cell, BNO055 IMU and PPG sensor. Adaptive-baseline PPG detection with hysteresis and contact validation rejects compression artifact, running across both ESP32-S3 cores under FreeRTOS.', tags: ['Load cell & IMU fusion', 'PPG signal processing', 'Dual-core FreeRTOS'], url: 'https://github.com/Will946/CPRPal' },
  { id: 'buck-boost', kind: 'PCB', title: '5V Buck-Boost', blurb: 'Feed it a dying battery or an overachieving wall adapter, it hands back the same unbothered 5V.', tags: ['Buck-boost regulation', 'Reverse-polarity protection', 'Power-good signaling'], url: 'https://github.com/Will946/5V-Buck-Boost-Converter' },
  { id: 'motor-driver', kind: 'PCB', title: '12V Motor Driver', blurb: 'Just enough decoupling to keep the magic smoke where it belongs.', tags: ['H-bridge layout', 'Decoupling design'], url: 'https://github.com/Will946/12V-Motor-Driver' },
  { id: 'usb-c-pd', kind: 'PCB', title: 'USB-C PD Trigger', blurb: 'Politely asks a charger for way more power than it should hand over, and usually gets it. 20V out.', tags: ['USB-PD negotiation', 'Load switching'], url: 'https://github.com/Will946/USBC-PD' },
  { id: 'job-offers', title: 'William’s job offers', blurb: '0 found. Still wicked cool. Try again.', tags: ['Unemployed'], listed: false },
  { id: 'duck', title: 'Rubber duck', blurb: 'It is a rubber duck. It does nothing. Try again.', tags: ['Prank'], listed: false },
  { id: 'magic-smoke', title: 'The magic smoke', blurb: 'Escaped from a motor driver. Do not attempt to put it back in.', tags: ['Prank'], listed: false },
  { id: 'this-site', kind: 'Software', title: 'This website', blurb: 'A 3D dojo with a physics engine, because a PDF was not enough.', tags: ['React Three Fiber', 'Rapier physics'], url: 'https://github.com/Will946/Website' },
];
