import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/prisma";
import { listAdminCategories } from "@/lib/server/admin-data";
import { AdminContentModeSwitch } from "@/components/admin-content-mode-switch";
import { AdminPageShell } from "@/components/admin-page-shell";
import { createCategoryAction, toggleCategoryStatusAction, updateCategoryAction } from "../actions";

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
      return "Yeni kategori oluşturuldu.";
    case "updated":
      return "Kategori bilgileri güncellendi.";
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

function resolveMode(value: string) {
  return value === "new" ? "new" : "list";
}

function getCategoryHref(categoryId: string, options?: { edit?: boolean }) {
  const params = new URLSearchParams();

  if (options?.edit) {
    params.set("edit", categoryId);
  }

  const query = params.toString();
  const base = query ? `/admin/categories?${query}` : "/admin/categories";
  return `${base}#category-${categoryId}`;
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

  const resolvedSearchParams = (await searchParams) ?? {};
  const status = asSingle(resolvedSearchParams.status);
  const mode = resolveMode(asSingle(resolvedSearchParams.mode));
  const editingId = asSingle(resolvedSearchParams.edit);
  const categories = await listAdminCategories();
  const isDemo = !hasDatabaseUrl();
  const listHref = "/admin/categories";
  const newHref = "/admin/categories?mode=new";

  return (
    <AdminPageShell
      currentPath="/admin/categories"
      title="Kategoriler"
      sessionEmail={session.email}
      actions={
        <Link href="/admin/products" className="admin-cta-primary whitespace-nowrap">
          Ürünler
        </Link>
      }
    >
      <section className="flex flex-wrap gap-2">
        <span className="admin-chip rounded-full px-4 py-2">{categories.length} kategori</span>
      </section>

      <AdminContentModeSwitch
        listHref={listHref}
        newHref={newHref}
        mode={mode}
        listLabel="Kategori listesi"
        newLabel="Yeni kategori"
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
            <span className="admin-chip rounded-full px-4 py-2">{categories.length}</span>
          </div>
          <div className="mt-4 grid gap-3">
            {categories.map((category) => (
              <article
                key={category.id}
                id={`category-${category.id}`}
                className="admin-card scroll-mt-28 rounded-[28px] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="admin-copy mt-2 text-sm">Sıra: {category.displayOrder + 1}</p>
                    {category.description ? (
                      <p className="admin-copy mt-2 text-sm leading-6">{category.description}</p>
                    ) : null}
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
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={
                      editingId === category.id
                        ? getCategoryHref(category.id)
                        : getCategoryHref(category.id, { edit: true })
                    }
                    className="admin-cta-secondary whitespace-nowrap"
                  >
                    {editingId === category.id ? "Düzenlemeyi kapat" : "Düzenle"}
                  </Link>
                  <form action={toggleCategoryStatusAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <button
                      type="submit"
                      disabled={isDemo}
                      className="admin-cta-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {category.isActive ? "Pasife al" : "Aktifleştir"}
                    </button>
                  </form>
                </div>

                {editingId === category.id ? (
                  <form action={updateCategoryAction} className="mt-4 space-y-3 rounded-[24px] border border-[color:var(--line)] p-4">
                    <input type="hidden" name="id" value={category.id} />
                    <input
                      type="hidden"
                      name="returnTo"
                      value={getCategoryHref(category.id, { edit: true })}
                    />
                    <input
                      name="name"
                      defaultValue={category.name}
                      placeholder="Kategori adı"
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <input
                      name="slug"
                      defaultValue={category.slug}
                      placeholder="Slug"
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <textarea
                      name="description"
                      defaultValue={category.description ?? ""}
                      placeholder="Açıklama"
                      rows={4}
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <button
                      type="submit"
                      disabled={isDemo}
                      className="admin-cta-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Kategoriyi kaydet
                    </button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <form action={createCategoryAction} className="admin-panel rounded-[32px] p-4">
          <input type="hidden" name="returnTo" value={newHref} />
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Yeni kategori</h2>
          <div className="mt-4 space-y-3">
            <input name="name" placeholder="Kategori adı" className="admin-input rounded-2xl px-4 py-3" />
            <input name="slug" placeholder="Slug" className="admin-input rounded-2xl px-4 py-3" />
            <textarea
              name="description"
              placeholder="Açıklama"
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
      )}
    </AdminPageShell>
  );
}
