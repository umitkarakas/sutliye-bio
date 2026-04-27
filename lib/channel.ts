export type Channel = "instagram_bio" | "qr_table" | "qr_branch" | "direct" | "other";

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function toURLSearchParams(params: Params): URLSearchParams {
  if (params instanceof URLSearchParams) return params;
  return new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null)
      .map(([k, v]) => [k, Array.isArray(v) ? (v[0] ?? "") : (v ?? "")])
  );
}

/**
 * ?q=m5 → "m5"  (primary format)
 * ?m5=  → "m5"  (legacy fallback)
 */
export function parseTableIdFromParams(params: Params): string | undefined {
  const sp = toURLSearchParams(params);

  const q = sp.get("q");
  if (q && /^m\d+$/.test(q)) return q;

  for (const key of sp.keys()) {
    if (/^m\d+$/.test(key)) return key;
  }

  return undefined;
}

/**
 * Trafik kanalını URL parametreleri ve referrer'a göre tespit eder.
 * Öncelik sırası: instagram_bio → qr_table → qr_branch → direct → other
 */
export function detectChannel(params: Params, referrer: string): Channel {
  const ref = referrer ?? "";

  if (ref.includes("instagram.com") || ref.includes("l.instagram.com")) {
    return "instagram_bio";
  }

  const sp = toURLSearchParams(params);
  const q = sp.get("q");
  if (q && /^m\d+$/.test(q)) return "qr_table";

  if (sp.has("qr") || sp.get("source") === "qr") return "qr_branch";

  if (!ref || ref === "direct") return "direct";

  return "other";
}

export const CHANNEL_LABELS: Record<Channel, string> = {
  instagram_bio: "Instagram Bio",
  qr_table: "QR – Masa",
  qr_branch: "QR – Şube",
  direct: "Direkt",
  other: "Diğer"
};
