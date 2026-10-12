import { cache } from "react";

import { db } from "@/lib/db";

export type AdminOverview = {
  totalMembers: number;
  pendingMembers: number;
  activeMembers: number;
  upcomingEvents: number;
  totalCredentials: number;
  openOpportunities: number;
  recentAuditLog: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: Date;
    actorName: string | null;
  }[];
};

export const getAdminOverview = cache(async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date();

  const [
    totalMembers,
    pendingMembers,
    activeMembers,
    upcomingEvents,
    totalCredentials,
    openOpportunities,
    auditRows,
  ] = await Promise.all([
    db.member.count(),
    db.member.count({ where: { status: "PENDING" } }),
    db.member.count({ where: { status: "ACTIVE" } }),
    db.event.count({ where: { status: "PUBLISHED", startsAt: { gte: now } } }),
    db.credential.count({ where: { revokedAt: null } }),
    db.opportunity.count({ where: { status: "published", closesAt: { gte: now } } }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { select: { fullName: true } } },
    }),
  ]);

  return {
    totalMembers,
    pendingMembers,
    activeMembers,
    upcomingEvents,
    totalCredentials,
    openOpportunities,
    recentAuditLog: auditRows.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      createdAt: row.createdAt,
      actorName: row.actor?.fullName ?? null,
    })),
  };
});

export type CertificateRow = {
  id: string;
  code: string;
  title: string;
  memberName: string;
  memberId: string;
  issuedAt: Date;
  revokedAt: Date | null;
};

export const getCertificateList = cache(async function getCertificateList(): Promise<
  CertificateRow[]
> {
  const rows = await db.credential.findMany({
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      code: true,
      title: true,
      issuedAt: true,
      revokedAt: true,
      member: { select: { id: true, fullName: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    title: row.title,
    memberName: row.member.fullName,
    memberId: row.member.id,
    issuedAt: row.issuedAt,
    revokedAt: row.revokedAt,
  }));
});

export const getAdminAlbumList = cache(async function getAdminAlbumList() {
  const rows = await db.album.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverUrl: true,
      publishedAt: true,
      eventId: true,
      event: { select: { title: true } },
      _count: { select: { items: true } },
      items: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverUrl: row.coverUrl,
    publishedAt: row.publishedAt,
    eventId: row.eventId,
    eventTitle: row.event?.title ?? null,
    itemCount: row._count.items,
    firstItemUrl: row.items[0]?.url ?? null,
  }));
});
