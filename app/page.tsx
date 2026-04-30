import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import {
  getPublicBranches,
  getPublicBusiness,
  getPublicMenuForBranch
} from "@/lib/server/public-data";
import type { TabId } from "@/lib/types";

export const dynamic = "force-dynamic";

const baseUrl = process.env.APP_BASE_URL ?? "https://example.com";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseTableId(params: Record<string, string | string[] | undefined>): string | undefined {
  return Object.keys(params).find((key) => /^m\d+$/.test(key));
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: baseUrl }
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab: TabId = resolvedSearchParams["tab"] === "menu" ? "menu" : "contact";
  const tableId = parseTableId(resolvedSearchParams);
  const [business, availableBranches] = await Promise.all([
    getPublicBusiness(),
    getPublicBranches()
  ]);
  const activeBranch = availableBranches[0];

  if (!activeBranch) {
    return null;
  }

  const menu = await getPublicMenuForBranch(activeBranch.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: business.name,
    description: business.seoDescription || business.tagline,
    url: baseUrl,
    telephone: business.primaryPhone,
    servesCuisine: "Türk Mutfağı"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicShell
        activeBranch={activeBranch}
        activeTab={activeTab}
        basePath="/"
        branches={availableBranches}
        business={business}
        menu={menu}
        rootBranchSlug={activeBranch.slug}
        tableId={tableId}
      />
    </>
  );
}
