import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import {
  getPublicBranchBySlug,
  getPublicBranches,
  getPublicBusiness,
  getPublicMenuForBranch
} from "@/lib/server/public-data";
import type { TabId } from "@/lib/types";

export const dynamic = "force-dynamic";

type BranchPageProps = {
  params: Promise<{
    branchSlug: string;
  }>;
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function BranchPage({ params, searchParams }: BranchPageProps) {
  const { branchSlug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab: TabId = resolvedSearchParams.tab === "menu" ? "menu" : "contact";
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

  return (
    <PublicShell
      activeBranch={branch}
      activeTab={activeTab}
      basePath={`/b/${branch.slug}`}
      branches={branches}
      business={business}
      menu={menu}
      rootBranchSlug={rootBranchSlug}
    />
  );
}
