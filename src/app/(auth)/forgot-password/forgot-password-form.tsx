"use client";

import { useActionState } from "react";

import { forgotPasswordAction, type AuthState } from "@/app/(auth)/actions";
import { Field } from "@/components/field";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";

const initial: AuthState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <FormAlert message={state.formError} />

      <Field
        id="email"
        label="Tech-U email"
        hint="The address you signed up with."
        error={state.fieldErrors?.email}
      >
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="firstname.lastname@tech-u.edu.ng"
          aria-invalid={Boolean(state.fieldErrors?.email) || undefined}
          required
        />
      </Field>

      <SubmitButton pendingLabel="Sending" className="w-full">
        Email me a reset link
      </SubmitButton>
    </form>
  );
}
