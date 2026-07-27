import { FadeIn } from "@/components/animations/fade-in";
import { TextReveal } from "@/components/animations/primitives";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";

export function PageHero({
  eyebrow,
  title,
  description,
  status,
}: {
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
}) {
  return (
    <header className="border-b border-[var(--border)]">
      <Container className="py-16 sm:py-24">
        <FadeIn>
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">{eyebrow}</p>
            {status ? <Badge variant="neutral">{status}</Badge> : null}
          </div>
        </FadeIn>
        <h1 className="mt-5 max-w-5xl text-5xl font-semibold tracking-[-0.05em] text-balance sm:text-7xl">
          <TextReveal>{title}</TextReveal>
        </h1>
        <FadeIn delay={0.18}>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {description}
          </p>
        </FadeIn>
      </Container>
    </header>
  );
}
