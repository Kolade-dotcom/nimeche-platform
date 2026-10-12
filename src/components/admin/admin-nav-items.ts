import type { LucideIcon } from "lucide-react";
import {
  AwardIcon,
  BriefcaseIcon,
  CalendarIcon,
  ImageIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Matches only the exact path. */
  exact?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin/overview",
    label: "Overview",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  { href: "/admin/members", label: "Members", icon: UsersIcon },
  { href: "/admin/events", label: "Events", icon: CalendarIcon },
  { href: "/admin/certificates", label: "Certificates", icon: AwardIcon },
  { href: "/admin/opportunities", label: "Opportunities", icon: BriefcaseIcon },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export function isAdminNavActive(item: AdminNavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
