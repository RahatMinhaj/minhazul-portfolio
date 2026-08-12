export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading portfolio"
      className="project-loader fixed inset-0 z-[200] grid min-h-dvh place-items-center px-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="project-loader-mark" aria-hidden>
          MI
        </div>
        <p className="eyebrow mt-8">Initializing portfolio</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Loading the next view
        </p>
        <div className="project-loader-track mt-6" aria-hidden />
      </div>
    </main>
  );
}
