import { PublicShell } from "@/components/public-shell";
import { getPublicBranches, getPublicMenuForBranch } from "@/lib/server/public-data";
import type { TabId } from "@/lib/types";

type HomePageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab: TabId = resolvedSearchParams.tab === "menu" ? "menu" : "contact";
  const availableBranches = await getPublicBranches();
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
      menu={menu}
    />
  );
}
