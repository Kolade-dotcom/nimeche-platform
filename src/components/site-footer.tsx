import Link from "next/link";

import { BrandLockup } from "@/components/brand-mark";

const COLUMNS = [
  {
    heading: "The branch",
    links: [
      { href: "/about", label: "About NiMechE-SF" },
      { href: "/about#executives", label: "Our executives" },
      { href: "/about#constitution", label: "Constitution" },
      { href: "/about#contact", label: "Contact us" },
    ],
  },
  {
    heading: "Members",
    links: [
      { href: "/events", label: "Events" },
      { href: "/opportunities", label: "Opportunities" },
      { href: "/projects", label: "Projects" },
      { href: "/sign-in", label: "Sign in" },
      { href: "/freshers", label: "Fresher support" },
    ],
  },
  {
    heading: "Employers",
    links: [
      { href: "/verify", label: "Verify a certificate" },
      { href: "/partner", label: "Partner with us" },
      { href: "/opportunities/submit", label: "Post an opportunity" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-border bg-surface mt-2 border-t py-10 pb-12">
      <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 sm:grid-cols-2 sm:px-7 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <BrandLockup />
          <p className="text-muted-foreground max-w-[34ch] text-sm">
            The Student Forum of the Nigerian Institution of Mechanical Engineers
            (NiMechE) at Abiola Ajimobi Technical University (AATU), also known as
            Tech-U, Ibadan.
          </p>
          <a
            href="mailto:nimechesfaatu@gmail.com"
            className="text-muted-foreground text-sm underline underline-offset-4"
          >
            nimechesfaatu@gmail.com
          </a>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <h2 className="text-muted-foreground mb-3 font-sans text-[11px] font-semibold tracking-[0.09em] uppercase">
              {column.heading}
            </h2>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
