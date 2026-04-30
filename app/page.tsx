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
    ...(business.logoUrl ? { image: business.logoUrl } : {}),
    telephone: activeBranch.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: activeBranch.address,
      addressLocality: activeBranch.district,
      addressRegion: activeBranch.city,
      addressCountry: "TR"
    },
    ...(activeBranch.mapUrl ? { hasMap: activeBranch.mapUrl } : {}),
    servesCuisine: "Türk Mutfağı",
    ...(menu.length > 0
      ? {
          hasMenu: {
            "@type": "Menu",
            name: "Menü",
            url: `${baseUrl}?tab=menu`,
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
