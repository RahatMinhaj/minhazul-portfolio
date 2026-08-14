"use client";

import {
  ArrowUp,
  Bot,
  ExternalLink,
  LoaderCircle,
  MessageCircleMore,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

type SourceLink = { title: string; href: string };
type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: SourceLink[] | undefined;
};

const welcomeMessage: ChatMessage = {
  id: 0,
  role: "assistant",
  content:
    "Welcome. You are connected to Minhaz's Personal Chatbot Assistant, a privacy-aware guide grounded in Minhazul's published professional portfolio.",
};

const suggestions = [
  "What is Minhazul's core stack?",
  "Summarize his enterprise project experience.",
  "How has he applied AI in software projects?",
] as const;

export function PortfolioChatbot() {
  const launcherRef = useRef<HTMLButtonElement>(null);
  const nextMessageId = useRef(1);
  const panelRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        !panelRef.current?.contains(target) &&
        !launcherRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    const focusTimer = window.setTimeout(
      () => textareaRef.current?.focus(),
      120,
    );

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  function clearConversation() {
    setMessages([welcomeMessage]);
    setInput("");
    nextMessageId.current = 1;
  }

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
          content:
            "I could not reach the assistant. Please check your connection and try again.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.section
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-describedby="portfolio-chat-description"
            aria-labelledby="portfolio-chat-title"
            className="fixed right-3 bottom-20 z-50 flex h-[min(36rem,72dvh)] w-[calc(100vw-1.5rem)] max-w-[26rem] origin-bottom-right flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface)_97%,transparent)] shadow-2xl backdrop-blur-xl sm:right-7 sm:bottom-24 sm:h-[min(39rem,76dvh)] sm:w-[25rem]"
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            id="portfolio-chat-panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            ref={panelRef}
            role="dialog"
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="relative overflow-hidden border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-raised)_56%,transparent)] p-4 pr-24">
              <div
                className="absolute top-0 right-10 h-24 w-40 bg-[radial-gradient(circle,var(--accent),transparent_68%)] opacity-10"
                aria-hidden
              />
              <div className="relative flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--accent)] shadow-[var(--shadow-control)]">
                  <Bot aria-hidden size={18} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      className="truncate text-sm font-semibold"
                      id="portfolio-chat-title"
                    >
                      Minhaz&apos;s AI Assistant
                    </h2>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[8px] text-emerald-300 uppercase">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Online
                    </span>
                  </div>
                  <p
                    className="mt-0.5 truncate text-[10px] text-[var(--muted)]"
                    id="portfolio-chat-description"
                  >
                    Grounded in published portfolio content
                  </p>
                </div>
              </div>
            </header>

            <div className="absolute top-4 right-3 z-10 flex items-center gap-0.5">
              {messages.length > 1 ? (
                <button
                  aria-label="Clear conversation"
                  className="grid size-9 place-items-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  onClick={clearConversation}
                  type="button"
                >
                  <RotateCcw aria-hidden size={15} />
                </button>
              ) : null}
              <button
                aria-label="Close Minhaz's Personal Chatbot Assistant"
                className="grid size-8 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X aria-hidden size={17} />
              </button>
            </div>

            <div
              aria-live="polite"
              aria-relevant="additions text"
              className="min-h-0 flex-1 overflow-y-auto bg-[color-mix(in_srgb,var(--background)_72%,var(--surface))] px-3 py-4"
              role="log"
            >
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <ChatMessageItem key={message.id} message={message} />
                ))}

                {messages.length === 1 ? (
                  <div className="ml-9">
                    <p className="mb-2.5 font-mono text-[9px] tracking-[0.16em] text-[var(--muted)] uppercase">
                      Try asking
                    </p>
                    <div className="grid gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-left text-xs leading-5 text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                          key={suggestion}
                          onClick={() => void askQuestion(suggestion)}
                          type="button"
                        >
                          {suggestion}
                          <Sparkles
                            className="shrink-0 text-[var(--accent)] opacity-55 transition-opacity group-hover:opacity-100"
                            aria-hidden
                            size={13}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {pending ? (
                  <div className="flex items-start gap-3" role="status">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
                      <Bot aria-hidden size={15} />
                    </span>
                    <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--muted)] shadow-[var(--shadow-card)]">
                      <LoaderCircle
                        className="animate-spin"
                        aria-hidden
                        size={14}
                      />
                      Reviewing portfolio evidence
                    </div>
                  </div>
                ) : null}
                <div ref={transcriptEndRef} />
              </div>
            </div>

            <form
              className="border-t border-[var(--border)] bg-[var(--surface)] p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void askQuestion(input);
              }}
            >
              <div>
                <div className="flex items-end gap-2 rounded-2xl bg-[var(--background)] p-2 shadow-[inset_0_0_0_1px_var(--border-strong)]">
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Ask a portfolio question</span>
                    <textarea
                      className="max-h-28 min-h-11 w-full resize-none bg-transparent px-2.5 py-2.5 text-sm leading-6 outline-none placeholder:text-[var(--muted)] focus-visible:outline-none"
                      disabled={pending}
                      maxLength={500}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void askQuestion(input);
                        }
                      }}
                      placeholder="Ask about experience, projects, or skills"
                      rows={1}
                      ref={textareaRef}
                      value={input}
                    />
                  </label>
                  <button
                    aria-label="Send question"
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[var(--shadow-control)] transition-[opacity,transform] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-35"
                    disabled={pending || !input.trim()}
                    type="submit"
                  >
                    {pending ? (
                      <LoaderCircle
                        className="animate-spin"
                        aria-hidden
                        size={17}
                      />
                    ) : (
                      <ArrowUp aria-hidden size={18} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-3 px-1 text-[9px] leading-4 text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck aria-hidden size={12} />
                    Not stored · Gemini / OpenRouter fallback
                  </span>
                  <span>{input.length}/500</span>
                </div>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        aria-controls="portfolio-chat-panel"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          open ? "Close portfolio assistant" : "Open portfolio assistant"
        }
        className="group fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-2.5 pr-4 text-left shadow-[var(--shadow-card)] backdrop-blur-xl transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-glow)] sm:right-7 sm:bottom-7"
        onClick={() => setOpen((current) => !current)}
        ref={launcherRef}
        type="button"
      >
        <span className="relative grid size-10 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[var(--shadow-control)]">
          {open ? (
            <X aria-hidden size={19} />
          ) : (
            <MessageCircleMore aria-hidden size={19} />
          )}
          {!open ? (
            <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-[var(--surface)] bg-emerald-400" />
          ) : null}
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-semibold">
            {open ? "Close assistant" : "Chat with Minhaz AI"}
          </span>
          <span className="mt-0.5 block text-[10px] tracking-wider text-[var(--muted)] uppercase">
            Portfolio guide
          </span>
        </span>
      </button>
    </>
  );
}

function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      aria-label={`${isUser ? "You" : "Minhaz's Personal Chatbot Assistant"}: ${message.content}`}
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-xl border",
          isUser
            ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]",
        )}
      >
        {isUser ? (
          <UserRound aria-hidden size={14} />
        ) : (
          <Bot aria-hidden size={15} />
        )}
      </span>
      <div className={cn("max-w-[84%]", isUser && "text-right")}>
        <p className="mb-1.5 font-mono text-[9px] tracking-[0.14em] text-[var(--muted)] uppercase">
          {isUser ? "You" : "Minhaz AI"}
        </p>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-left text-sm leading-6 shadow-[var(--shadow-card)]",
            isUser
              ? "rounded-tr-sm bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "rounded-tl-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.sources?.length ? (
            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <p className="mb-2 font-mono text-[9px] tracking-[0.14em] text-[var(--muted)] uppercase">
                Portfolio sources
              </p>
              <div className="grid gap-1.5">
                {message.sources.map((source) => (
                  <Link
                    className="group flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-raised)] px-3 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                    href={source.href}
                    key={`${source.href}-${source.title}`}
                  >
                    <span className="truncate">{source.title}</span>
                    <ExternalLink
                      className="shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)]"
                      aria-hidden
                      size={12}
                    />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
