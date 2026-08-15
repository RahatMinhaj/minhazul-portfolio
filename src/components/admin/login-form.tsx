"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePreserveFormOnError } from "@/hooks/use-preserve-form-on-error";
import type { LoginState } from "@/lib/validation/auth";
import { loginAction } from "@/server/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const preserveFormValues = usePreserveFormOnError(
    Boolean(state.message || state.errors),
    state,
  );

  return (
    <form
      action={formAction}
      className="mt-8 space-y-5"
      onSubmit={(event) => preserveFormValues(event.currentTarget)}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="username">
          Username
        </label>
        <Input
          autoComplete="username"
          id="username"
          name="username"
          placeholder="admin"
          required
          type="text"
        />
        {state.errors?.username?.map((error) => (
          <p className="text-sm text-red-400" key={error}>
            {error}
          </p>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          required
          type="password"
        />
        {state.errors?.password?.map((error) => (
          <p className="text-sm text-red-400" key={error}>
            {error}
          </p>
        ))}
      </div>
      {state.message ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-(--border) bg-(--surface-raised) p-3 text-sm text-(--muted)"
        >
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle className="animate-spin" aria-hidden size={16} />
        ) : (
          <LockKeyhole aria-hidden size={16} />
        )}
        {pending ? "Verifying…" : "Sign in securely"}
      </Button>
    </form>
  );
}
