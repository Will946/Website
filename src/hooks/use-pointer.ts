"use client";

import { useEffect, useRef } from "react";

export type PointerState = { x: number; y: number };

/**
 * Tracks pointer position, normalized to -1..1 relative to `target`'s
 * bounding box, in a ref (not React state) so consumers can read it from a
 * requestAnimationFrame loop without paying for a re-render on every
 * pointermove.
 */
export function usePointer(target: React.RefObject<HTMLElement | null>) {
  const pointer = useRef<PointerState>({ x: 0, y: 0 });

  useEffect(() => {
    const el = target.current;
    if (!el) return;

    function handleMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }
    function handleLeave() {
      pointer.current.x = 0;
      pointer.current.y = 0;
    }

    el.addEventListener("pointermove", handleMove, { passive: true });
    el.addEventListener("pointerleave", handleLeave, { passive: true });
    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
    };
  }, [target]);

  return pointer;
}
