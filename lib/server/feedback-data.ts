import { hasDatabaseUrl, queryFirst, withDb } from "@/lib/db";

export type FeedbackStatus = "new" | "reviewed" | "archived";

export type FeedbackRow = {
  id: string;
  branchName: string | null;
  rating: number | null;
  message: string;
  source: string;
  status: FeedbackStatus;
  tableId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  createdAt: string;
};

export type FeedbackStats = {
  total: number;
  thisWeek: number;
  avgRating: number | null;
};

type BusinessIdRow = { id: string };

async function getPrimaryBusinessId() {
  return withDb(async (db) => {
    const row = await queryFirst<BusinessIdRow>(
      db,
      `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`
    );
    return row?.id;
  });
}

export async function createFeedback(input: {
  branchId: string;
  tableId?: string;
  rating?: number;
  message: string;
  source?: string;
}) {
  if (!hasDatabaseUrl()) {
    return { ok: true, isDemo: true };
  }

  try {
    const businessId = await getPrimaryBusinessId();

    if (!businessId) {
      throw new Error("No business found.");
    }

    await withDb((db) =>
      db.query(
        `
          INSERT INTO "Feedback" (
            id,
            "businessId",
            "branchId",
            rating,
            message,
            source,
            status,
            "tableId",
            "createdAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, 'new', $7, NOW())
        `,
        [
          crypto.randomUUID(),
          businessId,
          input.branchId,
          input.rating ?? null,
          input.message,
          input.source || "public",
          input.tableId ?? null
        ]
      )
    );

    return { ok: true, isDemo: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[feedback-data] createFeedback error: ${message}`);
    return { ok: false, isDemo: false };
  }
}

export async function getFeedbacks(from: string, to: string): Promise<FeedbackRow[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  try {
    const businessId = await getPrimaryBusinessId();

    if (!businessId) return [];

    const result = await withDb((db) =>
      db.query<FeedbackRow>(
        `
          SELECT
            f.id,
            b.name AS "branchName",
            f.rating,
            f.message,
            f.source,
            f.status,
            f."tableId",
            f."contactName",
            f."contactPhone",
            TO_CHAR(f."createdAt" AT TIME ZONE 'Europe/Istanbul', 'DD.MM.YYYY HH24:MI') AS "createdAt"
          FROM "Feedback" f
          LEFT JOIN "Branch" b ON b.id = f."branchId"
          WHERE f."businessId" = $1
            AND f."createdAt" >= (DATE '${from}' AT TIME ZONE 'Europe/Istanbul')
            AND f."createdAt" < ((DATE '${to}' + INTERVAL '1 day') AT TIME ZONE 'Europe/Istanbul')
          ORDER BY f."createdAt" DESC
        `,
        [businessId]
      )
    );

    return result.rows;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[feedback-data] getFeedbacks error: ${message}`);
    return [];
  }
}

export async function getFeedbackStats(): Promise<FeedbackStats> {
  if (!hasDatabaseUrl()) {
    return { total: 0, thisWeek: 0, avgRating: null };
  }

  try {
    const businessId = await getPrimaryBusinessId();

    if (!businessId) return { total: 0, thisWeek: 0, avgRating: null };

    const result = await withDb((db) =>
      db.query<{ total: string; thisWeek: string; avgRating: string | null }>(
        `
          SELECT
            COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '7 days')::text AS "thisWeek",
            ROUND(AVG(rating)::numeric, 1)::text AS "avgRating"
          FROM "Feedback"
          WHERE "businessId" = $1
        `,
        [businessId]
      )
    );

    const row = result.rows[0];

    return {
      total: Number(row?.total ?? 0),
      thisWeek: Number(row?.thisWeek ?? 0),
      avgRating: row?.avgRating != null ? Number(row.avgRating) : null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[feedback-data] getFeedbackStats error: ${message}`);
    return { total: 0, thisWeek: 0, avgRating: null };
  }
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  if (!hasDatabaseUrl()) return;

  await withDb((db) =>
    db.query(
      `UPDATE "Feedback" SET status = $1 WHERE id = $2`,
      [status, id]
    )
  );
}
