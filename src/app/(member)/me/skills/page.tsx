import type { Metadata } from "next";
import { CheckIcon, DownloadIcon, ShieldCheckIcon } from "lucide-react";

import {
  LevelMeter,
  PageIntro,
  Well,
  levelLabel,
  type Level,
} from "@/components/member/pieces";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSkills } from "@/lib/member/queries";
import { requireMember } from "@/lib/member/session";

export const metadata: Metadata = { title: "My skills" };

const LEVEL_NOTES: Record<Level, string> = {
  INTRODUCED: "You have seen it done once.",
  PRACTISING: "You have done it, with help or under review.",
  COMPETENT: "You have done it unaided and it was assessed.",
  VERIFIED: "A named member of staff or industry host signed it off.",
};

export default async function MemberSkillsPage() {
  const member = await requireMember();
  const skills = await getSkills(member.id);

  return (
    <>
      <PageIntro
        title="My skills"
        lede="You did not fill any of this in. Every line below was worked out from what you attended, completed and submitted — which is why it is worth something to an employer and a self-declared skills list is not."
      />

      <Card className="mb-6 flex-row flex-wrap items-center gap-4 p-5">
        <ShieldCheckIcon className="text-primary-text size-6 shrink-0" />
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
          <h2 className="font-heading font-bold">Put this on your CV</h2>
          <p className="text-muted-foreground text-[13px]">
            Export your skills and certificates as a one-page record, with the
            verification codes included.
          </p>
        </div>
        <Button size="sm" disabled>
          <DownloadIcon /> Export as PDF
        </Button>
      </Card>

      {skills.length === 0 ? (
        <Well>
          Nothing here yet. Levels appear as you attend events and complete what they ask
          for.
        </Well>
      ) : (
        <div className="mb-7 grid gap-4 lg:grid-cols-2">
          {skills.map((skill) => (
            <Card key={skill.id} className="gap-3.5 p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-base font-bold">{skill.name}</h2>
                <Badge
                  variant={
                    skill.level === "VERIFIED" || skill.level === "COMPETENT"
                      ? "primary"
                      : "default"
                  }
                >
                  {levelLabel(skill.level)}
                </Badge>
              </div>

              <LevelMeter level={skill.level} />

              <div>
                <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.09em] uppercase">
                  How you got here
                </span>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {skill.evidence.map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <CheckIcon className="text-primary-text mt-1 size-3.5 shrink-0" />
                      <span className="text-muted-foreground text-[13px]">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {skill.verifiedBy ? (
                <Well>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheckIcon className="size-4 shrink-0" />
                    Verified by {skill.verifiedBy}
                  </span>
                </Well>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <Card className="gap-4 p-5">
        <h2 className="font-heading text-lg font-bold">How the four levels work</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(LEVEL_NOTES) as Level[]).map((level) => (
            <div key={level} className="flex flex-col gap-1">
              <strong className="text-sm font-semibold">{levelLabel(level)}</strong>
              <span className="text-muted-foreground text-[13px]">
                {LEVEL_NOTES[level]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-[13px]">
          Only the fourth needs a human. The first three are counted from your record, and
          they move on their own as you take part.
        </p>
      </Card>
    </>
  );
}
