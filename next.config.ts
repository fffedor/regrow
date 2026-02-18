import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.TAURI_ENV_PLATFORM ? "" : "/regrow",
};

export default nextConfig;
