import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/prisma";
import { listAdminBranches } from "@/lib/server/admin-data";
import { AdminNav } from "@/components/admin-nav";
import { createBranchAction, toggleBranchStatusAction } from "../actions";

type SearchParams = Promise<{
  status?: string | string[];
}>;

function asSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getMessage(status: string) {
  switch (status) {
    case "created":
      return "Yeni şube kaydı oluşturuldu.";
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

export default async function AdminBranchesPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const status = asSingle((await searchParams)?.status);
  const branches = await listAdminBranches();
  const isDemo = !hasDatabaseUrl();

  return (
    <main className="min-h-screen px-4 py-6 text-[color:var(--foreground)] sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="admin-shell rounded-[32px] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="admin-kicker">Admin şubeleri</p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">Şube Yönetimi</h1>
              <p className="admin-copy mt-3 max-w-2xl text-sm leading-6">
                Şube bilgileri, iletişim alanları ve görünürlük durumu bu ekrandan yönetilir.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminNav currentPath="/admin/branches" />
              <Link href="/" className="admin-cta-primary whitespace-nowrap">
                Mobil görünüm
              </Link>
            </div>
          </div>
        </section>

        {isDemo ? (
          <section className="admin-notice rounded-[24px] px-4 py-3 text-sm">
            Demo fallback aktif. Şube listesi görünür, ama yeni kayıt eklemek için `DATABASE_URL` gerekir.
          </section>
        ) : null}

        {getMessage(status) ? (
          <section className="admin-feedback rounded-[24px] px-4 py-3 text-sm">
            {getMessage(status)}
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="admin-panel rounded-[32px] p-4">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Mevcut Şubeler</h2>
            <div className="mt-4 grid gap-3">
              {branches.map((branch) => (
                <article key={branch.id} className="admin-card rounded-[28px] p-4">
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
                  </div>
                  <form action={toggleBranchStatusAction} className="mt-4">
                    <input type="hidden" name="id" value={branch.id} />
                    <button
                      type="submit"
                      disabled={isDemo}
                      className="admin-cta-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {branch.isActive ? "Pasife al" : "Aktifleştir"}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </div>

          <form
            action={createBranchAction}
            className="admin-panel rounded-[32px] p-4"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Yeni Şube Ekle</h2>
            <p className="admin-copy mt-2 text-sm leading-6">
              Kayıt oluşunca aktif ürünler için bu şubeye otomatik gizli `branch_product` kayıtları açılır.
            </p>
            <div className="mt-4 space-y-3">
              <input name="name" placeholder="Şube adı" className="admin-input rounded-2xl px-4 py-3" />
              <input name="slug" placeholder="slug" className="admin-input rounded-2xl px-4 py-3" />
              <input name="address" placeholder="Adres" className="admin-input rounded-2xl px-4 py-3" />
              <div className="grid grid-cols-2 gap-3">
                <input name="district" placeholder="İlçe" className="admin-input rounded-2xl px-4 py-3" />
                <input name="city" placeholder="Şehir" className="admin-input rounded-2xl px-4 py-3" />
              </div>
              <input name="phone" placeholder="Telefon" className="admin-input rounded-2xl px-4 py-3" />
              <input name="whatsapp" placeholder="WhatsApp" className="admin-input rounded-2xl px-4 py-3" />
              <input name="mapUrl" placeholder="Harita linki" className="admin-input rounded-2xl px-4 py-3" />
              <button
                type="submit"
                disabled={isDemo}
                className="admin-cta-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                Şube oluştur
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
