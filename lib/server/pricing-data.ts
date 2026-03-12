import type { PricingAdjustmentType, PricingMatrixData, PricingMatrixRow } from "@/lib/types";
import { branchProducts, branches, categories, products } from "@/lib/demo-data";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

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

export async function listPricingMatrix(filters: PricingMatrixFilters = {}): Promise<PricingMatrixData> {
  if (!hasDatabaseUrl()) {
    return buildDemoPricingMatrix(filters);
  }

  try {
    const prisma = await getPrisma();
    const [dbBranches, dbCategories] = await Promise.all([
      prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" }
      }),
      prisma.menuCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" }
      })
    ]);

    const availableBranchIds = dbBranches.map((branch) => branch.id);
    const selectedBranchIds = normalizeBranchIds(filters.branchIds, availableBranchIds);
    const selectedCategoryId = filters.categoryId ?? "";
    const search = (filters.search ?? "").trim();

    const dbProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { displayOrder: "asc" },
      include: {
        category: true,
        branchProducts: {
          where: {
            branchId: {
              in: selectedBranchIds
            }
          }
        }
      }
    });

    const rows: PricingMatrixRow[] = dbProducts.map((product) => ({
      productId: product.id,
      productName: product.name,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      badge: product.badgeLabel ?? undefined,
      cells: selectedBranchIds.map((branchId) => {
        const branch = dbBranches.find((entry) => entry.id === branchId);
        const branchProduct = product.branchProducts.find((entry) => entry.branchId === branchId);

        return {
          id: branchProduct?.id ?? `${branchId}:${product.id}`,
          branchId,
          branchName: branch?.name ?? "Şube",
          price: branchProduct ? Number(branchProduct.price) : null,
          stockStatus: branchProduct?.stockStatus ?? "hidden",
          isAvailable: branchProduct?.isAvailable ?? false,
          canEdit: Boolean(branchProduct)
        };
      })
    }));

    return {
      isDemo: false,
      branches: dbBranches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        slug: branch.slug
      })),
      categories: dbCategories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug
      })),
      rows,
      selectedBranchIds,
      selectedCategoryId,
      search
    };
  } catch (error) {
    console.error("[pricing-data] Falling back to demo pricing matrix.", error);
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

  const prisma = await getPrisma();
  const { Prisma } = await import("@prisma/client");

  return prisma.branchProduct.update({
    where: { id: input.id },
    data: {
      price: new Prisma.Decimal(input.price.toFixed(2)),
      stockStatus: input.stockStatus,
      isAvailable: input.stockStatus === "in_stock",
      stockQuantity: input.stockStatus === "out_of_stock" ? 0 : undefined
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

  const prisma = await getPrisma();
  const matchingEntries = await prisma.branchProduct.findMany({
    where: {
      branchId: {
        in: input.branchIds
      },
      product: {
        isActive: true,
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        ...(input.productIds?.length ? { id: { in: input.productIds } } : {})
      }
    },
    include: {
      product: true,
      branch: true
    }
  });

  if (input.previewOnly) {
    return {
      affectedCount: matchingEntries.length,
      sample: matchingEntries.slice(0, 5).map((entry) => ({
        branchName: entry.branch.name,
        productName: entry.product.name,
        currentPrice: Number(entry.price),
        nextPrice: computeAdjustedPrice(
          Number(entry.price),
          input.adjustmentType,
          input.adjustmentValue
        )
      }))
    };
  }

  const { Prisma } = await import("@prisma/client");
  await prisma.$transaction(
    matchingEntries.map((entry) =>
      prisma.branchProduct.update({
        where: { id: entry.id },
        data: {
          price: new Prisma.Decimal(
            computeAdjustedPrice(
              Number(entry.price),
              input.adjustmentType,
              input.adjustmentValue
            ).toFixed(2)
          )
        }
      })
    )
  );

  return {
    affectedCount: matchingEntries.length
  };
}
