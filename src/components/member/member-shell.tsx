"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react";

import { BrandLockup } from "@/components/brand-mark";
import { MemberAvatar } from "@/components/member/member-avatar";
import {
  ACCOUNT_NAV,
  BOTTOM_NAV,
  MAIN_NAV,
  isActive,
  titleFor,
  type NavItem,
} from "@/components/member/nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The frame every member page sits in.
 *
 * Three navigations, one source of truth: a rail on a laptop, a bar across the
 * bottom of a phone, and a drawer behind the menu button for everything that
 * does not fit in the bar. They all read the same arrays, so a route added in
 * nav-items.ts appears in each of them.
 */
export function MemberShell({
  fullName,
  execTitle,
  children,
}: {
  fullName: string;
  execTitle: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const close = () => setMenuOpen(false);

  return (
    <div className="bg-background min-h-dvh lg:flex">
      <aside className="border-border bg-surface sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col gap-1 overflow-y-auto border-r px-4 py-5 lg:flex">
        <Link href="/" className="mb-4 px-2" aria-label="NiMechE-SF, Tech-U — home">
          <BrandLockup size={40} />
        </Link>
        <NavList items={MAIN_NAV} pathname={pathname} />
        <p className="text-muted-foreground mt-5 px-3 pb-1 text-[11px] font-semibold tracking-[0.09em] uppercase">
          Account
        </p>
        <NavList items={ACCOUNT_NAV} pathname={pathname} />
        <form action="/sign-out" method="post" className="mt-auto pt-4">
          <Button type="submit" variant="ghost" className="w-full justify-start gap-3">
            <LogOutIcon className="size-[18px]" />
            Sign out
          </Button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-surface sticky top-0 z-30 flex min-h-[64px] items-center gap-3 border-b px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="member-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="border-border flex size-10 items-center justify-center rounded-md border lg:hidden"
          >
            {menuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
          <h2 className="font-heading min-w-0 flex-1 truncate text-[17px] font-bold">
            {titleFor(pathname)}
          </h2>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label="Notifications"
            disabled
          >
            <BellIcon className="size-[18px]" />
          </Button>
          <MemberAvatar fullName={fullName} title={execTitle} />
        </header>

        {menuOpen ? (
          <nav
            id="member-menu"
            className="border-border bg-surface border-b px-4 py-3 lg:hidden"
            onClick={close}
          >
            <NavList items={MAIN_NAV} pathname={pathname} />
            <p className="text-muted-foreground mt-4 px-3 pb-1 text-[11px] font-semibold tracking-[0.09em] uppercase">
              Account
            </p>
            <NavList items={ACCOUNT_NAV} pathname={pathname} />
            <form action="/sign-out" method="post" className="mt-2">
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
        ) : null}

        {/* The bottom bar is fixed and overlays the page, so the last card on a
            phone needs room to clear it. 84px is the bar plus its safe area. */}
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pt-6 pb-[84px] sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      <nav
        aria-label="Sections"
        className="border-border bg-surface fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {BOTTOM_NAV.map((item) => {
          const active = isActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[58px] flex-col items-center justify-center gap-1 text-[11px] font-medium",
                active ? "text-primary-text font-semibold" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavList({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(item, pathname);
        const className = cn(
          "flex min-h-[44px] items-center gap-3 rounded-md px-3 text-[15px] font-medium",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        );

        return (
          <li key={item.href}>
            {item.soon ? (
              <span
                className={cn(
                  className,
                  "text-muted-foreground cursor-default opacity-60"
                )}
              >
                <item.icon className="size-[18px]" />
                {item.label}
                <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  Soon
                </span>
              </span>
            ) : (
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={className}
              >
                <item.icon className="size-[18px]" />
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
