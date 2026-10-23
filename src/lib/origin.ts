// Route handlers that change data must be called from our own pages (server actions check this
// automatically; plain route handlers don't). Complements the SameSite=Lax session cookie.
export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
