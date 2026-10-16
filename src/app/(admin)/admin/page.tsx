import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTechAdmin } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function TechAdminPage() {
  await requireTechAdmin();
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6 sm:p-10">
      <div>
        <p className="text-muted-foreground text-sm font-medium">TECH TEAM</p>
        <h1 className="font-heading mt-1 text-3xl font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground mt-2">Technical administration for the platform.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Platform settings</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">Review the current environment configuration.</p>
          <Link className="font-semibold text-primary-text underline" href="/admin/settings">Open settings</Link>
        </CardContent>
      </Card>
    </main>
  );
}
