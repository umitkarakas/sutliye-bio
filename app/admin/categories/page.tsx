import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/prisma";
import { listAdminCategories } from "@/lib/server/admin-data";
import { AdminNav } from "@/components/admin-nav";
import { createCategoryAction, toggleCategoryStatusAction } from "../actions";

type SearchParams = Promise<{
  status?: string | string[];
}>;

function asSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getMessage(status: string) {
  switch (status) {
    case "created":
      return "Yeni kategori oluşturuldu.";
    case "toggled":
      return "Kategori durumu güncellendi.";
    case "invalid":
      return "Kategori adı ve slug zorunlu.";
    case "error":
      return "Kategori oluşturulamadı. Veritabanı bağlantısını kontrol et.";
    default:
      return "";
  }
}

export default async function AdminCategoriesPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const status = asSingle((await searchParams)?.status);
  const categories = await listAdminCategories();
  const isDemo = !hasDatabaseUrl();

  return (
    <main className="min-h-screen px-4 py-6 text-[color:var(--foreground)] sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="admin-shell rounded-[32px] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="admin-kicker">Admin kategorileri</p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">Kategori Yönetimi</h1>
              <p className="admin-copy mt-3 max-w-2xl text-sm leading-6">
                Mobil menüdeki kategori sırası, adı ve görünürlüğü bu alandan yönetilir.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminNav currentPath="/admin/categories" />
              <Link href="/admin/products" className="admin-cta-primary whitespace-nowrap">
                Ürünlere git
              </Link>
            </div>
          </div>
        </section>

        {isDemo ? (
          <section className="admin-notice rounded-[24px] px-4 py-3 text-sm">
            Demo fallback aktif. Yeni kategori eklemek için `DATABASE_URL` gerekir.
          </section>
        ) : null}

        {getMessage(status) ? (
          <section className="admin-feedback rounded-[24px] px-4 py-3 text-sm">
            {getMessage(status)}
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="admin-panel rounded-[32px] p-4">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Mevcut Kategoriler</h2>
            <div className="mt-4 grid gap-3">
              {categories.map((category) => (
                <article key={category.id} className="admin-card rounded-[28px] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="admin-copy mt-2 text-sm">Görünüm sırası: {category.displayOrder + 1}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="admin-badge rounded-full px-3 py-1 text-xs font-medium">
                        {category.slug}
                      </span>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-medium",
                          category.isActive ? "admin-status-active" : "admin-status-inactive"
                        ].join(" ")}
                      >
                        {category.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                  </div>
                  <form action={toggleCategoryStatusAction} className="mt-4">
                    <input type="hidden" name="id" value={category.id} />
                    <button
                      type="submit"
                      disabled={isDemo}
                      className="admin-cta-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {category.isActive ? "Pasife al" : "Aktifleştir"}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </div>

          <form
            action={createCategoryAction}
            className="admin-panel rounded-[32px] p-4"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Yeni Kategori</h2>
            <p className="admin-copy mt-2 text-sm leading-6">
              Pasif kategoriler mobil menü ve fiyat filtrelerinde gizlenir.
            </p>
            <div className="mt-4 space-y-3">
              <input name="name" placeholder="Kategori adı" className="admin-input rounded-2xl px-4 py-3" />
              <input name="slug" placeholder="slug" className="admin-input rounded-2xl px-4 py-3" />
              <textarea
                name="description"
                placeholder="Açıklama (opsiyonel)"
                rows={4}
                className="admin-input rounded-2xl px-4 py-3"
              />
              <button
                type="submit"
                disabled={isDemo}
                className="admin-cta-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                Kategori oluştur
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
