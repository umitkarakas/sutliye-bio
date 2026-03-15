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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M7 5.5h10A2.5 2.5 0 0 1 19.5 8v8A2.5 2.5 0 0 1 17 18.5H7A2.5 2.5 0 0 1 4.5 16V8A2.5 2.5 0 0 1 7 5.5Z" />
      <path d="m5.5 8 6.5 5 6.5-5" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 7.5h14" />
      <path d="M5 12h14" />
      <path d="M5 16.5h10" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 21s-5.5-5.3-5.5-10A5.5 5.5 0 0 1 12 5.5 5.5 5.5 0 0 1 17.5 11c0 4.7-5.5 10-5.5 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M20 11.5A8.5 8.5 0 0 1 7.4 19l-3.4 1 1.1-3.2A8.5 8.5 0 1 1 20 11.5Z" />
      <path d="M9.3 9.2c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.5l.4 1.1c.1.3.1.5-.1.7l-.5.6c-.1.1-.2.3 0 .6.4.7 1 1.4 1.8 1.8.3.2.5.1.6 0l.6-.5c.2-.2.4-.2.7-.1l1.1.4c.5.2.5.4.5.6v.5c0 .3 0 .5-.5.7-.4.2-1.2.3-2.3-.1-1-.4-2.1-1.2-3.1-2.2s-1.7-2.1-2.1-3.1c-.4-1-.3-1.8-.1-2.2Z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="m12 3.7 2.6 5.2 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.7Z" />
    </svg>
  );
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M3 9.5 12 4l9 5.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
      <path d="M9 21V12h6v9" />
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

  // Richer gradient background — gives glass cards something to blur against
  const shellStyle = {
    ...brandThemeToCssVariables(business.theme),
    background: [
      "radial-gradient(ellipse 120% 60% at 10% 0%, color-mix(in srgb, var(--brand-primary) 28%, transparent) 0%, transparent 70%)",
      "radial-gradient(ellipse 80% 50% at 90% 100%, color-mix(in srgb, var(--brand-secondary) 32%, transparent) 0%, transparent 70%)",
      "var(--brand-background)"
    ].join(", ")
  };

  // Glass card style (used inline because Tailwind can't compose arbitrary rgba + blur easily)
  const glassCard = {
    background: "rgba(255, 252, 253, 0.55)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)"
  } as React.CSSProperties;

  const glassCardStrong = {
    background: "rgba(255, 255, 255, 0.72)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)"
  } as React.CSSProperties;

  return (
    <main style={shellStyle} className="min-h-screen px-4 py-5 pb-[6.5rem] text-[15px] text-[color:var(--foreground)] sm:px-6">
      <AnalyticsBeacon branchId={activeBranch.id} activeTab={activeTab} source="public_shell" />
      <div className="mx-auto w-full max-w-md space-y-3">

        {/* Header card — dark, opaque */}
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#171416] shadow-[var(--shadow)]">
          <div className="px-5 py-6 text-white">
            <div className="flex items-center gap-5">
              {business.logoUrl ? (
                <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/8 p-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={business.logoUrl} alt={`${business.name} logosu`} className="h-full w-full object-contain" />
                </div>
              ) : null}
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[0.92] text-white">
                  {business.name}
                </h1>
                <p className="mt-2 text-sm text-white/60">
                  {activeBranch.district} / {activeBranch.city}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content — cards float directly on gradient for true glass effect */}
        {activeTab === "contact" ? (
          <section className="space-y-3">
            {orderedBranches.map((branch) => (
              <article
                key={branch.id}
                style={glassCard}
                className="rounded-[20px] border border-white/40 p-4 shadow-[var(--shadow-soft)]"
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
                    style={glassCardStrong}
                    className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/50 px-3 py-3 text-center"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
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
                    style={glassCardStrong}
                    className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/50 px-3 py-3 text-center"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
                      <WhatsAppIcon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">WhatsApp</span>
                  </EventLink>
                  <a
                    href={getReviewHref(branch)}
                    target="_blank"
                    rel="noreferrer"
                    style={glassCardStrong}
                    className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/50 px-3 py-3 text-center"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
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
            {/* Category anchors */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[color:var(--foreground)]/70">{menuItemCount} ürün</p>
              <div className="flex gap-2 overflow-x-auto">
                {visibleCategories.map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.slug}`}
                    style={glassCardStrong}
                    className="rounded-full border border-white/50 px-3 py-1 text-xs font-medium whitespace-nowrap text-[color:var(--foreground)]"
                  >
                    {category.name} ({category.items.length})
                  </a>
                ))}
              </div>
            </div>

            {visibleCategories.length === 0 ? (
              <section style={glassCard} className="rounded-[20px] border border-white/40 p-5 text-sm text-[color:var(--muted)] shadow-[var(--shadow-soft)]">
                Bu şube için gösterilecek aktif menü kaydı bulunamadı.
              </section>
            ) : null}

            {visibleCategories.map((category) => (
              <section key={category.id} id={category.slug} className="space-y-3">
                <div className="flex items-end justify-between px-1">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl">{category.name}</h2>
                  <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {activeBranch.name}
                  </span>
                </div>

                {category.items.map((item) => (
                  <article
                    key={item.id}
                    style={glassCard}
                    className="rounded-[20px] border border-white/40 p-4 shadow-[var(--shadow-soft)]"
                  >
                    <div
                      className={
                        item.imageUrl
                          ? "grid grid-cols-[7rem_minmax(0,1fr)] gap-4 md:grid-cols-[9rem_minmax(0,1fr)]"
                          : "flex flex-col gap-3"
                      }
                    >
                      {item.imageUrl ? (
                        <div style={glassCardStrong} className="h-28 overflow-hidden rounded-2xl border border-white/50 md:h-32">
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
                              <span className="mt-1.5 inline-block rounded-full bg-[color:var(--accent)] px-2.5 py-0.5 text-[11px] font-medium text-white">
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

      {/* Bottom navigation — single row, fixed */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2"
        style={{
          background: "rgba(248, 236, 238, 0.28)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)"
        }}
      >
        <div className="mx-auto flex h-14 max-w-md items-stretch gap-2">

          {/* Branch strip — scrollable, own pill */}
          <div
            className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-2xl px-2.5 py-1.5"
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 2px 12px rgba(96,8,16,0.08), inset 0 0 0 1px rgba(255,255,255,0.9)"
            }}
          >
            {orderedBranches.map((branch) => {
              const href = getBranchHref(branch.slug, rootBranchSlug);
              const isActive = branch.id === activeBranch.id;
              return (
                <Link
                  key={branch.id}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  style={isActive ? { color: "#ffffff" } : undefined}
                  className={[
                    "inline-flex w-[38%] shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition",
                    isActive
                      ? "bg-[color:var(--accent)] shadow-[0_3px_8px_rgba(96,8,16,0.30)]"
                      : "text-[color:var(--foreground)]/70"
                  ].join(" ")}
                >
                  <StoreIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{branch.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Contact + Menu — own pill, with labels */}
          <div
            className="flex w-[30%] shrink-0 items-stretch gap-1 rounded-2xl p-1.5"
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 2px 12px rgba(96,8,16,0.08), inset 0 0 0 1px rgba(255,255,255,0.9)"
            }}
          >
            <Link
              href={basePath}
              aria-current={activeTab === "contact" ? "page" : undefined}
              style={activeTab === "contact" ? { color: "#ffffff" } : undefined}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition",
                activeTab === "contact"
                  ? "bg-[#171416] shadow-[0_3px_8px_rgba(0,0,0,0.25)]"
                  : "text-[color:var(--foreground)]/50"
              ].join(" ")}
            >
              <ContactIcon className="h-[16px] w-[16px]" />
              <span className="text-[9px] font-semibold tracking-wide">İletişim</span>
            </Link>
            <Link
              href={`${basePath}?tab=menu`}
              aria-current={activeTab === "menu" ? "page" : undefined}
              style={activeTab === "menu" ? { color: "#ffffff" } : undefined}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition",
                activeTab === "menu"
                  ? "bg-[#171416] shadow-[0_3px_8px_rgba(0,0,0,0.25)]"
                  : "text-[color:var(--foreground)]/50"
              ].join(" ")}
            >
              <MenuIcon className="h-[16px] w-[16px]" />
              <span className="text-[9px] font-semibold tracking-wide">Menü</span>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
