import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { getDashboardSummary } from "@/lib/server/analytics-data";

const matrixRows = [
  { name: "Adana Kebap", kadikoy: "320 TL", besiktas: "340 TL", uskudar: "330 TL" },
  { name: "Urfa Kebap", kadikoy: "305 TL", besiktas: "320 TL", uskudar: "315 TL" },
  { name: "Ayran", kadikoy: "55 TL", besiktas: "60 TL", uskudar: "58 TL" }
];

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

  return (
    <main className="min-h-screen px-4 py-6 text-[color:var(--foreground)] sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <section className="admin-shell rounded-[32px] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="admin-kicker">Yönetim paneli</p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">Operasyon Özeti</h1>
              <p className="admin-copy mt-3 max-w-2xl text-sm leading-6">
                Şube bazlı fiyat, stok ve trafik verisini aynı akış içinde takip etmek için ana kontrol yüzeyi.
              </p>
              <p className="admin-kicker mt-3">
                Oturum: {session.email}
              </p>
              {summary.isDemo ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">
                  Analytics demo fallback aktif
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminNav currentPath="/admin" />
              <Link href="/admin/pricing" className="admin-cta-accent whitespace-nowrap">
                Fiyat matrisini aç
              </Link>
              <Link href="/" className="admin-cta-primary whitespace-nowrap">
                Mobil ekranı aç
              </Link>
              <form action="/api/admin/auth/logout" method="post">
                <button type="submit" className="admin-cta-secondary whitespace-nowrap">
                  Çıkış yap
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <article key={card.label} className="admin-panel rounded-[28px] p-4">
              <p className="admin-kicker">{card.label}</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-3xl">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="admin-panel rounded-[32px] p-4">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="admin-chip rounded-full px-4 py-2">Kategori: Kebap</span>
              <span className="admin-chip rounded-full px-4 py-2">Şubeler: 3 seçili</span>
              <span className="admin-chip rounded-full px-4 py-2">Arama: aktif değil</span>
            </div>
            <Link href="/admin/pricing" className="admin-cta-accent whitespace-nowrap">
              Fiyat ekranına git
            </Link>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-[color:var(--line)]">
            <div className="grid grid-cols-[1.3fr_repeat(3,1fr)] bg-[color:var(--foreground)] px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/78">
              <span>Ürün</span>
              <span>Kadıköy</span>
              <span>Beşiktaş</span>
              <span>Üsküdar</span>
            </div>
            {matrixRows.map((row, index) => (
              <div
                key={row.name}
                className={[
                  "grid grid-cols-[1.3fr_repeat(3,1fr)] gap-2 px-4 py-4 text-sm",
                  index % 2 === 0 ? "bg-[color:var(--card-strong)]" : "bg-[rgba(239,228,212,0.44)]"
                ].join(" ")}
              >
                <div className="font-semibold">{row.name}</div>
                <div className="admin-card rounded-2xl px-3 py-2">{row.kadikoy}</div>
                <div className="admin-card rounded-2xl px-3 py-2">{row.besiktas}</div>
                <div className="admin-card rounded-2xl px-3 py-2">{row.uskudar}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
