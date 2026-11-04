export interface Project {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  url?: string;
  /** Left out of the Projects section (the pranks): false. */
  listed?: boolean;
}

// The gacha dispenses these (capsule index modulo the count); some are pranks.
export const PROJECTS: Project[] = [
  { id: 'pill-sorter', title: 'Automatic Pill Sorter', blurb: 'In progress. Fills a weekly pill organizer for you: each hopper holds one pill, and a disc rotates the right one into place. Custom PCB drives the motor.', tags: ['Motor driver PCB', 'Hopper position sensing', 'Dispense mechanism design'] },
  { id: 'formula-sae', title: 'USC Formula SAE', blurb: 'The car doesn’t move until every wire on this list checks out. 120-contact LV harness, shutdown circuit opening in under 10ms.', tags: ['CAN layout', 'Test & Validation', 'LabVIEW'] },
  { id: 'bldcm-driver', title: 'BLDC Motor Controller', blurb: 'Two round boards that only agree on one thing: exactly where the rotor is, a hundred thousand times a second.', tags: ['BLDC commutation', 'Phase current sensing', 'CAN FD daisy-chain'] },
  { id: 'sirgrab', title: 'SirGrab', blurb: 'A 7-DOF robotic arm that follows your hand. Either the beginning of automation or a very expensive game of fetch.', tags: ['PWM servo driver PCB', 'MediaPipe hand tracking', '7-DOF arm control'] },
  { id: 'ohare-air', title: 'O’Hare Air', blurb: 'A flower-shaped air quality monitor with a stepper-driven needle and its own Wi-Fi dashboard. No app, no cloud.', tags: ['I2C sensor integration', 'Stepper gauge control', 'Embedded web dashboard'] },
  { id: 'cocktail-machine', title: 'Cocktail Machine', blurb: 'Built so I never have to make eye contact with anyone at 2am.', tags: ['H-bridge pump control', 'ESP32-S3 firmware', 'Fluid routing'] },
  { id: 'tea-cozy-hotplate', title: 'Tea Cozy Hotplate', blurb: 'The heating element is the PCB itself, etched into a spiral and told to misbehave a little. Holds ±2°C.', tags: ['PCB trace heater design', 'Closed-loop temperature control', 'Thermistor sensing'] },
  { id: 'gnss', title: 'GNSS Receiver', blurb: 'A u-blox ZED-F9P carrier board, patient enough to wait for enough satellites to agree on where it is.', tags: ['RTK positioning', 'Carrier board layout', 'Battery-backed RTC'] },
  { id: 'cprpal', title: 'CPRPal', blurb: 'USC capstone: a CPR feedback device on a custom PCB fusing an HX711 load cell, BNO055 IMU and PPG sensor. Adaptive-baseline PPG detection with hysteresis and contact validation rejects compression artifact, running across both ESP32-S3 cores under FreeRTOS.', tags: ['Load cell & IMU fusion', 'PPG signal processing', 'Dual-core FreeRTOS'] },
  { id: 'buck-boost', title: '5V Buck-Boost', blurb: 'Feed it a dying battery or an overachieving wall adapter, it hands back the same unbothered 5V.', tags: ['Buck-boost regulation', 'Reverse-polarity protection', 'Power-good signaling'] },
  { id: 'motor-driver', title: '12V Motor Driver', blurb: 'Just enough decoupling to keep the magic smoke where it belongs.', tags: ['H-bridge layout', 'Decoupling design'] },
  { id: 'usb-c-pd', title: 'USB-C PD Trigger', blurb: 'Politely asks a charger for way more power than it should hand over, and usually gets it. 20V out.', tags: ['USB-PD negotiation', 'Load switching'] },
  { id: 'job-offers', title: 'William’s job offers', blurb: '0 found. Still wicked cool. Try again.', tags: ['Unemployed'], listed: false },
  { id: 'duck', title: 'Rubber duck', blurb: 'It is a rubber duck. It does nothing. Try again.', tags: ['Prank'], listed: false },
  { id: 'magic-smoke', title: 'The magic smoke', blurb: 'Escaped from a motor driver. Do not attempt to put it back in.', tags: ['Prank'], listed: false },
  { id: 'this-site', title: 'This website', blurb: 'A 3D dojo with a physics engine, because a PDF was not enough.', tags: ['React Three Fiber', 'Rapier physics'] },
];
