"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { changePasswordAction, type SettingsState } from "./actions";

const initialState: SettingsState = {};

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initialState);
  return (
    <form action={action} className="space-y-4">
      {(["currentPassword", "newPassword", "confirmPassword"] as const).map((name) => {
        const labels = { currentPassword: "Current password", newPassword: "New password", confirmPassword: "Confirm new password" };
        return <div key={name} className="space-y-1.5"><label htmlFor={name} className="text-sm font-medium">{labels[name]}</label><input id={name} name={name} type="password" autoComplete={name === "currentPassword" ? "current-password" : "new-password"} required minLength={name === "currentPassword" ? undefined : 8} maxLength={72} className="border-input bg-surface h-11 w-full rounded-md border px-3 text-sm" /></div>;
      })}
      {state.error ? <p role="alert" className="text-danger text-sm">{state.error}</p> : null}
      {state.success ? <p role="status" className="text-primary-text text-sm">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Updating…" : "Change password"}</Button>
    </form>
  );
}
