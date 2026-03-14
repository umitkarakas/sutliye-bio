import { branchProducts, branches, categories, products } from "@/lib/demo-data";
import { hasDatabaseUrl, withDb, withTransaction } from "@/lib/db";
import type { PricingAdjustmentType, PricingMatrixData, PricingMatrixRow } from "@/lib/types";

type PricingMatrixFilters = {
  branchIds?: string[];
  categoryId?: string;
  search?: string;
};

type BatchPricingInput = {
  branchIds: string[];
  categoryId?: string;
  productIds?: string[];
  adjustmentType: PricingAdjustmentType;
  adjustmentValue: number;
  previewOnly?: boolean;
};

type BranchRow = {
  id: string;
  name: string;
  slug: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type PricingMatrixDbRow = {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  badgeLabel: string | null;
  branchProductId: string | null;
  branchId: string | null;
  price: string | number | null;
  stockStatus: "in_stock" | "out_of_stock" | "hidden" | null;
  isAvailable: boolean | null;
};

type BranchProductRow = {
  id: string;
  branchId: string;
  productId: string;
  price: string | number;
  stockStatus: "in_stock" | "out_of_stock" | "hidden";
  isAvailable: boolean;
  stockQuantity: number | null;
  currency: string;
};

type BatchPreviewRow = {
  id: string;
  branchName: string;
  productName: string;
  price: string | number;
};

function normalizeBranchIds(input: string[] | undefined, availableIds: string[]) {
  const sanitized = (input ?? []).filter(Boolean).filter((id) => availableIds.includes(id));
  return sanitized.length > 0 ? sanitized : availableIds;
}

function includesSearch(value: string, search: string) {
  return value.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr"));
}

function computeAdjustedPrice(currentPrice: number, type: PricingAdjustmentType, value: number) {
  if (type === "percentage") {
    return Number((currentPrice * (1 + value / 100)).toFixed(2));
  }

  if (type === "fixed_delta") {
    return Number((currentPrice + value).toFixed(2));
  }

  return Number(value.toFixed(2));
}

function buildDemoPricingMatrix(filters: PricingMatrixFilters = {}): PricingMatrixData {
  const availableBranchIds = branches.map((branch) => branch.id);
  const selectedBranchIds = normalizeBranchIds(filters.branchIds, availableBranchIds);
  const selectedCategoryId = filters.categoryId ?? "";
  const search = (filters.search ?? "").trim();

  const rows: PricingMatrixRow[] = products
    .filter((product) => (selectedCategoryId ? product.categoryId === selectedCategoryId : true))
    .filter((product) =>
      search
        ? includesSearch(product.name, search) || includesSearch(product.description, search)
        : true
    )
    .map((product) => {
      const category = categories.find((entry) => entry.id === product.categoryId);

      return {
        productId: product.id,
        productName: product.name,
        categoryId: product.categoryId,
        categoryName: category?.name ?? "Kategori",
        badge: product.badge,
        cells: selectedBranchIds.map((branchId) => {
          const branch = branches.find((entry) => entry.id === branchId);
          const branchProduct = branchProducts.find(
            (entry) => entry.branchId === branchId && entry.productId === product.id
          );

          return {
            id: `${branchId}:${product.id}`,
            branchId,
            branchName: branch?.name ?? "Şube",
            price: branchProduct?.price ?? null,
            stockStatus: branchProduct?.stockStatus ?? "hidden",
            isAvailable: branchProduct?.stockStatus === "in_stock",
            canEdit: false
          };
        })
      };
    });

  return {
    isDemo: true,
    branches: branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
      slug: branch.slug
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug
    })),
    rows,
    selectedBranchIds,
    selectedCategoryId,
    search
  };
}

function normalizeBranchProduct(row: BranchProductRow) {
  return {
    id: row.id,
    branchId: row.branchId,
    productId: row.productId,
    price: Number(row.price),
    stockStatus: row.stockStatus,
    isAvailable: row.isAvailable,
    stockQuantity: row.stockQuantity,
    currency: row.currency
  };
}

export async function listPricingMatrix(filters: PricingMatrixFilters = {}): Promise<PricingMatrixData> {
  if (!hasDatabaseUrl()) {
    return buildDemoPricingMatrix(filters);
  }

  try {
    return await withDb(async (db) => {
      const [dbBranchesResult, dbCategoriesResult] = await Promise.all([
        db.query<BranchRow>(
          `
            SELECT id, name, slug
            FROM "Branch"
            WHERE "isActive" = TRUE
            ORDER BY "displayOrder" ASC
          `
        ),
        db.query<CategoryRow>(
          `
            SELECT id, name, slug
            FROM "MenuCategory"
            WHERE "isActive" = TRUE
            ORDER BY "displayOrder" ASC
          `
        )
      ]);

      const dbBranches = dbBranchesResult.rows;
      const dbCategories = dbCategoriesResult.rows;
      const availableBranchIds = dbBranches.map((branch) => branch.id);
      const selectedBranchIds = normalizeBranchIds(filters.branchIds, availableBranchIds);
      const selectedCategoryId = filters.categoryId ?? "";
      const search = (filters.search ?? "").trim();
      const searchPattern = search ? `%${search}%` : null;

      const dbProducts = await db.query<PricingMatrixDbRow>(
        `
          SELECT
            p.id AS "productId",
            p.name AS "productName",
            p."categoryId" AS "categoryId",
            c.name AS "categoryName",
            p."badgeLabel" AS "badgeLabel",
            bp.id AS "branchProductId",
            bp."branchId" AS "branchId",
            bp.price,
            bp."stockStatus" AS "stockStatus",
            bp."isAvailable" AS "isAvailable"
          FROM "Product" p
          INNER JOIN "MenuCategory" c ON c.id = p."categoryId"
          LEFT JOIN "BranchProduct" bp
            ON bp."productId" = p.id
           AND bp."branchId" = ANY($1::text[])
          WHERE p."isActive" = TRUE
            AND ($2::text = '' OR p."categoryId" = $2)
            AND ($3::text IS NULL OR p.name ILIKE $3 OR p.description ILIKE $3)
          ORDER BY p."displayOrder" ASC, bp."branchId" ASC
        `,
        [selectedBranchIds, selectedCategoryId, searchPattern]
      );

      const rowsByProduct = new Map<string, PricingMatrixRow>();

      for (const row of dbProducts.rows) {
        if (!rowsByProduct.has(row.productId)) {
          rowsByProduct.set(row.productId, {
            productId: row.productId,
            productName: row.productName,
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            badge: row.badgeLabel ?? undefined,
            cells: []
          });
        }
      }

      for (const product of rowsByProduct.values()) {
        product.cells = selectedBranchIds.map((branchId) => {
          const branch = dbBranches.find((entry) => entry.id === branchId);
          const match = dbProducts.rows.find(
            (entry) => entry.productId === product.productId && entry.branchId === branchId
          );

          return {
            id: match?.branchProductId ?? `${branchId}:${product.productId}`,
            branchId,
            branchName: branch?.name ?? "Şube",
            price: match?.price === null || match?.price === undefined ? null : Number(match.price),
            stockStatus: match?.stockStatus ?? "hidden",
            isAvailable: match?.isAvailable ?? false,
            canEdit: Boolean(match?.branchProductId)
          };
        });
      }

      return {
        isDemo: false,
        branches: dbBranches,
        categories: dbCategories,
        rows: [...rowsByProduct.values()],
        selectedBranchIds,
        selectedCategoryId,
        search
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[pricing-data] Falling back to demo pricing matrix: ${message}`);
    return buildDemoPricingMatrix(filters);
  }
}

export async function updateBranchProduct(input: {
  id: string;
  price: number;
  stockStatus: "in_stock" | "out_of_stock" | "hidden";
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withDb(async (db) => {
    const result = await db.query<BranchProductRow>(
      `
        UPDATE "BranchProduct"
        SET
          price = $2::numeric(10, 2),
          "stockStatus" = $3::"StockStatus",
          "isAvailable" = $4::boolean,
          "stockQuantity" = COALESCE($5::integer, "stockQuantity"),
          "updatedAt" = NOW()
        WHERE id = $1
        RETURNING
          id,
          "branchId",
          "productId",
          price,
          "stockStatus",
          "isAvailable",
          "stockQuantity",
          currency
      `,
      [
        input.id,
        input.price.toFixed(2),
        input.stockStatus,
        input.stockStatus === 'in_stock',
        input.stockStatus === 'out_of_stock' ? 0 : null
      ]
    );

    const branchProduct = result.rows[0];

    if (!branchProduct) {
      throw new Error("Branch product not found.");
    }

    return normalizeBranchProduct(branchProduct);
  });
}

export type ProductBranchPricingItem = {
  id: string;
  branchId: string;
  branchName: string;
  price: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "hidden";
  isAvailable: boolean;
};

export async function getProductBranchPricing(productId: string): Promise<ProductBranchPricingItem[]> {
  if (!hasDatabaseUrl()) {
    return branches.map((branch) => {
      const bp = branchProducts.find(
        (entry) => entry.branchId === branch.id && entry.productId === productId
      );
      return {
        id: `${branch.id}:${productId}`,
        branchId: branch.id,
        branchName: branch.name,
        price: bp?.price ?? null,
        stockStatus: bp?.stockStatus ?? "hidden",
        isAvailable: bp?.stockStatus === "in_stock"
      };
    });
  }

  try {
    return await withDb(async (db) => {
      const result = await db.query<{
        id: string;
        branchId: string;
        branchName: string;
        price: string | number | null;
        stockStatus: "in_stock" | "out_of_stock" | "hidden";
        isAvailable: boolean;
      }>(
        `
          SELECT
            bp.id,
            bp."branchId" AS "branchId",
            b.name AS "branchName",
            bp.price,
            bp."stockStatus" AS "stockStatus",
            bp."isAvailable" AS "isAvailable"
          FROM "BranchProduct" bp
          INNER JOIN "Branch" b ON b.id = bp."branchId"
          WHERE bp."productId" = $1
            AND b."isActive" = TRUE
          ORDER BY b."displayOrder" ASC
        `,
        [productId]
      );

      return result.rows.map((row) => ({
        id: row.id,
        branchId: row.branchId,
        branchName: row.branchName,
        price: row.price === null ? null : Number(row.price),
        stockStatus: row.stockStatus,
        isAvailable: row.isAvailable
      }));
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[pricing-data] Falling back to demo for product branch pricing: ${message}`);
    return [];
  }
}

export async function upsertProductBranchPricing(
  productId: string,
  entries: Array<{
    branchId: string;
    price: number;
    stockStatus: "in_stock" | "out_of_stock" | "hidden";
  }>
): Promise<void> {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  return withTransaction(async (db) => {
    for (const entry of entries) {
      await db.query(
        `
          UPDATE "BranchProduct"
          SET
            price = $1::numeric(10, 2),
            "stockStatus" = $2::"StockStatus",
            "isAvailable" = $3::boolean,
            "updatedAt" = NOW()
          WHERE "branchId" = $4 AND "productId" = $5
        `,
        [
          entry.price.toFixed(2),
          entry.stockStatus,
          entry.stockStatus === "in_stock",
          entry.branchId,
          productId
        ]
      );
    }
  });
}

export async function batchUpdatePricing(input: BatchPricingInput) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  if (!input.branchIds.length) {
    throw new Error("At least one branch must be selected.");
  }

  const productIds = input.productIds?.filter(Boolean) ?? [];

  return withTransaction(async (db) => {
    const matchingEntriesResult = await db.query<BatchPreviewRow>(
      `
        SELECT
          bp.id,
          b.name AS "branchName",
          p.name AS "productName",
          bp.price
        FROM "BranchProduct" bp
        INNER JOIN "Product" p ON p.id = bp."productId"
        INNER JOIN "Branch" b ON b.id = bp."branchId"
        WHERE bp."branchId" = ANY($1::text[])
          AND p."isActive" = TRUE
          AND ($2::text IS NULL OR p."categoryId" = $2)
          AND (
            COALESCE(array_length($3::text[], 1), 0) = 0
            OR p.id = ANY($3::text[])
          )
      `,
      [input.branchIds, input.categoryId ?? null, productIds]
    );

    const matchingEntries = matchingEntriesResult.rows;

    if (input.previewOnly) {
      return {
        affectedCount: matchingEntries.length,
        sample: matchingEntries.slice(0, 5).map((entry) => ({
          branchName: entry.branchName,
          productName: entry.productName,
          currentPrice: Number(entry.price),
          nextPrice: computeAdjustedPrice(
            Number(entry.price),
            input.adjustmentType,
            input.adjustmentValue
          )
        }))
      };
    }

    const updatedResult = await db.query<{ id: string }>(
      `
        UPDATE "BranchProduct" bp
        SET
          price = CASE
            WHEN $4 = 'percentage'
              THEN ROUND((bp.price * (1 + ($5::numeric / 100)))::numeric, 2)
            WHEN $4 = 'fixed_delta'
              THEN ROUND((bp.price + $5::numeric)::numeric, 2)
            ELSE ROUND($5::numeric, 2)
          END,
          "updatedAt" = NOW()
        FROM "Product" p
        WHERE bp."productId" = p.id
          AND bp."branchId" = ANY($1::text[])
          AND p."isActive" = TRUE
          AND ($2::text IS NULL OR p."categoryId" = $2)
          AND (
            COALESCE(array_length($3::text[], 1), 0) = 0
            OR p.id = ANY($3::text[])
          )
        RETURNING bp.id
      `,
      [
        input.branchIds,
        input.categoryId ?? null,
        productIds,
        input.adjustmentType,
        input.adjustmentValue
      ]
    );

    return {
      affectedCount: updatedResult.rows.length
    };
  });
}
