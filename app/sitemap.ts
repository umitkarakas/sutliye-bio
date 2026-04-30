import type { MetadataRoute } from "next";
import { getPublicBranches } from "@/lib/server/public-data";

const baseUrl = process.env.APP_BASE_URL ?? "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const branches = await getPublicBranches();

  const branchUrls: MetadataRoute.Sitemap = branches.map((branch) => ({
    url: `${baseUrl}/b/${branch.slug}`,
    changeFrequency: "weekly",
    priority: 0.9
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1.0
    },
    ...branchUrls
  ];
}
