import type { Metadata } from "next";
import { AwardIcon, BadgeCheckIcon, SparklesIcon } from "lucide-react";

import { Well } from "@/components/member/pieces";
import { Card } from "@/components/ui/card";
import { getActivity } from "@/lib/member/queries";
import { requireMember } from "@/lib/member/session";
import { longDate } from "@/lib/format";

export const metadata: Metadata = { title: "My activity" };

export default async function MemberActivityPage() {
  const member = await requireMember();
  const activity = await getActivity(member.id, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">My activity</h1>
        <p className="text-muted-foreground mt-2">A record of your events, certificates, skills and membership updates.</p>
      </div>
      {activity.length === 0 ? <Well>Your activity will appear here as you take part in branch events and programmes.</Well> : (
        <Card className="gap-0 p-5">
          <ol className="divide-border divide-y">
            {activity.map((entry) => (
              <li key={entry.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                <span className="bg-primary-subtle text-primary-text flex size-9 shrink-0 items-center justify-center rounded-full">
                  {entry.kind === "CERTIFICATE_ISSUED" ? <AwardIcon className="size-4" /> : entry.kind === "SKILL_LEVEL_UP" ? <SparklesIcon className="size-4" /> : <BadgeCheckIcon className="size-4" />}
                </span>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{entry.summary}</p><p className="text-muted-foreground mt-1 text-xs">{entry.kind.replaceAll("_", " ")}</p></div>
                <time dateTime={entry.occurredAt.toISOString()} className="text-muted-foreground shrink-0 text-xs">{longDate(entry.occurredAt)}</time>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
