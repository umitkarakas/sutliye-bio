import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias["@generated-prisma/client"] = path.resolve(
      process.cwd(),
      "node_modules/.prisma/client/default.js"
    );

    return config;
  }
};

export default nextConfig;
