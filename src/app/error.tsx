"use client";

export default function ErrorPage({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-6 py-24"
    >
      <p className="eyebrow">Application error</p>
      <h1 className="mt-5 text-5xl font-semibold tracking-tight">
        Something interrupted the render.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
        The issue has been contained. Retry the current view, or return to the
        home page if it continues.
      </p>
      <button
        className="mt-9 w-fit rounded-full bg-[var(--accent)] px-5 py-3 font-medium text-[#06110d]"
        onClick={() => unstable_retry()}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
