import { NextResponse } from "next/server";
import { getPublicBranches, getPublicBusiness } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [business, branches] = await Promise.all([getPublicBusiness(), getPublicBranches()]);

  return NextResponse.json({
    business,
    branches
  });
}
