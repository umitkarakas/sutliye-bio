"use client";

import { useEffect, useRef } from "react";
import type { TabId } from "@/lib/types";

type AnalyticsBeaconProps = {
  branchId: string;
  activeTab: TabId;
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

function sendEvent(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

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
}

export function AnalyticsBeacon({ branchId, activeTab, source }: AnalyticsBeaconProps) {
  const sentRef = useRef<string>("");

  useEffect(() => {
    const fingerprint = `${branchId}:${activeTab}:${source}`;

    if (sentRef.current === fingerprint) {
      return;
    }

    sentRef.current = fingerprint;

    const sessionId = getAnalyticsSessionId();

    sendEvent({
      eventName: "page_view",
      branchId,
      source,
      sessionId,
      metadata: {
        activeTab
      }
    });

    sendEvent({
      eventName: "branch_view",
      branchId,
      source,
      sessionId
    });

    sendEvent({
      eventName: "tab_view",
      branchId,
      source,
      sessionId,
      metadata: {
        activeTab
      }
    });
  }, [activeTab, branchId, source]);

  return null;
}
