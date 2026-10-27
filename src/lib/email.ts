import "server-only";

// Transactional email via Resend's HTTP API (no SDK needed).
// Needs RESEND_API_KEY and EMAIL_FROM, e.g. "PitchPath <noreply@pitchpathsoccer.com>".
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text, html }),
  });
  if (!res.ok) throw new Error(`Email provider returned ${res.status}`);
}
