import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd()),
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "menu.sutliye.com",
        "www.menu.sutliye.com",
        "01.qrbir.com",
        "www.01.qrbir.com"
      ]
    }
  }
};

export default nextConfig;
