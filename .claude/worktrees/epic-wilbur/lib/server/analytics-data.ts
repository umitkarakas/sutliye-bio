import { hasDatabaseUrl, queryFirst, withDb } from "@/lib/db";

type RecordEventInput = {
  eventName: string;
  branchId?: string;
  productId?: string;
  sessionId?: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export type DashboardSummary = {
  isDemo: boolean;
  totalVisits: number;
  topBranchName: string;
  callClicks: number;
  mapClicks: number;
  whatsappClicks: number;
};

type BusinessIdRow = {
  id: string;
};

type EventSummaryRow = {
  totalVisits: number;
  callClicks: number;
  mapClicks: number;
  whatsappClicks: number;
};

type TopBranchRow = {
  name: string;
};

function logAnalyticsFallback(error: unknown, scope: string) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.warn(`[analytics-data] Falling back to demo mode for ${scope}: ${message}`);
}

async function getPrimaryBusinessId() {
  return withDb(async (db) => {
    const business = await queryFirst<BusinessIdRow>(
      db,
      `
        SELECT id
        FROM "Business"
        ORDER BY "createdAt" ASC
        LIMIT 1
      `
    );

    return business?.id;
  });
}

export async function recordAnalyticsEvent(input: RecordEventInput) {
  if (!hasDatabaseUrl()) {
    return {
      ok: true,
      isDemo: true
    };
  }

  try {
    const businessId = await getPrimaryBusinessId();

    if (!businessId) {
      throw new Error("No business found. Seed the database first.");
    }

    await withDb((db) =>
      db.query(
        `
          INSERT INTO "EventLog" (
            id,
            "businessId",
            "branchId",
            "productId",
            "sessionId",
            "eventName",
            source,
            "metadataJson"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        `,
        [
          crypto.randomUUID(),
          businessId,
          input.branchId ?? null,
          input.productId ?? null,
          input.sessionId || crypto.randomUUID(),
          input.eventName,
          input.source || "public_shell",
          input.metadata ? JSON.stringify(input.metadata) : null
        ]
      )
    );

    return {
      ok: true,
      isDemo: false
    };
  } catch (error) {
    logAnalyticsFallback(error, `record:${input.eventName}`);
    return {
      ok: false,
      isDemo: false
    };
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (!hasDatabaseUrl()) {
    return {
      isDemo: true,
      totalVisits: 1284,
      topBranchName: "Besiktas",
      callClicks: 164,
      mapClicks: 119,
      whatsappClicks: 87
    };
  }

  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(
        db,
        `
          SELECT id
          FROM "Business"
          ORDER BY "createdAt" ASC
          LIMIT 1
        `
      );

      if (!business) {
        return {
          isDemo: true,
          totalVisits: 0,
          topBranchName: "Veri yok",
          callClicks: 0,
          mapClicks: 0,
          whatsappClicks: 0
        };
      }

      const [summary, topBranch] = await Promise.all([
        queryFirst<EventSummaryRow>(
          db,
          `
            SELECT
              COUNT(*) FILTER (WHERE "eventName" = 'page_view')::int AS "totalVisits",
              COUNT(*) FILTER (WHERE "eventName" = 'call_click')::int AS "callClicks",
              COUNT(*) FILTER (WHERE "eventName" = 'map_click')::int AS "mapClicks",
              COUNT(*) FILTER (WHERE "eventName" = 'whatsapp_click')::int AS "whatsappClicks"
            FROM "EventLog"
            WHERE "businessId" = $1
          `,
          [business.id]
        ),
        queryFirst<TopBranchRow>(
          db,
          `
            SELECT b.name
            FROM "EventLog" e
            INNER JOIN "Branch" b ON b.id = e."branchId"
            WHERE e."businessId" = $1
              AND e."eventName" = 'branch_view'
              AND e."branchId" IS NOT NULL
            GROUP BY b.id, b.name
            ORDER BY COUNT(*) DESC, b.name ASC
            LIMIT 1
          `,
          [business.id]
        )
      ]);

      return {
        isDemo: false,
        totalVisits: summary?.totalVisits ?? 0,
        topBranchName: topBranch?.name ?? "Veri yok",
        callClicks: summary?.callClicks ?? 0,
        mapClicks: summary?.mapClicks ?? 0,
        whatsappClicks: summary?.whatsappClicks ?? 0
      };
    });
  } catch (error) {
    logAnalyticsFallback(error, "dashboard");
    return {
      isDemo: true,
      totalVisits: 0,
      topBranchName: "Veri yok",
      callClicks: 0,
      mapClicks: 0,
      whatsappClicks: 0
    };
  }
}
