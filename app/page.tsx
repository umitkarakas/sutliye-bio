import { PublicShell } from "@/components/public-shell";
import {
  getPublicBranches,
  getPublicBusiness,
  getPublicMenuForBranch
} from "@/lib/server/public-data";
import type { TabId } from "@/lib/types";

type HomePageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab: TabId = resolvedSearchParams.tab === "menu" ? "menu" : "contact";
  const [business, availableBranches] = await Promise.all([
    getPublicBusiness(),
    getPublicBranches()
  ]);
  const activeBranch = availableBranches[0];

  if (!activeBranch) {
    return null;
  }

  const menu = await getPublicMenuForBranch(activeBranch.id);

  return (
    <PublicShell
      activeBranch={activeBranch}
      activeTab={activeTab}
      basePath="/"
      branches={availableBranches}
      business={business}
      menu={menu}
      rootBranchSlug={activeBranch.slug}
    />
  );
}
