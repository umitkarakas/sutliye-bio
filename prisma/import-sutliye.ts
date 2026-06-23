import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL required");

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u"
  };
  return input
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (m) => map[m] ?? m)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const tl = (n: number) =>
  "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// price = porsiyon/tekil fiyat; kg = kilogram fiyatı (varsa açıklamaya yazılır)
type P = { name: string; price: number; kg?: number };
type Cat = { name: string; items: P[] };

const menu: Cat[] = [
  {
    name: "Soğuk Kadayıf",
    items: [
      { name: "Fıstıklı Soğuk Kadayıf", price: 200, kg: 800 },
      { name: "Çikolatalı Fıstıklı Soğuk Kadayıf", price: 200, kg: 800 },
      { name: "Frambuazlı Soğuk Kadayıf", price: 200, kg: 800 },
      { name: "Fındıklı Soğuk Kadayıf", price: 185, kg: 750 }
    ]
  },
  {
    name: "Soğuk Baklava",
    items: [
      { name: "Fıstıklı Soğuk Baklava", price: 225, kg: 1000 },
      { name: "Çikolatalı Fıstıklı Soğuk Baklava", price: 225, kg: 1000 },
      { name: "Fındıklı Soğuk Baklava", price: 200, kg: 850 }
    ]
  },
  {
    name: "Şerbetli Tatlı",
    items: [
      { name: "Fıstıklı Özel Kesim Baklava", price: 225, kg: 1350 },
      { name: "Kuru Baklava", price: 250, kg: 1450 },
      { name: "Cevizli Dürüm", price: 200, kg: 950 },
      { name: "Cevizli Ev Baklavası", price: 200, kg: 950 },
      { name: "Sütlü Nuriye", price: 200, kg: 950 },
      { name: "Fıstık Sarma", price: 275, kg: 1650 },
      { name: "Midye Baklava", price: 275, kg: 1650 },
      { name: "Şöbiyet Baklava", price: 275, kg: 1650 },
      { name: "Havuç Dilimi Baklava", price: 250, kg: 1450 },
      { name: "Diyar Burma Kadayıf", price: 225, kg: 1350 }
    ]
  },
  {
    name: "Ekmek Kadayıfı",
    items: [
      { name: "Vişneli Ekmek Kadayıfı", price: 175, kg: 750 },
      { name: "Kaymak", price: 100, kg: 950 }
    ]
  },
  {
    name: "Kabak Tatlısı",
    items: [{ name: "Kabak Tatlısı", price: 175, kg: 850 }]
  },
  {
    name: "Sütlü Tatlı",
    items: [
      { name: "Kazandibi", price: 225 },
      { name: "Sütlaç", price: 250 },
      { name: "Bademli Keşkül", price: 250 },
      { name: "Şokella", price: 250 },
      { name: "Tiramisu", price: 250 },
      { name: "Lotuslu Magnolia", price: 250 },
      { name: "İncirli Muhallebi", price: 250 },
      { name: "Damla Sakızlı Muhallebi", price: 250 },
      { name: "Antep Fıstıklı Muhallebi", price: 275 },
      { name: "Sütliye Muhallebi", price: 250 },
      { name: "Kestaneli Muhallebi", price: 250 },
      { name: "Aşure", price: 250 }
    ]
  },
  {
    name: "Dondurma",
    items: [
      { name: "Top Dondurma Çeşitleri", price: 60 },
      { name: "Dondurma Kilogram", price: 850 },
      { name: "Antep Fıstıklı Top Dondurma", price: 70 },
      { name: "Antep Fıstıklı Dondurma Kg", price: 900 },
      { name: "Kağıt Helva", price: 50 },
      { name: "Tabak Kornet", price: 50 },
      { name: "Kornet", price: 10 },
      { name: "Strafor Paket", price: 50 }
    ]
  },
  {
    name: "Çikolata",
    items: [
      { name: "Sütlü Lolipop Çikolata 24 Gr", price: 75 },
      { name: "Pookie Bear Love 130 Gr", price: 400 },
      { name: "Pookie Bear Love 100 Gr", price: 350 },
      { name: "Şemsiye Çikolata 22 Gr", price: 50 },
      { name: "Beyoğlu Sütlü Antep Fıstıklı 90 Gr", price: 300 },
      { name: "Beyoğlu Sütlü Fındıklı 90 Gr", price: 200 },
      { name: "Beyoğlu Bitter Antep Fıstıklı 90 Gr", price: 300 },
      { name: "Beyoğlu Bitter Fındıklı 90 Gr", price: 225 },
      { name: "Tramvay Teneke Fındık 225 Gr", price: 650 },
      { name: "Tramvay Teneke Antep Fıstıklı 225 Gr", price: 750 },
      { name: "El Yapımı Fındık Kreması", price: 500 },
      { name: "Küp Mini Kalp 100 Gr", price: 250 },
      { name: "Miracle 308 Gr", price: 850 },
      { name: "İstanbul Madlen Kültür Serisi 260 Gr", price: 750 },
      { name: "Square 300 Gr", price: 750 },
      { name: "Gala 315 Gr", price: 950 },
      { name: "Dubai Çikolatası Poşet 120 Gr", price: 400 },
      { name: "Dubai Çikolatası Poşet 500 Gr", price: 1250 },
      { name: "Dubai Çikolatası 30 Gr", price: 75 },
      { name: "Dubai Çikolatası 96 Gr Kutu", price: 350 },
      { name: "Dubai Çikolatası Silindir 200 Gr Kutu", price: 550 }
    ]
  },
  {
    name: "İçecekler",
    items: [
      { name: "Çay", price: 50 },
      { name: "Büyük Bardak Çay", price: 75 },
      { name: "Uludağ Su 400 ml", price: 20 },
      { name: "Uludağ Premium Maden Suyu 250 ml", price: 75 },
      { name: "Uludağ Sade Soda 200 ml", price: 50 },
      { name: "Uludağ Meyveli Soda 200 ml", price: 60 },
      { name: "Doğal Limonata El Yapımı 300 ml", price: 120 },
      { name: "Uludağ Şişe Limonata 250 ml", price: 75 },
      { name: "Uludağ Frutti Extra", price: 75 },
      { name: "Uludağ Portakallı Gazoz Cam Şişe 250 ml", price: 75 },
      { name: "Uludağ Sade Gazoz Cam Şişe 250 ml", price: 75 },
      { name: "Doğal Meyve Suyu Flavz 250 ml", price: 120 }
    ]
  },
  {
    name: "Kahve Çeşitleri",
    items: [
      { name: "Türk Kahvesi", price: 100 },
      { name: "Filtre Kahve", price: 120 },
      { name: "Sütlü Kahve", price: 120 },
      { name: "Latte", price: 120 },
      { name: "Americano", price: 120 },
      { name: "Flat White", price: 120 },
      { name: "Espresso", price: 120 },
      { name: "Macchiato", price: 120 },
      { name: "Cappuccino", price: 120 },
      { name: "Mocha", price: 120 },
      { name: "Double Espresso", price: 120 },
      { name: "Caffe Crema", price: 120 },
      { name: "Latte Macchiato", price: 120 },
      { name: "Sıcak Süt", price: 120 },
      { name: "Sütlü Çikolata", price: 120 },
      { name: "Vanilyalı Cappuccino", price: 120 },
      { name: "Caramel Macchiato", price: 120 },
      { name: "White Chocolate", price: 120 },
      { name: "Sıcak Çikolata", price: 120 },
      { name: "Sahlep", price: 120 }
    ]
  },
  {
    name: "Soğuk Kahve Çeşitleri",
    items: [
      { name: "Ice Americano", price: 120 },
      { name: "Ice Latte", price: 120 },
      { name: "Ice Mocha", price: 120 },
      { name: "Ice White Mocha", price: 120 },
      { name: "Ice Caramel Latte", price: 120 }
    ]
  }
];

const branchesData = [
  {
    name: "Sütliye Viaport Asya",
    slug: "viaport-asya",
    address: "Yenişehir, Dedepaşa Cd. No:19/1, 34912",
    district: "Pendik",
    city: "İstanbul",
    query: "Sütliye Viaport Asya, Yenişehir, Dedepaşa Cd No:19/1, 34912 Pendik/İstanbul"
  },
  {
    name: "Sütliye Tatlı Başiskele",
    slug: "basiskele",
    address: "Körfez, Mahmut Çavuş Cd, Damlar, A Blok No:31B, 41245",
    district: "Başiskele",
    city: "Kocaeli",
    query: "Sütliye Başiskele, Körfez, Mahmut Çavuş Cd, A Blok No:31B, 41245 Başiskele/Kocaeli"
  },
  {
    name: "Sütliye Metro Market",
    slug: "metro-market",
    address: "Hacı Halim Mah., Ankara Cd. No:273 D:273, 41310",
    district: "Kartepe",
    city: "Kocaeli",
    query: "Sütliye Metro Market, Hacı Halim Mahallesi, Ankara Cd. No:273, 41310 Kartepe/Kocaeli"
  }
];

const mapUrl = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

async function main() {
  const business = await prisma.business.findFirst();
  if (!business) throw new Error("Business not found");
  const businessId = business.id;

  // Business kimliğini Sütliye'ye güncelle
  await prisma.business.update({
    where: { id: businessId },
    data: {
      name: "Sütliye",
      slug: "sutliye",
      brandTagline: "Yeni nesil tatlıcı",
      brandBadge: "QR menü",
      seoTitle: "Sütliye | Yeni Nesil Tatlıcı",
      seoDescription:
        "Sütliye tatlı menüsü — soğuk kadayıf, soğuk baklava, şerbetli tatlılar, sütlü tatlılar, çikolata ve kahve çeşitleri.",
      logoUrl: "/brand/logo-icon.svg",
      primaryColor: "#02808b",
      secondaryColor: "#ec83b5",
      backgroundColor: "#eef3f3"
    }
  });

  // Eski menü ve şubeleri temizle (cascade ile branchProduct'lar da silinir)
  await prisma.product.deleteMany({ where: { businessId } });
  await prisma.menuCategory.deleteMany({ where: { businessId } });
  await prisma.branch.deleteMany({ where: { businessId } });

  // Şubeler
  const createdBranches = [];
  for (let i = 0; i < branchesData.length; i++) {
    const b = branchesData[i];
    const branch = await prisma.branch.create({
      data: {
        businessId,
        name: b.name,
        slug: b.slug,
        address: `${b.address} ${b.district}/${b.city}`,
        district: b.district,
        city: b.city,
        mapUrl: mapUrl(b.query),
        instagram: "sutliyetatli",
        phone: "",
        whatsapp: "",
        isActive: true,
        displayOrder: i
      }
    });
    createdBranches.push(branch);
  }

  // Kategoriler + ürünler + tüm şubeler için fiyatlar
  let productCount = 0;
  let branchProductCount = 0;
  for (let ci = 0; ci < menu.length; ci++) {
    const cat = menu[ci];
    const category = await prisma.menuCategory.create({
      data: {
        businessId,
        name: cat.name,
        slug: slugify(cat.name),
        displayOrder: ci,
        isActive: true
      }
    });

    for (let pi = 0; pi < cat.items.length; pi++) {
      const item = cat.items[pi];
      const product = await prisma.product.create({
        data: {
          businessId,
          categoryId: category.id,
          name: item.name,
          slug: slugify(`${cat.name}-${item.name}`),
          description: item.kg ? `Kilogram fiyatı: ${tl(item.kg)}` : "",
          displayOrder: pi,
          isActive: true
        }
      });
      productCount++;

      for (const branch of createdBranches) {
        await prisma.branchProduct.create({
          data: {
            branchId: branch.id,
            productId: product.id,
            price: item.price,
            currency: "TRY",
            stockStatus: "in_stock",
            isAvailable: true
          }
        });
        branchProductCount++;
      }
    }
  }

  console.log(
    `OK: ${createdBranches.length} şube, ${menu.length} kategori, ${productCount} ürün, ${branchProductCount} fiyat kaydı.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
