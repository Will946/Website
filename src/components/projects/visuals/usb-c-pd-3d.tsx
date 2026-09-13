"use client";

import dynamic from "next/dynamic";
import { Object3DViewer } from "@/components/three/object-3d-viewer";
import { UsbCPdVisual } from "@/components/projects/visuals/usb-c-pd-visual";

const UsbCPdScene = dynamic(() => import("@/components/projects/scenes/usb-c-pd-scene").then((m) => m.UsbCPdScene), {
  ssr: false,
});

/**
 * Drop-in replacement for the flat UsbCPdVisual in the Projects grid: a
 * realistic 3D board (modeled on the actual KiCad renders) with a
 * voltage-negotiation ladder that climbs 5V through 20V, then a delivered-
 * power pulse traveling from the USB-C input to the barrel jack output,
 * instead of a click-to-run schematic. Ignores the `active`/
 * `reducedMotion` props ProjectEntry passes (Object3DViewer tracks both
 * itself) so it still satisfies VisualProps.
 */
export function UsbCPd3DVisual() {
  return (
    <Object3DViewer
      Scene={UsbCPdScene}
      Fallback={UsbCPdVisual}
      ariaLabel="Interactive 3D model of the USB-C PD trigger board, with a voltage-negotiation ladder climbing from 5V to 20V and power then flowing out to the barrel jack. Drag to rotate, scroll to zoom."
      className="border-0 bg-transparent"
    />
  );
}
