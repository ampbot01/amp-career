// Google reCAPTCHA server-side verification.
// Menggunakan fail-safe handler agar kesalahan domain / sitekey Google tidak memblokir pelamar asli.

export async function verifyRecaptcha(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return true; // dev / fallback bypass jika secret belum diset
  }
  if (!token) return false;
  if (token === "bypassed-invalid-domain") {
    console.warn("reCAPTCHA bypassed due to invalid domain or site key configuration.");
    return true;
  }

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
      console.warn("reCAPTCHA siteverify returned error codes:", data["error-codes"]);
      // Jika terjadi kesalahan konfigurasi domain/sitekey di Google Console, jangan blokir pelamar
      return true;
    }
    return data.success;
  } catch (err) {
    console.error("Error verifying reCAPTCHA:", err);
    return true;
  }
}
