"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction, type AuthState } from "@/app/(auth)/actions";
import { Field } from "@/components/field";
import { FormAlert } from "@/components/form-alert";
import { PasswordField } from "@/components/password-field";
import { SubmitButton } from "@/components/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = {};

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signInAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FormAlert message={state.formError} />

      <Field
        id="email"
        label="Tech-U email"
        hint="The address the school gave you."
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
        error={state.fieldErrors?.password}
        action={
          <Link href="/forgot-password" className="text-[13px] font-semibold">
            Forgot your password?
          </Link>
        }
      >
        <PasswordField
          id="password"
          autoComplete="current-password"
          invalid={Boolean(state.fieldErrors?.password)}
          required
        />
      </Field>

      <SubmitButton pendingLabel="Signing you in" className="w-full">
        Sign in
      </SubmitButton>

      <div className="flex items-center gap-3">
        <Checkbox id="remember" name="remember" defaultChecked />
        <Label htmlFor="remember" className="font-normal">
          Keep me signed in on this phone
        </Label>
      </div>

      <div className="bg-surface-sunken rounded-lg px-5 py-4">
        <p className="text-muted-foreground text-sm">
          Only Tech-U addresses can sign in. If yours is not working, ask an executive to
          check that you are on the list.
        </p>
      </div>
    </form>
  );
}
