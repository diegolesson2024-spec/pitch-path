"use client";

// Last-resort error screen if the root layout itself fails. Must render its own <html>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0a0e1a", color: "#eef1f8", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>PitchPath is having trouble</h1>
          <p style={{ color: "#a3acc2", marginTop: 12 }}>Please try again in a moment.</p>
          <button onClick={reset} style={{ marginTop: 24, padding: "10px 20px", borderRadius: 999, border: 0, background: "#ff6a13", color: "#140600", fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
