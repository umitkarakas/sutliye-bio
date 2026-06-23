import { hasDatabaseUrl, queryFirst, withDb } from "@/lib/db";
import { branches, getBranchBySlug, getMenuForBranch } from "@/lib/demo-data";
import { business as demoBusiness } from "@/lib/demo-data";
import { createBrandTheme } from "@/lib/brand-theme";
import type { MenuCategoryWithItems, MenuItemView, PublicBusiness } from "@/lib/types";

function logPublicFallback(error: unknown, scope: string) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.warn(`[public-data] Falling back to demo data for ${scope}: ${message}`);
}

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

type BusinessRow = {
  name: string;
  logoUrl: string | null;
  brandTagline: string | null;
  brandBadge: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  primaryPhone: string;
  primaryWhatsapp: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
};

type BranchRow = {
  id: string;
  slug: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  whatsapp: string;
  mapUrl: string;
  reviewUrl: string | null;
  instagram: string | null;
  blurb: string | null;
  heroNote: string | null;
  dayOfWeek: number | null;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean | null;
};

type MenuRow = {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  productId: string | null;
  productName: string | null;
  productDescription: string | null;
  imageUrl: string | null;
  badgeLabel: string | null;
  isFeatured: boolean | null;
  stockStatus: "in_stock" | "out_of_stock" | "hidden" | null;
  price: string | number | null;
};

function mapBranches(rows: BranchRow[]) {
  const grouped = new Map<
    string,
    {
      branch: Omit<BranchRow, "dayOfWeek" | "openTime" | "closeTime" | "isClosed">;
      hours: Array<{
        dayOfWeek: number;
        openTime: string | null;
        closeTime: string | null;
        isClosed: boolean;
      }>;
    }
  >();

  for (const row of rows) {
    const existing = grouped.get(row.id);

    if (!existing) {
      grouped.set(row.id, {
        branch: {
          id: row.id,
          slug: row.slug,
          name: row.name,
          address: row.address,
          district: row.district,
          city: row.city,
          phone: row.phone,
          whatsapp: row.whatsapp,
          mapUrl: row.mapUrl,
          reviewUrl: row.reviewUrl,
          instagram: row.instagram,
          blurb: row.blurb,
          heroNote: row.heroNote
        },
        hours:
          row.dayOfWeek === null
            ? []
            : [
                {
                  dayOfWeek: row.dayOfWeek,
                  openTime: row.openTime,
                  closeTime: row.closeTime,
                  isClosed: row.isClosed ?? false
                }
              ]
      });
      continue;
    }

    if (row.dayOfWeek !== null) {
      existing.hours.push({
        dayOfWeek: row.dayOfWeek,
        openTime: row.openTime,
        closeTime: row.closeTime,
        isClosed: row.isClosed ?? false
      });
    }
  }

  return [...grouped.values()].map(({ branch, hours }) => ({
    id: branch.id,
    slug: branch.slug,
    name: branch.name,
    address: branch.address,
    district: branch.district,
    city: branch.city,
    phone: branch.phone,
    whatsapp: branch.whatsapp,
    mapUrl: branch.mapUrl,
    reviewUrl: branch.reviewUrl ?? undefined,
    instagram: branch.instagram ?? undefined,
    hours: summarizeBranchHours(hours),
    blurb: branch.blurb ?? "",
    heroNote: branch.heroNote ?? ""
  }));
}

export async function getPublicBusiness(): Promise<PublicBusiness> {
  if (!hasDatabaseUrl()) {
    return {
      ...demoBusiness
    };
  }

  try {
    const record = await withDb((db) =>
      queryFirst<BusinessRow>(
        db,
        `
          SELECT
            name,
            "logoUrl",
            "brandTagline",
            "brandBadge",
            "seoTitle",
            "seoDescription",
            "primaryPhone",
            "primaryWhatsapp",
            "primaryColor",
            "secondaryColor",
            "backgroundColor"
          FROM "Business"
          ORDER BY "createdAt" ASC
          LIMIT 1
        `
      )
    );

    if (!record) {
      throw new Error("No business found.");
    }

    return {
      name: record.name,
      tagline: record.brandTagline ?? demoBusiness.tagline,
      badge: record.brandBadge ?? demoBusiness.badge,
      logoUrl: record.logoUrl ?? demoBusiness.logoUrl ?? undefined,
      primaryPhone: record.primaryPhone,
      primaryWhatsapp: record.primaryWhatsapp,
      seoTitle: record.seoTitle ?? demoBusiness.seoTitle,
      seoDescription: record.seoDescription ?? demoBusiness.seoDescription ?? record.brandTagline ?? demoBusiness.tagline,
      theme: createBrandTheme({
        primaryColor: record.primaryColor ?? demoBusiness.theme.primaryColor,
        secondaryColor: record.secondaryColor ?? demoBusiness.theme.secondaryColor,
        backgroundColor: record.backgroundColor ?? demoBusiness.theme.backgroundColor
      })
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
    const rows = await withDb((db) =>
      db.query<BranchRow>(
        `
          SELECT
            b.id,
            b.slug,
            b.name,
            b.address,
            b.district,
            b.city,
            b.phone,
            b.whatsapp,
            b."mapUrl",
            b."reviewUrl",
            b.instagram,
            b.blurb,
            b."heroNote",
            h."dayOfWeek",
            h."openTime",
            h."closeTime",
            h."isClosed"
          FROM "Branch" b
          LEFT JOIN "BranchHour" h ON h."branchId" = b.id
          WHERE b."isActive" = TRUE
          ORDER BY b."displayOrder" ASC, h."dayOfWeek" ASC
        `
      )
    );

    return mapBranches(rows.rows);
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
    const rows = await withDb((db) =>
      db.query<BranchRow>(
        `
          SELECT
            b.id,
            b.slug,
            b.name,
            b.address,
            b.district,
            b.city,
            b.phone,
            b.whatsapp,
            b."mapUrl",
            b."reviewUrl",
            b.instagram,
            b.blurb,
            b."heroNote",
            h."dayOfWeek",
            h."openTime",
            h."closeTime",
            h."isClosed"
          FROM "Branch" b
          LEFT JOIN "BranchHour" h ON h."branchId" = b.id
          WHERE b.slug = $1 AND b."isActive" = TRUE
          ORDER BY h."dayOfWeek" ASC
        `,
        [slug]
      )
    );

    if (rows.rows.length === 0) {
      return undefined;
    }

    return mapBranches(rows.rows)[0];
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
    const rows = await withDb((db) =>
      db.query<MenuRow>(
        `
          SELECT
            c.id AS "categoryId",
            c.slug AS "categorySlug",
            c.name AS "categoryName",
            p.id AS "productId",
            p.name AS "productName",
            p.description AS "productDescription",
            p."imageUrl",
            p."badgeLabel",
            p."isFeatured",
            bp."stockStatus",
            bp.price
          FROM "MenuCategory" c
          LEFT JOIN "Product" p
            ON p."categoryId" = c.id
           AND p."isActive" = TRUE
          LEFT JOIN "BranchProduct" bp
            ON bp."productId" = p.id
           AND bp."branchId" = $1
          WHERE c."isActive" = TRUE
          ORDER BY c."displayOrder" ASC, p."displayOrder" ASC
        `,
        [branchId]
      )
    );

    const categories = new Map<string, MenuCategoryWithItems>();

    for (const row of rows.rows) {
      if (!categories.has(row.categoryId)) {
        categories.set(row.categoryId, {
          id: row.categoryId,
          slug: row.categorySlug,
          name: row.categoryName,
          items: []
        });
      }

      if (!row.productId || !row.productName) {
        continue;
      }

      if (!row.stockStatus || row.stockStatus === "hidden" || row.price === null) {
        continue;
      }

      const item: MenuItemView = {
        id: row.productId,
        name: row.productName,
        description: row.productDescription ?? "",
        imageUrl: row.imageUrl ?? undefined,
        badge: row.badgeLabel ?? undefined,
        price: Number(row.price),
        stockStatus: row.stockStatus === "in_stock" ? "in_stock" : "out_of_stock",
        featured: row.isFeatured ?? false
      };

      categories.get(row.categoryId)?.items.push(item);
    }

    return [...categories.values()];
  } catch (error) {
    logPublicFallback(error, `menu:${branchId}`);
    return getMenuForBranch(branchId);
  }
}
