import { NextResponse } from "next/server";
import { business } from "@/lib/demo-data";
import { getPublicBranches } from "@/lib/server/public-data";

export async function GET() {
  const branches = await getPublicBranches();

  return NextResponse.json({
    business,
    branches
  });
}
