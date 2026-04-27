"use client";

import { useCallback } from "react";
import { createClientSessionId } from "@/lib/client-session-id";

type MenuItemTrackerProps = {
  productId: string;
  branchId: string;
  source: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function getSessionId() {
  const key = "analytics_session_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = createClientSessionId();
  window.localStorage.setItem(key, generated);
  return generated;
}

export function MenuItemTracker({ productId, branchId, source, children, className, style }: MenuItemTrackerProps) {
  const handleClick = useCallback(() => {
    const tableId = window.sessionStorage.getItem("qr_table_id");
    const channel = window.sessionStorage.getItem("analytics_channel") ?? "direct";

    const body = JSON.stringify({
      eventName: "menu_item_view",
      productId,
      branchId,
      source,
      sessionId: getSessionId(),
      channel,
      tableId: tableId ?? undefined
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }

    // GA4 custom event
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as Window & { gtag: (...args: unknown[]) => void }).gtag("event", "menu_item_view", {
        product_id: productId,
        branch_id: branchId,
        source
      });
    }
  }, [productId, branchId, source]);

  return (
    <article className={className} style={style} onClick={handleClick}>
      {children}
    </article>
  );
}
