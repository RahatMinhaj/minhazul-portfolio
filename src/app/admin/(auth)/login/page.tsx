import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center px-5 py-16"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <span className="grid size-11 place-items-center rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-foreground)]">
            <ShieldCheck aria-hidden size={20} />
          </span>
          <p className="eyebrow mt-8">Restricted system</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Portfolio administration
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Authenticate with the administrator account configured during the
            secure database seed.
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
