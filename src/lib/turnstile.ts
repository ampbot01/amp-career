// Cloudflare Turnstile server-side verification.
// Dev mode: kalau secret belum diisi, loloskan (supaya dev lokal gak blocked).
// Di production WAJIB set TURNSTILE_SECRET_KEY.

export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("TURNSTILE_SECRET_KEY belum diset di production!");
      return false;
    }
    return true; // dev bypass
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}
