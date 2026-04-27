"use client";

import { useCallback } from "react";
import { createClientSessionId } from "@/lib/client-session-id";

type EventLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: "call_click" | "whatsapp_click" | "map_click";
  branchId: string;
  source: string;
};

function getAnalyticsSessionId() {
  const key = "analytics_session_id";
  const existing = window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const generated = createClientSessionId();
  window.localStorage.setItem(key, generated);
  return generated;
}

export function EventLink({
  eventName,
  branchId,
  source,
  onClick,
  children,
  ...props
}: EventLinkProps) {
  const handleClick = useCallback<NonNullable<EventLinkProps["onClick"]>>(
    (event) => {
      onClick?.(event);

      const tableId = window.sessionStorage.getItem("qr_table_id");
      const channel = window.sessionStorage.getItem("analytics_channel") ?? "direct";

      const body = JSON.stringify({
        eventName,
        branchId,
        source,
        sessionId: getAnalyticsSessionId(),
        channel,
        tableId: tableId ?? undefined
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
      } else {
        void fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true
        });
      }

      // GA4 custom event
      if (typeof window !== "undefined" && "gtag" in window) {
        (window as Window & { gtag: (...args: unknown[]) => void }).gtag("event", eventName, {
          branch_id: branchId,
          source
        });
      }
    },
    [branchId, eventName, onClick, source]
  );

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
