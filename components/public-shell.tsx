import Link from "next/link";
import { business } from "@/lib/demo-data";
import type { Branch, MenuCategoryWithItems, TabId } from "@/lib/types";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { EventLink } from "@/components/event-link";

type PublicShellProps = {
  activeBranch: Branch;
  activeTab: TabId;
  basePath: string;
  branches: Branch[];
  menu: MenuCategoryWithItems[];
};

function formatPhoneHref(phone: string) {
  return `tel:${phone.replaceAll(" ", "")}`;
}

function formatWhatsAppHref(phone: string) {
  return `https://wa.me/${phone.replaceAll(" ", "").replaceAll("+", "")}`;
}

export function PublicShell({ activeBranch, activeTab, basePath, branches, menu }: PublicShellProps) {
  return (
    <main className="min-h-screen px-4 py-5 text-[15px] text-[color:var(--foreground)] sm:px-6">
      <AnalyticsBeacon branchId={activeBranch.id} activeTab={activeTab} source="public_shell" />
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-md flex-col gap-4">
        <section className="overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[color:var(--card)] shadow-[var(--shadow)] backdrop-blur">
          <div className="border-b border-[color:var(--line)] bg-[linear-gradient(135deg,var(--hero-start),var(--hero-end))] px-5 py-6 text-white">
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-[color:var(--hero-glow)] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/88">
              {business.badge}
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">{activeBranch.district}</p>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-none">
                  {business.name}
                </h1>
              </div>
              <div className="rounded-[24px] border border-white/15 bg-black/10 px-3 py-2 text-right text-xs text-white/80 shadow-[var(--shadow-soft)]">
                <p>Bugün</p>
                <p className="mt-1 font-semibold text-white">{activeBranch.hours}</p>
              </div>
            </div>
            <p className="mt-4 max-w-[28ch] text-sm leading-6 text-white/84">{business.tagline}</p>
            <p className="mt-2 text-xs leading-5 text-white/68">{activeBranch.heroNote}</p>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="rounded-[26px] border border-[color:var(--line)] bg-[color:var(--card-strong)] p-3 shadow-[var(--shadow-soft)]">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">Şube Seçimi</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {branches.map((branch) => {
                  const href = branch.slug === "kadikoy" ? "/" : `/b/${branch.slug}`;
                  const isActive = branch.id === activeBranch.id;

                  return (
                    <Link
                      key={branch.id}
                      href={href}
                      className={[
                        "inline-flex min-w-fit items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition shadow-[var(--shadow-soft)]",
                        isActive
                          ? "border-[color:var(--accent)] bg-[color:var(--accent)] !text-white"
                          : "border-[color:var(--line-strong)] bg-[color:var(--card-muted)] text-[color:var(--foreground)]"
                      ].join(" ")}
                    >
                      {branch.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-2 rounded-[26px] bg-[color:var(--accent-soft)] p-1 shadow-[var(--shadow-soft)]">
              <Link
                href={basePath}
                className={[
                  "inline-flex min-h-14 items-center justify-center rounded-[22px] px-4 py-3 text-center text-sm font-semibold transition",
                  activeTab === "contact"
                    ? "bg-[color:var(--foreground)] !text-white shadow-[var(--shadow-soft)]"
                    : "text-[color:var(--foreground)]"
                ].join(" ")}
              >
                İletişim
              </Link>
              <Link
                href={`${basePath}?tab=menu`}
                className={[
                  "inline-flex min-h-14 items-center justify-center rounded-[22px] px-4 py-3 text-center text-sm font-semibold transition",
                  activeTab === "menu"
                    ? "bg-[color:var(--foreground)] !text-white shadow-[var(--shadow-soft)]"
                    : "text-[color:var(--foreground)]"
                ].join(" ")}
              >
                Menü
              </Link>
            </nav>

            {activeTab === "contact" ? (
              <section className="space-y-3">
                <article className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--card-strong)] p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Aktif Şube</p>
                      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">{activeBranch.name}</h2>
                    </div>
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium text-[color:var(--accent-strong)]">
                      Açık
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{activeBranch.blurb}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>{activeBranch.address}</p>
                    <p>
                      {activeBranch.district} / {activeBranch.city}
                    </p>
                    <p className="font-medium">Çalışma Saatleri: {activeBranch.hours}</p>
                  </div>
                </article>

                <div className="grid grid-cols-3 gap-2">
                  <EventLink
                    eventName="call_click"
                    branchId={activeBranch.id}
                    source="public_shell"
                    href={formatPhoneHref(activeBranch.phone)}
                    className="inline-flex min-h-14 items-center justify-center rounded-[22px] bg-[color:var(--foreground)] px-3 py-4 text-center text-sm font-semibold !text-white shadow-[var(--shadow-soft)]"
                  >
                    Ara
                  </EventLink>
                  <EventLink
                    eventName="whatsapp_click"
                    branchId={activeBranch.id}
                    source="public_shell"
                    href={formatWhatsAppHref(activeBranch.whatsapp)}
                    className="inline-flex min-h-14 items-center justify-center rounded-[22px] bg-[color:var(--olive)] px-3 py-4 text-center text-sm font-semibold !text-white shadow-[var(--shadow-soft)]"
                  >
                    WhatsApp
                  </EventLink>
                  <EventLink
                    eventName="map_click"
                    branchId={activeBranch.id}
                    source="public_shell"
                    href={activeBranch.mapUrl}
                    className="inline-flex min-h-14 items-center justify-center rounded-[22px] bg-[color:var(--accent)] px-3 py-4 text-center text-sm font-semibold !text-white shadow-[var(--shadow-soft)]"
                  >
                    Harita
                  </EventLink>
                </div>

                <section className="rounded-[28px] border border-[color:var(--line)] bg-[rgba(255,255,255,0.54)] p-4 shadow-[var(--shadow-soft)]">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Diğer Şubeler</h3>
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Hızlı Geçiş</p>
                  </div>
                  <div className="space-y-3">
                    {branches
                      .filter((branch) => branch.id !== activeBranch.id)
                      .map((branch) => {
                        const href = branch.slug === "kadikoy" ? "/" : `/b/${branch.slug}`;

                        return (
                          <Link
                            key={branch.id}
                            href={href}
                            className="flex items-center justify-between rounded-[22px] border border-[color:var(--line)] bg-white/90 px-4 py-3"
                          >
                            <div>
                              <p className="font-medium">{branch.name}</p>
                              <p className="text-sm text-[color:var(--muted)]">{branch.address}</p>
                            </div>
                            <span className="text-sm text-[color:var(--accent-strong)]">Aç</span>
                          </Link>
                        );
                      })}
                  </div>
                </section>
              </section>
            ) : (
              <section className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {menu.map((category) => (
                    <a
                      key={category.id}
                      href={`#${category.slug}`}
                      className="rounded-full border border-[color:var(--line-strong)] bg-[color:var(--card-muted)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)]"
                    >
                      {category.name}
                    </a>
                  ))}
                </div>

                {menu.map((category) => (
                  <section key={category.id} id={category.slug} className="space-y-3">
                    <div className="flex items-end justify-between">
                      <h2 className="font-[family-name:var(--font-display)] text-2xl">{category.name}</h2>
                      <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                        {activeBranch.name}
                      </span>
                    </div>

                    {category.items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--card-strong)] p-4 shadow-[var(--shadow-soft)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">{item.name}</h3>
                              {item.featured || item.badge ? (
                                <span className="rounded-full bg-[color:var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--accent-strong)]">
                                  {item.badge ?? "Öne çıkan"}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
                          </div>
                          <div className="text-right">
                            {item.stockStatus === "in_stock" ? (
                              <>
                                <p className="font-[family-name:var(--font-display)] text-2xl">{item.price} TL</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[color:var(--olive)]">
                                  Hazır
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-[family-name:var(--font-display)] text-xl text-[color:var(--muted)]">
                                  Tükendi
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">
                                  Stokta Yok
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </section>
                ))}
              </section>
            )}
          </div>
        </section>

        <Link
          href="/admin"
          className="self-center rounded-full border border-[color:var(--line)] bg-white/70 px-4 py-2 text-sm text-[color:var(--muted)]"
        >
          Admin demo ekranına git
        </Link>
      </div>
    </main>
  );
}
