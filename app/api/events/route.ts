import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/server/analytics-data";

const allowedEvents = new Set([
  "page_view",
  "tab_view",
  "branch_view",
  "call_click",
  "whatsapp_click",
  "map_click",
  "menu_item_view",
  "feedback_submit"
]);

export async function POST(request: Request) {
  const body = (await request.json()) as {
    eventName?: string;
    branchId?: string;
    productId?: string;
    source?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.eventName || !allowedEvents.has(body.eventName)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  await recordAnalyticsEvent({
    eventName: body.eventName,
    branchId: body.branchId,
    productId: body.productId,
    source: body.source,
    sessionId: body.sessionId,
    metadata: body.metadata
  });

  return NextResponse.json({ ok: true });
}
