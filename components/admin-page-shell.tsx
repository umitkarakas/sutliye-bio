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
        <section className="admin-shell rounded-[32px] p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="admin-kicker">Admin</p>
                <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none">{title}</h1>
                <p className="text-sm text-[color:var(--muted)]">{sessionEmail}</p>
              </div>
              {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>

            <AdminNav currentPath={currentPath} />
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
