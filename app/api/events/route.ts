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
    channel?: string;
    tableId?: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.eventName || !allowedEvents.has(body.eventName)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const result = await recordAnalyticsEvent({
    eventName: body.eventName,
    branchId: body.branchId,
    productId: body.productId,
    source: body.source,
    sessionId: body.sessionId,
    channel: body.channel,
    tableId: body.tableId,
    metadata: body.metadata
  });

  if (!result.ok) {
    return NextResponse.json({ error: "Failed to record event" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
