import Link from "next/link";
import type { Branch, MenuCategoryWithItems, PublicBusiness, TabId } from "@/lib/types";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { brandThemeToCssVariables } from "@/lib/brand-theme";

type PublicShellProps = {
  activeBranch: Branch;
  activeTab: TabId;
  basePath: string;
  branches: Branch[];
  business: PublicBusiness;
  menu: MenuCategoryWithItems[];
  rootBranchSlug: string;
};

function ContactIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M7 5.5h10A2.5 2.5 0 0 1 19.5 8v8A2.5 2.5 0 0 1 17 18.5H7A2.5 2.5 0 0 1 4.5 16V8A2.5 2.5 0 0 1 7 5.5Z" />
      <path d="m5.5 8 6.5 5 6.5-5" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 7.5h14" />
      <path d="M5 12h14" />
      <path d="M5 16.5h10" />
    </svg>
  );
}

function getBranchHref(branchSlug: string, rootBranchSlug: string) {
  return branchSlug === rootBranchSlug ? "/" : `/b/${branchSlug}`;
}

function getBranchAvailabilityLabel(hours: string) {
  return hours.toLocaleLowerCase("tr").includes("kapali") ? "Kapali" : "Bugun acik";
}

export function PublicShell({
  activeBranch,
  activeTab,
  basePath,
  branches,
  business,
  menu,
  rootBranchSlug
}: PublicShellProps) {
  const visibleCategories = menu.filter((category) => category.items.length > 0);
  const menuItemCount = visibleCategories.reduce((count, category) => count + category.items.length, 0);
  const availabilityLabel = getBranchAvailabilityLabel(activeBranch.hours);
  const shellStyle = {
    ...brandThemeToCssVariables(business.theme),
    backgroundColor: "color-mix(in srgb, var(--brand-background) 82%, #2a2324 18%)"
  };

  return (
    <main style={shellStyle} className="min-h-screen px-4 py-5 pb-28 text-[15px] text-[color:var(--foreground)] sm:px-6">
      <AnalyticsBeacon branchId={activeBranch.id} activeTab={activeTab} source="public_shell" />
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-md flex-col gap-4">
        <section className="overflow-hidden rounded-[32px] border border-black/6 bg-[rgba(255,250,250,0.72)] shadow-[var(--shadow)]">
          <div className="border-b border-white/6 bg-[#171416] px-5 py-6 text-white">
            <div className="mb-4 inline-flex rounded-full bg-[color:var(--accent)] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white">
              {business.badge}
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-4">
                {business.logoUrl ? (
                  <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white/8 p-2 shadow-[var(--shadow-soft)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={business.logoUrl}
                      alt={`${business.name} logosu`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : null}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">{activeBranch.district}</p>
                  <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-none">
                    {business.name}
                  </h1>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 px-3 py-2 text-right text-xs text-white/78 shadow-[var(--shadow-soft)]">
                <p>{availabilityLabel}</p>
                <p className="mt-1 font-semibold text-white">{activeBranch.hours}</p>
              </div>
            </div>
            <p className="mt-4 max-w-[28ch] text-sm leading-6 text-white/84">{business.tagline}</p>
            <p className="mt-2 text-xs leading-5 text-white/56">{activeBranch.heroNote}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-white/84">
                {branches.length} sube
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-white/84">
                {visibleCategories.length} kategori
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-white/84">
                {menuItemCount} urun
              </span>
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="rounded-[26px] border border-black/6 bg-[rgba(255,255,255,0.82)] p-3 shadow-[var(--shadow-soft)]">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">Şube Seçimi</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {branches.map((branch) => {
                  const href = getBranchHref(branch.slug, rootBranchSlug);
                  const isActive = branch.id === activeBranch.id;

                  return (
                    <Link
                      key={branch.id}
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "inline-flex min-w-fit items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition shadow-[var(--shadow-soft)]",
                        isActive
                          ? "border-[color:var(--accent)] bg-[color:var(--accent)] !text-white"
                          : "border-black/6 bg-white text-[color:var(--foreground)]"
                      ].join(" ")}
                    >
                      {branch.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {activeTab === "contact" ? (
              <section className="space-y-3">
                <article className="rounded-[28px] border border-black/6 bg-[rgba(255,255,255,0.84)] p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Aktif Şube</p>
                      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">{activeBranch.name}</h2>
                    </div>
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-medium",
                        availabilityLabel === "Kapali"
                          ? "bg-[color:var(--danger-soft)] text-[color:var(--danger-strong)]"
                          : "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"
                      ].join(" ")}
                    >
                      {availabilityLabel}
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

                <section className="rounded-[28px] border border-black/6 bg-[rgba(255,255,255,0.7)] p-4 shadow-[var(--shadow-soft)]">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Diğer Şubeler</h3>
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Hızlı Geçiş</p>
                  </div>
                  <div className="space-y-3">
                    {branches
                      .filter((branch) => branch.id !== activeBranch.id)
                      .map((branch) => {
                        const href = getBranchHref(branch.slug, rootBranchSlug);

                        return (
                          <Link
                            key={branch.id}
                            href={href}
                            aria-label={`${branch.name} subesini ac`}
                            className="flex items-center justify-between rounded-[22px] border border-black/6 bg-white px-4 py-3"
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
                <div className="rounded-[26px] border border-black/6 bg-[rgba(255,255,255,0.78)] p-3 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">
                        Menu ozeti
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        {activeBranch.name} icin {menuItemCount} urun gosteriliyor.
                      </p>
                    </div>
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium text-[color:var(--accent-strong)]">
                      {visibleCategories.length} kategori
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {visibleCategories.map((category) => (
                    <a
                      key={category.id}
                      href={`#${category.slug}`}
                      className="rounded-full border border-black/6 bg-white px-4 py-2 text-sm font-medium text-[color:var(--foreground)]"
                    >
                      {category.name} ({category.items.length})
                    </a>
                  ))}
                </div>

                {visibleCategories.length === 0 ? (
                  <section className="rounded-[28px] border border-black/6 bg-[rgba(255,255,255,0.84)] p-5 text-sm text-[color:var(--muted)] shadow-[var(--shadow-soft)]">
                    Bu sube icin gosterilecek aktif menu kaydi bulunamadi.
                  </section>
                ) : null}

                {visibleCategories.map((category) => (
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
                        className="rounded-[28px] border border-black/6 bg-[rgba(255,255,255,0.84)] p-4 shadow-[var(--shadow-soft)]"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex flex-1 gap-4">
                            {item.imageUrl ? (
                              <div className="h-24 w-full overflow-hidden rounded-[22px] border border-black/6 bg-white sm:w-28 sm:flex-none">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : null}
                            <div className="flex flex-wrap items-center gap-2">
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
                            </div>
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

        <div className="sticky bottom-3 z-10">
          <nav className="rounded-[32px] border border-white/24 bg-[color:var(--accent)] p-2 shadow-[0_20px_50px_rgba(122,8,18,0.28)]">
            <div className="grid grid-cols-2 gap-2 rounded-[26px] bg-black/8 p-1">
              <Link
                href={basePath}
                aria-current={activeTab === "contact" ? "page" : undefined}
                className={[
                  "inline-flex min-h-[3.75rem] items-center justify-center rounded-[22px] px-4 py-3 text-center text-sm font-semibold transition",
                  activeTab === "contact"
                    ? "bg-white !text-[color:var(--accent)] shadow-[0_10px_26px_rgba(96,8,16,0.22)]"
                    : "text-white/84"
                ].join(" ")}
              >
                <span className="flex items-center gap-2.5">
                  <ContactIcon className="h-[1.05rem] w-[1.05rem] flex-none" />
                  <span className="tracking-[0.01em]">İletişim</span>
                </span>
              </Link>
              <Link
                href={`${basePath}?tab=menu`}
                aria-current={activeTab === "menu" ? "page" : undefined}
                className={[
                  "inline-flex min-h-[3.75rem] items-center justify-center rounded-[22px] px-4 py-3 text-center text-sm font-semibold transition",
                  activeTab === "menu"
                    ? "bg-white !text-[color:var(--accent)] shadow-[0_10px_26px_rgba(96,8,16,0.22)]"
                    : "text-white/84"
                ].join(" ")}
              >
                <span className="flex items-center gap-2.5">
                  <MenuIcon className="h-[1.05rem] w-[1.05rem] flex-none" />
                  <span className="tracking-[0.01em]">Menü</span>
                </span>
              </Link>
            </div>
          </nav>
        </div>

        <div className="h-2" />

        <div className="pb-2">
          <div className="mx-auto h-1.5 w-24 rounded-full bg-[rgba(42,26,18,0.14)]" />
        </div>

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
