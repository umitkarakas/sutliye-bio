import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import {
  getPublicBranchBySlug,
  getPublicBranches,
  getPublicMenuForBranch
} from "@/lib/server/public-data";
import type { TabId } from "@/lib/types";

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
  const branch = await getPublicBranchBySlug(branchSlug);

  if (!branch) {
    notFound();
  }

  const branches = await getPublicBranches();
  const menu = await getPublicMenuForBranch(branch.id);

  return (
    <PublicShell
      activeBranch={branch}
      activeTab={activeTab}
      basePath={`/b/${branch.slug}`}
      branches={branches}
      menu={menu}
    />
  );
}
