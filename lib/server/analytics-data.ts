import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

function logAnalyticsFallback(error: unknown, scope: string) {
  console.error(`[analytics-data] Falling back to demo mode for ${scope}.`, error);
}

async function getPrimaryBusinessId() {
  const prisma = await getPrisma();
  const business = await prisma.business.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true }
  });

  return business?.id;
}

async function countEventsByName(eventName: string) {
  const prisma = await getPrisma();
  const businessId = await getPrimaryBusinessId();

  if (!businessId) {
    return 0;
  }

  return prisma.eventLog.count({
    where: {
      businessId,
      eventName
    }
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
    const prisma = await getPrisma();
    const businessId = await getPrimaryBusinessId();

    if (!businessId) {
      throw new Error("No business found. Seed the database first.");
    }

    await prisma.eventLog.create({
      data: {
        businessId,
        branchId: input.branchId,
        productId: input.productId,
        sessionId: input.sessionId || crypto.randomUUID(),
        eventName: input.eventName,
        source: input.source || "public_shell",
        metadataJson: input.metadata as Prisma.InputJsonValue | undefined
      }
    });

    return {
      ok: true,
      isDemo: false
    };
  } catch (error) {
    logAnalyticsFallback(error, `record:${input.eventName}`);
    return {
      ok: true,
      isDemo: true
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
    const prisma = await getPrisma();
    const businessId = await getPrimaryBusinessId();

    if (!businessId) {
      return {
        isDemo: true,
        totalVisits: 0,
        topBranchName: "Veri yok",
        callClicks: 0,
        mapClicks: 0,
        whatsappClicks: 0
      };
    }

    const [totalVisits, callClicks, mapClicks, whatsappClicks, topBranch] = await Promise.all([
      prisma.eventLog.count({
        where: {
          businessId,
          eventName: "page_view"
        }
      }),
      countEventsByName("call_click"),
      countEventsByName("map_click"),
      countEventsByName("whatsapp_click"),
      prisma.eventLog.groupBy({
        by: ["branchId"],
        where: {
          businessId,
          eventName: "branch_view",
          branchId: {
            not: null
          }
        },
        _count: {
          _all: true
        },
        orderBy: {
          _count: {
            branchId: "desc"
          }
        },
        take: 1
      })
    ]);

    let topBranchName = "Veri yok";

    if (topBranch[0]?.branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: topBranch[0].branchId },
        select: { name: true }
      });
      topBranchName = branch?.name ?? "Veri yok";
    }

    return {
      isDemo: false,
      totalVisits,
      topBranchName,
      callClicks,
      mapClicks,
      whatsappClicks
    };
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
