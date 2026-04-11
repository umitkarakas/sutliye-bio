import Link from "next/link";
import type { Branch, MenuCategoryWithItems, PublicBusiness, TabId } from "@/lib/types";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { EventLink } from "@/components/event-link";
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
      strokeWidth="2.15"
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
      strokeWidth="2.15"
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

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 21s-5.5-5.3-5.5-10A5.5 5.5 0 0 1 12 5.5 5.5 5.5 0 0 1 17.5 11c0 4.7-5.5 10-5.5 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 11.5A8.5 8.5 0 0 1 7.4 19l-3.4 1 1.1-3.2A8.5 8.5 0 1 1 20 11.5Z" />
      <path d="M9.3 9.2c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.5l.4 1.1c.1.3.1.5-.1.7l-.5.6c-.1.1-.2.3 0 .6.4.7 1 1.4 1.8 1.8.3.2.5.1.6 0l.6-.5c.2-.2.4-.2.7-.1l1.1.4c.5.2.5.4.5.6v.5c0 .3 0 .5-.5.7-.4.2-1.2.3-2.3-.1-1-.4-2.1-1.2-3.1-2.2s-1.7-2.1-2.1-3.1c-.4-1-.3-1.8-.1-2.2Z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="m12 3.7 2.6 5.2 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.7Z" />
    </svg>
  );
}

function getBranchHref(branchSlug: string, rootBranchSlug: string) {
  return branchSlug === rootBranchSlug ? "/" : `/b/${branchSlug}`;
}

function getWhatsappHref(value: string) {
  const normalized = value.replace(/\D/g, "");
  return `https://wa.me/${normalized}`;
}

function getReviewHref(branch: Branch) {
  return branch.reviewUrl || branch.mapUrl;
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
  const orderedBranches = [
    activeBranch,
    ...branches.filter((branch) => branch.id !== activeBranch.id)
  ];
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
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-5">
                {business.logoUrl ? (
                  <div className="flex h-28 w-28 flex-none items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-white/8 p-3 shadow-[var(--shadow-soft)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={business.logoUrl}
                      alt={`${business.name} logosu`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : null}
                <div className="flex min-h-28 items-center">
                  <h1 className="font-[family-name:var(--font-display)] text-[2.5rem] leading-[0.92]">
                    {business.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-base leading-6 text-white/58 sm:text-lg">
                  {activeBranch.district} / {activeBranch.city}
                </p>
                <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-3 text-right text-sm text-white shadow-[var(--shadow-soft)]">
                  <p className="font-semibold leading-snug">{activeBranch.hours}</p>
                </div>
              </div>
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
                {orderedBranches.map((branch) => (
                  <article
                    key={branch.id}
                    className="rounded-[28px] border border-black/6 bg-[rgba(255,255,255,0.84)] p-4 shadow-[var(--shadow-soft)]"
                  >
                    <div>
                      <h2 className="font-[family-name:var(--font-display)] text-3xl">{branch.name}</h2>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{branch.blurb}</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <p>{branch.address}</p>
                      <p>
                        {branch.district} / {branch.city}
                      </p>
                      <p className="font-medium">Çalışma Saatleri: {branch.hours}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <EventLink
                        href={branch.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        eventName="map_click"
                        branchId={branch.id}
                        source="public_shell"
                        className="inline-flex flex-col items-center justify-center gap-2 rounded-[20px] border border-black/6 bg-white px-4 py-3 text-center"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.16)]">
                          <PinIcon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[11px] font-medium tracking-[0.01em] text-[color:var(--muted)]">
                          Adres
                        </span>
                      </EventLink>
                      <EventLink
                        href={getWhatsappHref(branch.whatsapp)}
                        target="_blank"
                        rel="noreferrer"
                        eventName="whatsapp_click"
                        branchId={branch.id}
                        source="public_shell"
                        className="inline-flex flex-col items-center justify-center gap-2 rounded-[20px] border border-black/6 bg-white px-4 py-3 text-center"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.16)]">
                          <WhatsAppIcon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[11px] font-medium tracking-[0.01em] text-[color:var(--muted)]">
                          WhatsApp
                        </span>
                      </EventLink>
                      <a
                        href={getReviewHref(branch)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-col items-center justify-center gap-2 rounded-[20px] border border-black/6 bg-white px-4 py-3 text-center"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.16)]">
                          <StarIcon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[11px] font-medium tracking-[0.01em] text-[color:var(--muted)]">
                          Google Yorum
                        </span>
                      </a>
                    </div>
                  </article>
                ))}
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
                        <div
                          className={
                            item.imageUrl
                              ? "grid grid-cols-[7rem_minmax(0,1fr)] gap-4 md:grid-cols-[9rem_minmax(0,1fr)] xl:grid-cols-[10rem_minmax(0,1fr)]"
                              : "flex flex-col gap-4"
                          }
                        >
                          {item.imageUrl ? (
                            <div className="h-28 overflow-hidden rounded-[22px] border border-black/6 bg-white md:h-32 xl:h-36">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                            </div>
                          ) : null}

                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-semibold leading-tight md:text-xl xl:text-2xl">
                                    {item.name}
                                  </h3>
                                  {item.featured || item.badge ? (
                                    <span className="rounded-full bg-[color:var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--accent-strong)]">
                                      {item.badge ?? "Öne çıkan"}
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="shrink-0 text-right">
                                {item.stockStatus === "in_stock" ? (
                                  <>
                                    <p className="font-[family-name:var(--font-display)] text-[1.9rem] leading-none md:text-[2.35rem] xl:text-[3rem]">
                                      {item.price} TL
                                    </p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[color:var(--olive)]">
                                      Hazır
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-[family-name:var(--font-display)] text-xl text-[color:var(--muted)] md:text-[2rem] xl:text-3xl">
                                      Tükendi
                                    </p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[color:var(--accent-strong)]">
                                      Stokta Yok
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)] md:text-base xl:mt-5 xl:text-[1.05rem]">
                              {item.description}
                            </p>
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

        <div className="sticky bottom-4 z-10 px-1">
          <nav className="rounded-[30px] border border-white/65 bg-[rgba(255,247,248,0.92)] p-2.5 shadow-[0_18px_42px_rgba(67,24,28,0.16)] backdrop-blur">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={basePath}
                aria-current={activeTab === "contact" ? "page" : undefined}
                className={[
                  "inline-flex min-h-[4rem] items-center justify-center rounded-[22px] border px-4 py-3 text-left text-sm font-semibold transition",
                  activeTab === "contact"
                    ? "border-[color:var(--accent-soft-strong)] bg-white text-[color:var(--foreground)] shadow-[0_12px_24px_rgba(96,8,16,0.14)]"
                    : "border-transparent bg-transparent text-[color:var(--muted)]"
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={[
                      "flex h-11 w-11 flex-none items-center justify-center rounded-2xl transition",
                      activeTab === "contact"
                        ? "bg-[color:var(--accent)] text-white shadow-[0_10px_20px_rgba(96,8,16,0.22)]"
                        : "bg-white text-[color:var(--accent-strong)]"
                    ].join(" ")}
                  >
                    <ContactIcon className="h-5 w-5" />
                  </span>
                  <span className="tracking-[0.01em]">İletişim</span>
                </span>
              </Link>
              <Link
                href={`${basePath}?tab=menu`}
                aria-current={activeTab === "menu" ? "page" : undefined}
                className={[
                  "inline-flex min-h-[4rem] items-center justify-center rounded-[22px] border px-4 py-3 text-left text-sm font-semibold transition",
                  activeTab === "menu"
                    ? "border-[color:var(--accent-soft-strong)] bg-white text-[color:var(--foreground)] shadow-[0_12px_24px_rgba(96,8,16,0.14)]"
                    : "border-transparent bg-transparent text-[color:var(--muted)]"
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={[
                      "flex h-11 w-11 flex-none items-center justify-center rounded-2xl transition",
                      activeTab === "menu"
                        ? "bg-[color:var(--accent)] text-white shadow-[0_10px_20px_rgba(96,8,16,0.22)]"
                        : "bg-white text-[color:var(--accent-strong)]"
                    ].join(" ")}
                  >
                    <MenuIcon className="h-5 w-5" />
                  </span>
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

      </div>
    </main>
  );
}
