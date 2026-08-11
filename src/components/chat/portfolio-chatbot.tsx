"use client";

import { Bot, CornerDownLeft, LoaderCircle, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

type SourceLink = { title: string; href: string };
type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: SourceLink[] | undefined;
};

const suggestions = [
  "What is Minhazul's core stack?",
  "Tell me about his enterprise projects.",
  "What experience does he have with AI?",
] as const;

export function PortfolioChatbot() {
  const nextMessageId = useRef(1);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Ask about Minhazul's experience, projects, skills, education, or availability.",
    },
  ]);

  async function askQuestion(question: string) {
    const normalized = question.trim();
    if (!normalized || pending) return;

    const history = messages
      .filter((message) => message.id !== 0)
      .slice(-6)
      .map(({ role, content }) => ({ role, content }));
    const userMessage: ChatMessage = {
      id: nextMessageId.current++,
      role: "user",
      content: normalized,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: normalized, history }),
      });
      const payload = (await response.json()) as {
        answer?: string;
        message?: string;
        sources?: SourceLink[];
      };

      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          role: "assistant",
          content:
            payload.answer ??
            payload.message ??
            "The portfolio assistant could not answer that question.",
          sources: payload.sources,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          role: "assistant",
          content: "The portfolio assistant is temporarily unavailable.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="group fixed right-5 bottom-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-card)] transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-glow)] sm:right-7 sm:bottom-7"
          data-cursor="Ask AI"
          type="button"
        >
          <span className="relative grid size-7 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
            <Sparkles aria-hidden size={15} />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border border-[var(--surface)] bg-[var(--accent)]" />
          </span>
          Ask about me
        </button>
      </DialogTrigger>
      <DialogContent className="flex h-[min(42rem,85dvh)] max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="mb-0 border-b border-[var(--border)] p-5 pr-14">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--accent)]">
              <Bot aria-hidden size={19} />
            </span>
            <div>
              <DialogTitle className="text-lg">Portfolio assistant</DialogTitle>
              <DialogDescription>
                Answers from published portfolio information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogClose
          aria-label="Close portfolio assistant"
          className="absolute top-5 right-5 grid size-9 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]"
        >
          <X aria-hidden size={17} />
        </DialogClose>

        <div
          aria-live="polite"
          className="flex-1 space-y-4 overflow-y-auto p-5"
        >
          {messages.map((message) => (
            <div
              className={cn(
                "max-w-[88%] rounded-[var(--radius-card)] px-4 py-3 text-sm leading-6",
                message.role === "user"
                  ? "ml-auto bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--foreground)]",
              )}
              key={message.id}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.sources?.length ? (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                  {message.sources.map((source) => (
                    <Link
                      className="text-xs font-medium text-[var(--accent)] hover:underline"
                      href={source.href}
                      key={`${source.href}-${source.title}`}
                    >
                      {source.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {messages.length === 1 ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  className="rounded-full border border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                  key={suggestion}
                  onClick={() => void askQuestion(suggestion)}
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
          {pending ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-xs text-[var(--muted)]">
              <LoaderCircle className="animate-spin" aria-hidden size={13} />
              Reading the portfolio…
            </div>
          ) : null}
        </div>

        <form
          className="border-t border-[var(--border)] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void askQuestion(input);
          }}
        >
          <div className="flex items-end gap-2 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--background)] p-2 focus-within:border-[var(--accent)]">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Ask a portfolio question</span>
              <textarea
                className="max-h-28 min-h-11 w-full resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-[var(--muted)]"
                disabled={pending}
                maxLength={500}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about experience, projects, or skills…"
                rows={1}
                value={input}
              />
            </label>
            <Button
              aria-label="Send question"
              disabled={pending || !input.trim()}
              size="icon"
              type="submit"
            >
              <CornerDownLeft aria-hidden size={16} />
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] leading-4 text-[var(--muted)]">
            AI-generated answers can be inaccurate. Questions are sent to Google
            Gemini and are not stored by this site.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
