"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type IconProps = { className?: string };

const Icon = {
  overview: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  analytics: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="5" rx="1" />
      <rect x="12" y="8" width="3" height="9" rx="1" />
      <rect x="17" y="5" width="3" height="12" rx="1" />
    </svg>
  ),
  products: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  categories: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M3 5h8l9 9-6 6-9-9V5z" />
      <circle cx="7.5" cy="9.5" r="1.5" />
    </svg>
  ),
  pricing: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  branches: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M3 21h18" />
      <path d="M5 21V8l7-5 7 5v13" />
      <path d="M9 21v-6h6v6" />
    </svg>
  ),
  branding: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <circle cx="13.5" cy="6.5" r="1.5" />
      <circle cx="17.5" cy="10.5" r="1.5" />
      <circle cx="8.5" cy="7.5" r="1.5" />
      <circle cx="6.5" cy="12.5" r="1.5" />
      <path d="M12 2a10 10 0 1 0 0 20 2.5 2.5 0 0 0 2-4 2.5 2.5 0 0 1 2-4h1a3 3 0 0 0 3-3 8 8 0 0 0-8-8z" />
    </svg>
  ),
  feedback: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
    </svg>
  )
};

type NavItem = { href: string; label: string; icon: keyof typeof Icon };
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: "Genel",
    items: [
      { href: "/admin", label: "Genel Bakış", icon: "overview" },
      { href: "/admin/analytics", label: "Analytics", icon: "analytics" }
    ]
  },
  {
    title: "Menü Yönetimi",
    items: [
      { href: "/admin/products", label: "Ürünler", icon: "products" },
      { href: "/admin/categories", label: "Kategoriler", icon: "categories" },
      { href: "/admin/pricing", label: "Toplu Fiyat", icon: "pricing" }
    ]
  },
  {
    title: "İşletme",
    items: [
      { href: "/admin/branches", label: "Şubeler", icon: "branches" },
      { href: "/admin/branding", label: "Marka", icon: "branding" }
    ]
  },
  {
    title: "Etkileşim",
    items: [{ href: "/admin/feedback", label: "Geri Bildirimler", icon: "feedback" }]
  }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ sessionEmail }: { sessionEmail: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("admin-sidebar-collapsed");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync persisted UI pref after mount
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close mobile drawer on route change
    setMobileOpen(false);
  }, [pathname]);

  const navBody = (
    <>
      <div className="admin-side-brand">
        <Link href="/admin" aria-label="Sütliye yönetim paneli">
          {collapsed ? (
            <Image src="/brand/logo-icon.svg" alt="Sütliye" width={40} height={40} priority />
          ) : (
            <Image src="/brand/logo-horizontal.svg" alt="Sütliye" width={150} height={45} priority />
          )}
        </Link>
        <button
          type="button"
          className="admin-side-collapse"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={collapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
          </svg>
        </button>
      </div>

      <nav className="admin-side-nav">
        {groups.map((group) => (
          <div key={group.title} className="admin-side-group">
            {!collapsed ? <p className="admin-side-group-title">{group.title}</p> : <span className="admin-side-group-rule" />}
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href);
              const IconComp = Icon[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active ? "true" : "false"}
                  className="admin-side-item"
                  title={collapsed ? item.label : undefined}
                >
                  <span className="admin-side-item-icon">
                    <IconComp className="h-5 w-5" />
                  </span>
                  {!collapsed ? <span className="admin-side-item-label">{item.label}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="admin-side-footer">
        {!collapsed ? (
          <div className="admin-side-user">
            <span className="admin-side-user-avatar">{sessionEmail.charAt(0).toUpperCase()}</span>
            <span className="admin-side-user-email">{sessionEmail}</span>
          </div>
        ) : null}
        <div className="admin-side-actions">
          <Link href="/" className="admin-side-action" title="Mobil görünüm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect x="7" y="2" width="10" height="20" rx="2" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {!collapsed ? <span>Mobil görünüm</span> : null}
          </Link>
          <form action="/api/admin/auth/logout" method="post">
            <button type="submit" className="admin-side-action admin-side-logout" title="Çıkış yap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {!collapsed ? <span>Çıkış yap</span> : null}
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="admin-mobilebar">
        <button type="button" className="admin-mobilebar-burger" onClick={() => setMobileOpen(true)} aria-label="Menüyü aç">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Image src="/brand/logo-horizontal.svg" alt="Sütliye" width={120} height={36} priority />
      </div>

      {/* Desktop sidebar */}
      <aside className="admin-sidebar" data-collapsed={collapsed ? "true" : "false"}>
        {navBody}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="admin-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="admin-sidebar admin-sidebar-drawer" data-collapsed="false" onClick={(event) => event.stopPropagation()}>
            {navBody}
          </aside>
        </div>
      ) : null}
    </>
  );
}
