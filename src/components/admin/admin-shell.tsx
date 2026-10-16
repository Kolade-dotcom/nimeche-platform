"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon, MenuIcon, XIcon } from "lucide-react";

import { BrandLockup } from "@/components/brand-mark";
import {
  ADMIN_NAV_ITEMS,
  isAdminNavActive,
  type AdminNavItem,
} from "@/components/admin/admin-nav-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RoleKey } from "@prisma/client";

function titleFor(pathname: string): string {
  const match = [...ADMIN_NAV_ITEMS]
    .filter((item) => isAdminNavActive(item, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Admin";
}

export function AdminShell({
  fullName,
  roles,
  children,
}: {
  fullName: string;
  roles: RoleKey[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const close = () => setMenuOpen(false);

  const rolesLabel = roles
    .map((r) => {
      if (r === "ADMIN") return "Tech Admin";
      if (r === "PRESIDENT") return "President";
      if (r === "EXECUTIVE") return "Executive";
      return r;
    })
    .join(", ");
  const navItems = ADMIN_NAV_ITEMS;

  return (
    <div className="bg-background min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="border-border bg-surface sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col gap-1 overflow-y-auto border-r px-4 py-5 lg:flex">
        <Link
          href="/"
          className="mb-4 px-2"
          aria-label="NiMechE-SF, Tech-U — home"
        >
          <BrandLockup size={40} />
        </Link>

        <p className="text-muted-foreground mb-1 px-3 text-[11px] font-semibold tracking-[0.09em] uppercase">
          Executive Dashboard
        </p>

        <NavList items={navItems} pathname={pathname} />

        <div className="mt-auto space-y-2 pt-4">
          <div className="px-3 py-2">
            <p className="text-foreground truncate text-sm font-semibold">{fullName}</p>
            <p className="text-muted-foreground text-xs">{rolesLabel}</p>
          </div>
          <form action="/sign-out" method="post">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3"
            >
              <LogOutIcon className="size-[18px]" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="border-border bg-surface sticky top-0 z-30 flex min-h-[64px] items-center gap-3 border-b px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="border-border flex size-11 items-center justify-center rounded-md border lg:hidden"
          >
            {menuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
          <h2 className="font-heading min-w-0 flex-1 truncate text-[17px] font-bold">
            {titleFor(pathname)}
          </h2>
          <div className="hidden items-center gap-2 sm:flex">
            <p className="text-muted-foreground text-sm">{fullName}</p>
            <span className="bg-primary-subtle text-primary-text rounded-full px-2 py-0.5 text-xs font-semibold">
              {rolesLabel}
            </span>
          </div>
        </header>

        {/* Mobile drawer */}
        {menuOpen && (
          <nav
            id="admin-menu"
            className="border-border bg-surface border-b px-4 py-3 lg:hidden"
            onClick={close}
          >
            <NavList items={navItems} pathname={pathname} />
            <form action="/sign-out" method="post" className="mt-3">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <LogOutIcon className="size-[18px]" />
                Sign out
              </Button>
            </form>
          </nav>
        )}

        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pt-6 pb-10 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavList({
  items,
  pathname,
}: {
  items: AdminNavItem[];
  pathname: string;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isAdminNavActive(item, pathname);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[44px] items-center gap-3 rounded-md px-3 text-[15px] font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-[18px] shrink-0" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
