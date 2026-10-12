import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCertificateList } from "@/lib/admin/queries";
import { db } from "@/lib/db";
import { longDate } from "@/lib/format";
import { issueCertificatesAction, revokeCredentialAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const [certificates, completedEvents] = await Promise.all([
    getCertificateList(),
    db.event.findMany({
      where: { status: "COMPLETED" },
      orderBy: { startsAt: "desc" },
      select: { id: true, title: true, startsAt: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Certificates</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} issued
        </p>
      </div>

      {/* Issue certificates section */}
      <Card>
        <CardHeader>
          <CardTitle>Issue certificates for an event</CardTitle>
        </CardHeader>
        <CardContent>
          {completedEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No completed events. Mark an event as complete to issue certificates.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {completedEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {longDate(event.startsAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await issueCertificatesAction(event.id);
                    }}
                  >
                    <Button type="submit" size="sm">
                      Issue for this event
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Certificates table */}
      <Table stacked>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Certificate</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                No certificates issued yet.
              </TableCell>
            </TableRow>
          ) : (
            certificates.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell data-label="Member" className="font-medium">
                  {cert.memberName}
                </TableCell>
                <TableCell data-label="Certificate">{cert.title}</TableCell>
                <TableCell data-label="Issued">{longDate(cert.issuedAt)}</TableCell>
                <TableCell data-label="Code" className="font-mono text-sm tabular-nums">
                  {cert.code}
                </TableCell>
                <TableCell data-label="Status">
                  {cert.revokedAt ? (
                    <Badge variant="destructive">Revoked</Badge>
                  ) : (
                    <Badge variant="primary">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!cert.revokedAt && (
                    <form
                      action={async () => {
                        "use server";
                        await revokeCredentialAction(cert.id, "Revoked by admin");
                      }}
                    >
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="text-danger border-danger/40"
                      >
                        Revoke
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
