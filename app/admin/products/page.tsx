import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/prisma";
import { listAdminBranches, listAdminCategories, listAdminProducts } from "@/lib/server/admin-data";
import { getProductBranchPricing } from "@/lib/server/pricing-data";
import { AdminContentModeSwitch } from "@/components/admin-content-mode-switch";
import { AdminPageShell } from "@/components/admin-page-shell";
import { ProductPricingSection } from "@/components/product-pricing-section";
import {
  createProductAction,
  deleteProductAction,
  moveProductAction,
  toggleProductStatusAction,
  updateProductAction
} from "../actions";

type SearchParams = Promise<{
  edit?: string | string[];
  mode?: string | string[];
  status?: string | string[];
}>;

function asSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getMessage(status: string) {
  switch (status) {
    case "created":
      return "Yeni ürün oluşturuldu. Fiyatlar aktif şubelere işlendi.";
    case "updated":
      return "Ürün bilgileri ve fiyatları güncellendi.";
    case "toggled":
      return "Ürün durumu güncellendi.";
    case "deleted":
      return "Ürün silindi.";
    case "reordered":
      return "Ürün liste sırası güncellendi.";
    case "invalid":
      return "Kategori, ad, slug, açıklama, görsel ve fiyat bilgisi zorunlu.";
    case "error":
      return "Ürün işlemi tamamlanamadı. Veritabanı bağlantısını ve alanları kontrol et.";
    default:
      return "";
  }
}

function resolveMode(value: string) {
  return value === "new" ? "new" : "list";
}

function formatPriceSummary(summary: {
  minPrice: number | null;
  maxPrice: number | null;
  pricedBranchCount: number;
}) {
  if (!summary.pricedBranchCount || summary.minPrice === null || summary.maxPrice === null) {
    return "Fiyat tanımı yok";
  }

  if (summary.minPrice === summary.maxPrice) {
    return `${summary.minPrice} TL`;
  }

  return `${summary.minPrice} - ${summary.maxPrice} TL`;
}

function getProductHref(productId: string, options?: { edit?: boolean }) {
  const params = new URLSearchParams();

  if (options?.edit) {
    params.set("edit", productId);
  }

  const query = params.toString();
  const base = query ? `/admin/products?${query}` : "/admin/products";
  return `${base}#product-${productId}`;
}

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const status = asSingle(resolvedSearchParams.status);
  const mode = resolveMode(asSingle(resolvedSearchParams.mode));
  const editingId = asSingle(resolvedSearchParams.edit);
  const [products, categories, allBranches] = await Promise.all([
    listAdminProducts(),
    listAdminCategories(),
    listAdminBranches()
  ]);
  const activeBranches = allBranches.filter((b) => b.isActive);
  const isDemo = !hasDatabaseUrl();

  const editingBranchPricing = editingId
    ? await getProductBranchPricing(editingId)
    : [];
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const listHref = "/admin/products";
  const newHref = "/admin/products?mode=new";

  return (
    <AdminPageShell
      currentPath="/admin/products"
      title="Ürünler"
      sessionEmail={session.email}
      actions={null}
    >
      <section className="admin-panel rounded-[32px] p-5">
        <p className="admin-kicker">Ürün yönetimi</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Ürün + fiyat tek formda</h2>
        <p className="admin-copy mt-3 text-sm leading-6">
          Ürün eklerken veya düzenlerken şube bazlı fiyat ve stok durumunu aynı formda yönetebilirsin.
          Toplu fiyat güncellemesi için <Link href="/admin/pricing" className="underline">Toplu Fiyat</Link> sayfasını kullan.
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        <span className="admin-chip rounded-full px-4 py-2">{products.length} ürün</span>
      </section>

      <AdminContentModeSwitch
        listHref={listHref}
        newHref={newHref}
        mode={mode}
        listLabel="Ürün listesi"
        newLabel="Yeni ürün"
      />

      {isDemo ? (
        <section className="admin-notice rounded-[24px] px-4 py-3 text-sm">
          Demo fallback aktif. Yeni kayıt için `DATABASE_URL` gerekir.
        </section>
      ) : null}

      {getMessage(status) ? (
        <section className="admin-feedback rounded-[24px] px-4 py-3 text-sm">
          {getMessage(status)}
        </section>
      ) : null}

      {mode === "list" ? (
        <section className="admin-panel rounded-[32px] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Liste</h2>
            <span className="admin-chip rounded-full px-4 py-2">{products.length}</span>
          </div>

          {products.length === 0 ? (
            <div className="admin-card rounded-[28px] px-4 py-5 text-sm text-[color:var(--muted)]">
              Henüz ürün yok.
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  id={`product-${product.id}`}
                  className="admin-card scroll-mt-28 rounded-[30px] p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="h-32 overflow-hidden rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card-strong)] md:w-40 md:flex-none">
                      {product.imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[color:var(--muted)]">
                          Görsel eksik
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="admin-kicker">
                            {categoryMap.get(product.categoryId) ?? product.categoryId}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{product.name}</h3>
                            {product.badgeLabel ? (
                              <span className="admin-badge rounded-full px-3 py-1 text-xs font-medium">
                                {product.badgeLabel}
                              </span>
                            ) : null}
                            {product.isFeatured && !product.badgeLabel ? (
                              <span className="admin-badge rounded-full px-3 py-1 text-xs font-medium">
                                Öne çıkan
                              </span>
                            ) : null}
                          </div>
                          <p className="admin-copy mt-3 text-sm leading-6">{product.description}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-medium",
                              product.isActive ? "admin-status-active" : "admin-status-inactive"
                            ].join(" ")}
                          >
                            {product.isActive ? "Aktif" : "Pasif"}
                          </span>
                          <span className="admin-chip rounded-full px-3 py-1 text-xs">
                            Sıra {product.displayOrder + 1}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[22px] border border-[color:var(--line)] bg-[rgba(255,255,255,0.56)] p-3">
                          <p className="admin-kicker">Fiyat özeti</p>
                          <p className="mt-2 font-semibold">{formatPriceSummary(product.priceSummary)}</p>
                          <p className="mt-1 text-xs text-[color:var(--muted)]">
                            {product.priceSummary.pricedBranchCount} / {product.priceSummary.activeBranchCount} aktif şube
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-[color:var(--line)] bg-[rgba(255,255,255,0.56)] p-3">
                          <p className="admin-kicker">Görsel</p>
                          <p className="mt-2 text-sm">{product.imageUrl ? "Hazır" : "Eksik"}</p>
                          <p className="mt-1 text-xs text-[color:var(--muted)]">Public kartta kullanılır</p>
                        </div>
                        <div className="rounded-[22px] border border-[color:var(--line)] bg-[rgba(255,255,255,0.56)] p-3">
                          <p className="admin-kicker">Slug</p>
                          <p className="mt-2 text-sm">{product.slug}</p>
                          <p className="mt-1 text-xs text-[color:var(--muted)]">Sabit tanımlayıcı</p>
                        </div>
                      </div>

                      {editingId !== product.id ? (
                        <div className="mt-4">
                          <Link
                            href={getProductHref(product.id, { edit: true })}
                            className="admin-cta-primary whitespace-nowrap"
                          >
                            Düzenle
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {editingId === product.id ? (
                    <div className="mt-5 border-t border-[color:var(--line)] pt-5">
                      <form action={updateProductAction}>
                        <input type="hidden" name="id" value={product.id} />
                        <input
                          type="hidden"
                          name="returnTo"
                          value={getProductHref(product.id, { edit: true })}
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                          <select
                            name="categoryId"
                            defaultValue={product.categoryId}
                            required
                            className="admin-input rounded-2xl px-4 py-3"
                          >
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          <input
                            name="name"
                            defaultValue={product.name}
                            placeholder="Ürün adı"
                            required
                            className="admin-input rounded-2xl px-4 py-3"
                          />
                          <input
                            name="slug"
                            defaultValue={product.slug}
                            placeholder="Slug"
                            required
                            className="admin-input rounded-2xl px-4 py-3"
                          />
                          <input
                            name="imageUrl"
                            defaultValue={product.imageUrl ?? ""}
                            placeholder="Görsel URL"
                            required
                            className="admin-input rounded-2xl px-4 py-3"
                          />
                          <input
                            name="badgeLabel"
                            defaultValue={product.badgeLabel ?? ""}
                            placeholder="Etiket"
                            className="admin-input rounded-2xl px-4 py-3"
                          />
                          <label className="admin-card flex items-center gap-3 rounded-2xl px-4 py-3">
                            <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} />
                            <span>Öne çıkan ürün</span>
                          </label>
                        </div>
                        <textarea
                          name="description"
                          defaultValue={product.description}
                          placeholder="Açıklama"
                          rows={4}
                          required
                          className="admin-input mt-3 w-full rounded-2xl px-4 py-3"
                        />
                        <ProductPricingSection
                          branches={editingBranchPricing.map((bp) => ({
                            id: bp.branchId,
                            name: bp.branchName,
                            currentPrice: bp.price,
                            currentStockStatus: bp.stockStatus
                          }))}
                          defaultMode="per_branch"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="submit"
                            disabled={isDemo}
                            className="admin-cta-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Kaydet
                          </button>
                          <Link href={listHref} className="admin-cta-secondary">
                            Vazgeç
                          </Link>
                        </div>
                      </form>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--line)] pt-4">
                        <form action={moveProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="direction" value="up" />
                          <input type="hidden" name="returnTo" value={getProductHref(product.id, { edit: true })} />
                          <button
                            type="submit"
                            disabled={isDemo}
                            className="admin-cta-secondary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Yukarı al
                          </button>
                        </form>
                        <form action={moveProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="direction" value="down" />
                          <input type="hidden" name="returnTo" value={getProductHref(product.id, { edit: true })} />
                          <button
                            type="submit"
                            disabled={isDemo}
                            className="admin-cta-secondary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Aşağı al
                          </button>
                        </form>
                        <form action={toggleProductStatusAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="returnTo" value={getProductHref(product.id, { edit: true })} />
                          <button
                            type="submit"
                            disabled={isDemo}
                            className="admin-cta-secondary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {product.isActive ? "Pasife al" : "Aktifleştir"}
                          </button>
                        </form>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="returnTo" value={getProductHref(product.id)} />
                          <button
                            type="submit"
                            disabled={isDemo}
                            className="admin-cta-secondary whitespace-nowrap text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Sil
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <form action={createProductAction} className="admin-panel rounded-[32px] p-4">
          <input type="hidden" name="returnTo" value={newHref} />
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Yeni ürün</h2>
          <p className="admin-copy mt-2 text-sm leading-6">
            Ürün bilgilerini ve şube fiyatlarını tek formda tanımla.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select name="categoryId" defaultValue="" required className="admin-input rounded-2xl px-4 py-3">
              <option value="" disabled>
                Kategori seç
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input name="name" placeholder="Ürün adı" required className="admin-input rounded-2xl px-4 py-3" />
            <input name="slug" placeholder="Slug" required className="admin-input rounded-2xl px-4 py-3" />
            <input name="imageUrl" placeholder="Görsel URL" required className="admin-input rounded-2xl px-4 py-3" />
            <input
              name="badgeLabel"
              placeholder="Etiket"
              className="admin-input rounded-2xl px-4 py-3"
            />
            <label className="admin-card flex items-center gap-3 rounded-2xl px-4 py-3">
              <input type="checkbox" name="isFeatured" />
              <span>Öne çıkan ürün</span>
            </label>
          </div>
          <textarea
            name="description"
            placeholder="Açıklama"
            rows={4}
            required
            className="admin-input mt-3 w-full rounded-2xl px-4 py-3"
          />
          <ProductPricingSection
            branches={activeBranches.map((b) => ({
              id: b.id,
              name: b.name,
              currentPrice: null,
              currentStockStatus: "in_stock" as const
            }))}
            defaultMode="uniform"
          />
          <button
            type="submit"
            disabled={isDemo}
            className="admin-cta-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ürün oluştur
          </button>
        </form>
      )}
    </AdminPageShell>
  );
}
