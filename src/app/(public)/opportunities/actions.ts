"use server";

import { submitOpportunity } from "@/lib/opportunities/queries";
import { opportunitySubmitSchema } from "@/lib/validation/opportunity";

export type OpportunityFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function submitOpportunityAction(
  _prev: OpportunityFormState,
  formData: FormData
): Promise<OpportunityFormState> {
  const raw = {
    title: formData.get("title") as string,
    organisation: formData.get("organisation") as string,
    type: formData.get("type") as string,
    deadline: formData.get("deadline") as string,
    description: formData.get("description") as string,
    externalUrl: (formData.get("externalUrl") as string) || "",
  };

  const parsed = opportunitySubmitSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  try {
    await submitOpportunity({
      ...parsed.data,
      externalUrl: parsed.data.externalUrl || undefined,
    });
    return { ok: true };
  } catch (err) {
    console.error("[submitOpportunityAction]", err);
    return { error: "Submission failed — please try again." };
  }
}
