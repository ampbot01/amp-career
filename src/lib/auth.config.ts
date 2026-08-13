import type { NextAuthConfig } from "next-auth";

// Config ringan untuk middleware (edge) — TANPA credentials provider
// yang menarik argon2/pg (native, node-only). Callback authorized di sini
// hanya cek keberadaan session JWT, bukan verifikasi password.
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [],
} satisfies NextAuthConfig;
