"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { DEFAULT_BRAND_THEME } from "@/lib/brand-theme";
import {
  createAdminBranch,
  createAdminCategory,
  createAdminProduct,
  deleteAdminProduct,
  listAdminBranches,
  moveAdminProduct,
  updateAdminBranch,
  updateAdminBrandSettings,
  updateAdminCategory,
  updateAdminProduct,
  toggleAdminBranchStatus,
  toggleAdminCategoryStatus,
  toggleAdminProductStatus,
  upsertBranchHours
} from "@/lib/server/admin-data";
import { upsertProductBranchPricing } from "@/lib/server/pricing-data";

function statusUrl(path: string, status: string) {
  const hashIdx = path.indexOf("#");
  const base = hashIdx === -1 ? path : path.slice(0, hashIdx);
  const hash = hashIdx === -1 ? "" : path.slice(hashIdx);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}status=${status}${hash}`;
}

function getReturnTo(formData: FormData, fallbackPath: string) {
  const raw = String(formData.get("returnTo") || fallbackPath);
  const returnTo = raw.split("#")[0]; // strip fragment — redirect() doesn't support fragment URLs
  return returnTo.startsWith(fallbackPath) ? returnTo : fallbackPath;
}

async function requireSessionOrRedirect() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

function isHexColor(value: string) {
  return /^#([0-9a-fA-F]{6})$/.test(value);
}

type StockStatus = "in_stock" | "out_of_stock" | "hidden";

function isStockStatus(value: string): value is StockStatus {
  return value === "in_stock" || value === "out_of_stock" || value === "hidden";
}

async function parseBranchPricing(formData: FormData) {
  const pricingMode = String(formData.get("pricingMode") || "uniform");
  const branchIds = formData.getAll("branchIds").map(String).filter(Boolean);

  if (pricingMode === "per_branch" && branchIds.length > 0) {
    return branchIds.map((branchId) => {
      const price = Number(String(formData.get(`branch_${branchId}_price`) || "0"));
      const rawStatus = String(formData.get(`branch_${branchId}_stockStatus`) || "in_stock");
      const stockStatus: StockStatus = isStockStatus(rawStatus) ? rawStatus : "in_stock";
      return { branchId, price: Number.isNaN(price) ? 0 : price, stockStatus };
    });
  }

  // Uniform mode: apply same price/status to all active branches
  const uniformPrice = Number(String(formData.get("uniformPrice") || "0"));
  const rawStatus = String(formData.get("uniformStockStatus") || "in_stock");
  const uniformStockStatus: StockStatus = isStockStatus(rawStatus) ? rawStatus : "in_stock";
  const price = Number.isNaN(uniformPrice) ? 0 : uniformPrice;

  const activeBranches = await listAdminBranches();
  return activeBranches
    .filter((b) => b.isActive)
    .map((b) => ({ branchId: b.id, price, stockStatus: uniformStockStatus }));
}

export async function createBranchAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/branches");

  const payload = {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    district: String(formData.get("district") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").trim(),
    mapUrl: String(formData.get("mapUrl") || "").trim(),
    reviewUrl: String(formData.get("reviewUrl") || "").trim(),
    instagram: String(formData.get("instagram") || "").trim().replace(/^@/, "")
  };

  if (
    !payload.name ||
    !payload.slug ||
    !payload.address ||
    !payload.district ||
    !payload.city ||
    !payload.mapUrl
  ) {
    const hashIdx = returnTo.indexOf("#");
    const base = hashIdx === -1 ? returnTo : returnTo.slice(0, hashIdx);
    const sep = base.includes("?") ? "&" : "?";
    const fields = new URLSearchParams({
      status: "invalid",
      f_name: payload.name,
      f_slug: payload.slug,
      f_address: payload.address,
      f_district: payload.district,
      f_city: payload.city,
      f_phone: payload.phone,
      f_whatsapp: payload.whatsapp,
      f_mapUrl: payload.mapUrl,
      f_reviewUrl: payload.reviewUrl
    });
    redirect(`${base}${sep}${fields.toString()}`);
  }

  try {
    await createAdminBranch({
      ...payload,
      reviewUrl: payload.reviewUrl || undefined,
      instagram: payload.instagram || undefined
    });
  } catch {
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/branches");
  redirect(statusUrl("/admin/branches", "created"));
}

export async function updateBranchAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/branches");

  const payload = {
    id: String(formData.get("id") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    district: String(formData.get("district") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").trim(),
    mapUrl: String(formData.get("mapUrl") || "").trim(),
    reviewUrl: String(formData.get("reviewUrl") || "").trim(),
    instagram: String(formData.get("instagram") || "").trim().replace(/^@/, "")
  };

  if (
    !payload.id ||
    !payload.name ||
    !payload.slug ||
    !payload.address ||
    !payload.district ||
    !payload.city ||
    !payload.mapUrl
  ) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  try {
    await updateAdminBranch({
      ...payload,
      reviewUrl: payload.reviewUrl || undefined,
      instagram: payload.instagram || undefined
    });
  } catch {
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/branches");
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  revalidatePath("/b/[branchSlug]", "page");
  redirect(statusUrl(returnTo, "updated"));
}

export async function createCategoryAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/categories");

  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name || !slug) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  try {
    await createAdminCategory({
      name,
      slug,
      description: description || undefined
    });
  } catch {
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  redirect(statusUrl("/admin/categories", "created"));
}

export async function updateCategoryAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/categories");

  const payload = {
    id: String(formData.get("id") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    description: String(formData.get("description") || "").trim()
  };

  if (!payload.id || !payload.name || !payload.slug) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  try {
    await updateAdminCategory({
      id: payload.id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description || undefined
    });
  } catch {
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  revalidatePath("/b/[branchSlug]", "page");
  redirect(statusUrl(returnTo, "updated"));
}

export async function createProductAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/products");

  const payload = {
    categoryId: String(formData.get("categoryId") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    imageUrl: String(formData.get("imageUrl") || "").trim(),
    badgeLabel: String(formData.get("badgeLabel") || "").trim(),
    isFeatured: formData.get("isFeatured") === "on"
  };

  if (
    !payload.categoryId ||
    !payload.name ||
    !payload.slug ||
    !payload.description ||
    !payload.imageUrl
  ) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  try {
    const branchPrices = await parseBranchPricing(formData);
    const initialPrice = branchPrices.length > 0 ? branchPrices[0].price : 0;

    await createAdminProduct({
      categoryId: payload.categoryId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      imageUrl: payload.imageUrl,
      badgeLabel: payload.badgeLabel || undefined,
      initialPrice,
      isFeatured: payload.isFeatured,
      branchPrices
    });
  } catch (err) {
    console.error("[createProductAction]", err);
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  redirect(statusUrl("/admin/products", "created"));
}

export async function updateProductAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/products");

  const payload = {
    id: String(formData.get("id") || "").trim(),
    categoryId: String(formData.get("categoryId") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    imageUrl: String(formData.get("imageUrl") || "").trim(),
    badgeLabel: String(formData.get("badgeLabel") || "").trim(),
    isFeatured: formData.get("isFeatured") === "on"
  };

  if (
    !payload.id ||
    !payload.categoryId ||
    !payload.name ||
    !payload.slug ||
    !payload.description ||
    !payload.imageUrl
  ) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  try {
    await updateAdminProduct({
      id: payload.id,
      categoryId: payload.categoryId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      imageUrl: payload.imageUrl,
      badgeLabel: payload.badgeLabel || undefined,
      isFeatured: payload.isFeatured
    });

    const branchPrices = await parseBranchPricing(formData);
    if (branchPrices.length > 0) {
      await upsertProductBranchPricing(payload.id, branchPrices);
    }
  } catch (err) {
    console.error("[updateProductAction]", err);
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  redirect(statusUrl(returnTo, "updated"));
}

export async function deleteProductAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/products");

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  try {
    await deleteAdminProduct(id);
  } catch {
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  redirect(statusUrl(returnTo, "deleted"));
}

export async function moveProductAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/products");

  const id = String(formData.get("id") || "").trim();
  const direction = String(formData.get("direction") || "") as "up" | "down";

  if (!id || (direction !== "up" && direction !== "down")) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  try {
    await moveAdminProduct(id, direction);
  } catch {
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect(statusUrl(returnTo, "reordered"));
}

export async function updateBrandSettingsAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/branding");

  const name = String(formData.get("name") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const badge = String(formData.get("badge") || "").trim();
  const seoTitle = String(formData.get("seoTitle") || "").trim();
  const seoDescription = String(formData.get("seoDescription") || "").trim();
  const primaryColor = String(formData.get("primaryColor") || DEFAULT_BRAND_THEME.primaryColor).trim();
  const secondaryColor = String(formData.get("secondaryColor") || DEFAULT_BRAND_THEME.secondaryColor).trim();
  const backgroundColor = String(
    formData.get("backgroundColor") || DEFAULT_BRAND_THEME.backgroundColor
  ).trim();

  if (
    !name ||
    !tagline ||
    !badge ||
    !isHexColor(primaryColor) ||
    !isHexColor(secondaryColor) ||
    !isHexColor(backgroundColor)
  ) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  try {
    await updateAdminBrandSettings({
      name,
      logoUrl,
      tagline,
      badge,
      seoTitle,
      seoDescription,
      theme: {
        primaryColor,
        secondaryColor,
        backgroundColor
      }
    });
  } catch {
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/branding");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/b/[branchSlug]", "page");
  redirect(statusUrl("/admin/branding", "updated"));
}

export async function toggleBranchStatusAction(formData: FormData) {
  await requireSessionOrRedirect();

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    redirect(statusUrl("/admin/branches", "invalid"));
  }

  try {
    await toggleAdminBranchStatus(id);
  } catch {
    redirect(statusUrl("/admin/branches", "error"));
  }

  revalidatePath("/admin/branches");
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  redirect(statusUrl("/admin/branches", "toggled"));
}

export async function toggleCategoryStatusAction(formData: FormData) {
  await requireSessionOrRedirect();

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    redirect(statusUrl("/admin/categories", "invalid"));
  }

  try {
    await toggleAdminCategoryStatus(id);
  } catch {
    redirect(statusUrl("/admin/categories", "error"));
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/pricing");
  redirect(statusUrl("/admin/categories", "toggled"));
}

export async function upsertBranchHoursAction(formData: FormData) {
  await requireSessionOrRedirect();

  const branchId = String(formData.get("branchId") || "").trim();
  const returnTo = getReturnTo(formData, "/admin/branches");

  if (!branchId) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  const days = [1, 2, 3, 4, 5, 6, 7];
  const hours = days.map((day) => ({
    dayOfWeek: day,
    isClosed: formData.get(`day_${day}_closed`) === "on",
    openTime: String(formData.get(`day_${day}_open`) || "").trim() || null,
    closeTime: String(formData.get(`day_${day}_close`) || "").trim() || null
  }));

  try {
    await upsertBranchHours(branchId, hours);
  } catch {
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/branches");
  revalidatePath("/b/[branchSlug]", "page");
  redirect(statusUrl(returnTo, "hours_updated"));
}

export async function toggleProductStatusAction(formData: FormData) {
  await requireSessionOrRedirect();
  const returnTo = getReturnTo(formData, "/admin/products");

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    redirect(statusUrl(returnTo, "invalid"));
  }

  try {
    await toggleAdminProductStatus(id);
  } catch {
    redirect(statusUrl(returnTo, "error"));
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  redirect(statusUrl(returnTo, "toggled"));
}
