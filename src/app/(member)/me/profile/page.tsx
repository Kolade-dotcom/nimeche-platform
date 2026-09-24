import Link from "next/link";
import type { Metadata } from "next";
import {
  AwardIcon,
  DatabaseIcon,
  GlobeIcon,
  QrCodeIcon,
  SmartphoneIcon,
} from "lucide-react";

import { BrandLockup } from "@/components/brand-mark";
import { MemberAvatar } from "@/components/member/member-avatar";
import {
  Code,
  Fact,
  LevelMeter,
  StatTile,
  Well,
  levelLabel,
} from "@/components/member/pieces";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCredentials, getProfileTotals, getSkills } from "@/lib/member/queries";
import { requireMember } from "@/lib/member/session";
import { monthYear } from "@/lib/format";

export const metadata: Metadata = { title: "My profile" };

const DEPARTMENTS: Record<string, string> = {
  MECHANICAL: "Mechanical Engineering",
  MECHATRONICS: "Mechatronics Engineering",
};

const STATUSES: Record<string, string> = {
  PENDING: "Awaiting approval",
  ACTIVE: "Active member",
  LAPSED: "Lapsed",
  ALUMNUS: "Alumnus",
};

export default async function MemberProfilePage() {
  const member = await requireMember();

  const [totals, skills, credentials] = await Promise.all([
    getProfileTotals(member.id),
    getSkills(member.id),
    getCredentials(member.id),
  ]);

  const department = member.department ? DEPARTMENTS[member.department] : null;
  const subtitle = [department, member.level ? `${member.level} level` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="mb-7 flex flex-wrap items-start gap-5">
        <MemberAvatar fullName={member.fullName} size={72} />
        <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-bold">{member.fullName}</h1>
            <Badge variant={member.status === "ACTIVE" ? "primary" : "default"}>
              {STATUSES[member.status] ?? member.status}
            </Badge>
            {member.execTitle ? <Badge variant="accent">{member.execTitle}</Badge> : null}
          </div>
          <p className="text-muted-foreground">
            {subtitle}
            {member.joinedAt ? ` · Member since ${monthYear(member.joinedAt)}` : null}
          </p>
        </div>
        <Button variant="outline" size="sm" disabled>
          Edit profile
        </Button>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <Card className="gap-5 p-5">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg font-bold">Membership record</h2>
              <span className="text-muted-foreground text-[13px]">
                Kept for you. You do not fill any of this in.
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Fact label="Tech-U email" value={member.email} />
              <Fact
                label="Matric number"
                value={<span className="tabular-nums">{member.matricNo ?? "—"}</span>}
              />
              <Fact
                label="Member number"
                value={<span className="tabular-nums">{member.memberNo ?? "—"}</span>}
              />
              <Fact label="Department" value={department ?? "—"} />
              <Fact label="Level" value={member.level ?? "—"} />
              <Fact
                label="Expected graduation"
                value={member.expectedGraduation ?? "—"}
              />
            </div>
            <Well>
              Your matric number came from the department roll when an executive approved
              you. Nobody typed it, and if it is wrong, tell an executive rather than
              editing it here — it is what ties this record to the school&rsquo;s.
            </Well>
          </Card>

          <Card className="gap-4 p-5">
            <h2 className="font-heading text-lg font-bold">This session</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile value={totals.activities} label="activities" />
              <StatTile value={totals.certificates} label="certificates" />
              <StatTile value={totals.contactHours} label="contact hours" />
              <StatTile value={totals.skills} label="skills building" />
            </div>
          </Card>

          <Card className="gap-5 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold">
                Skills, from what you have done
              </h2>
              <Link
                href="/me/skills"
                className="text-primary-text text-[13px] font-semibold"
              >
                See all
              </Link>
            </div>
            <ul className="flex flex-col gap-4">
              {skills.slice(0, 4).map((skill) => (
                <li key={skill.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-semibold">{skill.name}</strong>
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
                  <span className="text-muted-foreground text-[13px]">
                    {skill.verifiedBy
                      ? `Verified by ${skill.verifiedBy}`
                      : skill.evidence[0]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground text-[13px]">
              You never fill this in. Levels move as you attend, complete and submit
              things, which is what makes them worth putting in front of an employer.
            </p>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="gap-0 overflow-hidden border-0 p-0">
            <div className="bg-band px-5 pt-5 pb-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <BrandLockup size={40} knockout />
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
                  Member
                </span>
              </div>
              <div className="mt-6 flex flex-col gap-1">
                <h2 className="font-heading text-xl font-bold">{member.fullName}</h2>
                <p className="text-sm text-white/80">{subtitle}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold tracking-[0.09em] text-white/70 uppercase">
                    Matric number
                  </span>
                  <span className="font-semibold tabular-nums">
                    {member.matricNo ?? "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold tracking-[0.09em] text-white/70 uppercase">
                    Member since
                  </span>
                  <span className="font-semibold">
                    {member.joinedAt ? monthYear(member.joinedAt) : "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-surface flex flex-wrap gap-2 px-5 py-4">
              <Button variant="outline" size="sm" disabled>
                <SmartphoneIcon /> Save to phone
              </Button>
              <Button variant="outline" size="sm" disabled>
                <QrCodeIcon /> Show QR
              </Button>
            </div>
          </Card>

          <Card className="gap-3.5 p-5">
            <div className="flex items-start gap-3">
              <GlobeIcon className="text-primary-text mt-0.5 size-5 shrink-0" />
              <div className="flex flex-col gap-1">
                <h2 className="font-heading font-bold">Public profile</h2>
                <p className="text-muted-foreground text-[13px]">
                  {member.publicProfile ? "On" : "Off"}. Turn it on and you get a
                  shareable page at{" "}
                  <span className="font-mono text-[12px]">
                    /u/{member.publicSlug ?? "your-name"}
                  </span>{" "}
                  — useful on a CV, and you choose what shows.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Preview and turn on
            </Button>
          </Card>

          <Card className="gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-base font-bold">Certificates</h2>
              <Link
                href="/me/certificates"
                className="text-primary-text text-[13px] font-semibold"
              >
                All {credentials.length}
              </Link>
            </div>
            <ul className="flex flex-col gap-3">
              {credentials.slice(0, 2).map((credential) => (
                <li key={credential.id} className="flex items-start gap-3">
                  <AwardIcon className="text-primary-text mt-0.5 size-[18px] shrink-0" />
                  <div className="flex min-w-0 flex-col gap-1">
                    <strong className="text-sm font-semibold">{credential.title}</strong>
                    <Code>{credential.code}</Code>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="gap-3.5 p-5">
            <div className="flex items-start gap-3">
              <DatabaseIcon className="text-primary-text mt-0.5 size-5 shrink-0" />
              <div className="flex flex-col gap-1">
                <h2 className="font-heading font-bold">Your data</h2>
                <p className="text-muted-foreground text-[13px]">
                  Export everything the branch holds about you, or ask for it to be
                  deleted. Certificates already issued stay verifiable either way.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled>
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-danger border-border-strong"
              >
                Delete my account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
