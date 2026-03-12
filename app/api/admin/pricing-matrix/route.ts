import { NextResponse } from "next/server";
import { listPricingMatrix } from "@/lib/server/pricing-data";
import { requireAdmin } from "@/lib/server/route-helpers";

export async function GET(request: Request) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const data = await listPricingMatrix({
    categoryId: searchParams.get("categoryId") || undefined,
    search: searchParams.get("search") || undefined,
    branchIds: searchParams.getAll("branchIds")
  });

  return NextResponse.json(data);
}
