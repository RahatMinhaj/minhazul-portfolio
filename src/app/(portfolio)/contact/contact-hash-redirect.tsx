"use client";

import { useEffect } from "react";

export function ContactHashRedirect() {
  useEffect(() => {
    window.location.replace("/#contact-overview");
  }, []);

  return (
    <main className="flex min-h-[40vh] items-center justify-center px-6">
      <p className="text-sm text-[var(--muted)]">Opening contact…</p>
    </main>
  );
}
