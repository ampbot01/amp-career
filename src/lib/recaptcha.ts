// Google reCAPTCHA server-side verification.

export async function verifyRecaptcha(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("RECAPTCHA_SECRET_KEY belum diset di production!");
      return false;
    }
    return true;
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
    if (!data.success) {
      console.warn("reCAPTCHA siteverify verification failed:", data["error-codes"]);
    }
    return data.success;
  } catch (err) {
    console.error("Error verifying reCAPTCHA:", err);
    return false;
  }
}
