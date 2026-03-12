import { hasDatabaseUrl, getPrisma } from "@/lib/prisma";
import { branches, categories, products } from "@/lib/demo-data";

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

  const prisma = await getPrisma();
  return prisma.branch.findMany({
    orderBy: { displayOrder: "asc" }
  });
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

  const prisma = await getPrisma();
  return prisma.menuCategory.findMany({
    orderBy: { displayOrder: "asc" }
  });
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
      badgeLabel: product.badge,
      isFeatured: Boolean(product.badge),
      isActive: true,
      displayOrder: index,
      categoryId: product.categoryId
    }));
  }

  const prisma = await getPrisma();
  return prisma.product.findMany({
    orderBy: { displayOrder: "asc" }
  });
}

export async function createAdminProduct(input: {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  badgeLabel?: string;
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
        badgeLabel: input.badgeLabel,
        isFeatured: Boolean(input.badgeLabel),
        displayOrder: (lastProduct?.displayOrder ?? -1) + 1
      }
    });

    if (activeBranches.length > 0) {
      await tx.branchProduct.createMany({
        data: activeBranches.map((branch) => ({
          branchId: branch.id,
          productId: product.id,
          price: 0,
          stockStatus: "hidden",
          isAvailable: false
        }))
      });
    }

    return product;
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
