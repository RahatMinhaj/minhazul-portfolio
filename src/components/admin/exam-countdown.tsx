"use client";

import { useEffect, useState } from "react";

export function ExamCountdown({
  startedAtIso,
  timeLimitSec,
  formId,
}: {
  startedAtIso: string;
  timeLimitSec: number;
  formId: string;
}) {
  const endsAt = new Date(startedAtIso).getTime() + timeLimitSec * 1000;
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((endsAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        const form = document.getElementById(formId) as HTMLFormElement | null;
        if (form && !form.dataset.autoSubmitted) {
          form.dataset.autoSubmitted = "1";
          form.requestSubmit();
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt, formId]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining <= 60;

  return (
    <div
      className={`sticky top-20 z-10 mb-4 rounded-[var(--radius-control)] border px-4 py-3 text-sm ${
        urgent
          ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
          : "border-[var(--border-strong)] bg-[var(--surface-raised)]"
      }`}
    >
      Time remaining:{" "}
      <span className="font-mono font-semibold">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
      {remaining === 0 ? " · submitting…" : null}
    </div>
  );
}
