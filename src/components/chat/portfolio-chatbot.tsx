"use client";

import {
  ArrowUp,
  Atom,
  Bot,
  CheckCircle2,
  ExternalLink,
  MessageCircleMore,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  WandSparkles,
  WifiOff,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

import { cn } from "@/lib/utils/cn";

type SourceLink = { title: string; href: string };
type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: SourceLink[] | undefined;
  retryQuestion?: string | undefined;
  status?: "error" | undefined;
};

type ChatPayload = {
  answer?: string;
  message?: string;
  sources?: SourceLink[];
};

class ChatRequestError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
  }
}

const invitationStorageKey = "portfolio-chat-invitation-v1";

const welcomeMessage: ChatMessage = {
  id: 0,
  role: "assistant",
  content:
    "Hi, I am Minhazul's portfolio copilot. Ask me to connect his experience, projects, and technical strengths to what matters to you.",
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
  const pendingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(invitationStorageKey)) return;
    } catch {
      return;
    }

    const invitationTimer = window.setTimeout(
      () => setShowInvitation(true),
      3500,
    );
    return () => window.clearTimeout(invitationTimer);
  }, []);

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
    if (pendingRef.current) return;
    setMessages([welcomeMessage]);
    setInput("");
    nextMessageId.current = 1;
  }

  function dismissInvitation() {
    setShowInvitation(false);
    try {
      window.localStorage.setItem(invitationStorageKey, "dismissed");
    } catch {
      // The invitation can still be dismissed when storage is unavailable.
    }
  }

  function openChat() {
    dismissInvitation();
    setOpen(true);
  }

  async function askQuestion(
    question: string,
    options: { appendUserMessage?: boolean } = {},
  ) {
    const normalized = question.trim();
    if (!normalized || pendingRef.current) return;

    const appendUserMessage = options.appendUserMessage !== false;

    let history = messages
      .filter((message) => message.id !== 0 && message.status !== "error")
      .slice(-6)
      .map(({ role, content }) => ({ role, content: content.slice(0, 1000) }));
    if (
      !appendUserMessage &&
      history.at(-1)?.role === "user" &&
      history.at(-1)?.content === normalized
    ) {
      history = history.slice(0, -1);
    }

    if (appendUserMessage) {
      const userMessage: ChatMessage = {
        id: nextMessageId.current++,
        role: "user",
        content: normalized,
      };
      setMessages((current) => [...current, userMessage]);
    } else {
      setMessages((current) =>
        current.filter(
          (message) =>
            !(
              message.status === "error" && message.retryQuestion === normalized
            ),
        ),
      );
    }
    setInput("");
    pendingRef.current = true;
    setPending(true);

    try {
      const payload = await requestChatAnswer(normalized, history);

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
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "I could not reach the assistant. Please try again.";
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId.current++,
          role: "assistant",
          content: message,
          retryQuestion:
            !(error instanceof ChatRequestError) || error.retryable
              ? normalized
              : undefined,
          status: "error",
        },
      ]);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.section
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            aria-describedby="portfolio-chat-description"
            aria-labelledby="portfolio-chat-title"
            className="fixed right-2 bottom-2 z-50 flex h-[min(46rem,calc(100dvh-1rem))] w-[calc(100vw-1rem)] origin-bottom-right flex-col overflow-hidden rounded-[calc(var(--radius-card)+0.5rem)] border border-[color-mix(in_srgb,var(--accent)_26%,var(--border-strong))] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] shadow-[0_36px_110px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:right-7 sm:bottom-24 sm:h-[min(43rem,78dvh)] sm:w-[29rem]"
            exit={{ opacity: 0, scale: 0.96, y: 14, filter: "blur(3px)" }}
            id="portfolio-chat-panel"
            initial={{ opacity: 0, scale: 0.94, y: 18, filter: "blur(4px)" }}
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <motion.span
                animate={{ scale: [1, 1.08, 1], x: [0, 8, 0], y: [0, -6, 0] }}
                className="absolute -top-24 -right-16 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_28%,transparent),transparent_68%)] opacity-70"
                transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
              />
              <motion.span
                animate={{ scale: [1, 1.12, 1], x: [0, -10, 0], y: [0, 10, 0] }}
                className="absolute -bottom-28 -left-16 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_70%)] opacity-80"
                transition={{ duration: 9.5, ease: "easeInOut", repeat: Infinity }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-raised)_42%,transparent),transparent_35%,color-mix(in_srgb,var(--accent)_6%,transparent))]" />
            </div>
            <header className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-raised)_94%,transparent),color-mix(in_srgb,var(--accent)_8%,var(--surface)))] p-5 pr-24">
              <div className="absolute inset-y-0 left-0 w-1 bg-[var(--accent)]" />
              <div
                className="absolute top-0 right-10 h-24 w-40 bg-[radial-gradient(circle,var(--accent),transparent_68%)] opacity-10"
                aria-hidden
              />
              <div className="relative flex items-center gap-3">
                <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--accent)_36%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))] text-[var(--accent)] shadow-[var(--shadow-control)]">
                  <WandSparkles aria-hidden size={19} />
                  <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-[var(--surface)] bg-emerald-400" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      className="truncate text-sm font-semibold"
                      id="portfolio-chat-title"
                    >
                      Portfolio intelligence
                    </h2>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-mono text-[9px] text-[var(--muted)] uppercase">
                      <CheckCircle2 aria-hidden size={10} />
                      Evidence-linked
                    </span>
                  </div>
                  <p
                    className="mt-0.5 truncate text-[10px] text-[var(--muted)]"
                    id="portfolio-chat-description"
                  >
                    Ask about work, systems, skills, and experience
                  </p>
                </div>
              </div>
            </header>

            <div className="absolute top-4 right-3 z-10 flex items-center gap-0.5">
              {messages.length > 1 ? (
                <button
                  aria-label="Clear conversation"
                  className="grid size-9 place-items-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  disabled={pending}
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
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    onRetry={(question) =>
                      void askQuestion(question, { appendUserMessage: false })
                    }
                  />
                ))}

                {messages.length === 1 ? (
                  <div className="ml-9">
                    <p className="mb-2.5 font-mono text-[9px] tracking-[0.16em] text-[var(--muted)] uppercase">
                      Try asking
                    </p>
                    <div className="grid gap-2">
                      {suggestions.map((suggestion) => (
                        <motion.button
                          className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-left text-xs leading-5 text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                          key={suggestion}
                          onClick={() => void askQuestion(suggestion)}
                          type="button"
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.985 }}
                        >
                          {suggestion}
                          <Sparkles
                            className="shrink-0 text-[var(--accent)] opacity-55 transition-opacity group-hover:opacity-100"
                            aria-hidden
                            size={13}
                          />
                        </motion.button>
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
                      <TypingDots />
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
                <div className="flex items-end gap-2 rounded-2xl bg-[var(--background)] p-2 shadow-[inset_0_0_0_1px_var(--border-strong)] transition-shadow focus-within:shadow-[inset_0_0_0_1px_var(--accent),var(--shadow-control)]">
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Ask a portfolio question</span>
                    <textarea
                      className="max-h-28 min-h-11 w-full resize-none bg-transparent px-2.5 py-2.5 text-sm leading-6 outline-none placeholder:text-[var(--muted)] focus-visible:outline-none"
                      disabled={pending}
                      maxLength={500}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
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
                      <TypingDots />
                    ) : (
                      <ArrowUp aria-hidden size={18} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-3 px-1 text-[9px] leading-4 text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck aria-hidden size={12} />
                    Private session · responses may take a moment
                  </span>
                  <span>{input.length}/500</span>
                </div>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showInvitation && !open ? (
          <motion.aside
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-label="Portfolio assistant invitation"
            className="fixed right-3 bottom-22 z-50 w-[calc(100vw-1.5rem)] max-w-[22rem] origin-bottom-right overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:right-7 sm:bottom-25"
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="absolute -top-16 -right-12 size-36 rounded-full bg-[var(--accent)] opacity-10 blur-3xl"
              aria-hidden
            />
            <button
              aria-label="Dismiss chat invitation"
              className="absolute top-3 right-3 grid size-9 place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]"
              onClick={dismissInvitation}
              type="button"
            >
              <X aria-hidden size={15} />
            </button>
            <div className="relative flex items-start gap-3 pr-7">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[var(--shadow-glow)]">
                <Sparkles aria-hidden size={18} />
              </span>
              <div>
                <p className="eyebrow">Interactive portfolio</p>
                <h2 className="mt-1 text-base font-semibold">
                  Want the guided version?
                </h2>
              </div>
            </div>
            <p className="relative mt-4 text-sm leading-6 text-[var(--muted)]">
              Ask the AI assistant to connect Minhazul&apos;s projects, skills,
              and experience to what you are looking for.
            </p>
            <div className="relative mt-4 flex gap-2">
              <button
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow-control)] transition-transform hover:-translate-y-0.5"
                onClick={openChat}
                type="button"
              >
                Start exploring
                <ArrowUp className="rotate-45" aria-hidden size={15} />
              </button>
              <button
                className="min-h-11 rounded-xl px-4 text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]"
                onClick={dismissInvitation}
                type="button"
              >
                Not now
              </button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <motion.button
        aria-controls="portfolio-chat-panel"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          open ? "Close portfolio assistant" : "Open portfolio assistant"
        }
        className={cn(
          "group fixed right-4 bottom-4 z-50 flex items-center gap-3 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--accent)_30%,var(--border-strong))] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-2.5 pr-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-glow)] sm:right-7 sm:bottom-7",
          open && "max-sm:hidden",
        )}
        onClick={() => (open ? setOpen(false) : openChat())}
        ref={launcherRef}
        type="button"
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          animate={open ? {} : { rotate: [0, 2, -2, 0] }}
          className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[linear-gradient(130deg,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_45%,color-mix(in_srgb,var(--accent)_18%,transparent))]"
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        />
        <span className="relative grid size-11 place-items-center overflow-visible rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[var(--shadow-control)]">
          {!open ? (
            <>
              <span className="absolute inset-[-6px] -z-10 animate-pulse rounded-[1rem] border border-[color-mix(in_srgb,var(--accent)_45%,transparent)]" />
              <motion.span
                animate={{ rotate: 360 }}
                className="absolute inset-[-9px] -z-20 rounded-[1.25rem] border border-dashed border-[color-mix(in_srgb,var(--accent)_35%,transparent)]"
                transition={{ duration: 8, ease: "linear", repeat: Infinity }}
              />
            </>
          ) : null}
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
          <span className="mt-0.5 inline-flex items-center gap-1.5 text-[10px] tracking-wider text-[var(--muted)] uppercase">
            <Atom aria-hidden size={11} />
            Portfolio guide
          </span>
        </span>
      </motion.button>
    </>
  );
}

function ChatMessageItem({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry: (question: string) => void;
}) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const retryQuestion = message.retryQuestion;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-xl border",
          isUser
            ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
            : isError
              ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]",
        )}
      >
        {isUser ? (
          <UserRound aria-hidden size={14} />
        ) : isError ? (
          <WifiOff aria-hidden size={15} />
        ) : (
          <Bot aria-hidden size={15} />
        )}
      </span>
      <div className={cn("max-w-[84%]", isUser && "text-right")}>
        <p className="mb-1.5 font-mono text-[9px] tracking-[0.14em] text-[var(--muted)] uppercase">
          {isUser ? "You" : isError ? "Connection note" : "Minhaz AI"}
        </p>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-left text-sm leading-6 shadow-[var(--shadow-card)]",
            isUser
              ? "rounded-tr-sm bg-[var(--accent)] text-[var(--accent-foreground)]"
              : isError
                ? "rounded-tl-sm border border-amber-400/25 bg-amber-400/8 text-[var(--foreground)]"
                : "rounded-tl-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
          )}
        >
          {isUser || isError ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <FormattedAssistantMessage content={message.content} />
          )}
          {retryQuestion ? (
            <button
              className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-amber-400/25 bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              onClick={() => onRetry(retryQuestion)}
              type="button"
            >
              <RotateCcw aria-hidden size={13} />
              Retry question
            </button>
          ) : null}
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
    </motion.div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((index) => (
        <motion.span
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          className="size-1.5 rounded-full bg-current"
          key={index}
          transition={{
            duration: 0.9,
            ease: "easeInOut",
            repeat: Infinity,
            delay: index * 0.12,
          }}
        />
      ))}
    </span>
  );
}

function FormattedAssistantMessage({ content }: { content: string }) {
  return (
    <Markdown
      components={{
        a: ({ href, children }) => {
          if (href?.startsWith("/")) {
            return (
              <Link
                className="font-medium text-[var(--accent)] underline"
                href={href}
              >
                {children}
              </Link>
            );
          }
          return (
            <a
              className="font-medium text-[var(--accent)] underline"
              href={href}
              rel="noreferrer"
              target="_blank"
            >
              {children}
            </a>
          );
        },
        code: ({ children }) => (
          <code className="rounded bg-[var(--surface-raised)] px-1.5 py-0.5 font-mono text-[0.82em] text-[var(--accent)]">
            {children}
          </code>
        ),
        h1: ({ children }) => (
          <h3 className="mt-4 mb-1 font-semibold first:mt-0">{children}</h3>
        ),
        h2: ({ children }) => (
          <h3 className="mt-4 mb-1 font-semibold first:mt-0">{children}</h3>
        ),
        h3: ({ children }) => (
          <h3 className="mt-4 mb-1 font-semibold first:mt-0">{children}</h3>
        ),
        li: ({ children }) => <li className="pl-0.5">{children}</li>,
        ol: ({ children }) => (
          <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
        ),
        p: ({ children }) => (
          <p className="my-2 first:mt-0 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-[var(--foreground)]">
            {children}
          </strong>
        ),
        ul: ({ children }) => (
          <ul className="my-2 list-disc space-y-1 pl-5 marker:text-[var(--accent)]">
            {children}
          </ul>
        ),
      }}
    >
      {content}
    </Markdown>
  );
}

async function requestChatAnswer(
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
) {
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history }),
    });
  } catch {
    throw new ChatRequestError(
      "The connection was interrupted. You can retry this question.",
      true,
    );
  }

  const payload = (await response.json().catch(() => ({}))) as ChatPayload;
  if (response.ok) return payload;

  throw new ChatRequestError(
    payload.message ??
      (response.status === 429
        ? "The hourly chat limit has been reached. Please try later."
        : "The assistant could not answer right now."),
    response.status === 502,
  );
}
