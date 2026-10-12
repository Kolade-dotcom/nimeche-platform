import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { longDate } from "@/lib/format";
import { publishOpportunityAction, rejectOpportunityAction } from "./actions";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  internship: "Internship",
  job: "Job",
  scholarship: "Scholarship",
  competition: "Competition",
  grant: "Grant",
  conference: "Conference",
  training: "Training",
  volunteering: "Volunteering",
};

export default async function OpportunitiesPage() {
  const [reviewQueue, published] = await Promise.all([
    db.opportunity.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        organisation: true,
        type: true,
        closesAt: true,
        status: true,
        createdAt: true,
        description: true,
      },
    }),
    db.opportunity.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        organisation: true,
        type: true,
        closesAt: true,
        publishedAt: true,
        description: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Opportunities</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and publish member-submitted opportunities.
        </p>
      </div>

      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">
            Review queue{reviewQueue.length > 0 ? ` (${reviewQueue.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          {reviewQueue.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No opportunities in the review queue.
            </p>
          ) : (
            <ul className="space-y-3 pt-2">
              {reviewQueue.map((item) => (
                <li key={item.id}>
                  <Card>
                    <CardContent className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{item.title}</p>
                          <Badge variant="default">
                            {TYPE_LABELS[item.type] ?? item.type}
                          </Badge>
                          <Badge variant="accent">{item.status}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {item.organisation} · Deadline: {longDate(item.closesAt)}
                        </p>
                        {item.description && (
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {item.description}
                          </p>
                        )}
                        <p className="text-muted-foreground text-xs">
                          Submitted {longDate(item.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <form
                          action={async () => {
                            "use server";
                            await publishOpportunityAction(item.id);
                          }}
                        >
                          <Button type="submit" size="sm">
                            Publish
                          </Button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await rejectOpportunityAction(item.id);
                          }}
                        >
                          <Button type="submit" size="sm" variant="outline">
                            Reject
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="published">
          {published.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No published opportunities.
            </p>
          ) : (
            <ul className="space-y-3 pt-2">
              {published.map((item) => (
                <li key={item.id}>
                  <Card>
                    <CardContent className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.title}</p>
                        <Badge variant="primary">
                          {TYPE_LABELS[item.type] ?? item.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {item.organisation} · Deadline: {longDate(item.closesAt)}
                        {item.publishedAt && ` · Published: ${longDate(item.publishedAt)}`}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
