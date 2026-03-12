import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { batchUpdatePricingAction, updateBranchProductAction } from "./actions";
import { listPricingMatrix } from "@/lib/server/pricing-data";
import { AdminNav } from "@/components/admin-nav";

type SearchParams = Promise<{
  categoryId?: string | string[];
  branchIds?: string | string[];
  search?: string | string[];
  status?: string | string[];
}>;

function asSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function asMany(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function buildReturnTo({
  branchIds,
  categoryId,
  search
}: {
  branchIds: string[];
  categoryId: string;
  search: string;
}) {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set("categoryId", categoryId);
  }

  if (search) {
    params.set("search", search);
  }

  for (const branchId of branchIds) {
    params.append("branchIds", branchId);
  }

  const query = params.toString();
  return query ? `/admin/pricing?${query}` : "/admin/pricing";
}

function statusMessage(status: string) {
  switch (status) {
    case "updated":
      return "Tekil fiyat ve stok güncellemesi kaydedildi.";
    case "batch-updated":
      return "Toplu fiyat güncellemesi tamamlandı.";
    case "invalid":
    case "batch-invalid":
      return "Gönderilen form verisi geçersiz.";
    case "update-error":
    case "batch-error":
      return "İşlem tamamlanamadı. Veritabanı bağlantısını ve alanları kontrol et.";
    default:
      return "";
  }
}

export default async function AdminPricingPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedCategoryId = asSingle(resolvedSearchParams.categoryId);
  const selectedBranchIds = asMany(resolvedSearchParams.branchIds);
  const search = asSingle(resolvedSearchParams.search);
  const status = asSingle(resolvedSearchParams.status);

  const matrix = await listPricingMatrix({
    categoryId: selectedCategoryId,
    branchIds: selectedBranchIds,
    search
  });

  const returnTo = buildReturnTo({
    branchIds: matrix.selectedBranchIds,
    categoryId: matrix.selectedCategoryId,
    search: matrix.search
  });

  return (
    <main className="min-h-screen px-4 py-6 text-[color:var(--foreground)] sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="admin-shell rounded-[32px] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="admin-kicker">Fiyatlandırma</p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">Şube Bazlı Fiyat ve Stok</h1>
              <p className="admin-copy mt-3 max-w-3xl text-sm leading-6">
                Tekil hücre güncelleme ve kategori bazlı toplu fiyat işlemleri bu ekrandan yönetilir.
              </p>
              <p className="admin-kicker mt-3">
                Oturum: {session.email}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminNav currentPath="/admin/pricing" />
              <Link href="/admin" className="admin-cta-secondary whitespace-nowrap">
                Panele dön
              </Link>
              <Link href="/" className="admin-cta-primary whitespace-nowrap">
                Mobil görünüm
              </Link>
            </div>
          </div>
        </section>

        {matrix.isDemo ? (
          <section className="admin-notice rounded-[24px] px-4 py-3 text-sm">
            Demo fallback aktif. Fiyat ve stok listesi görünür, fakat düzenleme işlemleri için `DATABASE_URL` tanımlı bir veritabanı gerekir.
          </section>
        ) : null}

        {statusMessage(status) ? (
          <section className="admin-feedback rounded-[24px] px-4 py-3 text-sm">
            {statusMessage(status)}
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.2fr_2.2fr]">
          <form
            action="/admin/pricing"
            method="get"
            className="admin-panel rounded-[32px] p-4"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Filtreler</h2>
            <div className="mt-4 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Kategori</span>
                <select
                  name="categoryId"
                  defaultValue={matrix.selectedCategoryId}
                  className="admin-input rounded-2xl px-4 py-3"
                >
                  <option value="">Tüm kategoriler</option>
                  {matrix.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Arama</span>
                <input
                  type="search"
                  name="search"
                  defaultValue={matrix.search}
                  placeholder="Ürün veya açıklama ara"
                  className="admin-input rounded-2xl px-4 py-3"
                />
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Şubeler</legend>
                <div className="grid gap-2">
                  {matrix.branches.map((branch) => (
                    <label
                      key={branch.id}
                      className="admin-card flex items-center gap-3 rounded-2xl px-4 py-3"
                    >
                      <input
                        type="checkbox"
                        name="branchIds"
                        value={branch.id}
                        defaultChecked={matrix.selectedBranchIds.includes(branch.id)}
                      />
                      <span>{branch.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                className="admin-cta-primary w-full"
              >
                Filtreyi uygula
              </button>
            </div>
          </form>

          <form
            action={batchUpdatePricingAction}
            className="admin-panel rounded-[32px] p-4"
          >
            <input type="hidden" name="returnTo" value={returnTo} />
            {matrix.selectedBranchIds.map((branchId) => (
              <input key={branchId} type="hidden" name="branchIds" value={branchId} />
            ))}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl">Toplu Fiyat Güncelle</h2>
                <p className="admin-copy mt-2 text-sm leading-6">
                  Seçili şubeler ve kategori bağlamında toplu artış, sabit fark veya doğrudan fiyat atama yap.
                </p>
              </div>
              <span className="admin-badge rounded-full px-3 py-1 text-xs font-medium">
                {matrix.selectedBranchIds.length} şube seçili
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Kategori</span>
                <select
                  name="categoryId"
                  defaultValue={matrix.selectedCategoryId}
                  className="admin-input rounded-2xl px-4 py-3"
                >
                  <option value="">Tüm aktif ürünler</option>
                  {matrix.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">İşlem tipi</span>
                <select
                  name="adjustmentType"
                  defaultValue="percentage"
                  className="admin-input rounded-2xl px-4 py-3"
                >
                  <option value="percentage">Yüzde artış ve azalış</option>
                  <option value="fixed_delta">Sabit tutar ekle ve çıkar</option>
                  <option value="set_fixed_price">Doğrudan yeni fiyat ata</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Değer</span>
                <input
                  type="number"
                  step="0.01"
                  name="adjustmentValue"
                  defaultValue="10"
                  className="admin-input rounded-2xl px-4 py-3"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={matrix.isDemo}
              className="admin-cta-accent mt-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Toplu güncellemeyi uygula
            </button>
          </form>
        </section>

        <section className="admin-panel rounded-[32px] p-4">
          <div className="admin-copy mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="admin-chip rounded-full px-4 py-2">
              {matrix.rows.length} ürün
            </span>
            <span className="admin-chip rounded-full px-4 py-2">
              {matrix.selectedBranchIds.length} şube
            </span>
            {matrix.selectedCategoryId ? (
              <span className="admin-chip rounded-full px-4 py-2">
                Kategori filtresi aktif
              </span>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <div
              className="grid min-w-[940px] gap-3"
              style={{
                gridTemplateColumns: `minmax(260px, 1.2fr) repeat(${matrix.selectedBranchIds.length}, minmax(220px, 1fr))`
              }}
            >
              <div className="rounded-[24px] bg-[color:var(--foreground)] px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/78">
                Ürün
              </div>
              {matrix.selectedBranchIds.map((branchId) => {
                const branch = matrix.branches.find((entry) => entry.id === branchId);

                return (
                  <div
                    key={branchId}
                    className="rounded-[24px] bg-[color:var(--foreground)] px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/78"
                  >
                    {branch?.name ?? "Şube"}
                  </div>
                );
              })}

              {matrix.rows.map((row) => (
                <div
                  key={row.productId}
                  className="contents"
                >
                  <article className="admin-card rounded-[28px] p-4">
                    <p className="admin-kicker">
                      {row.categoryName}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{row.productName}</h3>
                      {row.badge ? (
                        <span className="admin-badge rounded-full px-2.5 py-1 text-[11px] font-medium">
                          {row.badge}
                        </span>
                      ) : null}
                    </div>
                  </article>

                  {row.cells.map((cell) => (
                    <form
                      key={cell.id}
                      action={updateBranchProductAction}
                      className="admin-card rounded-[28px] p-4"
                    >
                      <input type="hidden" name="id" value={cell.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <p className="admin-kicker">
                        {cell.branchName}
                      </p>

                      {cell.canEdit ? (
                        <div className="mt-3 space-y-3">
                          <label className="block space-y-1">
                            <span className="admin-copy text-xs font-medium">Fiyat</span>
                            <input
                              type="number"
                              step="0.01"
                              name="price"
                              defaultValue={cell.price ?? 0}
                              disabled={matrix.isDemo}
                              className="admin-input rounded-2xl px-3 py-2 disabled:cursor-not-allowed"
                            />
                          </label>

                          <label className="block space-y-1">
                            <span className="admin-copy text-xs font-medium">Stok</span>
                            <select
                              name="stockStatus"
                              defaultValue={cell.stockStatus}
                              disabled={matrix.isDemo}
                              className="admin-input rounded-2xl px-3 py-2 disabled:cursor-not-allowed"
                            >
                              <option value="in_stock">Stokta</option>
                              <option value="out_of_stock">Tükendi</option>
                              <option value="hidden">Gizli</option>
                            </select>
                          </label>

                          <button
                            type="submit"
                            disabled={matrix.isDemo}
                            className="admin-cta-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Kaydet
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl bg-[rgba(239,228,212,0.52)] px-3 py-4 text-sm text-[color:var(--muted)]">
                          Bu ürün için ilgili şubede kayıt bulunmuyor.
                        </div>
                      )}
                    </form>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
