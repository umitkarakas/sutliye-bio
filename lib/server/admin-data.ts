import { branchProducts, branches, categories, products } from "@/lib/demo-data";
import { business as demoBusiness } from "@/lib/demo-data";
import { createBrandTheme } from "@/lib/brand-theme";
import { hasDatabaseUrl, queryFirst, withDb, withTransaction, type DbQueryable } from "@/lib/db";
import type { BrandTheme } from "@/lib/types";

type ProductPriceSummary = {
  activeBranchCount: number;
  pricedBranchCount: number;
  minPrice: number | null;
  maxPrice: number | null;
};

export type AdminBranchListItem = {
  id: string;
  name: string;
  slug: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  whatsapp: string;
  mapUrl: string;
  reviewUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
};

export type AdminCategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  displayOrder: number;
};

export type AdminProductListItem = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  badgeLabel?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  priceSummary: ProductPriceSummary;
};

export type AdminBrandSettings = {
  name: string;
  logoUrl: string;
  tagline: string;
  badge: string;
  seoTitle: string;
  seoDescription: string;
  theme: BrandTheme;
};

type BusinessIdRow = {
  id: string;
};

type BusinessSettingsRow = {
  id: string;
  name: string;
  logoUrl: string | null;
  brandTagline: string | null;
  brandBadge: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
};

type BranchRow = AdminBranchListItem;

type CategoryRow = AdminCategoryListItem;

type ProductAggregateRow = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  badgeLabel: string | null;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  activeBranchCount: number;
  pricedBranchCount: number;
  minPrice: string | number | null;
  maxPrice: string | number | null;
};

type ProductRow = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  badgeLabel: string | null;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
};

type ToggleStateRow = {
  isActive: boolean;
};

type DisplayOrderRow = {
  displayOrder: number;
};

function getDemoProductPriceSummary(productId: string): ProductPriceSummary {
  const matchingEntries = branchProducts.filter((entry) => entry.productId === productId);
  const prices = matchingEntries.map((entry) => entry.price).filter((price) => price > 0);

  return {
    activeBranchCount: branches.length,
    pricedBranchCount: prices.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null
  };
}

function logAdminFallback(error: unknown, scope: string) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.warn(`[admin-data] Falling back to demo data for ${scope}: ${message}`);
}

async function getPrimaryBusinessId(queryable: DbQueryable) {
  const business = await queryFirst<BusinessIdRow>(
    queryable,
    `
      SELECT id
      FROM "Business"
      ORDER BY "createdAt" ASC
      LIMIT 1
    `
  );

  if (!business) {
    throw new Error("No business found. Seed the database first.");
  }

  return business.id;
}

function getDemoBrandSettings(): AdminBrandSettings {
  return {
    name: demoBusiness.name,
    logoUrl: demoBusiness.logoUrl ?? "",
    tagline: demoBusiness.tagline,
    badge: demoBusiness.badge,
    seoTitle: demoBusiness.seoTitle ?? demoBusiness.name,
    seoDescription: demoBusiness.seoDescription ?? demoBusiness.tagline,
    theme: createBrandTheme(demoBusiness.theme)
  };
}

function normalizeProductRow(product: ProductRow) {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.imageUrl,
    badgeLabel: product.badgeLabel,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    displayOrder: product.displayOrder
  };
}

export async function getAdminBrandSettings(): Promise<AdminBrandSettings> {
  if (!hasDatabaseUrl()) {
    return getDemoBrandSettings();
  }

  try {
    const business = await withDb((db) =>
      queryFirst<BusinessSettingsRow>(
        db,
        `
          SELECT
            id,
            name,
            "logoUrl",
            "brandTagline",
            "brandBadge",
            "seoTitle",
            "seoDescription",
            "primaryColor",
            "secondaryColor",
            "backgroundColor"
          FROM "Business"
          ORDER BY "createdAt" ASC
          LIMIT 1
        `
      )
    );

    if (!business) {
      throw new Error("No business found. Seed the database first.");
    }

    return {
      name: business.name,
      logoUrl: business.logoUrl ?? "",
      tagline: business.brandTagline ?? demoBusiness.tagline,
      badge: business.brandBadge ?? demoBusiness.badge,
      seoTitle: business.seoTitle ?? demoBusiness.seoTitle ?? business.name,
      seoDescription:
        business.seoDescription ?? demoBusiness.seoDescription ?? business.brandTagline ?? demoBusiness.tagline,
      theme: createBrandTheme({
        primaryColor: business.primaryColor ?? demoBusiness.theme.primaryColor,
        secondaryColor: business.secondaryColor ?? demoBusiness.theme.secondaryColor,
        backgroundColor: business.backgroundColor ?? demoBusiness.theme.backgroundColor
      })
    };
  } catch (error) {
    logAdminFallback(error, "brand settings");
    return getDemoBrandSettings();
  }
}

export async function updateAdminBrandSettings(input: AdminBrandSettings) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withTransaction(async (db) => {
    const businessId = await getPrimaryBusinessId(db);
    const updated = await queryFirst<BusinessSettingsRow>(
      db,
      `
        UPDATE "Business"
        SET
          name = $2,
          "logoUrl" = $3,
          "brandTagline" = $4,
          "brandBadge" = $5,
          "seoTitle" = $6,
          "seoDescription" = $7,
          "primaryColor" = $8,
          "secondaryColor" = $9,
          "backgroundColor" = $10,
          "updatedAt" = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          "logoUrl",
          "brandTagline",
          "brandBadge",
          "seoTitle",
          "seoDescription",
          "primaryColor",
          "secondaryColor",
          "backgroundColor"
      `,
      [
        businessId,
        input.name,
        input.logoUrl || null,
        input.tagline,
        input.badge,
        input.seoTitle || null,
        input.seoDescription || null,
        input.theme.primaryColor,
        input.theme.secondaryColor,
        input.theme.backgroundColor
      ]
    );

    if (!updated) {
      throw new Error("Business not found.");
    }

    return updated;
  });
}

export async function listAdminBranches(): Promise<AdminBranchListItem[]> {
  if (!hasDatabaseUrl()) {
    return branches.map((branch, index) => ({
      id: branch.id,
      name: branch.name,
      slug: branch.slug,
      address: branch.address,
      district: branch.district,
      city: branch.city,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      mapUrl: branch.mapUrl,
      reviewUrl: branch.reviewUrl ?? null,
      isActive: true,
      displayOrder: index
    }));
  }

  try {
    const result = await withDb((db) =>
      db.query<BranchRow>(
        `
          SELECT
            id,
            name,
            slug,
            address,
            district,
            city,
            phone,
            whatsapp,
            "mapUrl",
            "reviewUrl",
            "isActive",
            "displayOrder"
          FROM "Branch"
          ORDER BY "displayOrder" ASC
        `
      )
    );

    return result.rows;
  } catch (error) {
    logAdminFallback(error, "branches");
    return branches.map((branch, index) => ({
      id: branch.id,
      name: branch.name,
      slug: branch.slug,
      address: branch.address,
      district: branch.district,
      city: branch.city,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      mapUrl: branch.mapUrl,
      reviewUrl: branch.reviewUrl ?? null,
      isActive: true,
      displayOrder: index
    }));
  }
}

export async function createAdminBranch(input: {
  name: string;
  slug: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  whatsapp: string;
  mapUrl: string;
  reviewUrl?: string;
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withTransaction(async (db) => {
    const businessId = await getPrimaryBusinessId(db);
    const nextDisplayOrder = await queryFirst<DisplayOrderRow>(
      db,
      `
        SELECT (COALESCE(MAX("displayOrder"), -1) + 1)::int AS "displayOrder"
        FROM "Branch"
      `
    );

    const branch = await queryFirst<BranchRow>(
      db,
      `
        INSERT INTO "Branch" (
          id,
          "businessId",
          name,
          slug,
          address,
          district,
          city,
          phone,
          whatsapp,
          "mapUrl",
          "reviewUrl",
          "displayOrder"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING
          id,
          name,
          slug,
          address,
          district,
          city,
          phone,
          whatsapp,
          "mapUrl",
          "reviewUrl",
          "isActive",
          "displayOrder"
      `,
      [
        crypto.randomUUID(),
        businessId,
        input.name,
        input.slug,
        input.address,
        input.district,
        input.city,
        input.phone,
        input.whatsapp,
        input.mapUrl,
        input.reviewUrl ?? null,
        nextDisplayOrder?.displayOrder ?? 0
      ]
    );

    if (!branch) {
      throw new Error("Failed to create branch.");
    }

    const activeProducts = await db.query<{ id: string }>(
      `
        SELECT id
        FROM "Product"
        WHERE "businessId" = $1
          AND "isActive" = TRUE
      `,
      [businessId]
    );

    for (const product of activeProducts.rows) {
      await db.query(
        `
          INSERT INTO "BranchProduct" (
            id,
            "branchId",
            "productId",
            price,
            "stockStatus",
            "isAvailable"
          )
          VALUES ($1, $2, $3, 0, 'hidden', FALSE)
        `,
        [crypto.randomUUID(), branch.id, product.id]
      );
    }

    return branch;
  });
}

export async function listAdminCategories(): Promise<AdminCategoryListItem[]> {
  if (!hasDatabaseUrl()) {
    return categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: null,
      isActive: true,
      displayOrder: index
    }));
  }

  try {
    const result = await withDb((db) =>
      db.query<CategoryRow>(
        `
          SELECT
            id,
            name,
            slug,
            description,
            "isActive",
            "displayOrder"
          FROM "MenuCategory"
          ORDER BY "displayOrder" ASC
        `
      )
    );

    return result.rows;
  } catch (error) {
    logAdminFallback(error, "categories");
    return categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: null,
      isActive: true,
      displayOrder: index
    }));
  }
}

export async function createAdminCategory(input: { name: string; slug: string; description?: string }) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withTransaction(async (db) => {
    const businessId = await getPrimaryBusinessId(db);
    const nextDisplayOrder = await queryFirst<DisplayOrderRow>(
      db,
      `
        SELECT (COALESCE(MAX("displayOrder"), -1) + 1)::int AS "displayOrder"
        FROM "MenuCategory"
      `
    );

    const category = await queryFirst<CategoryRow>(
      db,
      `
        INSERT INTO "MenuCategory" (
          id,
          "businessId",
          name,
          slug,
          description,
          "displayOrder"
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          name,
          slug,
          description,
          "isActive",
          "displayOrder"
      `,
      [
        crypto.randomUUID(),
        businessId,
        input.name,
        input.slug,
        input.description ?? null,
        nextDisplayOrder?.displayOrder ?? 0
      ]
    );

    if (!category) {
      throw new Error("Failed to create category.");
    }

    return category;
  });
}

export async function updateAdminBranch(input: {
  id: string;
  name: string;
  slug: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  whatsapp: string;
  mapUrl: string;
  reviewUrl?: string;
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withDb(async (db) => {
    const branch = await queryFirst<BranchRow>(
      db,
      `
        UPDATE "Branch"
        SET
          name = $2,
          slug = $3,
          address = $4,
          district = $5,
          city = $6,
          phone = $7,
          whatsapp = $8,
          "mapUrl" = $9,
          "reviewUrl" = $10,
          "updatedAt" = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          slug,
          address,
          district,
          city,
          phone,
          whatsapp,
          "mapUrl",
          "reviewUrl",
          "isActive",
          "displayOrder"
      `,
      [
        input.id,
        input.name,
        input.slug,
        input.address,
        input.district,
        input.city,
        input.phone,
        input.whatsapp,
        input.mapUrl,
        input.reviewUrl ?? null
      ]
    );

    if (!branch) {
      throw new Error("Branch not found.");
    }

    return branch;
  });
}

export async function updateAdminCategory(input: {
  id: string;
  name: string;
  slug: string;
  description?: string;
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withDb(async (db) => {
    const category = await queryFirst<CategoryRow>(
      db,
      `
        UPDATE "MenuCategory"
        SET
          name = $2,
          slug = $3,
          description = $4,
          "updatedAt" = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          slug,
          description,
          "isActive",
          "displayOrder"
      `,
      [input.id, input.name, input.slug, input.description ?? null]
    );

    if (!category) {
      throw new Error("Category not found.");
    }

    return category;
  });
}

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  if (!hasDatabaseUrl()) {
    return products.map((product, index) => ({
      id: product.id,
      name: product.name,
      slug: product.id,
      description: product.description,
      imageUrl: product.imageUrl,
      badgeLabel: product.badge,
      isFeatured: Boolean(product.badge),
      isActive: true,
      displayOrder: index,
      categoryId: product.categoryId,
      priceSummary: getDemoProductPriceSummary(product.id)
    }));
  }

  try {
    const result = await withDb((db) =>
      db.query<ProductAggregateRow>(
        `
          SELECT
            p.id,
            p."categoryId" AS "categoryId",
            p.name,
            p.slug,
            p.description,
            p."imageUrl" AS "imageUrl",
            p."badgeLabel" AS "badgeLabel",
            p."isFeatured" AS "isFeatured",
            p."isActive" AS "isActive",
            p."displayOrder" AS "displayOrder",
            COUNT(DISTINCT bp."branchId") FILTER (WHERE b."isActive" = TRUE)::int AS "activeBranchCount",
            COUNT(bp.id) FILTER (WHERE b."isActive" = TRUE AND bp.price > 0)::int AS "pricedBranchCount",
            MIN(bp.price) FILTER (WHERE b."isActive" = TRUE AND bp.price > 0) AS "minPrice",
            MAX(bp.price) FILTER (WHERE b."isActive" = TRUE AND bp.price > 0) AS "maxPrice"
          FROM "Product" p
          LEFT JOIN "BranchProduct" bp ON bp."productId" = p.id
          LEFT JOIN "Branch" b ON b.id = bp."branchId"
          GROUP BY
            p.id,
            p."categoryId",
            p.name,
            p.slug,
            p.description,
            p."imageUrl",
            p."badgeLabel",
            p."isFeatured",
            p."isActive",
            p."displayOrder"
          ORDER BY p."displayOrder" ASC
        `
      )
    );

    return result.rows.map((product) => ({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.imageUrl,
      badgeLabel: product.badgeLabel,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      displayOrder: product.displayOrder,
      priceSummary: {
        activeBranchCount: product.activeBranchCount,
        pricedBranchCount: product.pricedBranchCount,
        minPrice: product.minPrice === null ? null : Number(product.minPrice),
        maxPrice: product.maxPrice === null ? null : Number(product.maxPrice)
      }
    }));
  } catch (error) {
    logAdminFallback(error, "products");
    return products.map((product, index) => ({
      id: product.id,
      name: product.name,
      slug: product.id,
      description: product.description,
      imageUrl: product.imageUrl,
      badgeLabel: product.badge,
      isFeatured: Boolean(product.badge),
      isActive: true,
      displayOrder: index,
      categoryId: product.categoryId,
      priceSummary: getDemoProductPriceSummary(product.id)
    }));
  }
}

export async function createAdminProduct(input: {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  badgeLabel?: string;
  isFeatured?: boolean;
  initialPrice: number;
  branchPrices?: Array<{
    branchId: string;
    price: number;
    stockStatus: "in_stock" | "out_of_stock" | "hidden";
  }>;
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withTransaction(async (db) => {
    const businessId = await getPrimaryBusinessId(db);
    const nextDisplayOrder = await queryFirst<DisplayOrderRow>(
      db,
      `
        SELECT (COALESCE(MAX("displayOrder"), -1) + 1)::int AS "displayOrder"
        FROM "Product"
      `
    );

    const product = await queryFirst<ProductRow>(
      db,
      `
        INSERT INTO "Product" (
          id,
          "businessId",
          "categoryId",
          name,
          slug,
          description,
          "imageUrl",
          "badgeLabel",
          "isFeatured",
          "displayOrder"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
          id,
          "categoryId" AS "categoryId",
          name,
          slug,
          description,
          "imageUrl" AS "imageUrl",
          "badgeLabel" AS "badgeLabel",
          "isFeatured" AS "isFeatured",
          "isActive" AS "isActive",
          "displayOrder" AS "displayOrder"
      `,
      [
        crypto.randomUUID(),
        businessId,
        input.categoryId,
        input.name,
        input.slug,
        input.description,
        input.imageUrl,
        input.badgeLabel ?? null,
        input.isFeatured ?? Boolean(input.badgeLabel),
        nextDisplayOrder?.displayOrder ?? 0
      ]
    );

    if (!product) {
      throw new Error("Failed to create product.");
    }

    const activeBranches = await db.query<{ id: string }>(
      `
        SELECT id
        FROM "Branch"
        WHERE "businessId" = $1
          AND "isActive" = TRUE
      `,
      [businessId]
    );

    for (const branch of activeBranches.rows) {
      const branchPrice = input.branchPrices?.find((bp) => bp.branchId === branch.id);
      const price = branchPrice?.price ?? input.initialPrice;
      const stockStatus = branchPrice?.stockStatus ?? (price > 0 ? "in_stock" : "hidden");
      const isAvailable = stockStatus === "in_stock";

      await db.query(
        `
          INSERT INTO "BranchProduct" (
            id,
            "branchId",
            "productId",
            price,
            "stockStatus",
            "isAvailable"
          )
          VALUES ($1, $2, $3, $4::numeric(10, 2), $5::"StockStatus", $6)
        `,
        [crypto.randomUUID(), branch.id, product.id, price.toFixed(2), stockStatus, isAvailable]
      );
    }

    return normalizeProductRow(product);
  });
}

export async function updateAdminProduct(input: {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  badgeLabel?: string;
  isFeatured: boolean;
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withDb(async (db) => {
    const product = await queryFirst<ProductRow>(
      db,
      `
        UPDATE "Product"
        SET
          "categoryId" = $2,
          name = $3,
          slug = $4,
          description = $5,
          "imageUrl" = $6,
          "badgeLabel" = $7,
          "isFeatured" = $8,
          "updatedAt" = NOW()
        WHERE id = $1
        RETURNING
          id,
          "categoryId" AS "categoryId",
          name,
          slug,
          description,
          "imageUrl" AS "imageUrl",
          "badgeLabel" AS "badgeLabel",
          "isFeatured" AS "isFeatured",
          "isActive" AS "isActive",
          "displayOrder" AS "displayOrder"
      `,
      [
        input.id,
        input.categoryId,
        input.name,
        input.slug,
        input.description,
        input.imageUrl,
        input.badgeLabel ?? null,
        input.isFeatured
      ]
    );

    if (!product) {
      throw new Error("Product not found.");
    }

    return normalizeProductRow(product);
  });
}

export async function deleteAdminProduct(id: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withDb(async (db) => {
    const product = await queryFirst<ProductRow>(
      db,
      `
        DELETE FROM "Product"
        WHERE id = $1
        RETURNING
          id,
          "categoryId" AS "categoryId",
          name,
          slug,
          description,
          "imageUrl" AS "imageUrl",
          "badgeLabel" AS "badgeLabel",
          "isFeatured" AS "isFeatured",
          "isActive" AS "isActive",
          "displayOrder" AS "displayOrder"
      `,
      [id]
    );

    if (!product) {
      throw new Error("Product not found.");
    }

    return normalizeProductRow(product);
  });
}

export async function moveAdminProduct(id: string, direction: "up" | "down") {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withTransaction(async (db) => {
    const currentProduct = await queryFirst<ProductRow>(
      db,
      `
        SELECT
          id,
          "categoryId" AS "categoryId",
          name,
          slug,
          description,
          "imageUrl" AS "imageUrl",
          "badgeLabel" AS "badgeLabel",
          "isFeatured" AS "isFeatured",
          "isActive" AS "isActive",
          "displayOrder" AS "displayOrder"
        FROM "Product"
        WHERE id = $1
      `,
      [id]
    );

    if (!currentProduct) {
      throw new Error("Product not found.");
    }

    const swapCandidate = await queryFirst<ProductRow>(
      db,
      `
        SELECT
          id,
          "categoryId" AS "categoryId",
          name,
          slug,
          description,
          "imageUrl" AS "imageUrl",
          "badgeLabel" AS "badgeLabel",
          "isFeatured" AS "isFeatured",
          "isActive" AS "isActive",
          "displayOrder" AS "displayOrder"
        FROM "Product"
        WHERE "displayOrder" ${direction === "up" ? "<" : ">"} $1
        ORDER BY "displayOrder" ${direction === "up" ? "DESC" : "ASC"}
        LIMIT 1
      `,
      [currentProduct.displayOrder]
    );

    if (!swapCandidate) {
      return normalizeProductRow(currentProduct);
    }

    await db.query(
      `
        UPDATE "Product"
        SET "displayOrder" = $2, "updatedAt" = NOW()
        WHERE id = $1
      `,
      [currentProduct.id, swapCandidate.displayOrder]
    );

    const updatedSwap = await queryFirst<ProductRow>(
      db,
      `
        UPDATE "Product"
        SET "displayOrder" = $2, "updatedAt" = NOW()
        WHERE id = $1
        RETURNING
          id,
          "categoryId" AS "categoryId",
          name,
          slug,
          description,
          "imageUrl" AS "imageUrl",
          "badgeLabel" AS "badgeLabel",
          "isFeatured" AS "isFeatured",
          "isActive" AS "isActive",
          "displayOrder" AS "displayOrder"
      `,
      [swapCandidate.id, currentProduct.displayOrder]
    );

    if (!updatedSwap) {
      throw new Error("Failed to move product.");
    }

    return normalizeProductRow(updatedSwap);
  });
}

export async function toggleAdminBranchStatus(id: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withDb(async (db) => {
    const branch = await queryFirst<ToggleStateRow>(
      db,
      `
        SELECT "isActive" AS "isActive"
        FROM "Branch"
        WHERE id = $1
      `,
      [id]
    );

    if (!branch) {
      throw new Error("Branch not found.");
    }

    return db.query(
      `
        UPDATE "Branch"
        SET "isActive" = $2, "updatedAt" = NOW()
        WHERE id = $1
      `,
      [id, !branch.isActive]
    );
  });
}

export async function toggleAdminCategoryStatus(id: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withDb(async (db) => {
    const category = await queryFirst<ToggleStateRow>(
      db,
      `
        SELECT "isActive" AS "isActive"
        FROM "MenuCategory"
        WHERE id = $1
      `,
      [id]
    );

    if (!category) {
      throw new Error("Category not found.");
    }

    return db.query(
      `
        UPDATE "MenuCategory"
        SET "isActive" = $2, "updatedAt" = NOW()
        WHERE id = $1
      `,
      [id, !category.isActive]
    );
  });
}

export type BranchHourItem = {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

type BranchHourRow = {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

export async function getBranchHours(branchId: string): Promise<BranchHourItem[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  try {
    const result = await withDb((db) =>
      db.query<BranchHourRow>(
        `
          SELECT
            "dayOfWeek",
            "openTime",
            "closeTime",
            "isClosed"
          FROM "BranchHour"
          WHERE "branchId" = $1
          ORDER BY "dayOfWeek" ASC
        `,
        [branchId]
      )
    );

    return result.rows;
  } catch (error) {
    logAdminFallback(error, "branch hours");
    return [];
  }
}

export async function upsertBranchHours(
  branchId: string,
  hours: BranchHourItem[]
): Promise<void> {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withTransaction(async (db) => {
    for (const hour of hours) {
      await db.query(
        `
          INSERT INTO "BranchHour" (id, "branchId", "dayOfWeek", "openTime", "closeTime", "isClosed")
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT ("branchId", "dayOfWeek")
          DO UPDATE SET
            "openTime" = EXCLUDED."openTime",
            "closeTime" = EXCLUDED."closeTime",
            "isClosed" = EXCLUDED."isClosed"
        `,
        [
          crypto.randomUUID(),
          branchId,
          hour.dayOfWeek,
          hour.isClosed ? null : (hour.openTime || null),
          hour.isClosed ? null : (hour.closeTime || null),
          hour.isClosed
        ]
      );
    }
  });
}

export async function toggleAdminProductStatus(id: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withDb(async (db) => {
    const product = await queryFirst<ToggleStateRow>(
      db,
      `
        SELECT "isActive" AS "isActive"
        FROM "Product"
        WHERE id = $1
      `,
      [id]
    );

    if (!product) {
      throw new Error("Product not found.");
    }

    return db.query(
      `
        UPDATE "Product"
        SET "isActive" = $2, "updatedAt" = NOW()
        WHERE id = $1
      `,
      [id, !product.isActive]
    );
  });
}
