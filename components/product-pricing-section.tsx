"use client";

import { useState } from "react";

type BranchPricing = {
  id: string;
  name: string;
  currentPrice: number | null;
  currentStockStatus: "in_stock" | "out_of_stock" | "hidden";
};

type Props = {
  branches: BranchPricing[];
  defaultMode: "uniform" | "per_branch";
  defaultUniformPrice?: number;
};

const stockStatusLabels: Record<string, string> = {
  in_stock: "Stokta",
  out_of_stock: "Tükendi",
  hidden: "Gizli"
};

export function ProductPricingSection({ branches, defaultMode, defaultUniformPrice }: Props) {
  const [mode, setMode] = useState(defaultMode);

  if (branches.length === 0) {
    return (
      <div className="admin-card rounded-2xl px-4 py-3 text-sm text-[color:var(--muted)]">
        Aktif şube yok. Fiyat tanımlamak için önce bir şube oluşturun.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="admin-kicker">Fiyatlandırma</p>
      <input type="hidden" name="pricingMode" value={mode} />

      {branches.length > 1 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("uniform")}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              mode === "uniform"
                ? "bg-[color:var(--fg)] text-[color:var(--bg)]"
                : "admin-chip"
            }`}
          >
            Tüm şubelere aynı fiyat
          </button>
          <button
            type="button"
            onClick={() => setMode("per_branch")}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              mode === "per_branch"
                ? "bg-[color:var(--fg)] text-[color:var(--bg)]"
                : "admin-chip"
            }`}
          >
            Şube bazlı fiyat
          </button>
        </div>
      )}

      {mode === "uniform" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-[color:var(--muted)]">Fiyat (TL)</label>
            <input
              name="uniformPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={defaultUniformPrice ?? ""}
              placeholder="0.00"
              required
              className="admin-input w-full rounded-2xl px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[color:var(--muted)]">Stok durumu</label>
            <select
              name="uniformStockStatus"
              defaultValue="in_stock"
              className="admin-input w-full rounded-2xl px-4 py-3"
            >
              <option value="in_stock">Stokta</option>
              <option value="out_of_stock">Tükendi</option>
              <option value="hidden">Gizli</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="admin-card rounded-2xl p-3"
            >
              <input type="hidden" name="branchIds" value={branch.id} />
              <p className="mb-2 text-sm font-medium">{branch.name}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-[color:var(--muted)]">Fiyat (TL)</label>
                  <input
                    name={`branch_${branch.id}_price`}
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={branch.currentPrice ?? ""}
                    placeholder="0.00"
                    required
                    className="admin-input w-full rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[color:var(--muted)]">Durum</label>
                  <select
                    name={`branch_${branch.id}_stockStatus`}
                    defaultValue={branch.currentStockStatus}
                    className="admin-input w-full rounded-xl px-3 py-2 text-sm"
                  >
                    {Object.entries(stockStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
