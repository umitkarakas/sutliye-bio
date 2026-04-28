"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DateFilterBarProps {
  from: string;
  to: string;
  basePath: string;
}

function istanbulDate(offsetDays = 0): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(
    new Date(Date.now() - offsetDays * 86400000)
  );
}

const PRESETS = [
  { label: "Bugün",      getFrom: () => istanbulDate(0),  getTo: () => istanbulDate(0) },
  { label: "Dün",        getFrom: () => istanbulDate(1),  getTo: () => istanbulDate(1) },
  { label: "Son 7 Gün",  getFrom: () => istanbulDate(6),  getTo: () => istanbulDate(0) },
  { label: "Son 30 Gün", getFrom: () => istanbulDate(29), getTo: () => istanbulDate(0) },
  { label: "Son 90 Gün", getFrom: () => istanbulDate(89), getTo: () => istanbulDate(0) },
];

export function DateFilterBar({ from, to, basePath }: DateFilterBarProps) {
  const router = useRouter();

  const activePreset = PRESETS.find((p) => p.getFrom() === from && p.getTo() === to);
  const isCustom = !activePreset;

  const [showCustom, setShowCustom] = useState(isCustom);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  const today = istanbulDate(0);

  function navigate(f: string, t: string) {
    router.push(`${basePath}?from=${f}&to=${t}`);
  }

  function handlePreset(p: (typeof PRESETS)[number]) {
    setShowCustom(false);
    navigate(p.getFrom(), p.getTo());
  }

  function handleCustomApply() {
    if (customFrom && customTo && customFrom <= customTo) {
      navigate(customFrom, customTo);
    }
  }

  return (
    <section className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => handlePreset(p)}
          className={[
            "admin-chip rounded-full px-4 py-2 text-sm",
            !showCustom && activePreset?.label === p.label ? "admin-cta-primary" : ""
          ].join(" ")}
        >
          {p.label}
        </button>
      ))}

      <button
        onClick={() => setShowCustom((v) => !v)}
        className={[
          "admin-chip rounded-full px-4 py-2 text-sm",
          showCustom ? "admin-cta-primary" : ""
        ].join(" ")}
      >
        Özel
      </button>

      {showCustom && (
        <div className="flex w-full flex-wrap items-center gap-2 pt-1">
          <input
            type="date"
            value={customFrom}
            max={customTo || today}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="admin-chip rounded-[12px] px-3 py-1.5 text-sm"
          />
          <span className="admin-copy text-xs">—</span>
          <input
            type="date"
            value={customTo}
            min={customFrom || undefined}
            max={today}
            onChange={(e) => setCustomTo(e.target.value)}
            className="admin-chip rounded-[12px] px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleCustomApply}
            disabled={!customFrom || !customTo || customFrom > customTo}
            className="admin-cta-secondary rounded-full px-4 py-1.5 text-sm disabled:opacity-40"
          >
            Uygula
          </button>
        </div>
      )}
    </section>
  );
}
