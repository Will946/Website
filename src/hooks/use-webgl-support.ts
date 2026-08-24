"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

function detectWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return null;
}

/**
 * `null` means "not yet checked" (server render / first paint) so callers
 * can show a loading state rather than flashing the fallback before we've
 * actually determined support.
 */
export function useWebGLSupport() {
  return useSyncExternalStore(subscribe, detectWebGL, getServerSnapshot);
}
