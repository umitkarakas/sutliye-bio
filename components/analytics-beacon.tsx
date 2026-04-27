"use client";

import { useEffect, useRef } from "react";
import type { TabId } from "@/lib/types";
import { createClientSessionId } from "@/lib/client-session-id";
import { detectChannel } from "@/lib/channel";

type AnalyticsBeaconProps = {
  branchId: string;
  activeTab: TabId;
  source: string;
  tableId?: string;
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

/**
 * tableId URL'de varsa sessionStorage'a kaydeder, yoksa mevcut session'daki değeri okur.
 * Bu sayede QR koddan gelen masa bilgisi oturum boyunca tüm eventlerde korunur.
 */
function resolveTableId(tableId: string | undefined): string | undefined {
  const key = "qr_table_id";

  if (tableId) {
    window.sessionStorage.setItem(key, tableId);
    return tableId;
  }

  return window.sessionStorage.getItem(key) ?? undefined;
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

export function AnalyticsBeacon({ branchId, activeTab, source, tableId }: AnalyticsBeaconProps) {
  const sentRef = useRef<string>("");

  useEffect(() => {
    const fingerprint = `${branchId}:${activeTab}:${source}`;

    if (sentRef.current === fingerprint) {
      return;
    }

    sentRef.current = fingerprint;

    const sessionId = getAnalyticsSessionId();
    const resolvedTableId = resolveTableId(tableId);
    const tableMetadata = resolvedTableId ? { tableId: resolvedTableId } : {};

    const channel = detectChannel(
      new URLSearchParams(window.location.search),
      document.referrer
    );
    window.sessionStorage.setItem("analytics_channel", channel);

    sendEvent({
      eventName: "page_view",
      branchId,
      source,
      sessionId,
      channel,
      tableId: resolvedTableId ?? null,
      metadata: {
        activeTab,
        referrer: document.referrer || "direct",
        url: window.location.pathname,
        ...tableMetadata
      }
    });

    sendEvent({
      eventName: "branch_view",
      branchId,
      source,
      sessionId,
      channel,
      tableId: resolvedTableId ?? null,
      metadata: tableMetadata
    });

    sendEvent({
      eventName: "tab_view",
      branchId,
      source,
      sessionId,
      channel,
      tableId: resolvedTableId ?? null,
      metadata: {
        activeTab,
        ...tableMetadata
      }
    });
  }, [activeTab, branchId, source, tableId]);

  return null;
}
