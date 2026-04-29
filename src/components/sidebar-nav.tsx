"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Add Contact",
    description: "Create a new contact record",
  },
  {
    href: "/phonebook",
    label: "Phone Book",
    description: "Browse and sort all contacts",
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

type SidebarNavProps = {
  onNavigate?: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-col gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            onClick={onNavigate}
            className={`rounded-xl border px-4 py-3 transition ${
              isActive
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{item.description}</p>
          </Link>
        );
      })}
    </nav>
  );
}
