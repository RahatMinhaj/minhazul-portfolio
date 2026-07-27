"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          alignItems: "center",
          background: "#080b0b",
          color: "#edf5f1",
          display: "flex",
          fontFamily: "system-ui, sans-serif",
          justifyContent: "center",
          margin: 0,
          minHeight: "100vh",
          padding: "1.5rem",
        }}
      >
        <main style={{ maxWidth: "42rem" }}>
          <p style={{ color: "#58e6b0", fontFamily: "monospace" }}>
            GLOBAL_ERROR
          </p>
          <h1
            style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", margin: "1rem 0" }}
          >
            The application needs a fresh render.
          </h1>
          <p style={{ color: "#91a19b", fontSize: "1.125rem" }}>
            A top-level error was safely contained. Try loading the application
            again.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              background: "#58e6b0",
              border: 0,
              borderRadius: "999px",
              color: "#06110d",
              cursor: "pointer",
              fontWeight: 600,
              marginTop: "2rem",
              padding: "0.85rem 1.25rem",
            }}
            type="button"
          >
            Reload application
          </button>
        </main>
      </body>
    </html>
  );
}
