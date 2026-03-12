import { hasDatabaseUrl, getPrisma } from "@/lib/prisma";
import { branchProducts, branches, categories, products } from "@/lib/demo-data";

type ProductPriceSummary = {
  activeBranchCount: number;
  pricedBranchCount: number;
  minPrice: number | null;
  maxPrice: number | null;
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

function getDbProductPriceSummary(
  entries: Array<{
    price: unknown;
    branchId: string;
  }>
): ProductPriceSummary {
  const uniqueBranchIds = new Set(entries.map((entry) => entry.branchId));
  const prices = entries
    .map((entry) => Number(entry.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  return {
    activeBranchCount: uniqueBranchIds.size,
    pricedBranchCount: prices.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null
  };
}

function logAdminFallback(error: unknown, scope: string) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.warn(`[admin-data] Falling back to demo data for ${scope}: ${message}`);
}

async function getPrimaryBusinessId() {
  const prisma = await getPrisma();
  const business = await prisma.business.findFirst({
    orderBy: { createdAt: "asc" }
  });

  if (!business) {
    throw new Error("No business found. Seed the database first.");
  }

  return business.id;
}

export async function listAdminBranches() {
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
      isActive: true,
      displayOrder: index
    }));
  }

  try {
    const prisma = await getPrisma();
    return await prisma.branch.findMany({
      orderBy: { displayOrder: "asc" }
    });
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
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  const prisma = await getPrisma();
  const businessId = await getPrimaryBusinessId();

  const lastBranch = await prisma.branch.findFirst({
    orderBy: { displayOrder: "desc" }
  });

  const activeProducts = await prisma.product.findMany({
    where: {
      businessId,
      isActive: true
    },
    select: {
      id: true
    }
  });

  return prisma.$transaction(async (tx) => {
    const branch = await tx.branch.create({
      data: {
        businessId,
        ...input,
        displayOrder: (lastBranch?.displayOrder ?? -1) + 1
      }
    });

    if (activeProducts.length > 0) {
      await tx.branchProduct.createMany({
        data: activeProducts.map((product) => ({
          branchId: branch.id,
          productId: product.id,
          price: 0,
          stockStatus: "hidden",
          isAvailable: false
        }))
      });
    }

    return branch;
  });
}

export async function listAdminCategories() {
  if (!hasDatabaseUrl()) {
    return categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      isActive: true,
      displayOrder: index
    }));
  }

  try {
    const prisma = await getPrisma();
    return await prisma.menuCategory.findMany({
      orderBy: { displayOrder: "asc" }
    });
  } catch (error) {
    logAdminFallback(error, "categories");
    return categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      isActive: true,
      displayOrder: index
    }));
  }
}

export async function createAdminCategory(input: { name: string; slug: string; description?: string }) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  const prisma = await getPrisma();
  const businessId = await getPrimaryBusinessId();

  const lastCategory = await prisma.menuCategory.findFirst({
    orderBy: { displayOrder: "desc" }
  });

  return prisma.menuCategory.create({
    data: {
      businessId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      displayOrder: (lastCategory?.displayOrder ?? -1) + 1
    }
  });
}

export async function listAdminProducts() {
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
    const prisma = await getPrisma();
    const dbProducts = await prisma.product.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        branchProducts: {
          where: {
            branch: {
              isActive: true
            }
          },
          select: {
            branchId: true,
            price: true
          }
        }
      }
    });

    return dbProducts.map(({ branchProducts: currentBranchProducts, ...product }) => ({
      ...product,
      priceSummary: getDbProductPriceSummary(currentBranchProducts)
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
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  const prisma = await getPrisma();
  const businessId = await getPrimaryBusinessId();

  const lastProduct = await prisma.product.findFirst({
    orderBy: { displayOrder: "desc" }
  });

  const activeBranches = await prisma.branch.findMany({
    where: {
      businessId,
      isActive: true
    },
    select: {
      id: true
    }
  });

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        businessId,
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        imageUrl: input.imageUrl,
        badgeLabel: input.badgeLabel,
        isFeatured: input.isFeatured ?? Boolean(input.badgeLabel),
        displayOrder: (lastProduct?.displayOrder ?? -1) + 1
      }
    });

    if (activeBranches.length > 0) {
      await tx.branchProduct.createMany({
        data: activeBranches.map((branch) => ({
          branchId: branch.id,
          productId: product.id,
          price: input.initialPrice,
          stockStatus: "hidden",
          isAvailable: false
        }))
      });
    }

    return product;
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

  const prisma = await getPrisma();

  return prisma.product.update({
    where: { id: input.id },
    data: {
      categoryId: input.categoryId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl: input.imageUrl,
      badgeLabel: input.badgeLabel,
      isFeatured: input.isFeatured
    }
  });
}

export async function deleteAdminProduct(id: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  const prisma = await getPrisma();
  return prisma.product.delete({
    where: { id }
  });
}

export async function moveAdminProduct(id: string, direction: "up" | "down") {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  const prisma = await getPrisma();
  const currentProduct = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      displayOrder: true
    }
  });

  if (!currentProduct) {
    throw new Error("Product not found.");
  }

  const swapCandidate = await prisma.product.findFirst({
    where:
      direction === "up"
        ? { displayOrder: { lt: currentProduct.displayOrder } }
        : { displayOrder: { gt: currentProduct.displayOrder } },
    orderBy: {
      displayOrder: direction === "up" ? "desc" : "asc"
    },
    select: {
      id: true,
      displayOrder: true
    }
  });

  if (!swapCandidate) {
    return currentProduct;
  }

  return prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: currentProduct.id },
      data: {
        displayOrder: swapCandidate.displayOrder
      }
    });

    return tx.product.update({
      where: { id: swapCandidate.id },
      data: {
        displayOrder: currentProduct.displayOrder
      }
    });
  });
}

export async function toggleAdminBranchStatus(id: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  const prisma = await getPrisma();
  const branch = await prisma.branch.findUnique({
    where: { id },
    select: { isActive: true }
  });

  if (!branch) {
    throw new Error("Branch not found.");
  }

  return prisma.branch.update({
    where: { id },
    data: {
      isActive: !branch.isActive
    }
  });
}

export async function toggleAdminCategoryStatus(id: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  const prisma = await getPrisma();
  const category = await prisma.menuCategory.findUnique({
    where: { id },
    select: { isActive: true }
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  return prisma.menuCategory.update({
    where: { id },
    data: {
      isActive: !category.isActive
    }
  });
}

export async function toggleAdminProductStatus(id: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("Database is not configured.");
  }

  const prisma = await getPrisma();
  const product = await prisma.product.findUnique({
    where: { id },
    select: { isActive: true }
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  return prisma.product.update({
    where: { id },
    data: {
      isActive: !product.isActive
    }
  });
}
