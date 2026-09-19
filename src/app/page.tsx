import Link from "next/link";
import { AwardIcon, ArrowRightIcon, BriefcaseIcon, SparklesIcon } from "lucide-react";

import { BrandLockup } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * A placeholder home page that exercises the wiring: design tokens ->
 * Tailwind utilities -> shadcn components, in both themes. The real screens
 * are designed in docs/design/screens/ and get built section by section.
 */
export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="border-border bg-surface sticky top-0 z-30 border-b">
        <div className="mx-auto flex min-h-[70px] w-full max-w-[1180px] items-center gap-6 px-6">
          <BrandLockup />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm">Join NiMechE-SF</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-6 py-16">
        <Badge variant="primary">Setup complete</Badge>
        <h1 className="mt-5 max-w-[20ch] text-4xl font-bold sm:text-5xl">
          The work you do here should still count after you graduate.
        </h1>
        <p className="text-muted-foreground mt-5 max-w-[60ch] text-lg">
          This is the scaffold, not the site. The design system is wired up and the
          fifteen designed screens are ready to build against.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button>
            Join NiMechE-SF <ArrowRightIcon />
          </Button>
          <Button variant="outline">See what is on</Button>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: AwardIcon,
              title: "Certificates that verify",
              body: "Finish a programme and the certificate arrives, carrying a code anyone can check without an account.",
            },
            {
              icon: SparklesIcon,
              title: "A skill record you did not fill in",
              body: "Attend a clinic, work on a build, present at a review. The platform works out what you have practised.",
            },
            {
              icon: BriefcaseIcon,
              title: "Internships and competitions",
              body: "Openings from partner firms and the NSE Oyo branch, filtered to your department and level.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardHeader>
                <span className="bg-primary-subtle text-primary-text mb-1 flex size-10 items-center justify-center rounded-md">
                  <Icon className="size-5" />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-14">
          <CardHeader>
            <CardTitle>Where the design lives</CardTitle>
            <CardDescription>
              Fifteen responsive screens, one HTML file each, covering the public site,
              signing in, the member dashboard and the executive dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 text-sm">
            <Link
              className="underline underline-offset-4"
              href="https://github.com/Kolade-dotcom/nimeche-platform/tree/main/docs/design/screens"
            >
              docs/design/screens
            </Link>
            <Link
              className="underline underline-offset-4"
              href="https://github.com/Kolade-dotcom/nimeche-platform/blob/main/docs/design/DESIGN_PLAN.md"
            >
              Design plan
            </Link>
            <Link
              className="underline underline-offset-4"
              href="https://github.com/Kolade-dotcom/nimeche-platform/blob/main/docs/dev/DEV_PLAN.md"
            >
              Development plan
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
