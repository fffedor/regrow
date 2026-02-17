import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.TAURI_ENV ? "" : "/regrow",
};

export default nextConfig;
