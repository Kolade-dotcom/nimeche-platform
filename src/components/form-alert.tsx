import { AlertCircleIcon } from "lucide-react";

/** The errors that belong to the form rather than to any one field. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="bg-danger-subtle text-danger flex items-start gap-3 rounded-md px-4 py-3"
    >
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
