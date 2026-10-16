import type { LucideIcon } from "lucide-react";
import {
  AwardIcon,
  BriefcaseIcon,
  CalendarIcon,
  ImageIcon,
  LayoutDashboardIcon,
  FolderKanbanIcon,
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
    href: "/exco",
    label: "Overview",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  { href: "/exco/members", label: "Members", icon: UsersIcon },
  { href: "/exco/events", label: "Events", icon: CalendarIcon },
  { href: "/exco/projects", label: "Projects", icon: FolderKanbanIcon },
  { href: "/exco/certificates", label: "Certificates", icon: AwardIcon },
  { href: "/exco/opportunities", label: "Opportunities", icon: BriefcaseIcon },
  { href: "/exco/gallery", label: "Gallery", icon: ImageIcon },
];

export function isAdminNavActive(item: AdminNavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
