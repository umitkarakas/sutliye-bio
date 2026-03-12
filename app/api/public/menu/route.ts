import { NextResponse } from "next/server";
import { getPublicBranchBySlug, getPublicBranches, getPublicMenuForBranch } from "@/lib/server/public-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchSlug = searchParams.get("branchSlug");
  const branches = await getPublicBranches();
  const fallbackBranch = branches[0];

  const branch = branchSlug ? await getPublicBranchBySlug(branchSlug) : fallbackBranch;

  if (!branch) {
    return NextResponse.json({ error: "No branch available" }, { status: 404 });
  }

  const menu = await getPublicMenuForBranch(branch.id);

  return NextResponse.json({
    branch,
    menu
  });
}
