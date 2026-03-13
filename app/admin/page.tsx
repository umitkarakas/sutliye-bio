import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { AdminPageShell } from "@/components/admin-page-shell";
import { getDashboardSummary } from "@/lib/server/analytics-data";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const summary = await getDashboardSummary();
  const summaryCards = [
    { label: "Toplam ziyaret", value: String(summary.totalVisits) },
    { label: "En hareketli şube", value: summary.topBranchName },
    { label: "Telefon tıklaması", value: String(summary.callClicks) },
    { label: "Harita tıklaması", value: String(summary.mapClicks) },
    { label: "WhatsApp tıklaması", value: String(summary.whatsappClicks) }
  ];
  const quickActions = [
    { href: "/admin/branding", label: "Marka", tone: "admin-cta-accent" },
    { href: "/admin/pricing", label: "Fiyatlandırma", tone: "admin-cta-accent" },
    { href: "/admin/branches", label: "Şubeler", tone: "admin-cta-secondary" },
    { href: "/admin/products", label: "Ürünler", tone: "admin-cta-secondary" },
    { href: "/admin/categories", label: "Kategoriler", tone: "admin-cta-secondary" }
  ] as const;

  return (
    <AdminPageShell
      currentPath="/admin"
      title="Özet"
      sessionEmail={session.email}
      actions={
        <>
          <Link href="/" className="admin-cta-primary whitespace-nowrap">
            Mobil görünüm
          </Link>
          <form action="/api/admin/auth/logout" method="post">
            <button type="submit" className="admin-cta-secondary whitespace-nowrap">
              Çıkış yap
            </button>
          </form>
        </>
      }
    >
      {summary.isDemo ? (
        <section className="admin-notice rounded-[24px] px-4 py-3 text-sm">
          Analytics demo fallback aktif.
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <article key={card.label} className="admin-panel rounded-[28px] p-4">
            <p className="admin-kicker">{card.label}</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="admin-panel rounded-[32px] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="admin-kicker">Hızlı işlemler</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Devam et</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className={`${action.tone} whitespace-nowrap`}>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </AdminPageShell>
  );
}
