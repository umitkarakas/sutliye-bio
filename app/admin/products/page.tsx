import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/prisma";
import { listAdminCategories, listAdminProducts } from "@/lib/server/admin-data";
import { AdminNav } from "@/components/admin-nav";
import { createProductAction, toggleProductStatusAction } from "../actions";

type SearchParams = Promise<{
  status?: string | string[];
}>;

function asSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getMessage(status: string) {
  switch (status) {
    case "created":
      return "Yeni ürün oluşturuldu.";
    case "toggled":
      return "Ürün durumu güncellendi.";
    case "invalid":
      return "Kategori, ad, slug ve açıklama zorunlu.";
    case "error":
      return "Ürün oluşturulamadı. Veritabanı bağlantısını kontrol et.";
    default:
      return "";
  }
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

  const status = asSingle((await searchParams)?.status);
  const [products, categories] = await Promise.all([listAdminProducts(), listAdminCategories()]);
  const isDemo = !hasDatabaseUrl();
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <main className="min-h-screen px-4 py-6 text-[color:var(--foreground)] sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="admin-shell rounded-[32px] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="admin-kicker">Admin ürünleri</p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">Ürün Yönetimi</h1>
              <p className="admin-copy mt-3 max-w-2xl text-sm leading-6">
                Ürün kartları, kategori bağlantısı ve öne çıkan etiketleri bu alanda yönetilir.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminNav currentPath="/admin/products" />
              <Link href="/admin/pricing" className="admin-cta-primary whitespace-nowrap">
                Fiyat matrisi
              </Link>
            </div>
          </div>
        </section>

        {isDemo ? (
          <section className="admin-notice rounded-[24px] px-4 py-3 text-sm">
            Demo fallback aktif. Yeni ürün eklemek için `DATABASE_URL` gerekir.
          </section>
        ) : null}

        {getMessage(status) ? (
          <section className="admin-feedback rounded-[24px] px-4 py-3 text-sm">
            {getMessage(status)}
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <div className="admin-panel rounded-[32px] p-4">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Mevcut Ürünler</h2>
            <div className="mt-4 grid gap-3">
              {products.map((product) => (
                <article key={product.id} className="admin-card rounded-[28px] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="admin-copy mt-2 text-sm">
                        {categoryMap.get(product.categoryId) ?? product.categoryId}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {product.badgeLabel ? (
                        <span className="admin-badge rounded-full px-3 py-1 text-xs font-medium">
                          {product.badgeLabel}
                        </span>
                      ) : null}
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-medium",
                          product.isActive ? "admin-status-active" : "admin-status-inactive"
                        ].join(" ")}
                      >
                        {product.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                  </div>
                  <p className="admin-copy mt-3 text-sm leading-6">{product.description}</p>
                  <form action={toggleProductStatusAction} className="mt-4">
                    <input type="hidden" name="id" value={product.id} />
                    <button
                      type="submit"
                      disabled={isDemo}
                      className="admin-cta-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {product.isActive ? "Pasife al" : "Aktifleştir"}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </div>

          <form
            action={createProductAction}
            className="admin-panel rounded-[32px] p-4"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Yeni Ürün</h2>
            <p className="admin-copy mt-2 text-sm leading-6">
              Yeni ürün oluşunca aktif şubelerin her biri için otomatik gizli fiyat ve stok kaydı açılır.
            </p>
            <div className="mt-4 space-y-3">
              <select
                name="categoryId"
                defaultValue=""
                className="admin-input rounded-2xl px-4 py-3"
              >
                <option value="" disabled>
                  Kategori seç
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input name="name" placeholder="Ürün adı" className="admin-input rounded-2xl px-4 py-3" />
              <input name="slug" placeholder="slug" className="admin-input rounded-2xl px-4 py-3" />
              <textarea
                name="description"
                placeholder="Açıklama"
                rows={4}
                className="admin-input rounded-2xl px-4 py-3"
              />
              <input
                name="badgeLabel"
                placeholder="Etiket (opsiyonel)"
                className="admin-input rounded-2xl px-4 py-3"
              />
              <button
                type="submit"
                disabled={isDemo}
                className="admin-cta-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ürün oluştur
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
