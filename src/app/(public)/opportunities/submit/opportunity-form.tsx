"use client";

import { useActionState } from "react";

import {
  submitOpportunityAction,
  type OpportunityFormState,
} from "@/app/(public)/opportunities/actions";

const initial: OpportunityFormState = {};

const OPPORTUNITY_TYPES = [
  { value: "internship", label: "Internship" },
  { value: "job", label: "Job" },
  { value: "scholarship", label: "Scholarship" },
  { value: "competition", label: "Competition" },
  { value: "grant", label: "Grant" },
  { value: "conference", label: "Conference" },
  { value: "training", label: "Training" },
  { value: "volunteering", label: "Volunteering" },
];

export function OpportunityForm() {
  const [state, formAction] = useActionState(submitOpportunityAction, initial);

  if (state.ok) {
    return (
      <div
        role="alert"
        className="border-primary-text/20 bg-primary-subtle rounded-xl border p-8 text-center"
      >
        <p className="font-heading mb-2 text-[20px] font-bold">Thank you</p>
        <p className="text-muted-foreground">
          We have received your submission and will review it shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {state.error && (
        <div role="alert" className="text-danger-text bg-danger-subtle rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-semibold">
          Opportunity title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          placeholder="e.g. Summer Internship — Mechanical Design"
          aria-invalid={Boolean(state.fieldErrors?.title) || undefined}
          aria-describedby={state.fieldErrors?.title ? "title-error" : undefined}
          className="border-border-strong bg-surface min-h-[50px] rounded-lg border px-4 text-base focus:outline focus:outline-2 focus:outline-offset-0"
        />
        {state.fieldErrors?.title && (
          <p id="title-error" role="alert" className="text-danger-text text-[13px]">
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      {/* Organisation */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="organisation" className="text-sm font-semibold">
          Organisation
        </label>
        <input
          id="organisation"
          name="organisation"
          type="text"
          required
          maxLength={100}
          placeholder="e.g. NSE Oyo Branch"
          aria-invalid={Boolean(state.fieldErrors?.organisation) || undefined}
          aria-describedby={state.fieldErrors?.organisation ? "org-error" : undefined}
          className="border-border-strong bg-surface min-h-[50px] rounded-lg border px-4 text-base focus:outline focus:outline-2 focus:outline-offset-0"
        />
        {state.fieldErrors?.organisation && (
          <p id="org-error" role="alert" className="text-danger-text text-[13px]">
            {state.fieldErrors.organisation}
          </p>
        )}
      </div>

      {/* Type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="type" className="text-sm font-semibold">
          Type
        </label>
        <select
          id="type"
          name="type"
          required
          aria-invalid={Boolean(state.fieldErrors?.type) || undefined}
          aria-describedby={state.fieldErrors?.type ? "type-error" : undefined}
          className="border-border-strong bg-surface min-h-[50px] rounded-lg border px-4 text-base focus:outline focus:outline-2 focus:outline-offset-0"
        >
          <option value="">Choose a type…</option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.type && (
          <p id="type-error" role="alert" className="text-danger-text text-[13px]">
            {state.fieldErrors.type}
          </p>
        )}
      </div>

      {/* Deadline */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="deadline" className="text-sm font-semibold">
          Application deadline
        </label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          required
          aria-invalid={Boolean(state.fieldErrors?.deadline) || undefined}
          aria-describedby={state.fieldErrors?.deadline ? "deadline-error" : undefined}
          className="border-border-strong bg-surface min-h-[50px] rounded-lg border px-4 text-base focus:outline focus:outline-2 focus:outline-offset-0"
        />
        {state.fieldErrors?.deadline && (
          <p id="deadline-error" role="alert" className="text-danger-text text-[13px]">
            {state.fieldErrors.deadline}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-semibold">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          maxLength={1000}
          placeholder="Describe the opportunity, eligibility, and what applicants should know."
          aria-invalid={Boolean(state.fieldErrors?.description) || undefined}
          aria-describedby={state.fieldErrors?.description ? "desc-error" : undefined}
          className="border-border-strong bg-surface min-h-[120px] rounded-lg border px-4 py-3 text-base focus:outline focus:outline-2 focus:outline-offset-0"
        />
        {state.fieldErrors?.description && (
          <p id="desc-error" role="alert" className="text-danger-text text-[13px]">
            {state.fieldErrors.description}
          </p>
        )}
      </div>

      {/* External URL */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="externalUrl" className="text-sm font-semibold">
          Application link{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="externalUrl"
          name="externalUrl"
          type="url"
          inputMode="url"
          placeholder="https://…"
          aria-invalid={Boolean(state.fieldErrors?.externalUrl) || undefined}
          aria-describedby={state.fieldErrors?.externalUrl ? "url-error" : undefined}
          className="border-border-strong bg-surface min-h-[50px] rounded-lg border px-4 text-base focus:outline focus:outline-2 focus:outline-offset-0"
        />
        {state.fieldErrors?.externalUrl && (
          <p id="url-error" role="alert" className="text-danger-text text-[13px]">
            {state.fieldErrors.externalUrl}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-primary text-primary-foreground min-h-[50px] rounded-lg px-6 font-semibold transition-opacity hover:opacity-90 focus:outline focus:outline-2 focus:outline-offset-2"
      >
        Submit opportunity
      </button>

      <p className="text-muted-foreground text-center text-[13px]/relaxed">
        No account needed. Submissions are reviewed by the exec before going live.
      </p>
    </form>
  );
}
