import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import {
  getPublicBranchBySlug,
  getPublicBranches,
  getPublicBusiness,
  getPublicMenuForBranch
} from "@/lib/server/public-data";
import type { TabId } from "@/lib/types";
import { parseTableIdFromParams } from "@/lib/channel";

export const dynamic = "force-dynamic";

const baseUrl = process.env.APP_BASE_URL ?? "https://example.com";

type BranchPageProps = {
  params: Promise<{
    branchSlug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: BranchPageProps): Promise<Metadata> {
  const { branchSlug } = await params;
  const [business, branch] = await Promise.all([
    getPublicBusiness(),
    getPublicBranchBySlug(branchSlug)
  ]);

  if (!branch) return {};

  const businessTitle = business.seoTitle || business.name;
  const description =
    branch.blurb ||
    `${business.name} ${branch.name} şubesi — ${branch.address}, ${branch.district}, ${branch.city}`;
  const canonicalUrl = `${baseUrl}/b/${branchSlug}`;

  return {
    title: branch.name,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${businessTitle} — ${branch.name}`,
      description,
      type: "website",
      url: canonicalUrl
    }
  };
}

export default async function BranchPage({ params, searchParams }: BranchPageProps) {
  const { branchSlug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab: TabId = resolvedSearchParams["tab"] === "menu" ? "menu" : "contact";
  const tableId = parseTableIdFromParams(resolvedSearchParams);
  const [business, branch, branches] = await Promise.all([
    getPublicBusiness(),
    getPublicBranchBySlug(branchSlug),
    getPublicBranches()
  ]);

  if (!branch) {
    notFound();
  }

  const menu = await getPublicMenuForBranch(branch.id);
  const rootBranchSlug = branches[0]?.slug ?? branch.slug;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: branch.name === branches[0]?.name ? business.name : `${business.name} — ${branch.name}`,
    description:
      branch.blurb ||
      `${business.name} ${branch.name} şubesi — ${branch.address}, ${branch.district}, ${branch.city}`,
    telephone: branch.phone,
    url: `${baseUrl}/b/${branch.slug}`,
    ...(business.logoUrl ? { image: business.logoUrl } : {}),
    ...(branch.mapUrl ? { hasMap: branch.mapUrl } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.district,
      addressRegion: branch.city,
      addressCountry: "TR"
    },
    servesCuisine: "Türk Mutfağı",
    ...(menu.length > 0
      ? {
          hasMenu: {
            "@type": "Menu",
            name: "Menü",
            url: `${baseUrl}/b/${branch.slug}?tab=menu`,
            hasMenuSection: menu
              .filter((cat) => cat.items.length > 0)
              .map((cat) => ({
                "@type": "MenuSection",
                name: cat.name,
                hasMenuItem: cat.items.map((item) => ({
                  "@type": "MenuItem",
                  name: item.name,
                  description: item.description,
                  ...(item.imageUrl ? { image: item.imageUrl } : {}),
                  offers: {
                    "@type": "Offer",
                    price: item.price.toFixed(2),
                    priceCurrency: "TRY",
                    availability:
                      item.stockStatus === "in_stock"
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock"
                  }
                }))
              }))
          }
        }
      : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicShell
        activeBranch={branch}
        activeTab={activeTab}
        basePath={`/b/${branch.slug}`}
        branches={branches}
        business={business}
        menu={menu}
        rootBranchSlug={rootBranchSlug}
        tableId={tableId}
      />
    </>
  );
}
