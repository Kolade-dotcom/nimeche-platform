"use client";

import { useActionState } from "react";
import { SaveIcon } from "lucide-react";

import { Field } from "@/components/field";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";

import { saveFresherContactNumbers, type FresherContactFormState } from "./actions";

const initialState: FresherContactFormState = {};

export function FresherContactsForm({
  presidentPhone,
  executiveSupportPhone,
  staffAdviserPhone,
}: {
  presidentPhone: string;
  executiveSupportPhone: string;
  staffAdviserPhone: string;
}) {
  const [state, action] = useActionState(saveFresherContactNumbers, initialState);

  return (
    <form action={action} className="space-y-4">
      <FormAlert message={state.message} />
      {state.successMessage ? (
        <p role="status" className="bg-primary-subtle text-primary-text rounded-md px-4 py-3 text-sm font-medium">
          {state.successMessage}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="presidentPhone" label="President" error={state.fieldErrors?.presidentPhone}>
          <Input
            id="presidentPhone"
            name="presidentPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={presidentPhone}
            placeholder="Phone or WhatsApp number"
            aria-invalid={Boolean(state.fieldErrors?.presidentPhone) || undefined}
            required
          />
        </Field>
        <Field
          id="executiveSupportPhone"
          label="Executive support"
          error={state.fieldErrors?.executiveSupportPhone}
        >
          <Input
            id="executiveSupportPhone"
            name="executiveSupportPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={executiveSupportPhone}
            placeholder="Phone or WhatsApp number"
            aria-invalid={Boolean(state.fieldErrors?.executiveSupportPhone) || undefined}
            required
          />
        </Field>
        <Field
          id="staffAdviserPhone"
          label="Staff adviser"
          hint="Leave this blank to show “Number coming soon”."
          error={state.fieldErrors?.staffAdviserPhone}
          className="sm:col-span-2"
        >
          <Input
            id="staffAdviserPhone"
            name="staffAdviserPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={staffAdviserPhone}
            placeholder="Number coming soon"
            aria-invalid={Boolean(state.fieldErrors?.staffAdviserPhone) || undefined}
          />
        </Field>
      </div>
      <SubmitButton pendingLabel="Saving contacts">
        Save contact numbers <SaveIcon />
      </SubmitButton>
    </form>
  );
}
