"use client";

import { Keyboard, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const target = "build reliable systems with clear intent";

export function TypingChallenge() {
  const [input, setInput] = useState("");
  const accuracy = useMemo(() => {
    if (!input.length) return 100;
    const correct = [...input].filter(
      (character, index) => character === target[index],
    ).length;
    return Math.round((correct / input.length) * 100);
  }, [input]);
  const completed = input === target;

  return (
    <Card>
      <CardHeader>
        <Keyboard className="text-[var(--accent)]" aria-hidden size={20} />
        <CardTitle className="pt-4">Typing challenge</CardTitle>
        <CardDescription>
          A lightweight keyboard warm-up isolated from the portfolio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg bg-[var(--surface-raised)] p-4 font-mono text-sm">
          {target}
        </p>
        <label className="mt-4 block">
          <span className="sr-only">Type the displayed phrase</span>
          <input
            className="h-12 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 font-mono text-sm outline-none focus:border-[var(--accent)]"
            maxLength={target.length}
            onChange={(event) => setInput(event.target.value)}
            value={input}
          />
        </label>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
          <span>Accuracy: {accuracy}%</span>
          <span>
            {completed ? "Complete." : `${input.length}/${target.length}`}
          </span>
          <Button
            aria-label="Reset typing challenge"
            onClick={() => setInput("")}
            size="icon"
            variant="ghost"
          >
            <RotateCcw aria-hidden size={15} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
