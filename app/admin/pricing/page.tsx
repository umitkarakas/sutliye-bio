import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { batchUpdatePricingAction } from "./actions";
import { listPricingMatrix } from "@/lib/server/pricing-data";
import { AdminPageShell } from "@/components/admin-page-shell";

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

function buildPricingUrl({
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
    case "batch-updated":
      return "Toplu fiyat güncellemesi tamamlandı.";
    case "batch-invalid":
      return "Gönderilen form verisi geçersiz.";
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

  const returnTo = buildPricingUrl({
    branchIds: matrix.selectedBranchIds,
    categoryId: matrix.selectedCategoryId,
    search: matrix.search
  });

  return (
    <AdminPageShell
      currentPath="/admin/pricing"
      title="Toplu Fiyat"
      sessionEmail={session.email}
      actions={
        <Link href="/admin/products" className="admin-cta-secondary whitespace-nowrap">
          Ürünler
        </Link>
      }
    >
      <section className="admin-panel rounded-[32px] p-5">
        <p className="admin-kicker">Toplu fiyat güncelleme</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Toplu işlem</h2>
        <p className="admin-copy mt-3 text-sm leading-6">
          Seçili şubeler ve kategorideki tüm ürünlere yüzde, sabit fark veya sabit fiyat uygula.
          Tekil ürün fiyatları için <Link href="/admin/products" className="underline">Ürünler</Link> sayfasını kullan.
        </p>
      </section>

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

      <section className="grid gap-4 xl:grid-cols-[0.95fr_2.05fr]">
        <form action="/admin/pricing" method="get" className="admin-panel rounded-[32px] p-4">
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
      </section>
    </AdminPageShell>
  );
}
