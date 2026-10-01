import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, ".."),
  // Hides the circular dev-only route indicator that overlaps
  // the bottom-left of the page (including the footer).
  devIndicators: false,
};

export default nextConfig;
