"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { initialActionState, type ActionState } from "@/types/action-state";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} size="sm" type="submit">
      {pending ? <LoaderCircle className="animate-spin" aria-hidden size={15} /> : null}
      {pending ? "Working…" : label}
    </Button>
  );
}

export function InterviewPrepRedirectForm({
  action,
  children,
  className,
  redirectToPrefix,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  /** Path prefix; success redirects to `${redirectToPrefix}/${id}`. */
  redirectToPrefix: string;
  submitLabel: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    async (_state: ActionState, formData: FormData): Promise<ActionState> => {
      const result = await action(_state, formData);
      if (result.status === "success" && typeof result.data?.id === "string") {
        const base = redirectToPrefix.replace(/\/$/, "");
        router.push(`${base}/${result.data.id}`);
      }
      return result;
    },
    initialActionState,
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state.message, state.status, state.version]);

  return (
    <form action={formAction} className={className}>
      {children}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
