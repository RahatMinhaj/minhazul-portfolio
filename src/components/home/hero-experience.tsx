"use client";

import {
  ArrowDown,
  ArrowRight,
  Braces,
  CircleDot,
  Cpu,
  Sparkles,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";

import { MagneticElement } from "@/components/animations/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HeroCodeProperty } from "@/features/profile/hero-content";

type HeroExperienceProps = {
  availability: string;
  fullName: string;
  professionalTitle: string;
  shortBio: string;
  currentFocus: string;
  resumeUrl: string | null;
  technologies: string[];
  codeFileLabel: string;
  codeVariableName: string;
  codeProperties: readonly HeroCodeProperty[];
};

export function HeroExperience({
  availability,
  fullName,
  professionalTitle,
  shortBio,
  currentFocus,
  resumeUrl,
  technologies,
  codeFileLabel,
  codeVariableName,
  codeProperties,
}: HeroExperienceProps) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 22 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 22 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);
  const sceneX = useTransform(smoothX, [-0.5, 0.5], [-28, 28]);
  const sceneY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);
  const inverseX = useTransform(smoothX, [-0.5, 0.5], [16, -16]);
  const inverseY = useTransform(smoothY, [-0.5, 0.5], [12, -12]);

  return (
    <section
      aria-labelledby="hero-name"
      className="hero-stage relative mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[96rem] grid-cols-[minmax(0,1fr)] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:px-10"
      id="about-overview"
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      onPointerMove={(event) => {
        if (reduceMotion) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
        pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
      }}
    >
      <motion.div
        aria-hidden
        className="hero-energy-orb"
        style={{ x: sceneX, y: sceneY }}
      />
      <motion.div
        aria-hidden
        className="hero-circuit-field"
        style={{ x: inverseX, y: inverseY }}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <span
            className="hero-circuit-node"
            key={index}
            style={
              {
                "--node-index": index,
              } as React.CSSProperties
            }
          />
        ))}
      </motion.div>

      <div className="relative z-10 min-w-0">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3"
          initial={reduceMotion ? false : { opacity: 0, y: -14 }}
          transition={{ duration: 0.6 }}
        >
          <Badge>
            <CircleDot className="mr-1 animate-pulse" aria-hidden size={11} />
            {availability}
          </Badge>
          <p className="eyebrow">Java · Spring · AI · Distributed systems</p>
        </motion.div>

        <h1
          aria-label={`${fullName}, ${professionalTitle}`}
          className="mt-7 max-w-5xl font-semibold tracking-[-0.065em] text-balance"
          id="hero-name"
        >
          <span className="hero-name-line block text-[clamp(3.6rem,9vw,8.4rem)] leading-[0.82]">
            {fullName.split(" ").map((word, wordIndex, words) => {
              const characterOffset = words
                .slice(0, wordIndex)
                .reduce((total, item) => total + item.length, 0);
              return (
                <span className="inline-block whitespace-nowrap" key={word}>
                  {Array.from(word).map((character, characterIndex) => {
                    const index = characterOffset + wordIndex + characterIndex;
                    return (
                      <motion.span
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        aria-hidden
                        className="hero-letter inline-block"
                        initial={
                          reduceMotion
                            ? false
                            : { opacity: 0, rotateX: -80, y: "0.7em" }
                        }
                        key={`${character}-${index}`}
                        transition={{
                          delay: 0.08 + index * 0.045,
                          duration: 0.65,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        whileHover={
                          reduceMotion
                            ? {}
                            : {
                                y: -10,
                                rotate: index % 2 ? 2 : -2,
                                color: "var(--accent)",
                                transition: { duration: 0.18 },
                              }
                        }
                      >
                        {character}
                      </motion.span>
                    );
                  })}
                  {wordIndex < words.length - 1 ? "\u00a0" : null}
                </span>
              );
            })}
            <motion.span
              animate={{ scaleX: 1 }}
              aria-hidden
              className="hero-name-scan"
              initial={reduceMotion ? false : { scaleX: 0 }}
              transition={{ delay: 0.5, duration: 0.9 }}
            />
          </span>
          <span className="mt-5 block overflow-hidden text-[clamp(1.65rem,4.3vw,4.5rem)] leading-[0.98] text-[var(--accent)]">
            {professionalTitle.split(" ").map((word, index) => (
              <motion.span
                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                aria-hidden
                className="mr-[0.24em] inline-block"
                initial={
                  reduceMotion
                    ? false
                    : { filter: "blur(10px)", opacity: 0, y: "1em" }
                }
                key={word}
                transition={{
                  delay: 0.52 + index * 0.09,
                  duration: 0.55,
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          transition={{ delay: 0.85, duration: 0.55 }}
        >
          {shortBio}
        </motion.p>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-9 flex flex-wrap gap-3 max-sm:grid max-sm:grid-cols-2"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          transition={{ delay: 0.98, duration: 0.5 }}
        >
          <MagneticElement strength={0.12}>
            <Button asChild size="lg">
              <Link data-cursor="Explore work" href="/projects">
                View projects
                <ArrowRight aria-hidden size={16} />
              </Link>
            </Button>
          </MagneticElement>
          <MagneticElement strength={0.1}>
            <Button asChild size="lg" variant="outline">
              <Link
                data-cursor="Open résumé"
                href={resumeUrl ?? "/resume"}
                rel={resumeUrl ? "noreferrer" : undefined}
                target={resumeUrl ? "_blank" : undefined}
              >
                Résumé
              </Link>
            </Button>
          </MagneticElement>
          <a
            className="group inline-flex h-13 items-center gap-2 px-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] max-sm:col-span-2"
            data-cursor="Scroll"
            href="#work-overview"
          >
            Explore
            <ArrowDown
              className="transition-transform group-hover:translate-y-1"
              aria-hidden
              size={15}
            />
          </a>
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-full min-w-0"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        transition={{ delay: 0.35, duration: 0.8 }}
      >
        <div className="hero-console-shell">
          <div className="hero-console-glow" aria-hidden />
          <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-4">
              <span className="size-2 rounded-full bg-red-400/70" />
              <span className="size-2 rounded-full bg-amber-300/70" />
              <span className="size-2 rounded-full bg-emerald-400/70" />
              <span className="ml-3 font-mono text-[10px] text-[var(--muted)]">
                {codeFileLabel}
              </span>
              <Sparkles
                className="ml-auto text-[var(--accent)]"
                aria-hidden
                size={14}
              />
            </div>
            <div className="relative p-6 sm:p-8">
              <motion.div
                animate={reduceMotion ? {} : { y: [0, -5, 0] }}
                className="absolute top-7 right-7 grid size-16 place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)]"
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <Cpu className="text-[var(--accent)]" aria-hidden size={25} />
              </motion.div>
              <Braces
                className="mb-8 text-[var(--accent)]"
                aria-hidden
                size={23}
              />
              <pre className="overflow-x-auto font-mono text-xs leading-7 sm:text-sm">
                <code>
                  <span className="text-violet-300">const</span>{" "}
                  <span className="text-cyan-300">{codeVariableName}</span> ={" "}
                  {"{"}
                  {codeProperties.map((property, index) => (
                    <span key={property.key}>
                      {"\n  "}
                      {property.key}:{" "}
                      <CodePropertyValue value={property.value} />
                      {index < codeProperties.length - 1 ? "," : null}
                    </span>
                  ))}
                  {"\n"}
                  {"}"};
                </code>
              </pre>
              <p className="mt-8 border-l-2 border-[var(--accent)] pl-4 text-sm leading-6 text-[var(--muted)]">
                {currentFocus}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[var(--border)] px-6 py-5">
              {technologies.map((technology, index) => (
                <motion.span
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 font-mono text-[10px] text-[var(--muted)]"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                  key={technology}
                  transition={{ delay: 0.9 + index * 0.06 }}
                  whileHover={{
                    borderColor: "var(--accent)",
                    color: "var(--foreground)",
                    y: -3,
                  }}
                >
                  {technology}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CodePropertyValue({ value }: { value: HeroCodeProperty["value"] }) {
  if (typeof value === "string") {
    return <span className="text-amber-200">{JSON.stringify(value)}</span>;
  }

  return (
    <span className="text-emerald-300">
      {value === null ? "null" : String(value)}
    </span>
  );
}
