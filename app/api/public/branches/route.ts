import { NextResponse } from "next/server";
import { getPublicBranches } from "@/lib/server/public-data";

export async function GET() {
  const branches = await getPublicBranches();
  return NextResponse.json({ branches });
}
