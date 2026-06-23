import { AdminSidebar } from "@/components/admin-sidebar";

type AdminPageShellProps = {
  currentPath: string;
  title: string;
  sessionEmail: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminPageShell({ title, sessionEmail, actions, children }: AdminPageShellProps) {
  return (
    <div className="admin-layout">
      <AdminSidebar sessionEmail={sessionEmail} />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-heading">
            <p className="admin-kicker">Yönetim Paneli</p>
            <h1 className="admin-topbar-title font-[family-name:var(--font-display)]">{title}</h1>
          </div>
          {actions ? <div className="admin-topbar-actions">{actions}</div> : null}
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
