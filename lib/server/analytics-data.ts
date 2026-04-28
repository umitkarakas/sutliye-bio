import { hasDatabaseUrl, queryFirst, withDb } from "@/lib/db";

type RecordEventInput = {
  eventName: string;
  branchId?: string;
  productId?: string;
  sessionId?: string;
  source?: string;
  channel?: string;
  tableId?: string;
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
            channel,
            "tableId",
            "metadataJson"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
        `,
        [
          crypto.randomUUID(),
          businessId,
          input.branchId ?? null,
          input.productId ?? null,
          input.sessionId || crypto.randomUUID(),
          input.eventName,
          input.source || "public_shell",
          input.channel ?? null,
          input.tableId ?? null,
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

export type AnalyticsOverview = {
  isDemo: boolean;
  totalVisits: number;
  uniqueSessions: number;
  callClicks: number;
  mapClicks: number;
  whatsappClicks: number;
  menuItemViews: number;
};

export type DailyCount = {
  date: string;
  count: number;
};

export type BranchStat = {
  name: string;
  views: number;
};

export type ReferrerStat = {
  referrer: string;
  count: number;
};

export type ProductStat = {
  name: string;
  views: number;
};

export type RecentEvent = {
  id: string;
  eventName: string;
  branchName: string | null;
  productName: string | null;
  referrer: string | null;
  channel: string | null;
  tableId: string | null;
  createdAt: string;
};

type OverviewRow = {
  totalVisits: number;
  uniqueSessions: number;
  callClicks: number;
  mapClicks: number;
  whatsappClicks: number;
  menuItemViews: number;
};

type DailyRow = { date: string; count: number };
type BranchRow = { name: string; views: number };
type ReferrerRow = { referrer: string; count: number };
type ProductRow = { name: string; views: number };
type RecentRow = {
  id: string;
  eventName: string;
  branchName: string | null;
  productName: string | null;
  referrer: string | null;
  channel: string | null;
  tableId: string | null;
  createdAt: string;
};

// from/to are validated YYYY-MM-DD strings in Istanbul timezone
function dateRangeSql(from: string, to: string): string {
  return `AND "createdAt" >= (DATE '${from}' AT TIME ZONE 'Europe/Istanbul')
          AND "createdAt" < ((DATE '${to}' + INTERVAL '1 day') AT TIME ZONE 'Europe/Istanbul')`;
}

export async function getAnalyticsOverview(from: string, to: string): Promise<AnalyticsOverview> {
  if (!hasDatabaseUrl()) {
    return { isDemo: true, totalVisits: 1284, uniqueSessions: 432, callClicks: 164, mapClicks: 119, whatsappClicks: 87, menuItemViews: 573 };
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return { isDemo: true, totalVisits: 0, uniqueSessions: 0, callClicks: 0, mapClicks: 0, whatsappClicks: 0, menuItemViews: 0 };
      const filter = dateRangeSql(from, to);
      const row = await queryFirst<OverviewRow>(
        db,
        `SELECT
          COUNT(*) FILTER (WHERE "eventName" = 'page_view')::int AS "totalVisits",
          COUNT(DISTINCT "sessionId") FILTER (WHERE "eventName" = 'page_view')::int AS "uniqueSessions",
          COUNT(*) FILTER (WHERE "eventName" = 'call_click')::int AS "callClicks",
          COUNT(*) FILTER (WHERE "eventName" = 'map_click')::int AS "mapClicks",
          COUNT(*) FILTER (WHERE "eventName" = 'whatsapp_click')::int AS "whatsappClicks",
          COUNT(*) FILTER (WHERE "eventName" = 'menu_item_view')::int AS "menuItemViews"
        FROM "EventLog"
        WHERE "businessId" = $1 ${filter}`,
        [business.id]
      );
      return {
        isDemo: false,
        totalVisits: row?.totalVisits ?? 0,
        uniqueSessions: row?.uniqueSessions ?? 0,
        callClicks: row?.callClicks ?? 0,
        mapClicks: row?.mapClicks ?? 0,
        whatsappClicks: row?.whatsappClicks ?? 0,
        menuItemViews: row?.menuItemViews ?? 0
      };
    });
  } catch (error) {
    logAnalyticsFallback(error, "overview");
    return { isDemo: true, totalVisits: 0, uniqueSessions: 0, callClicks: 0, mapClicks: 0, whatsappClicks: 0, menuItemViews: 0 };
  }
}

export async function getEventsByDay(from: string, to: string): Promise<DailyCount[]> {
  if (!hasDatabaseUrl()) {
    const days = Math.min(
      Math.round((new Date(to + "T00:00:00").getTime() - new Date(from + "T00:00:00").getTime()) / 86400000) + 1,
      90
    );
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(new Date(from + "T00:00:00").getTime() + i * 86400000).toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 80 + 10)
    }));
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return [];
      const filter = dateRangeSql(from, to);
      const rows = await db.query<DailyRow>(
        `SELECT DATE(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Istanbul')::text AS date, COUNT(*)::int AS count
         FROM "EventLog"
         WHERE "businessId" = $1 AND "eventName" = 'page_view' ${filter}
         GROUP BY DATE(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Istanbul')
         ORDER BY date ASC`,
        [business.id]
      );
      return rows.rows;
    });
  } catch (error) {
    logAnalyticsFallback(error, "by_day");
    return [];
  }
}

export async function getTopBranches(from: string, to: string): Promise<BranchStat[]> {
  if (!hasDatabaseUrl()) {
    return [{ name: "Beşiktaş", views: 412 }, { name: "Kadıköy", views: 189 }, { name: "Şişli", views: 87 }];
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return [];
      const filter = dateRangeSql(from, to).replace(/\b"createdAt"\b/g, `e."createdAt"`);
      const rows = await db.query<BranchRow>(
        `SELECT b.name, COUNT(*)::int AS views
         FROM "EventLog" e
         INNER JOIN "Branch" b ON b.id = e."branchId"
         WHERE e."businessId" = $1 AND e."eventName" = 'branch_view' AND e."branchId" IS NOT NULL ${filter}
         GROUP BY b.id, b.name
         ORDER BY views DESC
         LIMIT 10`,
        [business.id]
      );
      return rows.rows;
    });
  } catch (error) {
    logAnalyticsFallback(error, "top_branches");
    return [];
  }
}

export async function getTopReferrers(from: string, to: string): Promise<ReferrerStat[]> {
  if (!hasDatabaseUrl()) {
    return [{ referrer: "direct", count: 520 }, { referrer: "google.com", count: 190 }, { referrer: "instagram.com", count: 74 }];
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return [];
      const filter = dateRangeSql(from, to);
      const rows = await db.query<ReferrerRow>(
        `SELECT
           COALESCE(
             CASE WHEN "metadataJson"->>'referrer' = '' THEN 'direct' ELSE "metadataJson"->>'referrer' END,
             'direct'
           ) AS referrer,
           COUNT(*)::int AS count
         FROM "EventLog"
         WHERE "businessId" = $1 AND "eventName" = 'page_view' AND "metadataJson" IS NOT NULL ${filter}
         GROUP BY 1
         ORDER BY count DESC
         LIMIT 10`,
        [business.id]
      );
      return rows.rows;
    });
  } catch (error) {
    logAnalyticsFallback(error, "top_referrers");
    return [];
  }
}

export async function getTopProducts(from: string, to: string): Promise<ProductStat[]> {
  if (!hasDatabaseUrl()) {
    return [{ name: "Adana Kebap", views: 234 }, { name: "Urfa Kebap", views: 178 }, { name: "Pide", views: 95 }];
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return [];
      const filter = dateRangeSql(from, to).replace(/\b"createdAt"\b/g, `e."createdAt"`);
      const rows = await db.query<ProductRow>(
        `SELECT p.name, COUNT(*)::int AS views
         FROM "EventLog" e
         INNER JOIN "Product" p ON p.id = e."productId"
         WHERE e."businessId" = $1 AND e."eventName" = 'menu_item_view' AND e."productId" IS NOT NULL ${filter}
         GROUP BY p.id, p.name
         ORDER BY views DESC
         LIMIT 10`,
        [business.id]
      );
      return rows.rows;
    });
  } catch (error) {
    logAnalyticsFallback(error, "top_products");
    return [];
  }
}

export async function getRecentEvents(limit: number): Promise<RecentEvent[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return [];
      const rows = await db.query<RecentRow>(
        `SELECT
           e.id,
           e."eventName",
           b.name AS "branchName",
           p.name AS "productName",
           e."metadataJson"->>'referrer' AS referrer,
           e.channel,
           e."tableId",
           TO_CHAR((e."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Istanbul', 'DD.MM.YYYY HH24:MI') AS "createdAt"
         FROM "EventLog" e
         LEFT JOIN "Branch" b ON b.id = e."branchId"
         LEFT JOIN "Product" p ON p.id = e."productId"
         WHERE e."businessId" = $1
         ORDER BY e."createdAt" DESC
         LIMIT $2`,
        [business.id, limit]
      );
      return rows.rows;
    });
  } catch (error) {
    logAnalyticsFallback(error, "recent_events");
    return [];
  }
}

export type BranchInteraction = {
  branchId: string;
  branchName: string;
  pageViews: number;
  whatsappClicks: number;
  callClicks: number;
  mapClicks: number;
  menuItemViews: number;
  totalInteractions: number;
};

export type EventTypeStat = {
  eventName: string;
  count: number;
  pct: number;
};

export type HourStat = {
  hour: number;
  count: number;
};

export type WeekdayStat = {
  dow: number;
  count: number;
};

type BranchInteractionRow = {
  branchId: string;
  branchName: string;
  pageViews: number;
  whatsappClicks: number;
  callClicks: number;
  mapClicks: number;
  menuItemViews: number;
  totalInteractions: number;
};

type EventTypeRow = { eventName: string; count: number };
type HourRow = { hour: number; count: number };
type WeekdayRow = { dow: number; count: number };

export async function getBranchInteractions(from: string, to: string): Promise<BranchInteraction[]> {
  if (!hasDatabaseUrl()) {
    return [
      { branchId: "1", branchName: "Beşiktaş", pageViews: 412, whatsappClicks: 45, callClicks: 23, mapClicks: 67, menuItemViews: 234, totalInteractions: 369 },
      { branchId: "2", branchName: "Kadıköy", pageViews: 189, whatsappClicks: 12, callClicks: 8, mapClicks: 34, menuItemViews: 89, totalInteractions: 143 }
    ];
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return [];
      const filter = dateRangeSql(from, to).replace(/\b"createdAt"\b/g, `e."createdAt"`);
      const rows = await db.query<BranchInteractionRow>(
        `SELECT
           b.id AS "branchId",
           b.name AS "branchName",
           COUNT(*) FILTER (WHERE e."eventName" = 'page_view')::int AS "pageViews",
           COUNT(*) FILTER (WHERE e."eventName" = 'whatsapp_click')::int AS "whatsappClicks",
           COUNT(*) FILTER (WHERE e."eventName" = 'call_click')::int AS "callClicks",
           COUNT(*) FILTER (WHERE e."eventName" = 'map_click')::int AS "mapClicks",
           COUNT(*) FILTER (WHERE e."eventName" = 'menu_item_view')::int AS "menuItemViews",
           COUNT(*) FILTER (WHERE e."eventName" IN ('whatsapp_click','call_click','map_click','menu_item_view'))::int AS "totalInteractions"
         FROM "EventLog" e
         INNER JOIN "Branch" b ON b.id = e."branchId"
         WHERE e."businessId" = $1 AND e."branchId" IS NOT NULL ${filter}
         GROUP BY b.id, b.name
         ORDER BY "pageViews" DESC`,
        [business.id]
      );
      return rows.rows;
    });
  } catch (error) {
    logAnalyticsFallback(error, "branch_interactions");
    return [];
  }
}

export async function getEventTypeTotals(from: string, to: string): Promise<EventTypeStat[]> {
  if (!hasDatabaseUrl()) {
    return [
      { eventName: "page_view", count: 1284, pct: 62 },
      { eventName: "branch_view", count: 410, pct: 20 },
      { eventName: "menu_item_view", count: 234, pct: 11 },
      { eventName: "whatsapp_click", count: 87, pct: 4 },
      { eventName: "map_click", count: 45, pct: 2 },
      { eventName: "call_click", count: 22, pct: 1 }
    ];
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return [];
      const filter = dateRangeSql(from, to);
      const rows = await db.query<EventTypeRow>(
        `SELECT "eventName", COUNT(*)::int AS count
         FROM "EventLog"
         WHERE "businessId" = $1 ${filter}
         GROUP BY "eventName"
         ORDER BY count DESC`,
        [business.id]
      );
      const total = rows.rows.reduce((s, r) => s + r.count, 0) || 1;
      return rows.rows.map((r) => ({ ...r, pct: Math.round((r.count / total) * 100) }));
    });
  } catch (error) {
    logAnalyticsFallback(error, "event_type_totals");
    return [];
  }
}

export async function getHourlyDistribution(from: string, to: string): Promise<HourStat[]> {
  if (!hasDatabaseUrl()) {
    return Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: h >= 11 && h <= 22 ? Math.floor(Math.random() * 60 + 10) : Math.floor(Math.random() * 10)
    }));
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return [];
      const filter = dateRangeSql(from, to);
      const rows = await db.query<HourRow>(
        `SELECT EXTRACT(HOUR FROM ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Istanbul')::int AS hour, COUNT(*)::int AS count
         FROM "EventLog"
         WHERE "businessId" = $1 AND "eventName" = 'page_view' ${filter}
         GROUP BY 1
         ORDER BY 1`,
        [business.id]
      );
      const map = new Map(rows.rows.map((r) => [r.hour, r.count]));
      return Array.from({ length: 24 }, (_, h) => ({ hour: h, count: map.get(h) ?? 0 }));
    });
  } catch (error) {
    logAnalyticsFallback(error, "hourly_distribution");
    return [];
  }
}

export async function getWeekdayDistribution(from: string, to: string): Promise<WeekdayStat[]> {
  if (!hasDatabaseUrl()) {
    const labels = [1, 2, 3, 4, 5, 6, 0];
    return labels.map((dow) => ({ dow, count: Math.floor(Math.random() * 120 + 30) }));
  }
  try {
    return await withDb(async (db) => {
      const business = await queryFirst<BusinessIdRow>(db, `SELECT id FROM "Business" ORDER BY "createdAt" ASC LIMIT 1`);
      if (!business) return [];
      const filter = dateRangeSql(from, to);
      const rows = await db.query<WeekdayRow>(
        `SELECT EXTRACT(DOW FROM ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Istanbul')::int AS dow, COUNT(*)::int AS count
         FROM "EventLog"
         WHERE "businessId" = $1 AND "eventName" = 'page_view' ${filter}
         GROUP BY 1
         ORDER BY 1`,
        [business.id]
      );
      const map = new Map(rows.rows.map((r) => [r.dow, r.count]));
      // Mon–Sun order: 1,2,3,4,5,6,0
      return [1, 2, 3, 4, 5, 6, 0].map((dow) => ({ dow, count: map.get(dow) ?? 0 }));
    });
  } catch (error) {
    logAnalyticsFallback(error, "weekday_distribution");
    return [];
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

export type TableTrafficRow = {
  branchName: string;
  tableId: string;
  pageViews: number;
  sessions: number;
  feedbackCount: number;
};

export async function getTableTrafficByBranch(from: string, to: string): Promise<TableTrafficRow[]> {
  if (!hasDatabaseUrl()) return [];

  try {
    const businessId = await getPrimaryBusinessId();
    if (!businessId) return [];

    const filter = dateRangeSql(from, to).replace(/\b"createdAt"\b/g, `e."createdAt"`);
    const result = await withDb((db) =>
      db.query<TableTrafficRow>(
        `
          SELECT
            b.name AS "branchName",
            e."tableId",
            COUNT(*) FILTER (WHERE e."eventName" = 'page_view')::int AS "pageViews",
            COUNT(DISTINCT e."sessionId")::int AS sessions,
            COUNT(*) FILTER (WHERE e."eventName" = 'feedback_submit')::int AS "feedbackCount"
          FROM "EventLog" e
          INNER JOIN "Branch" b ON b.id = e."branchId"
          WHERE e."businessId" = $1
            AND e."tableId" IS NOT NULL
            ${filter}
          GROUP BY b.name, e."tableId"
          ORDER BY "pageViews" DESC
        `,
        [businessId]
      )
    );

    return result.rows;
  } catch (error) {
    logAnalyticsFallback(error, "tableTraffic");
    return [];
  }
}

export type ChannelStat = {
  channel: string;
  sessions: number;
  visits: number;
  pct: number;
};

export async function getChannelBreakdown(from: string, to: string): Promise<ChannelStat[]> {
  if (!hasDatabaseUrl()) {
    return [
      { channel: "direct",        sessions: 280, visits: 720, pct: 56 },
      { channel: "qr_table",      sessions: 120, visits: 340, pct: 26 },
      { channel: "instagram_bio", sessions:  45, visits:  90, pct: 11 },
      { channel: "qr_branch",     sessions:  20, visits:  40, pct:  5 },
      { channel: "other",         sessions:   7, visits:  14, pct:  2 }
    ];
  }

  try {
    const businessId = await getPrimaryBusinessId();
    if (!businessId) return [];

    const filter = dateRangeSql(from, to);
    const result = await withDb((db) =>
      db.query<{ channel: string; sessions: number; visits: number }>(
        `
          SELECT
            COALESCE(channel, 'other') AS channel,
            COUNT(DISTINCT "sessionId")::int AS sessions,
            COUNT(*)::int AS visits
          FROM "EventLog"
          WHERE "businessId" = $1
            AND "eventName" = 'page_view'
            ${filter}
          GROUP BY 1
          ORDER BY visits DESC
        `,
        [businessId]
      )
    );

    const total = result.rows.reduce((s, r) => s + r.visits, 0) || 1;
    return result.rows.map((r) => ({
      ...r,
      pct: Math.round((r.visits / total) * 100)
    }));
  } catch (error) {
    logAnalyticsFallback(error, "channelBreakdown");
    return [];
  }
}
