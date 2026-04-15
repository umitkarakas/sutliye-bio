import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/server/feedback-data";
import { recordAnalyticsEvent } from "@/lib/server/analytics-data";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      branchId?: unknown;
      tableId?: unknown;
      rating?: unknown;
      message?: unknown;
    };

    const branchId = typeof body.branchId === "string" ? body.branchId.trim() : null;
    const message = typeof body.message === "string" ? body.message.trim() : null;
    const tableId = typeof body.tableId === "string" ? body.tableId.trim() : undefined;
    const rating = typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? body.rating
      : undefined;

    if (!branchId) {
      return NextResponse.json({ error: "branchId required" }, { status: 400 });
    }

    if (!message || message.length < 5) {
      return NextResponse.json({ error: "message must be at least 5 characters" }, { status: 400 });
    }

    const source = tableId ? "qr_table" : "public";

    const result = await createFeedback({ branchId, tableId, rating, message, source });

    if (!result.ok && !result.isDemo) {
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    // analytics: feedback_submit event
    void recordAnalyticsEvent({
      eventName: "feedback_submit",
      branchId,
      source,
      metadata: tableId ? { tableId } : undefined
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
