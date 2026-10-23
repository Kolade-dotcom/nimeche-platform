"use client";

import { useActionState } from "react";
import { SendIcon } from "lucide-react";

import {
  submitFresherIssueAction,
  type FresherFormState,
} from "@/app/(public)/freshers/actions";
import { Field } from "@/components/field";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";

const initial: FresherFormState = {};

export function FresherIssueForm() {
  const [state, action] = useActionState(submitFresherIssueAction, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormAlert message={state.message} />
      {state.successMessage ? (
        <p
          role="status"
          className="bg-success-subtle text-success rounded-lg px-4 py-3 text-sm font-medium"
        >
          {state.successMessage}
        </p>
      ) : null}

      <Field id="type" label="What do you need?" error={state.fieldErrors?.type}>
        <select
          id="type"
          name="type"
          defaultValue="REQUEST"
          required
          aria-invalid={Boolean(state.fieldErrors?.type) || undefined}
          className="border-input bg-surface focus-visible:ring-ring h-12 w-full rounded-sm border px-4 text-base outline-none focus-visible:ring-2"
        >
          <option value="REQUEST">I need help with something</option>
          <option value="INQUIRY">I have a question</option>
          <option value="COMPLAINT">I want to report a problem</option>
          <option value="OTHER">Something else</option>
        </select>
      </Field>

      <Field id="area" label="Topic" error={state.fieldErrors?.area}>
        <select
          id="area"
          name="area"
          defaultValue="ROOM_AND_HOSTEL"
          required
          aria-invalid={Boolean(state.fieldErrors?.area) || undefined}
          className="border-input bg-surface focus-visible:ring-ring h-12 w-full rounded-sm border px-4 text-base outline-none focus-visible:ring-2"
        >
          <option value="ROOM_AND_HOSTEL">Room or hostel</option>
          <option value="ARRIVAL_AND_DIRECTIONS">Arrival or directions</option>
          <option value="REGISTRATION">Registration or clearance</option>
          <option value="FEES">Fees or payment</option>
          <option value="ACADEMIC">Academic or department</option>
          <option value="SAFETY">Safety</option>
          <option value="OTHER">Other</option>
        </select>
      </Field>

      <Field id="subject" label="Short subject" error={state.fieldErrors?.subject}>
        <Input
          id="subject"
          name="subject"
          maxLength={120}
          placeholder="e.g. I need help finding my hostel"
          aria-invalid={Boolean(state.fieldErrors?.subject) || undefined}
          required
        />
      </Field>

      <Field
        id="message"
        label="Tell us what is happening"
        hint="Include enough detail for someone to understand what help you need."
        error={state.fieldErrors?.message}
      >
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={3000}
          placeholder="Write your message here"
          aria-invalid={Boolean(state.fieldErrors?.message) || undefined}
          required
          className="border-input bg-surface placeholder:text-muted-foreground w-full resize-y rounded-sm border px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        />
      </Field>

      <SubmitButton pendingLabel="Sending to the team" className="w-full sm:w-auto sm:self-start">
        Send to the executive team <SendIcon />
      </SubmitButton>
      <p className="text-muted-foreground text-xs/relaxed">
        Your name and contact number will be included so an executive can follow up. The
        executive team can see messages sent through this form.
      </p>
    </form>
  );
}
