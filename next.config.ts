import type { NextConfig } from "next";

// Set only by the GitHub Pages Actions workflow, since this repo is a
// project site served at will946.github.io/Website/, not the domain root.
// Left unset for local dev and any other host, which serve from "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
