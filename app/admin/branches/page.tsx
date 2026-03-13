import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/prisma";
import { listAdminBranches } from "@/lib/server/admin-data";
import { AdminContentModeSwitch } from "@/components/admin-content-mode-switch";
import { AdminPageShell } from "@/components/admin-page-shell";
import { createBranchAction, toggleBranchStatusAction, updateBranchAction } from "../actions";

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
      return "Yeni şube kaydı oluşturuldu.";
    case "updated":
      return "Şube bilgileri güncellendi.";
    case "toggled":
      return "Şube durumu güncellendi.";
    case "invalid":
      return "Tüm zorunlu şube alanlarını doldur.";
    case "error":
      return "Şube oluşturulamadı. Veritabanı bağlantısını kontrol et.";
    default:
      return "";
  }
}

function resolveMode(value: string) {
  return value === "new" ? "new" : "list";
}

function getBranchHref(branchId: string, options?: { edit?: boolean }) {
  const params = new URLSearchParams();

  if (options?.edit) {
    params.set("edit", branchId);
  }

  const query = params.toString();
  const base = query ? `/admin/branches?${query}` : "/admin/branches";
  return `${base}#branch-${branchId}`;
}

export default async function AdminBranchesPage({
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
  const branches = await listAdminBranches();
  const isDemo = !hasDatabaseUrl();
  const listHref = "/admin/branches";
  const newHref = "/admin/branches?mode=new";

  return (
    <AdminPageShell
      currentPath="/admin/branches"
      title="Şubeler"
      sessionEmail={session.email}
      actions={
        <Link href="/" className="admin-cta-primary whitespace-nowrap">
          Mobil görünüm
        </Link>
      }
    >
      <section className="flex flex-wrap gap-2">
        <span className="admin-chip rounded-full px-4 py-2">{branches.length} şube</span>
      </section>

      <AdminContentModeSwitch
        listHref={listHref}
        newHref={newHref}
        mode={mode}
        listLabel="Şube listesi"
        newLabel="Yeni şube"
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
            <span className="admin-chip rounded-full px-4 py-2">{branches.length}</span>
          </div>
          <div className="mt-4 grid gap-3">
            {branches.map((branch) => (
              <article
                key={branch.id}
                id={`branch-${branch.id}`}
                className="admin-card scroll-mt-28 rounded-[28px] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{branch.name}</h3>
                    <p className="admin-copy mt-2 text-sm">
                      {branch.district} / {branch.city}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="admin-badge rounded-full px-3 py-1 text-xs font-medium">
                      {branch.slug}
                    </span>
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-medium",
                        branch.isActive ? "admin-status-active" : "admin-status-inactive"
                      ].join(" ")}
                    >
                      {branch.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p>{branch.address}</p>
                  <p>Telefon: {branch.phone}</p>
                  <p>WhatsApp: {branch.whatsapp}</p>
                  {branch.reviewUrl ? <p>Google Yorum: Kayıtlı</p> : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={
                      editingId === branch.id
                        ? getBranchHref(branch.id)
                        : getBranchHref(branch.id, { edit: true })
                    }
                    className="admin-cta-secondary whitespace-nowrap"
                  >
                    {editingId === branch.id ? "Düzenlemeyi kapat" : "Düzenle"}
                  </Link>
                  <form action={toggleBranchStatusAction}>
                    <input type="hidden" name="id" value={branch.id} />
                    <button
                      type="submit"
                      disabled={isDemo}
                      className="admin-cta-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {branch.isActive ? "Pasife al" : "Aktifleştir"}
                    </button>
                  </form>
                </div>

                {editingId === branch.id ? (
                  <form action={updateBranchAction} className="mt-4 space-y-3 rounded-[24px] border border-[color:var(--line)] p-4">
                    <input type="hidden" name="id" value={branch.id} />
                    <input type="hidden" name="returnTo" value={getBranchHref(branch.id, { edit: true })} />
                    <input
                      name="name"
                      defaultValue={branch.name}
                      placeholder="Şube adı"
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <input
                      name="slug"
                      defaultValue={branch.slug}
                      placeholder="Slug"
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <input
                      name="address"
                      defaultValue={branch.address}
                      placeholder="Adres"
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="district"
                        defaultValue={branch.district}
                        placeholder="İlçe"
                        className="admin-input rounded-2xl px-4 py-3"
                      />
                      <input
                        name="city"
                        defaultValue={branch.city}
                        placeholder="Şehir"
                        className="admin-input rounded-2xl px-4 py-3"
                      />
                    </div>
                    <input
                      name="phone"
                      defaultValue={branch.phone}
                      placeholder="Telefon"
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <input
                      name="whatsapp"
                      defaultValue={branch.whatsapp}
                      placeholder="WhatsApp"
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <input
                      name="mapUrl"
                      defaultValue={branch.mapUrl}
                      placeholder="Harita linki"
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <input
                      name="reviewUrl"
                      defaultValue={branch.reviewUrl ?? ""}
                      placeholder="Google yorum linki"
                      className="admin-input rounded-2xl px-4 py-3"
                    />
                    <button
                      type="submit"
                      disabled={isDemo}
                      className="admin-cta-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Şubeyi kaydet
                    </button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <form action={createBranchAction} className="admin-panel rounded-[32px] p-4">
          <input type="hidden" name="returnTo" value={newHref} />
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Yeni şube</h2>
          <div className="mt-4 space-y-3">
            <input name="name" placeholder="Şube adı" className="admin-input rounded-2xl px-4 py-3" />
            <input name="slug" placeholder="Slug" className="admin-input rounded-2xl px-4 py-3" />
            <input name="address" placeholder="Adres" className="admin-input rounded-2xl px-4 py-3" />
            <div className="grid grid-cols-2 gap-3">
              <input name="district" placeholder="İlçe" className="admin-input rounded-2xl px-4 py-3" />
              <input name="city" placeholder="Şehir" className="admin-input rounded-2xl px-4 py-3" />
            </div>
            <input name="phone" placeholder="Telefon" className="admin-input rounded-2xl px-4 py-3" />
            <input name="whatsapp" placeholder="WhatsApp" className="admin-input rounded-2xl px-4 py-3" />
            <input name="mapUrl" placeholder="Harita linki" className="admin-input rounded-2xl px-4 py-3" />
            <input
              name="reviewUrl"
              placeholder="Google yorum linki"
              className="admin-input rounded-2xl px-4 py-3"
            />
            <button
              type="submit"
              disabled={isDemo}
              className="admin-cta-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Şube oluştur
            </button>
          </div>
        </form>
      )}
    </AdminPageShell>
  );
}
