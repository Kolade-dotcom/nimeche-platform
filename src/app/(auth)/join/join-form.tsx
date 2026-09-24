"use client";

import { useActionState } from "react";

import { joinAction, type AuthState } from "@/app/(auth)/actions";
import { Field } from "@/components/field";
import { FormAlert } from "@/components/form-alert";
import { PasswordField } from "@/components/password-field";
import { SegmentedField } from "@/components/segmented-field";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { DEPARTMENTS, LEVELS, PASSWORD_MIN } from "@/lib/validation/auth";

const initial: AuthState = {};

const LEVEL_OPTIONS = LEVELS.map((level) => ({ value: level, label: level }));

export function JoinForm() {
  const [state, formAction] = useActionState(joinAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <FormAlert message={state.formError} />

      <Field id="fullName" label="Full name" error={state.fieldErrors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Your name as the school has it"
          aria-invalid={Boolean(state.fieldErrors?.fullName) || undefined}
          required
        />
      </Field>

      <Field
        id="email"
        label="Tech-U email"
        hint="This is how you sign in. Personal addresses are not accepted."
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

      <Field
        id="password"
        label="Password"
        hint={`At least ${PASSWORD_MIN} characters. Tap Show to check it before you go on.`}
        error={state.fieldErrors?.password}
      >
        <PasswordField
          id="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN}
          invalid={Boolean(state.fieldErrors?.password)}
          required
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Department</legend>
        <SegmentedField
          name="department"
          options={DEPARTMENTS}
          invalid={Boolean(state.fieldErrors?.department)}
        />
        {state.fieldErrors?.department ? (
          <p role="alert" className="text-destructive text-[13px] font-medium">
            {state.fieldErrors.department}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Level</legend>
        <SegmentedField
          name="level"
          options={LEVEL_OPTIONS}
          invalid={Boolean(state.fieldErrors?.level)}
        />
        {state.fieldErrors?.level ? (
          <p role="alert" className="text-destructive text-[13px] font-medium">
            {state.fieldErrors.level}
          </p>
        ) : null}
      </fieldset>

      <SubmitButton pendingLabel="Creating your account" className="w-full">
        Create account
      </SubmitButton>

      <p className="text-muted-foreground text-center text-[13px]/relaxed">
        By joining you agree we may store your name, email, department and participation
        record. You can export or delete it at any time.
      </p>
    </form>
  );
}
