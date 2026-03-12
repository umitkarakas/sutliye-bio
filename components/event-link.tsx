"use client";

import { useCallback } from "react";

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

  const generated = crypto.randomUUID();
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

      const body = JSON.stringify({
        eventName,
        branchId,
        source,
        sessionId: getAnalyticsSessionId()
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
        return;
      }

      void fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body,
        keepalive: true
      });
    },
    [branchId, eventName, onClick, source]
  );

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
