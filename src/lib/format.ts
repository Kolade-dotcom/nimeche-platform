import { format } from "date-fns";

/**
 * One place for every date the member sees.
 *
 * `date-fns` with an explicit pattern rather than `toLocaleDateString`: these
 * strings are rendered on the server and hydrated on the client, and the two
 * disagree the moment the runtime's locale does. A fixed pattern cannot.
 */

/** "5 September 2026" - the long form used in prose and on certificates. */
export function longDate(date: Date): string {
  return format(date, "d MMMM yyyy");
}

/** "5 Sep" - the short form used where the year is obvious from context. */
export function shortDate(date: Date): string {
  return format(date, "d MMM");
}

/** "Oct 2023" - month and year, for anything that only needs that much. */
export function monthYear(date: Date): string {
  return format(date, "MMM yyyy");
}

/** The two halves of the date block that fronts every event. */
export function dateParts(date: Date): { day: string; month: string } {
  return { day: format(date, "dd"), month: format(date, "MMM").toUpperCase() };
}

/** "7:30am", or "" for a time nobody set. */
export function clockTime(date: Date): string {
  return format(date, "h:mmaaa");
}

/** Greeting keyed to the hour, because "Good evening" at 9am reads as a bug. */
export function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** The first name, for a greeting. "Akolade Salako" gives "Akolade". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/**
 * Up to two initials for an avatar. Takes the first and last word, so
 * "Akolade Salako" is AS and a single name is one letter rather than two of
 * the same one.
 */
export function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0]![0]!;
  const last = words.length > 1 ? words[words.length - 1]![0]! : "";
  return (first + last).toUpperCase();
}

/** Written-out ordinal-free relative wording, e.g. "due Friday", "due today". */
export function dueWording(due: Date, now: Date = new Date()): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round(
    (startOfDay(due).getTime() - startOfDay(now).getTime()) / 86_400_000
  );
  if (days < 0) return `overdue since ${longDate(due)}`;
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  if (days < 7) return `due ${format(due, "EEEE")}`;
  return `due ${longDate(due)}`;
}
