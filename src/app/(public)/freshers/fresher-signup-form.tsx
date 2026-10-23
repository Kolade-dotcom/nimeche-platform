"use client";

import { useActionState } from "react";
import { ArrowRightIcon } from "lucide-react";

import {
  fresherSignupAction,
  type FresherFormState,
} from "@/app/(public)/freshers/actions";
import { Field } from "@/components/field";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";

const initial: FresherFormState = {};

export function FresherSignupForm() {
  const [state, action] = useActionState(fresherSignupAction, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormAlert message={state.message} />
      <label aria-hidden="true" className="hidden" htmlFor="freshers-website">
        Leave this field empty
      </label>
      <input
        id="freshers-website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />

      <Field id="fullName" label="Your name" error={state.fieldErrors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Name you go by"
          aria-invalid={Boolean(state.fieldErrors?.fullName) || undefined}
          required
        />
      </Field>

      <Field
        id="phone"
        label="Phone or WhatsApp number"
        hint="Include your country code if it is not a Nigerian number."
        error={state.fieldErrors?.phone}
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="e.g. 0801 234 5678"
          aria-invalid={Boolean(state.fieldErrors?.phone) || undefined}
          required
        />
      </Field>

      <Field id="department" label="Department" error={state.fieldErrors?.department}>
        <select
          id="department"
          name="department"
          defaultValue=""
          required
          aria-invalid={Boolean(state.fieldErrors?.department) || undefined}
          className="border-input bg-surface focus-visible:ring-ring h-12 w-full rounded-sm border px-4 text-base outline-none focus-visible:ring-2"
        >
          <option value="" disabled>
            Choose your department
          </option>
          <option value="MECHANICAL">Mechanical Engineering</option>
          <option value="MECHATRONICS">Mechatronics Engineering</option>
        </select>
      </Field>

      <SubmitButton pendingLabel="Getting your support page ready" className="w-full">
        Continue <ArrowRightIcon />
      </SubmitButton>
      <p className="text-muted-foreground text-xs/relaxed">
        Your contact details and messages are shared with the NiMechE-SF executive team
        so they can respond. You do not need a matric number or school email.
      </p>
    </form>
  );
}
