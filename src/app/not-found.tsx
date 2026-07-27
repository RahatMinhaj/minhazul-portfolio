import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-6 py-24"
    >
      <p className="eyebrow">404 / Route not found</p>
      <h1 className="mt-5 text-5xl font-semibold tracking-tight">
        This path is outside the map.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
        The requested page does not exist or is not publicly available.
      </p>
      <Link
        className="mt-9 w-fit rounded-full bg-[var(--accent)] px-5 py-3 font-medium text-[#06110d] transition-transform hover:-translate-y-0.5"
        href="/"
      >
        Return home
      </Link>
    </main>
  );
}
