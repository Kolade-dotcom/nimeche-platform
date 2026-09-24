"use client";

import { useActionState } from "react";

import { resetPasswordAction, type AuthState } from "@/app/(auth)/actions";
import { Field } from "@/components/field";
import { FormAlert } from "@/components/form-alert";
import { PasswordField } from "@/components/password-field";
import { SubmitButton } from "@/components/submit-button";
import { PASSWORD_MIN } from "@/lib/validation/auth";

const initial: AuthState = {};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <FormAlert message={state.formError} />

      <Field
        id="password"
        label="New password"
        hint={`At least ${PASSWORD_MIN} characters. Tap Show to check it before you go on.`}
        error={state.fieldErrors?.password}
      >
        <PasswordField
          id="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN}
          invalid={Boolean(state.fieldErrors?.password)}
          required
          autoFocus
        />
      </Field>

      <SubmitButton pendingLabel="Saving" className="w-full">
        Set my new password
      </SubmitButton>
    </form>
  );
}
