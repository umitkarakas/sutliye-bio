"use client";

import { useState } from "react";

type BranchProductInfo = {
  branchProductId: string | null;
  branchId: string;
  branchName: string;
  price: number | null;
  stockStatus: "in_stock" | "out_of_stock" | "hidden";
  isAvailable: boolean;
};

type ActiveBranch = {
  id: string;
  name: string;
};

export function BranchPriceForm({
  productId,
  returnTo,
  branchProducts,
  activeBranches,
  isDemo,
  action
}: {
  productId: string;
  returnTo: string;
  branchProducts: BranchProductInfo[];
  activeBranches: ActiveBranch[];
  isDemo: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  const [applyToAll, setApplyToAll] = useState(true);

  return (
    <form action={action} className="mt-5 border-t border-[color:var(--line)] pt-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      {applyToAll && <input type="hidden" name="applyToAll" value="on" />}

      <h3 className="font-[family-name:var(--font-display)] text-xl">Fiyat güncelleme</h3>

      {branchProducts.length > 0 ? (
        <div className="mt-3 rounded-[22px] border border-[color:var(--line)] bg-[rgba(255,255,255,0.56)] p-3">
          <p className="admin-kicker">Mevcut şube fiyatları</p>
          <div className="mt-2 grid gap-1">
            {branchProducts.map((bp) => (
              <div key={bp.branchId} className="flex items-center justify-between text-sm">
                <span>{bp.branchName}</span>
                <span className="font-medium">
                  {bp.price !== null ? `${bp.price} TL` : "Fiyat yok"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Yeni fiyat (TL)"
          required
          className="admin-input rounded-2xl px-4 py-3"
        />
      </div>

      <div className="mt-3">
        <p className="admin-kicker mb-2">Güncellemenin geçerli olacağı şubeler</p>
        <label className="admin-card flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
          />
          <span>Tüm aktif şubelerde geçerli</span>
        </label>

        {!applyToAll && (
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {activeBranches.map((branch) => (
              <label
                key={branch.id}
                className="admin-card flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer"
              >
                <input type="checkbox" name="branchIds" value={branch.id} />
                <span>{branch.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isDemo}
          className="admin-cta-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Fiyatı güncelle
        </button>
      </div>
    </form>
  );
}
