import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Well } from "@/components/member/pieces";
import { getOpportunities } from "@/lib/member/queries";
import { requireMember } from "@/lib/member/session";
import { longDate } from "@/lib/format";

export const metadata: Metadata = { title: "Opportunities" };

export default async function MemberOpportunitiesPage() {
  const member = await requireMember();
  const opportunities = await getOpportunities(member, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Opportunities</h1>
        <p className="text-muted-foreground mt-2">Openings filtered by your department and level. Check each listing for its application details.</p>
      </div>
      {opportunities.length === 0 ? (
        <Well>No matching opportunities are open right now. Check back as new listings are published.</Well>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {opportunities.map((item) => (
            <Card key={item.id} className="items-start p-5">
              <div className="flex w-full items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-bold">{item.title}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">{item.organisation}</p>
                </div>
                <Badge variant="accent">{item.type}</Badge>
              </div>
              {item.description ? <p className="text-muted-foreground text-sm">{item.description}</p> : null}
              <p className="text-muted-foreground text-sm">{item.location ?? (item.isRemote ? "Remote" : "Location not specified")} · Closes {longDate(item.closesAt)}</p>
              {item.externalUrl ? <Button asChild size="sm"><a href={item.externalUrl} target="_blank" rel="noreferrer">View application</a></Button> : <p className="text-muted-foreground text-xs">Contact the organisation for application details.</p>}
            </Card>
          ))}
        </div>
      )}
      <Link href="/opportunities" className="text-primary-text text-sm font-semibold">Browse all public listings</Link>
    </div>
  );
}
