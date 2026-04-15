import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd()),
  experimental: {
    serverActions: {
      allowedOrigins: ["01.qrbir.com", "www.01.qrbir.com"]
    }
  }
};

export default nextConfig;
