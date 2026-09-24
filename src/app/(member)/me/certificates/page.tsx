import type { Metadata } from "next";
import { DownloadIcon, PenLineIcon, Share2Icon, TriangleAlertIcon } from "lucide-react";

import { Code, PageIntro, StatRow, StatTile, Well } from "@/components/member/pieces";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCredentials,
  getOutstanding,
  getVerificationChecks,
} from "@/lib/member/queries";
import { requireMember } from "@/lib/member/session";
import { dueWording, longDate } from "@/lib/format";

export const metadata: Metadata = { title: "My certificates" };

export default async function MemberCertificatesPage() {
  const member = await requireMember();

  const [credentials, outstanding, checks] = await Promise.all([
    getCredentials(member.id),
    getOutstanding(member.id),
    getVerificationChecks(member.id),
  ]);

  const contactHours = credentials.reduce((sum, c) => sum + c.contactHours, 0);

  return (
    <>
      <PageIntro
        title="My certificates"
        lede="Each one carries a code. An employer enters that code and sees what you completed — years from now, without making an account, and without asking you for anything."
      />

      <StatRow>
        <StatTile value={credentials.length} label="issued to you" />
        <StatTile value={outstanding.length} label="on the way" />
        <StatTile value={contactHours} label="contact hours" />
        <StatTile value={checks.length} label="verification checks" />
      </StatRow>

      <div className="mb-7 grid gap-4 lg:grid-cols-2">
        {credentials.map((credential) => (
          <Card key={credential.id} className="gap-0 overflow-hidden p-0">
            <div className="bg-primary-subtle flex flex-col gap-2 px-5 py-5">
              <span className="text-primary-text text-[11px] font-semibold tracking-[0.09em] uppercase">
                Certificate of completion
              </span>
              <h2 className="font-heading text-lg font-bold">{credential.title}</h2>
              <p className="text-muted-foreground text-[13px]">
                Issued {longDate(credential.issuedAt)} ·{" "}
                {plural(credential.sessions, "session")}, {credential.contactHours}{" "}
                contact hours
              </p>
            </div>
            <div className="flex flex-col gap-3.5 px-5 py-4">
              <div className="flex flex-wrap gap-2">
                {credential.skills.map((skill) => (
                  <Badge key={skill} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Code>{credential.code}</Code>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <DownloadIcon /> PDF
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Share2Icon /> Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {outstanding.length > 0 ? (
        <Card className="mb-7 gap-4 p-5">
          <h2 className="font-heading text-lg font-bold">On the way</h2>
          {outstanding.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-4">
              <TriangleAlertIcon className="text-accent-text size-5 shrink-0" />
              <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
                <strong className="text-[15px] font-semibold">{item.eventTitle}</strong>
                <p className="text-muted-foreground text-[13px]">
                  You were checked in on the day. The certificate is issued as soon as
                  your visit note is in — there is nothing to claim. It is{" "}
                  {dueWording(item.dueAt)}.
                </p>
              </div>
              <Button size="sm" disabled>
                <PenLineIcon /> Write the note
              </Button>
            </div>
          ))}
        </Card>
      ) : null}

      <Card className="gap-4 p-5">
        <h2 className="font-heading text-lg font-bold">
          Who has checked your certificates
        </h2>
        {checks.length === 0 ? (
          <Well>Nobody has entered one of your codes yet.</Well>
        ) : (
          <Table stacked>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Checked</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checks.map((check) => (
                <TableRow key={check.id}>
                  <TableCell data-label="Certificate">
                    <strong className="font-semibold">{check.credentialTitle}</strong>
                  </TableCell>
                  <TableCell data-label="Code">
                    <Code>{check.credentialCode}</Code>
                  </TableCell>
                  <TableCell data-label="Checked">{longDate(check.checkedAt)}</TableCell>
                  <TableCell data-label="Result">
                    {check.verified ? (
                      <Badge variant="primary">Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Revoked</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <p className="text-muted-foreground text-[13px]">
          We show you that a check happened and when. We do not show who ran it, because
          we do not ask them to identify themselves.
        </p>
      </Card>
    </>
  );
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
