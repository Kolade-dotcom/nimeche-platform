import { auth } from "@/auth";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  const session = await auth();
  return (
    <SiteHeaderClient
      signedIn={Boolean(session?.user)}
      hasExecutiveDashboard={session?.user?.isExecutive === true}
    />
  );
}
