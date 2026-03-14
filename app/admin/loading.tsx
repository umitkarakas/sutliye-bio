export default function AdminLoading() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="admin-shell rounded-[40px] p-3">
          <div className="flex flex-col gap-4 rounded-[34px] bg-[rgba(255,255,255,0.56)] p-4">
            <div className="rounded-[30px] bg-[#171416] px-5 py-5">
              <div className="h-4 w-16 animate-pulse rounded-full bg-white/20" />
              <div className="mt-2 h-10 w-48 animate-pulse rounded-2xl bg-white/20" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="rounded-[28px] border border-black/6 bg-[rgba(255,255,255,0.82)] p-3">
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-black/8" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="admin-panel rounded-[32px] p-5">
          <div className="h-3 w-20 animate-pulse rounded-full bg-black/8" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded-2xl bg-black/8" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-black/6" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-black/6" />
          </div>
        </section>

        <section className="admin-panel rounded-[32px] p-4">
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="admin-card rounded-[30px] p-4">
                <div className="flex gap-4">
                  <div className="h-32 w-40 animate-pulse rounded-[24px] bg-black/8" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-black/8" />
                    <div className="h-5 w-40 animate-pulse rounded-xl bg-black/8" />
                    <div className="h-3 w-full animate-pulse rounded-full bg-black/6" />
                    <div className="h-3 w-3/4 animate-pulse rounded-full bg-black/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
