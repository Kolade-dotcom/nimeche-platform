import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PasswordForm } from "./password-form";
import { requireMember } from "@/lib/member/session";

export const metadata: Metadata = { title: "Settings" };

export default async function MemberSettingsPage() {
  const member = await requireMember();
  return <div className="max-w-2xl space-y-6">
    <div><h1 className="font-heading text-2xl font-bold sm:text-3xl">Settings</h1><p className="text-muted-foreground mt-2">Manage your account access.</p></div>
    <Card className="items-start p-5"><div><h2 className="font-heading text-lg font-bold">Change password</h2><p className="text-muted-foreground mt-1 text-sm">Signed in as {member.email}. Choose a password you have not used elsewhere.</p></div><div className="w-full"><PasswordForm /></div></Card>
  </div>;
}
