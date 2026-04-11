function fallbackRandomSegment() {
  return Math.random().toString(36).slice(2, 10);
}

function fallbackSessionId() {
  return `session-${Date.now().toString(36)}-${fallbackRandomSegment()}-${fallbackRandomSegment()}`;
}

export function createClientSessionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return fallbackSessionId();
}
