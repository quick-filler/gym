import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle into .next/standalone so the
  // production Docker image can ship without the full node_modules tree.
  // See docs/design-decisions.md §9.x.
  output: "standalone",
};

export default nextConfig;
