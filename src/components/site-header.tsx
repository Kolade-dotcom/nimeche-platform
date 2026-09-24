"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

import { BrandLockup } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/projects", label: "Projects" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/news", label: "News" },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // The menu closes when a link in it is tapped, not in an effect watching the
  // pathname. Same result, and it does not set state during render.
  const close = () => setOpen(false);

  return (
    <header className="border-border bg-surface sticky top-0 z-30 border-b">
      <div className="mx-auto flex min-h-[70px] w-full max-w-[1180px] items-center gap-6 px-4 sm:px-7">
        <Link href="/" aria-label="NiMechE-SF, Tech-U — home">
          <BrandLockup />
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-muted-foreground hover:text-foreground text-[15px] font-medium",
                pathname.startsWith(link.href) && "text-foreground font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/join">Join</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="border-border flex size-11 items-center justify-center rounded-md border lg:hidden"
          >
            {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="site-menu"
          className="border-border bg-surface border-t px-4 pb-4 sm:px-7 lg:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="border-border block border-b py-3.5 text-base font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="sm:hidden">
              <Link
                href="/sign-in"
                onClick={close}
                className="block py-3.5 text-base font-semibold"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
