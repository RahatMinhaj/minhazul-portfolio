"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePreserveFormOnError } from "@/hooks/use-preserve-form-on-error";
import type { ContactState } from "@/lib/validation/contact";
import { submitContactMessage } from "@/server/actions/contact";

const initialState: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    initialState,
  );
  const preserveFormValues = usePreserveFormOnError(
    state.status === "error",
    state,
  );

  if (state.status === "success") {
    return (
      <div
        className="rounded-[var(--radius-card)] border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-8"
        role="status"
      >
        <p className="eyebrow">Transmission complete</p>
        <h2 className="mt-3 text-2xl font-semibold">Message received.</h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-5"
      onSubmit={(event) => preserveFormValues(event.currentTarget)}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          autoComplete="name"
          errors={state.errors?.name}
          id="name"
          label="Name"
          name="name"
        />
        <FormField
          autoComplete="email"
          errors={state.errors?.email}
          id="email"
          label="Email"
          name="email"
          type="email"
        />
      </div>
      <FormField
        errors={state.errors?.subject}
        id="subject"
        label="Subject"
        name="subject"
      />
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="message">
          Message
        </label>
        <textarea
          className="min-h-44 w-full resize-y rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
          id="message"
          name="message"
          placeholder="Describe what you would like to discuss…"
          required
        />
        {state.errors?.message?.map((error) => (
          <p className="text-sm text-red-400" key={error}>
            {error}
          </p>
        ))}
      </div>
      <div className="absolute -left-[10000px]" aria-hidden>
        <label htmlFor="company">Company website</label>
        <input autoComplete="off" id="company" name="company" tabIndex={-1} />
      </div>
      {state.status === "error" && state.message ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-red-400/30 bg-red-400/5 p-3 text-sm text-red-300"
        >
          {state.message}
        </p>
      ) : null}
      <Button disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle className="animate-spin" aria-hidden size={16} />
        ) : (
          <Send aria-hidden size={16} />
        )}
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function FormField({
  errors,
  id,
  label,
  ...props
}: React.ComponentProps<typeof Input> & {
  errors?: string[] | undefined;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <Input id={id} required {...props} />
      {errors?.map((error) => (
        <p className="text-sm text-red-400" key={error}>
          {error}
        </p>
      ))}
    </div>
  );
}
