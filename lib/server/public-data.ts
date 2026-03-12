import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { branches, getBranchBySlug, getMenuForBranch } from "@/lib/demo-data";
import { business as demoBusiness } from "@/lib/demo-data";
import type { MenuCategoryWithItems, MenuItemView, PublicBusiness } from "@/lib/types";

function logPublicFallback(error: unknown, scope: string) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.warn(`[public-data] Falling back to demo data for ${scope}: ${message}`);
}

const DEFAULT_BUSINESS_COPY = {
  tagline: "Sube sec, menuyu gor, tek dokunusla ara veya yol tarifi al.",
  badge: "QR ve bio-link icin hizli mobil deneyim"
};

function getCurrentIstanbulDayOfWeek() {
  const localNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  const day = localNow.getDay();
  return day === 0 ? 7 : day;
}

function summarizeBranchHours(
  hours: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>
) {
  if (!hours.length) {
    return "Saat bilgisi yakinda";
  }

  const sortedHours = [...hours].sort((left, right) => left.dayOfWeek - right.dayOfWeek);
  const firstOpenRange = sortedHours.find((entry) => !entry.isClosed && entry.openTime && entry.closeTime);

  const everyDaySame =
    sortedHours.length === 7 &&
    sortedHours.every(
      (entry) =>
        entry.isClosed === sortedHours[0]?.isClosed &&
        entry.openTime === sortedHours[0]?.openTime &&
        entry.closeTime === sortedHours[0]?.closeTime
    );

  if (everyDaySame && sortedHours[0]) {
    if (sortedHours[0].isClosed || !sortedHours[0].openTime || !sortedHours[0].closeTime) {
      return "Her gun kapali";
    }

    return `${sortedHours[0].openTime} - ${sortedHours[0].closeTime}`;
  }

  const todaysHours = sortedHours.find((entry) => entry.dayOfWeek === getCurrentIstanbulDayOfWeek());

  if (!todaysHours) {
    if (!firstOpenRange) {
      return "Saat bilgisi yakinda";
    }

    return `${firstOpenRange.openTime} - ${firstOpenRange.closeTime}`;
  }

  if (todaysHours.isClosed || !todaysHours.openTime || !todaysHours.closeTime) {
    return "Bugun kapali";
  }

  return `${todaysHours.openTime} - ${todaysHours.closeTime}`;
}

export async function getPublicBusiness(): Promise<PublicBusiness> {
  if (!hasDatabaseUrl()) {
    return {
      ...demoBusiness
    };
  }

  try {
    const prisma = await getPrisma();
    const record = await prisma.business.findFirst({
      orderBy: { createdAt: "asc" }
    });

    if (!record) {
      throw new Error("No business found.");
    }

    return {
      name: record.name,
      tagline: DEFAULT_BUSINESS_COPY.tagline,
      badge: DEFAULT_BUSINESS_COPY.badge,
      logoUrl: record.logoUrl ?? undefined,
      primaryPhone: record.primaryPhone,
      primaryWhatsapp: record.primaryWhatsapp
    };
  } catch (error) {
    logPublicFallback(error, "business");
    return {
      ...demoBusiness
    };
  }
}

export async function getPublicBranches() {
  if (!hasDatabaseUrl()) {
    return branches;
  }

  try {
    const prisma = await getPrisma();
    const dbBranches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        hours: {
          orderBy: { dayOfWeek: "asc" }
        }
      }
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
      hours: summarizeBranchHours(branch.hours),
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
      },
      include: {
        hours: {
          orderBy: { dayOfWeek: "asc" }
        }
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
      hours: summarizeBranchHours(branch.hours),
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
            imageUrl: product.imageUrl ?? undefined,
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
