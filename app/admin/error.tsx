"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="admin-panel rounded-[32px] p-8 text-center">
          <p className="admin-kicker">Hata</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Bir şeyler ters gitti</h2>
          <p className="admin-copy mt-3 text-sm leading-6">
            Sayfa yüklenirken beklenmeyen bir hata oluştu.
            {error.digest ? (
              <span className="ml-1 text-[color:var(--muted)]">({error.digest})</span>
            ) : null}
          </p>
          <button onClick={reset} className="admin-cta-primary mt-6">
            Tekrar dene
          </button>
        </section>
      </div>
    </main>
  );
}
