"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import {
  createAdminBranch,
  createAdminCategory,
  createAdminProduct,
  toggleAdminBranchStatus,
  toggleAdminCategoryStatus,
  toggleAdminProductStatus
} from "@/lib/server/admin-data";

function statusUrl(path: string, status: string) {
  return `${path}${path.includes("?") ? "&" : "?"}status=${status}`;
}

async function requireSessionOrRedirect() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function createBranchAction(formData: FormData) {
  await requireSessionOrRedirect();

  const payload = {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    district: String(formData.get("district") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").trim(),
    mapUrl: String(formData.get("mapUrl") || "").trim()
  };

  if (Object.values(payload).some((value) => !value)) {
    redirect(statusUrl("/admin/branches", "invalid"));
  }

  try {
    await createAdminBranch(payload);
  } catch {
    redirect(statusUrl("/admin/branches", "error"));
  }

  revalidatePath("/admin/branches");
  redirect(statusUrl("/admin/branches", "created"));
}

export async function createCategoryAction(formData: FormData) {
  await requireSessionOrRedirect();

  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name || !slug) {
    redirect(statusUrl("/admin/categories", "invalid"));
  }

  try {
    await createAdminCategory({
      name,
      slug,
      description: description || undefined
    });
  } catch {
    redirect(statusUrl("/admin/categories", "error"));
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  redirect(statusUrl("/admin/categories", "created"));
}

export async function createProductAction(formData: FormData) {
  await requireSessionOrRedirect();

  const payload = {
    categoryId: String(formData.get("categoryId") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    badgeLabel: String(formData.get("badgeLabel") || "").trim()
  };

  if (!payload.categoryId || !payload.name || !payload.slug || !payload.description) {
    redirect(statusUrl("/admin/products", "invalid"));
  }

  try {
    await createAdminProduct({
      categoryId: payload.categoryId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      badgeLabel: payload.badgeLabel || undefined
    });
  } catch {
    redirect(statusUrl("/admin/products", "error"));
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/pricing");
  redirect(statusUrl("/admin/products", "created"));
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

export async function toggleProductStatusAction(formData: FormData) {
  await requireSessionOrRedirect();

  const id = String(formData.get("id") || "").trim();

  if (!id) {
    redirect(statusUrl("/admin/products", "invalid"));
  }

  try {
    await toggleAdminProductStatus(id);
  } catch {
    redirect(statusUrl("/admin/products", "error"));
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/pricing");
  revalidatePath("/");
  redirect(statusUrl("/admin/products", "toggled"));
}
