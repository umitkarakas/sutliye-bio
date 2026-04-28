import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminPageShell } from "@/components/admin-page-shell";
import { DateFilterBar } from "@/components/date-filter-bar";
import { getFeedbacks, getFeedbackStats, updateFeedbackStatus, type FeedbackStatus } from "@/lib/server/feedback-data";
import { parseFilterDates } from "@/lib/admin-date-filter";

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "Yeni",
  reviewed: "İncelendi",
  archived: "Arşiv"
};

const STATUS_NEXT: Record<FeedbackStatus, FeedbackStatus> = {
  new: "reviewed",
  reviewed: "archived",
  archived: "new"
};

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  reviewed: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500"
};

function StarRating({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  return (
    <span className="text-sm" aria-label={`${rating} yıldız`}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function sourceLabel(source: string) {
  if (source === "qr_table") return "QR Masa";
  if (source === "public") return "Genel";
  return source;
}

type PageProps = {
  searchParams?: Promise<{ from?: string; to?: string; days?: string }>;
};

export default async function AdminFeedbackPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const resolved = (await searchParams) ?? {};
  const { from, to } = parseFilterDates(resolved);

  const [feedbacks, stats] = await Promise.all([
    getFeedbacks(from, to),
    getFeedbackStats()
  ]);

  async function handleStatusChange(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as FeedbackStatus;
    if (id && status) {
      await updateFeedbackStatus(id, status);
    }
    redirect("/admin/feedback");
  }

  return (
    <AdminPageShell currentPath="/admin/feedback" title="Geri Bildirimler" sessionEmail={session.email}>

      {/* İstatistik kartları */}
      <section className="grid grid-cols-3 gap-3">
        <div className="admin-card rounded-[24px] p-4">
          <p className="admin-copy text-xs uppercase tracking-widest">Toplam</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{stats.total}</p>
        </div>
        <div className="admin-card rounded-[24px] p-4">
          <p className="admin-copy text-xs uppercase tracking-widest">Bu Hafta</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{stats.thisWeek}</p>
        </div>
        <div className="admin-card rounded-[24px] p-4">
          <p className="admin-copy text-xs uppercase tracking-widest">Ort. Puan</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">
            {stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
          </p>
        </div>
      </section>

      {/* Dönem filtresi */}
      <DateFilterBar from={from} to={to} basePath="/admin/feedback" />

      {/* Yorum listesi */}
      {feedbacks.length === 0 ? (
        <section className="admin-panel rounded-[24px] px-4 py-8 text-center text-sm text-[color:var(--muted)]">
          Bu dönemde henüz geri bildirim yok.
        </section>
      ) : (
        <section className="space-y-3">
          {feedbacks.map((fb) => (
            <article key={fb.id} className="admin-panel rounded-[24px] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {fb.branchName ? (
                    <span className="font-semibold">{fb.branchName}</span>
                  ) : null}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[fb.status]}`}>
                    {STATUS_LABELS[fb.status]}
                  </span>
                  <span className="admin-chip rounded-full px-2 py-0.5 text-xs">
                    {sourceLabel(fb.source)}
                  </span>
                  {fb.tableId && (
                    <span className="admin-chip rounded-full px-2 py-0.5 text-xs">
                      {fb.tableId.replace(/^m(\d+)$/, "Masa $1")}
                    </span>
                  )}
                  {fb.rating ? <StarRating rating={fb.rating} /> : null}
                </div>
                <span className="admin-copy text-xs">{fb.createdAt}</span>
              </div>

              <p className="mt-2 text-sm leading-relaxed">{fb.message}</p>

              {fb.contactName || fb.contactPhone ? (
                <p className="admin-copy mt-1.5 text-xs">
                  {fb.contactName}{fb.contactName && fb.contactPhone ? " · " : ""}{fb.contactPhone}
                </p>
              ) : null}

              <form action={handleStatusChange} className="mt-3">
                <input type="hidden" name="id" value={fb.id} />
                <input type="hidden" name="status" value={STATUS_NEXT[fb.status]} />
                <button type="submit" className="admin-cta-secondary text-xs">
                  → {STATUS_LABELS[STATUS_NEXT[fb.status]]}
                </button>
              </form>
            </article>
          ))}
        </section>
      )}
    </AdminPageShell>
  );
}
