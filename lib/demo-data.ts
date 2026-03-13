import type {
  Branch,
  BranchProduct,
  MenuCategoryWithItems,
  MenuItemView,
  Product,
  ProductCategory
} from "@/lib/types";

function createDemoProductImage(title: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff7ec" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="480" height="320" rx="36" fill="url(#bg)" />
      <circle cx="375" cy="72" r="58" fill="rgba(255,255,255,0.34)" />
      <circle cx="105" cy="238" r="86" fill="rgba(255,255,255,0.2)" />
      <rect x="72" y="92" width="336" height="156" rx="30" fill="#1f1a17" opacity="0.12" />
      <rect x="102" y="122" width="276" height="96" rx="24" fill="#fffaf2" />
      <text x="240" y="168" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#2f241d">
        ${title}
      </text>
      <text x="240" y="204" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#7a5c45">
        Kebapci Menu
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const business = {
  name: "Ocakbaşı Sofrası",
  logoUrl: "",
  tagline: "Şube seç, menüyü gör, tek dokunuşla ara veya yol tarifi al.",
  badge: "QR ve bio-link için hızlı mobil deneyim",
  theme: {
    primaryColor: "#ba0814",
    secondaryColor: "#dc6f79",
    backgroundColor: "#efb7bd"
  }
};

export const branches: Branch[] = [
  {
    id: "kadikoy",
    slug: "kadikoy",
    name: "Kadıköy",
    address: "Moda Caddesi No: 18",
    district: "Kadıköy",
    city: "İstanbul",
    phone: "+90 216 555 10 10",
    whatsapp: "+90 532 555 10 10",
    mapUrl: "https://maps.google.com/?q=Moda+Caddesi+No:+18+Kadıköy",
    reviewUrl: "https://maps.google.com/?q=Moda+Caddesi+No:+18+Kadıköy",
    hours: "10:00 - 23:30",
    blurb: "Yoğun yaya trafiği ve hızlı servis odaklı şube.",
    heroNote: "Moda ve Çarşı hattından yürüyerek erişim."
  },
  {
    id: "besiktas",
    slug: "besiktas",
    name: "Beşiktaş",
    address: "Çarşı İçi No: 44",
    district: "Beşiktaş",
    city: "İstanbul",
    phone: "+90 212 555 20 20",
    whatsapp: "+90 532 555 20 20",
    mapUrl: "https://maps.google.com/?q=Çarşı+İçi+No:+44+Beşiktaş",
    reviewUrl: "https://maps.google.com/?q=Çarşı+İçi+No:+44+Beşiktaş",
    hours: "11:00 - 00:00",
    blurb: "Akşam yoğunluğu yüksek, paket ve oturma dengeli.",
    heroNote: "İş çıkışı ve gece kullanımı için en hızlı aksiyonlar öne çıkıyor."
  },
  {
    id: "uskudar",
    slug: "uskudar",
    name: "Üsküdar",
    address: "Hakimiyet-i Milliye No: 7",
    district: "Üsküdar",
    city: "İstanbul",
    phone: "+90 216 555 30 30",
    whatsapp: "+90 532 555 30 30",
    mapUrl: "https://maps.google.com/?q=Hakimiyet-i+Milliye+No:+7+Üsküdar",
    reviewUrl: "https://maps.google.com/?q=Hakimiyet-i+Milliye+No:+7+Üsküdar",
    hours: "09:30 - 23:00",
    blurb: "Aile masaları ve sakin oturum deneyimi için uygun.",
    heroNote: "Vapur çıkışına yakın, konum odaklı gelen kullanıcı kitlesi ağırlıklı."
  }
];

export const categories: ProductCategory[] = [
  { id: "kebap", slug: "kebap", name: "Kebap" },
  { id: "durum", slug: "durum", name: "Dürüm" },
  { id: "izgara", slug: "izgara", name: "Izgara" },
  { id: "icecek", slug: "icecek", name: "İçecek" }
];

export const products: Product[] = [
  {
    id: "adana",
    categoryId: "kebap",
    name: "Adana Kebap",
    description: "Közlenmiş biber, sumaklı soğan ve ince lavaş ile.",
    imageUrl: createDemoProductImage("Adana Kebap", "#f1b15f"),
    badge: "Öne çıkan"
  },
  {
    id: "urfa",
    categoryId: "kebap",
    name: "Urfa Kebap",
    description: "Daha yumuşak baharat profili ile klasik servis.",
    imageUrl: createDemoProductImage("Urfa Kebap", "#d99058")
  },
  {
    id: "tavuk-durum",
    categoryId: "durum",
    name: "Tavuk Dürüm",
    description: "Kor ateşinde tavuk şiş, yeşillik ve özel sos.",
    imageUrl: createDemoProductImage("Tavuk Dürüm", "#c6a35d")
  },
  {
    id: "kasap-kofte",
    categoryId: "izgara",
    name: "Kasap Köfte",
    description: "Pide üzeri servis ve domatesli tereyağı dokunuşu.",
    imageUrl: createDemoProductImage("Kasap Köfte", "#b97d5e")
  },
  {
    id: "ayran",
    categoryId: "icecek",
    name: "Ayran",
    description: "Günlük mayalı, soğuk servis.",
    imageUrl: createDemoProductImage("Ayran", "#87b2b6")
  }
];

export const branchProducts: BranchProduct[] = [
  { branchId: "kadikoy", productId: "adana", price: 320, stockStatus: "in_stock", featured: true },
  { branchId: "kadikoy", productId: "urfa", price: 305, stockStatus: "in_stock" },
  { branchId: "kadikoy", productId: "tavuk-durum", price: 220, stockStatus: "in_stock" },
  { branchId: "kadikoy", productId: "kasap-kofte", price: 290, stockStatus: "out_of_stock" },
  { branchId: "kadikoy", productId: "ayran", price: 55, stockStatus: "in_stock" },
  { branchId: "besiktas", productId: "adana", price: 340, stockStatus: "in_stock", featured: true },
  { branchId: "besiktas", productId: "urfa", price: 320, stockStatus: "in_stock" },
  { branchId: "besiktas", productId: "tavuk-durum", price: 235, stockStatus: "in_stock" },
  { branchId: "besiktas", productId: "kasap-kofte", price: 310, stockStatus: "in_stock" },
  { branchId: "besiktas", productId: "ayran", price: 60, stockStatus: "in_stock" },
  { branchId: "uskudar", productId: "adana", price: 330, stockStatus: "in_stock" },
  { branchId: "uskudar", productId: "urfa", price: 315, stockStatus: "in_stock" },
  { branchId: "uskudar", productId: "tavuk-durum", price: 225, stockStatus: "out_of_stock" },
  { branchId: "uskudar", productId: "kasap-kofte", price: 300, stockStatus: "in_stock" },
  { branchId: "uskudar", productId: "ayran", price: 58, stockStatus: "in_stock" }
];

export function getBranchBySlug(slug: string) {
  return branches.find((branch) => branch.slug === slug);
}

export function getMenuForBranch(branchId: string): MenuCategoryWithItems[] {
  return categories.map((category) => {
    const items = products
      .filter((product) => product.categoryId === category.id)
      .map((product): MenuItemView | null => {
        const branchProduct = branchProducts.find(
          (entry) => entry.branchId === branchId && entry.productId === product.id
        );

        if (branchProduct?.stockStatus === "hidden") {
          return null;
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          badge: product.badge,
          price: branchProduct?.price ?? 0,
          stockStatus:
            branchProduct?.stockStatus === "in_stock" ? "in_stock" : "out_of_stock",
          featured: branchProduct?.featured ?? false
        };
      })
      .filter((item): item is MenuItemView => item !== null);

    return {
      ...category,
      items
    };
  });
}
