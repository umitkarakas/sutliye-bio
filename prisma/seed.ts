import { PrismaClient, Prisma, StockStatus } from "@prisma/client";
import { branchProducts, branches, business, categories, products } from "../lib/demo-data";

const prisma = new PrismaClient();

function requiredId(map: Map<string, string>, key: string) {
  const value = map.get(key);

  if (!value) {
    throw new Error(`Missing mapped id for ${key}`);
  }

  return value;
}

async function main() {
  const createdBusiness = await prisma.business.upsert({
    where: { slug: "ocakbasi-sofrasi" },
    update: {
      name: business.name,
      primaryPhone: branches[0].phone,
      primaryWhatsapp: branches[0].whatsapp
    },
    create: {
      name: business.name,
      slug: "ocakbasi-sofrasi",
      primaryPhone: branches[0].phone,
      primaryWhatsapp: branches[0].whatsapp,
      defaultCurrency: "TRY"
    }
  });

  await prisma.adminUser.upsert({
    where: { email: "owner@ocakbasisofrasi.test" },
    update: {
      businessId: createdBusiness.id,
      fullName: "Demo Owner"
    },
    create: {
      businessId: createdBusiness.id,
      email: "owner@ocakbasisofrasi.test",
      fullName: "Demo Owner",
      role: "owner"
    }
  });

  const branchIdMap = new Map<string, string>();

  for (const [index, branch] of branches.entries()) {
    const createdBranch = await prisma.branch.upsert({
      where: {
        businessId_slug: {
          businessId: createdBusiness.id,
          slug: branch.slug
        }
      },
      update: {
        name: branch.name,
        address: branch.address,
        district: branch.district,
        city: branch.city,
        mapUrl: branch.mapUrl,
        phone: branch.phone,
        whatsapp: branch.whatsapp,
        blurb: branch.blurb,
        heroNote: branch.heroNote,
        displayOrder: index
      },
      create: {
        businessId: createdBusiness.id,
        name: branch.name,
        slug: branch.slug,
        address: branch.address,
        district: branch.district,
        city: branch.city,
        mapUrl: branch.mapUrl,
        phone: branch.phone,
        whatsapp: branch.whatsapp,
        blurb: branch.blurb,
        heroNote: branch.heroNote,
        displayOrder: index
      }
    });

    branchIdMap.set(branch.id, createdBranch.id);

    await prisma.branchHour.deleteMany({
      where: { branchId: createdBranch.id }
    });

    for (let day = 1; day <= 7; day += 1) {
      await prisma.branchHour.create({
        data: {
          branchId: createdBranch.id,
          dayOfWeek: day,
          openTime: branch.hours.split(" - ")[0],
          closeTime: branch.hours.split(" - ")[1],
          isClosed: false
        }
      });
    }
  }

  const categoryIdMap = new Map<string, string>();

  for (const [index, category] of categories.entries()) {
    const createdCategory = await prisma.menuCategory.upsert({
      where: {
        businessId_slug: {
          businessId: createdBusiness.id,
          slug: category.slug
        }
      },
      update: {
        name: category.name,
        displayOrder: index
      },
      create: {
        businessId: createdBusiness.id,
        name: category.name,
        slug: category.slug,
        displayOrder: index
      }
    });

    categoryIdMap.set(category.id, createdCategory.id);
  }

  const productIdMap = new Map<string, string>();

  for (const [index, product] of products.entries()) {
    const createdProduct = await prisma.product.upsert({
      where: {
        businessId_slug: {
          businessId: createdBusiness.id,
          slug: product.id
        }
      },
      update: {
        name: product.name,
        description: product.description,
        badgeLabel: product.badge,
        isFeatured: Boolean(product.badge),
        displayOrder: index,
        categoryId: requiredId(categoryIdMap, product.categoryId)
      },
      create: {
        businessId: createdBusiness.id,
        categoryId: requiredId(categoryIdMap, product.categoryId),
        name: product.name,
        slug: product.id,
        description: product.description,
        badgeLabel: product.badge,
        isFeatured: Boolean(product.badge),
        displayOrder: index
      }
    });

    productIdMap.set(product.id, createdProduct.id);
  }

  for (const entry of branchProducts) {
    const branchId = branchIdMap.get(entry.branchId);
    const productId = productIdMap.get(entry.productId);

    if (!branchId || !productId) {
      continue;
    }

    await prisma.branchProduct.upsert({
      where: {
        branchId_productId: {
          branchId,
          productId
        }
      },
      update: {
        price: new Prisma.Decimal(entry.price),
        stockStatus: entry.stockStatus as StockStatus,
        isAvailable: entry.stockStatus === "in_stock",
        isFeaturedOverride: entry.featured ?? null
      },
      create: {
        branchId,
        productId,
        price: new Prisma.Decimal(entry.price),
        stockStatus: entry.stockStatus as StockStatus,
        isAvailable: entry.stockStatus === "in_stock",
        isFeaturedOverride: entry.featured ?? null
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
