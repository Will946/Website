/**
 * Prefix for the handful of asset references that don't go through
 * `next/image` or `next/link` (which auto-prepend Next's `basePath`) —
 * inline CSS `url()` and raw `<a href>`s. Mirrors the same env var
 * `next.config.ts` reads, set only by the GitHub Pages build.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
