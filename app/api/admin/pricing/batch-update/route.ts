import { NextResponse } from "next/server";
import { batchUpdatePricing } from "@/lib/server/pricing-data";
import { jsonError, requireAdmin } from "@/lib/server/route-helpers";
import type { PricingAdjustmentType } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const body = (await request.json()) as {
    branchIds?: string[];
    categoryId?: string;
    productIds?: string[];
    adjustmentType?: PricingAdjustmentType;
    adjustmentValue?: number;
    previewOnly?: boolean;
  };

  if (!body.branchIds?.length || !body.adjustmentType || typeof body.adjustmentValue !== "number") {
    return jsonError("Missing batch update payload");
  }

  try {
    const result = await batchUpdatePricing({
      branchIds: body.branchIds,
      categoryId: body.categoryId,
      productIds: body.productIds,
      adjustmentType: body.adjustmentType,
      adjustmentValue: body.adjustmentValue,
      previewOnly: body.previewOnly
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to batch update pricing", 500);
  }
}
