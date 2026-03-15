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
    <main style={shellStyle} className="min-h-screen px-4 py-5 pb-[6.5rem] text-[15px] text-[color:var(--foreground)] sm:px-6">
      <AnalyticsBeacon branchId={activeBranch.id} activeTab={activeTab} source="public_shell" />
      <div className="mx-auto w-full max-w-md">
        <section className="overflow-hidden rounded-[28px] border border-black/6 bg-[rgba(255,255,255,0.82)] shadow-[var(--shadow)]">
          {/* Header */}
          <div className="border-b border-white/8 bg-[#171416] px-5 py-6 text-white">
            <div className="flex items-center gap-5">
              {business.logoUrl ? (
                <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/8 p-2.5 shadow-[var(--shadow-soft)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={business.logoUrl}
                    alt={`${business.name} logosu`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : null}
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[0.92]">
                  {business.name}
                </h1>
                <p className="mt-2 text-sm text-white/60">
                  {activeBranch.district} / {activeBranch.city}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 px-4 py-4">
            {activeTab === "contact" ? (
              <section className="space-y-3">
                {orderedBranches.map((branch) => (
                  <article
                    key={branch.id}
                    className="rounded-[20px] border border-black/6 bg-[rgba(255,255,255,0.82)] p-4 shadow-[var(--shadow-soft)]"
                  >
                    <h2 className="font-[family-name:var(--font-display)] text-3xl">{branch.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{branch.blurb}</p>
                    <div className="mt-3 space-y-1.5 text-sm">
                      <p>{branch.address}</p>
                      <p className="text-[color:var(--muted)]">{branch.district} / {branch.city}</p>
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
                        className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-black/6 bg-white px-3 py-3 text-center"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.16)]">
                          <PinIcon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">Adres</span>
                      </EventLink>
                      <EventLink
                        href={getWhatsappHref(branch.whatsapp)}
                        target="_blank"
                        rel="noreferrer"
                        eventName="whatsapp_click"
                        branchId={branch.id}
                        source="public_shell"
                        className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-black/6 bg-white px-3 py-3 text-center"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.16)]">
                          <WhatsAppIcon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">WhatsApp</span>
                      </EventLink>
                      <a
                        href={getReviewHref(branch)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-black/6 bg-white px-3 py-3 text-center"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.16)]">
                          <StarIcon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">Google Yorum</span>
                      </a>
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <section className="space-y-4">
                {/* Menu summary */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[color:var(--muted)]">
                    {menuItemCount} ürün
                  </p>
                  <div className="flex gap-2 overflow-x-auto">
                    {visibleCategories.map((category) => (
                      <a
                        key={category.id}
                        href={`#${category.slug}`}
                        className="rounded-full border border-black/6 bg-white px-3 py-1 text-xs font-medium text-[color:var(--foreground)] whitespace-nowrap"
                      >
                        {category.name} ({category.items.length})
                      </a>
                    ))}
                  </div>
                </div>

                {visibleCategories.length === 0 ? (
                  <section className="rounded-[20px] border border-black/6 bg-[rgba(255,255,255,0.82)] p-5 text-sm text-[color:var(--muted)] shadow-[var(--shadow-soft)]">
                    Bu şube için gösterilecek aktif menü kaydı bulunamadı.
                  </section>
                ) : null}

                {visibleCategories.map((category) => (
                  <section key={category.id} id={category.slug} className="space-y-3">
                    <div className="flex items-end justify-between">
                      <h2 className="font-[family-name:var(--font-display)] text-2xl">{category.name}</h2>
                      <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        {activeBranch.name}
                      </span>
                    </div>

                    {category.items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-[20px] border border-black/6 bg-[rgba(255,255,255,0.82)] p-4 shadow-[var(--shadow-soft)]"
                      >
                        <div
                          className={
                            item.imageUrl
                              ? "grid grid-cols-[7rem_minmax(0,1fr)] gap-4 md:grid-cols-[9rem_minmax(0,1fr)]"
                              : "flex flex-col gap-3"
                          }
                        >
                          {item.imageUrl ? (
                            <div className="h-28 overflow-hidden rounded-2xl border border-black/6 bg-white md:h-32">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                            </div>
                          ) : null}

                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="text-lg font-semibold leading-tight md:text-xl">
                                  {item.name}
                                </h3>
                                {item.featured || item.badge ? (
                                  <span className="mt-1.5 inline-block rounded-full bg-[color:var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--accent-strong)]">
                                    {item.badge ?? "Öne çıkan"}
                                  </span>
                                ) : null}
                              </div>

                              <div className="shrink-0 text-right">
                                {item.stockStatus === "in_stock" ? (
                                  <>
                                    <p className="font-[family-name:var(--font-display)] text-2xl leading-none md:text-3xl">
                                      {item.price} TL
                                    </p>
                                    <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-[color:var(--olive)]">
                                      Hazır
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-[family-name:var(--font-display)] text-xl text-[color:var(--muted)] md:text-2xl">
                                      Tükendi
                                    </p>
                                    <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">
                                      Stokta Yok
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)] md:text-base">
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
      </div>

      {/* Bottom navigation — fixed, layered */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <nav className="mx-auto max-w-md border-t border-black/6 bg-[rgba(255,247,248,0.96)] backdrop-blur-md shadow-[0_-8px_32px_rgba(67,24,28,0.10)]">
          {/* Branch strip */}
          {branches.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto border-b border-black/5 px-3 py-2 scrollbar-none">
              {branches.map((branch) => {
                const href = getBranchHref(branch.slug, rootBranchSlug);
                const isActive = branch.id === activeBranch.id;
                return (
                  <Link
                    key={branch.id}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold transition",
                      isActive
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                        : "border-black/8 bg-white/80 text-[color:var(--foreground)]"
                    ].join(" ")}
                  >
                    {branch.name}
                  </Link>
                );
              })}
            </div>
          ) : null}

          {/* Tab row */}
          <div className="grid grid-cols-2 gap-2 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <Link
              href={basePath}
              aria-current={activeTab === "contact" ? "page" : undefined}
              className={[
                "inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border px-4 text-sm font-semibold transition",
                activeTab === "contact"
                  ? "border-[color:var(--accent-soft-strong)] bg-white text-[color:var(--foreground)] shadow-[0_8px_20px_rgba(96,8,16,0.12)]"
                  : "border-transparent bg-transparent text-[color:var(--muted)]"
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 flex-none items-center justify-center rounded-lg transition",
                  activeTab === "contact"
                    ? "bg-[color:var(--accent)] text-white shadow-[0_4px_10px_rgba(96,8,16,0.22)]"
                    : "bg-black/6 text-[color:var(--accent-strong)]"
                ].join(" ")}
              >
                <ContactIcon className="h-4 w-4" />
              </span>
              İletişim
            </Link>
            <Link
              href={`${basePath}?tab=menu`}
              aria-current={activeTab === "menu" ? "page" : undefined}
              className={[
                "inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl border px-4 text-sm font-semibold transition",
                activeTab === "menu"
                  ? "border-[color:var(--accent-soft-strong)] bg-white text-[color:var(--foreground)] shadow-[0_8px_20px_rgba(96,8,16,0.12)]"
                  : "border-transparent bg-transparent text-[color:var(--muted)]"
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 flex-none items-center justify-center rounded-lg transition",
                  activeTab === "menu"
                    ? "bg-[color:var(--accent)] text-white shadow-[0_4px_10px_rgba(96,8,16,0.22)]"
                    : "bg-black/6 text-[color:var(--accent-strong)]"
                ].join(" ")}
              >
                <MenuIcon className="h-4 w-4" />
              </span>
              Menü
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
