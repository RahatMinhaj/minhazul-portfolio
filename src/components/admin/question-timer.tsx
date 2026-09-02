"use client";

import { useEffect, useRef, useState } from "react";

/** Accumulates active seconds while the question card is focused / being answered. */
export function QuestionTimer({
  itemId,
  initialSec = 0,
}: {
  itemId: string;
  initialSec?: number;
}) {
  const [elapsed, setElapsed] = useState(initialSec);
  const activeRef = useRef(false);
  const elapsedRef = useRef(initialSec);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    elapsedRef.current = elapsed;
    if (inputRef.current) inputRef.current.value = String(elapsed);
  }, [elapsed]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!activeRef.current) return;
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div
      className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]"
      onBlurCapture={() => {
        activeRef.current = false;
      }}
      onFocusCapture={() => {
        activeRef.current = true;
      }}
      onMouseEnter={() => {
        activeRef.current = true;
      }}
      onMouseLeave={() => {
        activeRef.current = false;
      }}
    >
      <span>
        Time on question:{" "}
        <span className="font-mono text-[var(--foreground)]">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </span>
      <input
        ref={inputRef}
        defaultValue={initialSec}
        name={`timeSpent_${itemId}`}
        type="hidden"
      />
    </div>
  );
}
