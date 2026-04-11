"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { batchUpdatePricing, updateBranchProduct } from "@/lib/server/pricing-data";
import type { PricingAdjustmentType } from "@/lib/types";

function extractReturnTo(formData: FormData) {
  const returnTo = String(formData.get("returnTo") || "/admin/pricing");
  return returnTo.startsWith("/admin/pricing") ? returnTo : "/admin/pricing";
}

export async function updateBranchProductAction(formData: FormData) {
  const session = await getAdminSession();
  const returnTo = extractReturnTo(formData);

  if (!session) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") || "");
  const price = Number(formData.get("price") || 0);
  const stockStatus = String(formData.get("stockStatus") || "in_stock") as
    | "in_stock"
    | "out_of_stock"
    | "hidden";

  if (!id || Number.isNaN(price) || price < 0) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=invalid`);
  }

  try {
    await updateBranchProduct({
      id,
      price,
      stockStatus
    });
  } catch {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=update-error`);
  }

  revalidatePath("/admin/pricing");
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=updated`);
}

export async function batchUpdatePricingAction(formData: FormData) {
  const session = await getAdminSession();
  const returnTo = extractReturnTo(formData);

  if (!session) {
    redirect("/admin/login");
  }

  const branchIds = formData.getAll("branchIds").map(String).filter(Boolean);
  const categoryId = String(formData.get("categoryId") || "");
  const adjustmentType = String(formData.get("adjustmentType") || "percentage") as PricingAdjustmentType;
  const adjustmentValue = Number(formData.get("adjustmentValue") || 0);

  if (!branchIds.length || Number.isNaN(adjustmentValue)) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=batch-invalid`);
  }

  try {
    await batchUpdatePricing({
      branchIds,
      categoryId: categoryId || undefined,
      adjustmentType,
      adjustmentValue
    });
  } catch {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=batch-error`);
  }

  revalidatePath("/admin/pricing");
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=batch-updated`);
}
