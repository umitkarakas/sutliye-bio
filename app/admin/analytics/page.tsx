import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminPageShell } from "@/components/admin-page-shell";
import { DateFilterBar } from "@/components/date-filter-bar";
import {
  getAnalyticsOverview,
  getEventsByDay,
  getTopBranches,
  getTopReferrers,
  getTopProducts,
  getRecentEvents,
  getBranchInteractions,
  getEventTypeTotals,
  getHourlyDistribution,
  getWeekdayDistribution,
  getTableTrafficByBranch,
  getChannelBreakdown
} from "@/lib/server/analytics-data";
import { getFeedbacks } from "@/lib/server/feedback-data";
import { CHANNEL_LABELS } from "@/lib/channel";
import { parseFilterDates } from "@/lib/admin-date-filter";

type SearchParams = Promise<{ from?: string | string[]; to?: string | string[]; days?: string | string[] }>;

const EVENT_LABELS: Record<string, string> = {
  page_view: "Sayfa görüntüleme",
  branch_view: "Şube görüntüleme",
  tab_view: "Sekme görüntüleme",
  call_click: "Telefon",
  whatsapp_click: "WhatsApp",
  map_click: "Harita",
  menu_item_view: "Ürün tıklaması",
  feedback_submit: "Geri bildirim"
};

const DOW_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function eventLabel(name: string) {
  return EVENT_LABELS[name] ?? name;
}

function BarRow({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex justify-between text-sm">
          <span className="truncate font-medium">{label}</span>
          <span className="admin-copy ml-2 shrink-0">{value.toLocaleString("tr-TR")}{suffix}</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--line)]">
          <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams?: SearchParams }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const resolved = (await searchParams) ?? {};
  const { from, to } = parseFilterDates(resolved);

  const [
    overview,
    byDay,
    topBranches,
    topReferrers,
    topProducts,
    recentEvents,
    branchInteractions,
    eventTypeTotals,
    hourlyDist,
    weekdayDist,
    tableTraffic,
    channelBreakdown,
    recentFeedbacks
  ] = await Promise.all([
    getAnalyticsOverview(from, to),
    getEventsByDay(from, to),
    getTopBranches(from, to),
    getTopReferrers(from, to),
    getTopProducts(from, to),
    getRecentEvents(25),
    getBranchInteractions(from, to),
    getEventTypeTotals(from, to),
    getHourlyDistribution(from, to),
    getWeekdayDistribution(from, to),
    getTableTrafficByBranch(from, to),
    getChannelBreakdown(from, to),
    getFeedbacks(from, to)
  ]);

  const maxDayCount = Math.max(...byDay.map((d) => d.count), 1);
  const maxHour = Math.max(...hourlyDist.map((h) => h.count), 1);
  const maxWeekday = Math.max(...weekdayDist.map((d) => d.count), 1);

  return (
    <AdminPageShell currentPath="/admin/analytics" title="Analytics" sessionEmail={session.email}>

      {/* Period tabs */}
      <DateFilterBar from={from} to={to} basePath="/admin/analytics" />

      {overview.isDemo && (
        <section className="admin-notice rounded-[24px] px-4 py-3 text-sm">
          Demo verileri gösteriliyor. Gerçek veriler için <code>DATABASE_URL</code> gerekir.
        </section>
      )}

      {/* Overview cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="admin-card rounded-[24px] p-4">
          <p className="admin-copy text-xs uppercase tracking-widest">Ziyaret</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{overview.totalVisits.toLocaleString("tr-TR")}</p>
        </div>
        <div className="admin-card rounded-[24px] p-4">
          <p className="admin-copy text-xs uppercase tracking-widest">Tekil Oturum</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{overview.uniqueSessions.toLocaleString("tr-TR")}</p>
        </div>
        <div className="admin-card rounded-[24px] p-4">
          <p className="admin-copy text-xs uppercase tracking-widest">Ürün Tıklaması</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{overview.menuItemViews.toLocaleString("tr-TR")}</p>
        </div>
        <div className="admin-card rounded-[24px] p-4">
          <p className="admin-copy text-xs uppercase tracking-widest">Telefon</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{overview.callClicks.toLocaleString("tr-TR")}</p>
        </div>
        <div className="admin-card rounded-[24px] p-4">
          <p className="admin-copy text-xs uppercase tracking-widest">WhatsApp</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{overview.whatsappClicks.toLocaleString("tr-TR")}</p>
        </div>
        <div className="admin-card rounded-[24px] p-4">
          <p className="admin-copy text-xs uppercase tracking-widest">Harita</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{overview.mapClicks.toLocaleString("tr-TR")}</p>
        </div>
      </section>

      {/* Trafik Kaynakları — channel breakdown */}
      {channelBreakdown.length > 0 && (
        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Trafik Kaynakları</h2>
          <p className="admin-copy mt-0.5 text-xs">Ziyaretçilerin nereden geldiği (Türkiye saati)</p>
          <div className="mt-4 space-y-3">
            {channelBreakdown.map((c) => (
              <div key={c.channel} className="flex items-center gap-3">
                <span className="w-[130px] shrink-0 text-sm font-medium">
                  {CHANNEL_LABELS[c.channel as keyof typeof CHANNEL_LABELS] ?? c.channel}
                </span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-[color:var(--line)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--accent)]"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className="admin-copy w-32 shrink-0 text-right text-xs">
                  {c.visits.toLocaleString("tr-TR")} ziyaret · %{c.pct}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily chart */}
      {byDay.length > 0 && (
        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Günlük Ziyaret</h2>
          <p className="admin-copy mt-0.5 text-xs">Türkiye saatine göre</p>
          <div className="mt-4 flex h-28 items-end gap-[3px]">
            {byDay.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count}`}
                className="flex-1 rounded-t-sm bg-[color:var(--accent)] opacity-80 transition-opacity hover:opacity-100"
                style={{ height: `${Math.round((d.count / maxDayCount) * 100)}%`, minHeight: "3px" }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-[color:var(--muted)]">
            <span>{byDay[0]?.date}</span>
            <span>{byDay[byDay.length - 1]?.date}</span>
          </div>
        </section>
      )}

      {/* Hourly + Weekday */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Saatlik Dağılım</h2>
          <p className="admin-copy mt-0.5 text-xs">Türkiye saatine göre</p>
          <div className="mt-4 flex h-20 items-end gap-[2px]">
            {hourlyDist.map((h) => (
              <div
                key={h.hour}
                title={`${h.hour}:00 — ${h.count} ziyaret`}
                className="flex-1 rounded-t-[2px] bg-[color:var(--accent)] opacity-75 transition-opacity hover:opacity-100"
                style={{ height: `${Math.round((h.count / maxHour) * 100)}%`, minHeight: h.count > 0 ? "3px" : "0" }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-[color:var(--muted)]">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
          </div>
        </section>

        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Haftanın Günleri</h2>
          <p className="admin-copy mt-0.5 text-xs">Türkiye saatine göre</p>
          <div className="mt-4 flex h-20 items-end gap-[4px]">
            {weekdayDist.map((d) => (
              <div key={d.dow} className="flex flex-1 flex-col items-center gap-1">
                <div
                  title={`${DOW_LABELS[d.dow]} — ${d.count} ziyaret`}
                  className="w-full rounded-t-[2px] bg-[color:var(--accent)] opacity-75 transition-opacity hover:opacity-100"
                  style={{ height: `${Math.round((d.count / maxWeekday) * 100)}%`, minHeight: d.count > 0 ? "3px" : "0" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-[color:var(--muted)]">
            {weekdayDist.map((d) => (
              <span key={d.dow} className="flex-1 text-center">{DOW_LABELS[d.dow]}</span>
            ))}
          </div>
        </section>
      </div>

      {/* Branch interactions matrix */}
      {branchInteractions.length > 0 && (
        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Şube Bazlı Etkileşim</h2>
          <p className="admin-copy mt-0.5 text-xs">Her şubenin etkileşim dağılımı</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--muted)]">
                  <th className="pb-2 pr-4 font-medium">Şube</th>
                  <th className="pb-2 pr-3 text-right font-medium">Ziyaret</th>
                  <th className="pb-2 pr-3 text-right font-medium">WA</th>
                  <th className="pb-2 pr-3 text-right font-medium">Tel</th>
                  <th className="pb-2 pr-3 text-right font-medium">Harita</th>
                  <th className="pb-2 text-right font-medium">Ürün</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)]">
                {branchInteractions.map((b) => (
                  <tr key={b.branchId}>
                    <td className="py-2 pr-4 font-medium">{b.branchName}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{b.pageViews.toLocaleString("tr-TR")}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[color:var(--accent)]">{b.whatsappClicks}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{b.callClicks}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{b.mapClicks}</td>
                    <td className="py-2 text-right tabular-nums">{b.menuItemViews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Masa Trafiği */}
      {tableTraffic.length > 0 && (
        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Masa Trafiği</h2>
          <p className="admin-copy mt-0.5 text-xs">QR kod ile açılan masa oturumları — en yoğun masalar üstte</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--line)] text-left">
                  <th className="admin-copy pb-2 pr-4 text-xs font-medium uppercase tracking-wider">Şube</th>
                  <th className="admin-copy pb-2 pr-4 text-xs font-medium uppercase tracking-wider">Masa</th>
                  <th className="admin-copy pb-2 pr-4 text-right text-xs font-medium uppercase tracking-wider">Ziyaret</th>
                  <th className="admin-copy pb-2 pr-4 text-right text-xs font-medium uppercase tracking-wider">Oturum</th>
                  <th className="admin-copy pb-2 text-right text-xs font-medium uppercase tracking-wider">Geri Bildirim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)]">
                {tableTraffic.map((row) => (
                  <tr key={`${row.branchName}-${row.tableId}`}>
                    <td className="py-2 pr-4 font-medium">{row.branchName}</td>
                    <td className="py-2 pr-4">
                      <span className="admin-chip rounded-full px-2 py-0.5 text-xs">
                        {row.tableId.replace(/^m(\d+)$/, "Masa $1")}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">{row.pageViews.toLocaleString("tr-TR")}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{row.sessions.toLocaleString("tr-TR")}</td>
                    <td className="py-2 text-right tabular-nums">{row.feedbackCount.toLocaleString("tr-TR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Event type totals */}
      {eventTypeTotals.length > 0 && (
        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Etkileşim Dağılımı</h2>
          <p className="admin-copy mt-0.5 text-xs">Tüm event tiplerinin kümülatif dağılımı</p>
          <div className="mt-4 space-y-2">
            {eventTypeTotals.map((e) => (
              <BarRow
                key={e.eventName}
                label={eventLabel(e.eventName)}
                value={e.count}
                max={eventTypeTotals[0]?.count ?? 1}
                suffix={` (%${e.pct})`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Two-column: branches + referrers */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Şube Dağılımı</h2>
          {topBranches.length === 0 ? (
            <p className="admin-copy mt-3 text-sm">Henüz veri yok.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {topBranches.map((b) => (
                <BarRow key={b.name} label={b.name} value={b.views} max={topBranches[0]?.views ?? 1} />
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">Ham Kaynak</h2>
          <p className="admin-copy mt-0.5 text-xs">Referrer adresleri</p>
          {topReferrers.length === 0 ? (
            <p className="admin-copy mt-3 text-sm">Henüz veri yok.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {topReferrers.map((r) => (
                <BarRow
                  key={r.referrer}
                  label={r.referrer === "direct" ? "Direkt" : r.referrer}
                  value={r.count}
                  max={topReferrers[0]?.count ?? 1}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Top products */}
      {topProducts.length > 0 && (
        <section className="admin-panel rounded-[32px] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl">En Çok Görüntülenen Ürünler</h2>
          <div className="mt-3 space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 text-sm">
                <span className="admin-copy w-5 shrink-0 text-center font-medium">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                <span className="admin-badge shrink-0 rounded-full px-3 py-0.5 text-xs">{p.views} tıklama</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent events */}
      <section className="admin-panel rounded-[32px] p-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Son Aktiviteler</h2>
        {recentEvents.length === 0 ? (
          <p className="admin-copy mt-3 text-sm">Henüz kayıt yok.</p>
        ) : (
          <div className="mt-3 divide-y divide-[color:var(--line)]">
            {recentEvents.map((e) => (
              <div key={e.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-0.5 py-2 text-sm">
                <div className="min-w-0">
                  <span className="font-medium">{eventLabel(e.eventName)}</span>
                  {e.branchName && <span className="admin-copy"> · {e.branchName}</span>}
                  {e.tableId && (
                    <span className="admin-chip ml-1 rounded-full px-1.5 py-0.5 text-[10px]">
                      {e.tableId.replace(/^m(\d+)$/, "M$1")}
                    </span>
                  )}
                  {e.channel && e.channel !== "direct" && (
                    <span className="admin-copy text-xs"> · {CHANNEL_LABELS[e.channel as keyof typeof CHANNEL_LABELS] ?? e.channel}</span>
                  )}
                  {e.productName && <span className="admin-copy"> · {e.productName}</span>}
                </div>
                <span className="admin-copy shrink-0 text-xs">{e.createdAt}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Son Geri Bildirimler */}
      {recentFeedbacks.length > 0 && (
        <section className="admin-panel rounded-[32px] p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl">Son Geri Bildirimler</h2>
            <Link href="/admin/feedback" className="admin-copy text-xs underline underline-offset-2">
              Tümünü gör →
            </Link>
          </div>
          <p className="admin-copy mt-0.5 text-xs">Son 30 gün · Türkiye saatine göre</p>
          <div className="mt-3 divide-y divide-[color:var(--line)]">
            {recentFeedbacks.slice(0, 8).map((fb) => (
              <div key={fb.id} className="flex flex-wrap items-start justify-between gap-2 py-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {fb.branchName && <span className="font-medium">{fb.branchName}</span>}
                    {fb.tableId && (
                      <span className="admin-chip rounded-full px-2 py-0.5 text-xs">
                        {fb.tableId.replace(/^m(\d+)$/, "Masa $1")}
                      </span>
                    )}
                    {fb.rating != null && (
                      <span className="text-xs text-[color:var(--accent)]">
                        {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--muted)]">{fb.message}</p>
                </div>
                <span className="admin-copy shrink-0 text-xs">{fb.createdAt}</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </AdminPageShell>
  );
}
