import { AdminNav } from "@/components/admin-nav";

type AdminPageShellProps = {
  currentPath: string;
  title: string;
  sessionEmail: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminPageShell({
  currentPath,
  title,
  sessionEmail,
  actions,
  children
}: AdminPageShellProps) {
  return (
    <main className="min-h-screen px-4 py-6 text-[color:var(--foreground)] sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="admin-shell rounded-[40px] p-3">
          <div className="flex flex-col gap-4 rounded-[34px] bg-[rgba(255,255,255,0.56)] p-4">
            <div className="rounded-[30px] bg-[#171416] px-5 py-5 text-white shadow-[var(--shadow-soft)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="admin-kicker text-white/56">Admin</p>
                  <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none">{title}</h1>
                  <p className="text-sm text-white/68">{sessionEmail}</p>
                </div>
                {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/6 bg-[rgba(255,255,255,0.82)] p-3 shadow-[var(--shadow-soft)]">
              <AdminNav currentPath={currentPath} />
            </div>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
