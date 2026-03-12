import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/route-helpers";
import { getDashboardSummary } from "@/lib/server/analytics-data";

export async function GET() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const summary = await getDashboardSummary();
  return NextResponse.json(summary);
}
