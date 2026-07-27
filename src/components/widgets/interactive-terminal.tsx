"use client";

import { ChevronRight, TerminalSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { FormEvent, useState } from "react";

import { themeIds } from "@/config/themes";

type TerminalLine = {
  id: number;
  command?: string;
  output: string;
};

const commandHelp =
  "help · about · skills · experience · projects · contact · resume · theme [name] · whoami · stack · availability · clear";

export function InteractiveTerminal({
  availability,
  profileName,
}: {
  availability: string;
  profileName: string;
}) {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 0,
      output: `Safe portfolio terminal ready. Type “help” for ${commandHelp}.`,
    },
  ]);
  const router = useRouter();
  const { setTheme } = useTheme();

  function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = input.trim();
    const [command = "", argument = ""] = raw.toLowerCase().split(/\s+/, 2);
    setInput("");

    if (command === "clear") {
      setLines([]);
      return;
    }

    const routeCommands: Record<string, string> = {
      about: "/about",
      skills: "/skills",
      experience: "/experience",
      projects: "/projects",
      contact: "/contact",
      resume: "/resume",
    };
    let output = "";

    if (routeCommands[command]) {
      output = `Opening ${routeCommands[command]}…`;
      router.push(routeCommands[command]);
    } else if (command === "help") {
      output = commandHelp;
    } else if (command === "whoami") {
      output = profileName;
    } else if (command === "availability") {
      output = availability;
    } else if (command === "stack") {
      output = "Verified technologies are available on /skills.";
    } else if (command === "theme") {
      if (themeIds.includes(argument as (typeof themeIds)[number])) {
        setTheme(argument);
        output = `Theme changed to ${argument}.`;
      } else {
        output = `Available themes: ${themeIds.join(", ")}`;
      }
    } else if (!command) {
      output = "";
    } else {
      output = `Unknown safe command: ${command}. Type “help”.`;
    }

    setLines((current) => [
      ...current,
      { id: Date.now(), command: raw, output },
    ]);
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[#050807] shadow-[var(--shadow-card)]">
      <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-emerald-300">
        <TerminalSquare aria-hidden size={16} />
        <h2 className="font-mono text-xs">portfolio-terminal</h2>
      </header>
      <div
        aria-live="polite"
        className="h-72 overflow-y-auto p-5 font-mono text-xs leading-6 text-emerald-100/75"
      >
        {lines.map((line) => (
          <div className="mb-3" key={line.id}>
            {line.command ? (
              <p className="text-emerald-300">$ {line.command}</p>
            ) : null}
            <p>{line.output}</p>
          </div>
        ))}
      </div>
      <form
        className="flex items-center border-t border-white/10 px-4"
        onSubmit={runCommand}
      >
        <ChevronRight className="text-emerald-300" aria-hidden size={15} />
        <label className="sr-only" htmlFor="terminal-command">
          Terminal command
        </label>
        <input
          autoComplete="off"
          className="h-12 w-full bg-transparent px-2 font-mono text-xs text-emerald-100 outline-none"
          id="terminal-command"
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          value={input}
        />
      </form>
    </section>
  );
}
