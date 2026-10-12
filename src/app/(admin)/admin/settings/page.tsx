import { RoleKey } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // Settings page is ADMIN-only — more restrictive than most admin pages
  await requireRole([RoleKey.ADMIN]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "(not set)";
  const nodeEnv = process.env.NODE_ENV ?? "(not set)";
  const emailFrom = process.env.EMAIL_FROM ?? "NiMechE-SF <onboarding@resend.dev>";
  const hasResendKey = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Environment-level configuration. These are read-only in Phase 1 — update them
          in your .env.local file and redeploy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="NODE_ENV" value={nodeEnv} />
          <Row label="Site URL" value={siteUrl} />
          <Row label="Email from" value={emailFrom} />
          <Row
            label="Email sending"
            value={
              hasResendKey ? "Active (RESEND_API_KEY set)" : "Disabled — printing to console"
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to update settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="text-muted-foreground list-inside list-decimal space-y-2">
            <li>
              Open <code className="bg-muted rounded px-1 py-0.5">.env.local</code> at the
              project root (copy from <code className="bg-muted rounded px-1 py-0.5">.env.example</code> if missing).
            </li>
            <li>Set the relevant variable and save.</li>
            <li>Restart the dev server, or redeploy to apply in production.</li>
          </ol>
          <p className="text-muted-foreground mt-3">
            Database credentials (DATABASE_URL, DIRECT_URL) are managed on the Neon
            dashboard. AUTH_SECRET can be rotated but will sign everyone out.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="font-mono font-medium break-all text-right">{value}</dd>
    </div>
  );
}
