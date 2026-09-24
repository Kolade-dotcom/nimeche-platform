import type { LucideIcon } from "lucide-react";
import {
  AwardIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  SparklesIcon,
  UserRoundIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  /** The word used in the mobile bar, where there is room for one. */
  short: string;
  icon: LucideIcon;
  /** Matches only the exact path. Without it, /me would light up everywhere. */
  exact?: boolean;
  /**
   * Listed but not built yet. Rendered as a dead entry rather than a link,
   * because the shape of the member's world is part of the design and an
   * anchor to a 404 is worse than an honest "soon".
   */
  soon?: boolean;
};

export const MAIN_NAV: NavItem[] = [
  {
    href: "/me",
    label: "Dashboard",
    short: "Dashboard",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  { href: "/me/events", label: "My events", short: "Events", icon: CalendarDaysIcon },
  {
    href: "/me/certificates",
    label: "My certificates",
    short: "Certificates",
    icon: AwardIcon,
  },
  { href: "/me/skills", label: "My skills", short: "Skills", icon: SparklesIcon },
  {
    href: "/me/opportunities",
    label: "Opportunities",
    short: "Openings",
    icon: BriefcaseIcon,
    soon: true,
  },
  {
    href: "/me/activity",
    label: "My activity",
    short: "Activity",
    icon: HistoryIcon,
    soon: true,
  },
];

export const ACCOUNT_NAV: NavItem[] = [
  { href: "/me/profile", label: "Profile", short: "Profile", icon: UserRoundIcon },
  {
    href: "/me/settings",
    label: "Settings",
    short: "Settings",
    icon: SettingsIcon,
    soon: true,
  },
];

/** The five that fit across a phone. Everything else lives behind the menu. */
export const BOTTOM_NAV: NavItem[] = [
  MAIN_NAV[0]!,
  MAIN_NAV[1]!,
  MAIN_NAV[2]!,
  MAIN_NAV[3]!,
  ACCOUNT_NAV[0]!,
];

export function isActive(item: NavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

/** The heading shown in the topbar, worked out from the route. */
export function titleFor(pathname: string): string {
  const match = [...MAIN_NAV, ...ACCOUNT_NAV]
    .filter((item) => isActive(item, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "My account";
}
