/**
 * Placeholder content for the homepage.
 *
 * Every export here is replaced by a database query once the events, gallery
 * and membership subsystems land. It is a module rather than markup inside the
 * page so the swap is one import, and so nobody has to go hunting through JSX
 * for the numbers when they stop being true.
 */

export type HomeStat = { value: string; label: string };

export const STATS: HomeStat[] = [
  { value: "312", label: "members this session" },
  { value: "24", label: "events run this year" },
  { value: "486", label: "certificates issued" },
  { value: "9", label: "industry partners" },
];

export type UpcomingEvent = {
  slug: string;
  day: string;
  month: string;
  kind: string;
  title: string;
  meta: string;
};

export const UPCOMING: UpcomingEvent[] = [
  {
    slug: "plant-visit-ibadan-steel-mill",
    day: "19",
    month: "SEP",
    kind: "Plant visit",
    title: "Ibadan Steel Mill",
    meta: "Rolling mill and maintenance workshop · 40 places",
  },
  {
    slug: "design-of-pressure-vessels",
    day: "27",
    month: "SEP",
    kind: "Webinar",
    title: "Design of pressure vessels",
    meta: "Online, 6:00pm · Engr. John Doe",
  },
  {
    slug: "cad-clinic-assemblies",
    day: "04",
    month: "OCT",
    kind: "Clinic",
    title: "CAD clinic: assemblies",
    meta: "Mechanical CAD lab · Bring a laptop",
  },
];

export type GalleryTile = {
  id: string;
  tag: string;
  caption?: string;
  duration?: string;
  wide?: boolean;
};

export const GALLERY: GalleryTile[] = [
  {
    id: "mill",
    tag: "Plant visit",
    caption: "Ibadan Steel Mill — 38 members on the shop floor",
    wide: true,
  },
  { id: "competition", tag: "Competition" },
  { id: "webinar", tag: "Webinar", duration: "2:41" },
  { id: "project", tag: "Project" },
  { id: "workshop", tag: "Workshop" },
];
