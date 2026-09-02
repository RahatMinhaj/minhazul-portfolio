"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePreserveFormOnError } from "@/hooks/use-preserve-form-on-error";
import { initialActionState, type ActionState } from "@/types/action-state";

export function AdminMutationForm({
  action,
  children,
  className,
  confirmMessage,
  encType,
  id,
  submitLabel = "Save changes",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children?: React.ReactNode;
  className?: string;
  confirmMessage?: string;
  encType?: "multipart/form-data";
  id?: string;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const preserveFormValues = usePreserveFormOnError(
    state.status === "error",
    state,
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state.message, state.status, state.version]);

  return (
    <form
      action={formAction}
      className={className}
      encType={encType}
      id={id}
      onSubmit={(event) => {
        const autoSubmitted = event.currentTarget.dataset.autoSubmitted === "1";
        if (confirmMessage && !autoSubmitted && !window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }

        preserveFormValues(event.currentTarget);
      }}
    >
      {children}
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit">
      {pending ? (
        <LoaderCircle className="animate-spin" aria-hidden size={15} />
      ) : null}
      {pending ? "Working…" : label}
    </Button>
  );
}
