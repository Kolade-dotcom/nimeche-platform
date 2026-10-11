import { cache } from "react";

import { db } from "@/lib/db";

export type PublicOpportunity = {
  id: string;
  slug: string;
  title: string;
  organisation: string;
  type: string;
  closesAt: Date;
  description: string | null;
  location: string | null;
  isRemote: boolean;
  externalUrl: string | null;
};

const publicOpportunitySelect = {
  id: true,
  slug: true,
  title: true,
  organisation: true,
  type: true,
  closesAt: true,
  description: true,
  location: true,
  isRemote: true,
  externalUrl: true,
} as const;

/** All published, non-expired opportunities. */
export const getPublishedOpportunities = cache(async function getPublishedOpportunities(
  filter?: { type?: string }
): Promise<PublicOpportunity[]> {
  return db.opportunity.findMany({
    where: {
      status: "published",
      closesAt: { gte: new Date() },
      ...(filter?.type ? { type: filter.type } : {}),
    },
    orderBy: { closesAt: "asc" },
    select: publicOpportunitySelect,
  });
});

/** A single published opportunity by slug. */
export const getOpportunityBySlug = cache(async function getOpportunityBySlug(
  slug: string
): Promise<PublicOpportunity | null> {
  return db.opportunity.findFirst({
    where: { slug, status: "published" },
    select: publicOpportunitySelect,
  });
});

/** Submit a new opportunity — always arrives with status='submitted'. */
export async function submitOpportunity(data: {
  title: string;
  organisation: string;
  type: string;
  deadline: string;
  description: string;
  externalUrl?: string;
}): Promise<void> {
  const slug = slugify(data.title);
  await db.opportunity.create({
    data: {
      title: data.title,
      organisation: data.organisation,
      type: data.type,
      closesAt: new Date(data.deadline),
      description: data.description,
      externalUrl: data.externalUrl || null,
      slug: await uniqueSlug(slug),
      status: "submitted",
    },
  });
}

/** Opportunities waiting for review (exec-facing). */
export const getOpportunitiesForReview = cache(
  async function getOpportunitiesForReview() {
    return db.opportunity.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      orderBy: { createdAt: "asc" },
      select: {
        ...publicOpportunitySelect,
        status: true,
        createdAt: true,
      },
    });
  }
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  const existing = await db.opportunity.findUnique({ where: { slug: base } });
  if (!existing) return base;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
