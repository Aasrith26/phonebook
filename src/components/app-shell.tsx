"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";

type AppShellProps = {
  children: React.ReactNode;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

function TopActionButtons() {
  const pathname = usePathname();
  const navItems = [
    { href: "/", label: "Add Contact" },
    { href: "/phonebook", label: "Phone Book" },
  ];

  return (
    <nav aria-label="Quick actions" className="grid w-full grid-cols-2 gap-2 sm:w-auto">
      {navItems.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={`rounded-lg border px-3 py-2 text-center text-sm font-semibold transition ${
              isActive
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1440px] p-3 sm:p-4 lg:p-6">
      <div className="grid min-h-[calc(100dvh-1.5rem)] grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm shadow-[var(--shadow)] lg:sticky lg:top-6 lg:block lg:h-[calc(100dvh-3rem)]">
          <div className="mb-5 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Dashboard
            </p>
            <p className="text-xs text-[var(--muted)]">Contact management workspace</p>
          </div>
          <SidebarNav />
        </aside>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm shadow-[var(--shadow)] sm:p-6 lg:p-8">
          <header className="mb-6 flex items-center gap-3">
            <TopActionButtons />
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMenuOpen(true)}
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M4 7H20M4 12H20M4 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>
          {children}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-slate-900/30 transition-opacity lg:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-dvh w-[300px] border-l border-[var(--line)] bg-[var(--surface)] p-5 shadow-xl transition-transform lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--ink)]">Navigation</p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--ink)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <SidebarNav onNavigate={() => setIsMenuOpen(false)} />
      </aside>
    </div>
  );
}
