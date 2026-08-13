// Google reCAPTCHA server-side verification.
// Dev mode: jika secret belum diset di .env, loloskan agar dev lokal tidak terblokir.
// Di production WAJIB set RECAPTCHA_SECRET_KEY.

export async function verifyRecaptcha(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("RECAPTCHA_SECRET_KEY belum diset di production!");
      return false;
    }
    return true; // dev bypass jika key belum diset
  }
  if (!token) return false;

  const params = new URLSearchParams({
    secret,
    response: token,
  });
  if (ip) params.set("remoteip", ip);

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    return data.success;
  } catch (err) {
    console.error("Error verifying reCAPTCHA:", err);
    return false;
  }
}
