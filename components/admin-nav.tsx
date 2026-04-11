import Link from "next/link";

const links = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/branding", label: "Marka" },
  { href: "/admin/pricing", label: "Toplu Fiyat" },
  { href: "/admin/branches", label: "Şubeler" },
  { href: "/admin/categories", label: "Kategoriler" },
  { href: "/admin/products", label: "Ürünler" },
  { href: "/admin/analytics", label: "Analytics" }
];

export function AdminNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive = currentPath === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            data-active={isActive ? "true" : "false"}
            className="admin-nav-link whitespace-nowrap"
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
