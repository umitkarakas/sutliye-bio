import type { MetadataRoute } from "next";

const baseUrl = process.env.APP_BASE_URL ?? "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
