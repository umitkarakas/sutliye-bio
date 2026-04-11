import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { batchUpdatePricingAction, updateBranchProductAction } from "./actions";
import { listPricingMatrix } from "@/lib/server/pricing-data";
import { AdminPageShell } from "@/components/admin-page-shell";

type SearchParams = Promise<{
  categoryId?: string | string[];
  branchIds?: string | string[];
  mode?: string | string[];
  search?: string | string[];
  status?: string | string[];
}>;

type PricingMode = "single" | "batch";

function asSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function asMany(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function buildPricingUrl({
  branchIds,
  categoryId,
  mode,
  search
}: {
  branchIds: string[];
  categoryId: string;
  mode?: PricingMode;
  search: string;
}) {
  const params = new URLSearchParams();

  if (mode && mode !== "single") {
    params.set("mode", mode);
  }

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

function resolveMode(value: string): PricingMode {
  return value === "batch" ? "batch" : "single";
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
  const mode = resolveMode(asSingle(resolvedSearchParams.mode));
  const search = asSingle(resolvedSearchParams.search);
  const status = asSingle(resolvedSearchParams.status);

  const matrix = await listPricingMatrix({
    categoryId: selectedCategoryId,
    branchIds: selectedBranchIds,
    search
  });

  const returnTo = buildPricingUrl({
    branchIds: matrix.selectedBranchIds,
    categoryId: matrix.selectedCategoryId,
    mode,
    search: matrix.search
  });
  const singleModeHref = buildPricingUrl({
    branchIds: matrix.selectedBranchIds,
    categoryId: matrix.selectedCategoryId,
    search: matrix.search
  });
  const batchModeHref = buildPricingUrl({
    branchIds: matrix.selectedBranchIds,
    categoryId: matrix.selectedCategoryId,
    mode: "batch",
    search: matrix.search
  });

  return (
    <AdminPageShell
      currentPath="/admin/pricing"
      title="Fiyatlandırma"
      sessionEmail={session.email}
      actions={
        <>
          <Link href="/" className="admin-cta-primary whitespace-nowrap">
            Mobil görünüm
          </Link>
          <Link href="/admin" className="admin-cta-secondary whitespace-nowrap">
            Özet
          </Link>
        </>
      }
    >
      <section className="flex flex-wrap gap-2">
        <span className="admin-chip rounded-full px-4 py-2">{matrix.rows.length} ürün</span>
        <span className="admin-chip rounded-full px-4 py-2">{matrix.selectedBranchIds.length} şube</span>
        {matrix.selectedCategoryId ? (
          <span className="admin-chip rounded-full px-4 py-2">Kategori filtresi</span>
        ) : null}
      </section>

      {matrix.isDemo ? (
        <section className="admin-notice rounded-[24px] px-4 py-3 text-sm">
          Demo fallback aktif. Düzenleme için `DATABASE_URL` gerekir.
        </section>
      ) : null}

      {statusMessage(status) ? (
        <section className="admin-feedback rounded-[24px] px-4 py-3 text-sm">
          {statusMessage(status)}
        </section>
      ) : null}

      <section className="admin-panel rounded-[32px] p-3">
        <div className="grid gap-2 md:grid-cols-2">
          <Link
            href={singleModeHref}
            aria-current={mode === "single" ? "page" : undefined}
            className={[
              "rounded-[24px] border px-4 py-4 transition",
              mode === "single"
                ? "border-transparent bg-[color:var(--foreground)] text-white"
                : "border-[color:var(--line)] bg-[color:var(--card-strong)] text-[color:var(--foreground)]"
            ].join(" ")}
          >
            <p className="text-sm font-semibold">Hızlı güncelleme</p>
            <p className={mode === "single" ? "mt-1 text-sm text-white/72" : "mt-1 text-sm text-[color:var(--muted)]"}>
              Ürün bul, tekil fiyat ve stok kaydet.
            </p>
          </Link>
          <Link
            href={batchModeHref}
            aria-current={mode === "batch" ? "page" : undefined}
            className={[
              "rounded-[24px] border px-4 py-4 transition",
              mode === "batch"
                ? "border-transparent bg-[color:var(--foreground)] text-white"
                : "border-[color:var(--line)] bg-[color:var(--card-strong)] text-[color:var(--foreground)]"
            ].join(" ")}
          >
            <p className="text-sm font-semibold">Toplu işlem</p>
            <p className={mode === "batch" ? "mt-1 text-sm text-white/72" : "mt-1 text-sm text-[color:var(--muted)]"}>
              Seçili şubeler ve kategori için toplu fiyat uygula.
            </p>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_2.05fr]">
        <form action="/admin/pricing" method="get" className="admin-panel rounded-[32px] p-4">
          <input type="hidden" name="mode" value={mode} />
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

            <button type="submit" className="admin-cta-primary w-full">
              Filtreyi uygula
            </button>
          </div>
        </form>

        {mode === "single" ? (
          <section className="admin-panel rounded-[32px] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-2xl">Hızlı güncelleme</h2>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="admin-chip rounded-full px-4 py-2">{matrix.rows.length} ürün</span>
                <span className="admin-chip rounded-full px-4 py-2">{matrix.selectedBranchIds.length} şube</span>
              </div>
            </div>

            {matrix.rows.length === 0 ? (
              <div className="admin-card rounded-[28px] px-4 py-5 text-sm text-[color:var(--muted)]">
                Bu filtrelerle eşleşen ürün bulunamadı.
              </div>
            ) : (
              <div className="grid gap-4">
                {matrix.rows.map((row) => (
                  <article key={row.productId} className="admin-card rounded-[30px] p-4">
                    <div className="flex flex-col gap-3 border-b border-[color:var(--line)] pb-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="admin-kicker">{row.categoryName}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{row.productName}</h3>
                          {row.badge ? (
                            <span className="admin-badge rounded-full px-2.5 py-1 text-[11px] font-medium">
                              {row.badge}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <span className="admin-chip rounded-full px-4 py-2 text-sm">
                        {row.cells.filter((cell) => cell.canEdit).length} şube kaydı
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {row.cells.map((cell) => (
                        <form
                          key={cell.id}
                          action={updateBranchProductAction}
                          className="rounded-[24px] border border-[color:var(--line)] bg-[rgba(255,255,255,0.56)] p-4"
                        >
                          <input type="hidden" name="id" value={cell.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="admin-kicker">{cell.branchName}</p>
                              <p className="mt-2 text-sm text-[color:var(--muted)]">
                                {cell.canEdit ? "Tekil fiyat ve stok güncelle" : "Bu ürün için kayıt yok"}
                              </p>
                            </div>
                            {cell.canEdit ? (
                              <span
                                className={[
                                  "rounded-full px-3 py-1 text-xs font-medium",
                                  cell.stockStatus === "in_stock"
                                    ? "admin-status-active"
                                    : cell.stockStatus === "hidden"
                                      ? "admin-chip"
                                      : "admin-status-inactive"
                                ].join(" ")}
                              >
                                {cell.stockStatus === "in_stock"
                                  ? "Stokta"
                                  : cell.stockStatus === "hidden"
                                    ? "Gizli"
                                    : "Tükendi"}
                              </span>
                            ) : null}
                          </div>

                          {cell.canEdit ? (
                            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
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
                                className="admin-cta-primary w-full md:w-auto disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Kaydet
                              </button>
                            </div>
                          ) : (
                            <div className="mt-4 rounded-2xl bg-[rgba(239,228,212,0.52)] px-3 py-4 text-sm text-[color:var(--muted)]">
                              Kayıt yok.
                            </div>
                          )}
                        </form>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <form action={batchUpdatePricingAction} className="admin-panel rounded-[32px] p-5">
            <input type="hidden" name="returnTo" value={returnTo} />
            {matrix.selectedBranchIds.map((branchId) => (
              <input key={branchId} type="hidden" name="branchIds" value={branchId} />
            ))}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl">Toplu işlem</h2>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  Seçili filtreler üzerinden toplu fiyat uygulayın.
                </p>
              </div>
              <span className="admin-badge rounded-full px-3 py-1 text-xs font-medium">
                {matrix.selectedBranchIds.length} şube
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="admin-card rounded-[28px] p-4">
                <p className="admin-kicker">Kapsam</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="admin-chip rounded-full px-4 py-2">{matrix.rows.length} ürün</span>
                  <span className="admin-chip rounded-full px-4 py-2">{matrix.selectedBranchIds.length} şube</span>
                  {matrix.selectedCategoryId ? (
                    <span className="admin-chip rounded-full px-4 py-2">Kategori seçili</span>
                  ) : null}
                </div>
              </div>

              <div className="admin-card rounded-[28px] p-4">
                <p className="admin-kicker">Aktif filtre</p>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {matrix.search ? `Arama: ${matrix.search}` : "Arama filtresi yok"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
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
                <span className="text-sm font-medium">İşlem</span>
                <select
                  name="adjustmentType"
                  defaultValue="percentage"
                  className="admin-input rounded-2xl px-4 py-3"
                >
                  <option value="percentage">Yüzde</option>
                  <option value="fixed_delta">Sabit fark</option>
                  <option value="set_fixed_price">Yeni fiyat</option>
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
              className="admin-cta-accent mt-5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Uygula
            </button>
          </form>
        )}
      </section>
    </AdminPageShell>
  );
}
