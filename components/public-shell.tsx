"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Branch, MenuCategoryWithItems, PublicBusiness, TabId } from "@/lib/types";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { EventLink } from "@/components/event-link";
import { MenuItemTracker } from "@/components/menu-item-tracker";
import { brandThemeToCssVariables } from "@/lib/brand-theme";

type PublicShellProps = {
  activeBranch: Branch;
  activeTab: TabId;
  basePath: string;
  branches: Branch[];
  business: PublicBusiness;
  menu: MenuCategoryWithItems[];
  rootBranchSlug: string;
  tableId?: string;
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3 1.8" />
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

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M6.5 3.5h3l1.5 4-2 1.5c1 2 2.5 3.5 4.5 4.5L15 11l4 1.5v3c0 1-1 2-2 2C9 19.5 4.5 11 4.5 6c0-1 1-2.5 2-2.5Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FeedbackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
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
  rootBranchSlug,
  tableId
}: PublicShellProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const visibleCategories = menu.filter((category) => category.items.length > 0);
  const menuItemCount = visibleCategories.reduce((count, category) => count + category.items.length, 0);
  const orderedBranches = [
    activeBranch,
    ...branches.filter((branch) => branch.id !== activeBranch.id)
  ];

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (feedbackMessage.trim().length < 5) return;
    setFeedbackState("submitting");

    try {
      const storedTableId = typeof window !== "undefined"
        ? (window.sessionStorage.getItem("qr_table_id") ?? tableId)
        : tableId;

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: activeBranch.id,
          tableId: storedTableId,
          rating: feedbackRating || undefined,
          message: feedbackMessage.trim()
        })
      });

      if (!res.ok) throw new Error("submit failed");

      setFeedbackState("success");
      setTimeout(() => {
        setShowFeedbackForm(false);
        setFeedbackState("idle");
        setFeedbackMessage("");
        setFeedbackRating(0);
      }, 2000);
    } catch {
      setFeedbackState("error");
    }
  }

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
      <AnalyticsBeacon branchId={activeBranch.id} activeTab={activeTab} source="public_shell" tableId={tableId} />
      <div className="mx-auto w-full max-w-md space-y-3">

        {/* Header card — marka teal gradyan */}
        <section
          className="overflow-hidden rounded-[28px] border border-white/15 shadow-[var(--shadow)]"
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 72%, #022a2e) 100%)" }}
        >
          <div className="px-5 py-6 text-white">
            <div className="flex items-center gap-5">
              {business.logoUrl ? (
                <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-[18px] border border-white/40 bg-white p-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={business.logoUrl} alt={`${business.name} logosu`} className="h-full w-full object-contain" />
                </div>
              ) : null}
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[0.92] text-white">
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
            <article
              style={glassCard}
              className="rounded-[20px] border border-white/40 p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="space-y-3">

                {/* Adres — tam genişlik */}
                <EventLink
                  href={activeBranch.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  eventName="map_click"
                  branchId={activeBranch.id}
                  source="public_shell"
                  style={glassCardStrong}
                  className="flex w-full items-center gap-3 rounded-[20px] border border-white/50 px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.07)] text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
                    <PinIcon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Adres</p>
                    <p className="text-sm font-medium text-[color:var(--foreground)] leading-snug">{activeBranch.address}</p>
                    <p className="text-xs text-[color:var(--muted)]">{activeBranch.district} / {activeBranch.city}</p>
                  </div>
                </EventLink>

                {/* Çalışma Saatleri — tam genişlik */}
                <div
                  style={glassCardStrong}
                  className="flex w-full items-center gap-3 rounded-[20px] border border-white/50 px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.07)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
                    <ClockIcon className="h-4.5 w-4.5" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Çalışma Saatleri</p>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{activeBranch.hours}</p>
                  </div>
                </div>

                {/* 2-kolon aksiyon grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Satır 1: WhatsApp | Telefon */}
                  {activeBranch.whatsapp ? (
                  <EventLink
                    href={getWhatsappHref(activeBranch.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    eventName="whatsapp_click"
                    branchId={activeBranch.id}
                    source="public_shell"
                    style={glassCardStrong}
                    className="inline-flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[20px] border border-white/50 px-3 py-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.07)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
                      <WhatsAppIcon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">WhatsApp</span>
                  </EventLink>
                  ) : null}

                  {activeBranch.phone ? (
                  <EventLink
                    href={`tel:${activeBranch.phone.replace(/\D/g, "")}`}
                    eventName="call_click"
                    branchId={activeBranch.id}
                    source="public_shell"
                    style={glassCardStrong}
                    className="inline-flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[20px] border border-white/50 px-3 py-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.07)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
                      <PhoneIcon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">Telefon Et</span>
                  </EventLink>
                  ) : null}

                  {/* Satır 2: Yol Tarifi | Google Yorum */}
                  <EventLink
                    href={activeBranch.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    eventName="map_click"
                    branchId={activeBranch.id}
                    source="public_shell"
                    style={glassCardStrong}
                    className="inline-flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[20px] border border-white/50 px-3 py-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.07)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
                      <PinIcon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">Yol Tarifi</span>
                  </EventLink>

                  <a
                    href={getReviewHref(activeBranch)}
                    target="_blank"
                    rel="noreferrer"
                    style={glassCardStrong}
                    className="inline-flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[20px] border border-white/50 px-3 py-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.07)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
                      <StarIcon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">Google Yorum</span>
                  </a>

                  {/* Satır 3: Instagram (varsa) | Geri Bildirim */}
                  {activeBranch.instagram ? (
                    <a
                      href={`https://www.instagram.com/${activeBranch.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      style={glassCardStrong}
                      className="inline-flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[20px] border border-white/50 px-3 py-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.07)]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
                        <InstagramIcon className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">Instagram</span>
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(true)}
                    style={glassCardStrong}
                    className={`inline-flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-[20px] border border-white/50 px-3 py-4 text-center shadow-[0_2px_10px_rgba(0,0,0,0.07)]${!activeBranch.instagram ? " col-span-2" : ""}`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_6px_14px_rgba(96,8,16,0.28)]">
                      <FeedbackIcon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-[11px] font-medium tracking-[0.2em] text-[color:var(--muted)]">Geri Bildirim</span>
                  </button>
                </div>

              </div>
            </article>

            {/* Feedback bottom sheet modal */}
            {showFeedbackForm ? (
              <div
                className="fixed inset-0 z-20 flex items-end justify-center p-3 sm:items-center sm:p-4"
                style={{ background: "rgba(0,0,0,0.45)" }}
                onClick={(e) => { if (e.target === e.currentTarget) setShowFeedbackForm(false); }}
              >
                <div
                  className="w-[calc(100%-1.5rem)] max-w-md rounded-[28px] p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-h-[min(88vh,720px)] sm:overflow-y-auto"
                  style={{
                    background: "rgba(255,252,253,0.96)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)"
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-[family-name:var(--font-display)] text-2xl">Geri Bildirim</h3>
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/8 text-[color:var(--muted)]"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {feedbackState === "success" ? (
                    <p className="py-6 text-center text-base font-medium text-[color:var(--accent)]">
                      Teşekkürler! Yorumunuz alındı.
                    </p>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                      {/* Yıldız puanı */}
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star === feedbackRating ? 0 : star)}
                            className="text-2xl transition-transform active:scale-110"
                            aria-label={`${star} yıldız`}
                          >
                            <StarIcon className={`h-7 w-7 ${star <= feedbackRating ? "text-[color:var(--accent)]" : "text-black/20"}`} />
                          </button>
                        ))}
                      </div>

                      <textarea
                        required
                        minLength={5}
                        maxLength={1000}
                        rows={4}
                        placeholder="Deneyiminizi yazın..."
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        className="w-full resize-none rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20"
                      />

                      {feedbackState === "error" ? (
                        <p className="text-center text-xs text-red-500">Bir hata oluştu, lütfen tekrar deneyin.</p>
                      ) : null}

                      <button
                        type="submit"
                        disabled={feedbackState === "submitting" || feedbackMessage.trim().length < 5}
                        className="w-full rounded-2xl bg-[color:var(--accent)] py-3.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(96,8,16,0.30)] disabled:opacity-50"
                      >
                        {feedbackState === "submitting" ? "Gönderiliyor..." : "Gönder"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        ) : (
          <section className="space-y-4">
            {/* Category anchors — scroll sırasında üstte sabit kalır */}
            <div
              style={glassCardStrong}
              className="sticky top-2 z-30 flex items-center gap-3 rounded-2xl border border-white/50 px-3 py-2 shadow-[var(--shadow-soft)] backdrop-blur-md"
            >
              <p className="shrink-0 text-sm text-[color:var(--foreground)]/70">{menuItemCount} ürün</p>
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
                {visibleCategories.map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.slug}`}
                    className="rounded-full border border-white/50 bg-white/60 px-3 py-1 text-xs font-medium whitespace-nowrap text-[color:var(--foreground)]"
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
              <section key={category.id} id={category.slug} className="scroll-mt-20 space-y-3">
                <div className="flex items-end justify-between px-1">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl">{category.name}</h2>
                  <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {activeBranch.name}
                  </span>
                </div>

                {category.items.map((item) => (
                  <MenuItemTracker
                    key={item.id}
                    productId={item.id}
                    branchId={activeBranch.id}
                    source="public_menu"
                    style={glassCard}
                    className="rounded-[20px] border border-white/40 p-3 shadow-[var(--shadow-soft)]"
                  >
                    <div
                      className={
                        item.imageUrl
                          ? "grid grid-cols-[6rem_minmax(0,1fr)] gap-3"
                          : "flex flex-col gap-2"
                      }
                    >
                      {item.imageUrl ? (
                        <div style={glassCardStrong} className="h-24 overflow-hidden rounded-xl border border-white/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                        </div>
                      ) : null}

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold leading-tight">
                              {item.name}
                            </h3>
                            {item.featured || item.badge ? (
                              <span className="mt-1 inline-block rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-medium text-white">
                                {item.badge ?? "Öne çıkan"}
                              </span>
                            ) : null}
                          </div>

                          <div className="shrink-0 text-right">
                            {item.stockStatus === "in_stock" ? (
                              <p className="font-[family-name:var(--font-display)] text-xl leading-none">
                                {item.price} TL
                              </p>
                            ) : (
                              <>
                                <p className="font-[family-name:var(--font-display)] text-lg text-[color:var(--muted)]">
                                  Tükendi
                                </p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[color:var(--accent-strong)]">
                                  Stokta Yok
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {item.description ? (
                          <p className="mt-2 text-sm leading-5 text-[color:var(--muted)]">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </MenuItemTracker>
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
                  ? "bg-[color:var(--accent)] shadow-[0_3px_8px_rgba(96,8,16,0.30)]"
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
                  ? "bg-[color:var(--accent)] shadow-[0_3px_8px_rgba(96,8,16,0.30)]"
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
