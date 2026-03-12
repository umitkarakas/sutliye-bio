import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { branches, getBranchBySlug, getMenuForBranch } from "@/lib/demo-data";
import type { MenuCategoryWithItems, MenuItemView } from "@/lib/types";

function logPublicFallback(error: unknown, scope: string) {
  console.error(`[public-data] Falling back to demo data for ${scope}.`, error);
}

export async function getPublicBranches() {
  if (!hasDatabaseUrl()) {
    return branches;
  }

  try {
    const prisma = await getPrisma();
    const dbBranches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" }
    });

    return dbBranches.map((branch) => ({
      id: branch.id,
      slug: branch.slug,
      name: branch.name,
      address: branch.address,
      district: branch.district,
      city: branch.city,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      mapUrl: branch.mapUrl,
      hours: "Saat bilgisi yakında",
      blurb: branch.blurb ?? "",
      heroNote: branch.heroNote ?? ""
    }));
  } catch (error) {
    logPublicFallback(error, "branch list");
    return branches;
  }
}

export async function getPublicBranchBySlug(slug: string) {
  if (!hasDatabaseUrl()) {
    return getBranchBySlug(slug);
  }

  try {
    const prisma = await getPrisma();
    const branch = await prisma.branch.findFirst({
      where: {
        slug,
        isActive: true
      }
    });

    if (!branch) {
      return undefined;
    }

    return {
      id: branch.id,
      slug: branch.slug,
      name: branch.name,
      address: branch.address,
      district: branch.district,
      city: branch.city,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      mapUrl: branch.mapUrl,
      hours: "Saat bilgisi yakında",
      blurb: branch.blurb ?? "",
      heroNote: branch.heroNote ?? ""
    };
  } catch (error) {
    logPublicFallback(error, `branch detail:${slug}`);
    return getBranchBySlug(slug);
  }
}

export async function getPublicMenuForBranch(branchId: string): Promise<MenuCategoryWithItems[]> {
  if (!hasDatabaseUrl()) {
    return getMenuForBranch(branchId);
  }

  try {
    const prisma = await getPrisma();
    const categories = await prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          include: {
            branchProducts: {
              where: {
                branchId
              }
            }
          }
        }
      }
    });

    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      items: category.products
        .map((product): MenuItemView | null => {
          const branchProduct = product.branchProducts[0];

          if (!branchProduct || branchProduct.stockStatus === "hidden") {
            return null;
          }

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            badge: product.badgeLabel ?? undefined,
            price: Number(branchProduct.price),
            stockStatus:
              branchProduct.stockStatus === "in_stock" ? "in_stock" : "out_of_stock",
            featured: branchProduct.isFeaturedOverride ?? product.isFeatured
          };
        })
        .filter((item) => item !== null)
    }));
  } catch (error) {
    logPublicFallback(error, `menu:${branchId}`);
    return getMenuForBranch(branchId);
  }
}
