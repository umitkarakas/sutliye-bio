export type TabId = "contact" | "menu";

export type BrandTheme = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
};

export type PublicBusiness = {
  name: string;
  tagline: string;
  badge: string;
  logoUrl?: string;
  primaryPhone?: string;
  primaryWhatsapp?: string;
  theme: BrandTheme;
};

export type Branch = {
  id: string;
  slug: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  whatsapp: string;
  mapUrl: string;
  reviewUrl?: string;
  hours: string;
  blurb: string;
  heroNote: string;
};

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl?: string;
  badge?: string;
};

export type BranchProduct = {
  branchId: string;
  productId: string;
  price: number;
  stockStatus: "in_stock" | "out_of_stock" | "hidden";
  featured?: boolean;
};

export type MenuItemView = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  badge?: string;
  price: number;
  stockStatus: "in_stock" | "out_of_stock";
  featured: boolean;
};

export type MenuCategoryWithItems = {
  id: string;
  slug: string;
  name: string;
  items: MenuItemView[];
};

export type PricingAdjustmentType = "percentage" | "fixed_delta" | "set_fixed_price";

export type PricingMatrixCell = {
  id: string;
  branchId: string;
  branchName: string;
  price: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "hidden";
  isAvailable: boolean;
  canEdit: boolean;
};

export type PricingMatrixRow = {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  badge?: string;
  cells: PricingMatrixCell[];
};

export type PricingMatrixData = {
  isDemo: boolean;
  branches: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  rows: PricingMatrixRow[];
  selectedBranchIds: string[];
  selectedCategoryId: string;
  search: string;
};
