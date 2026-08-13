import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import { supabaseAdmin } from "./supabase";
import { authConfig } from "./auth.config";

// Auth penuh — hanya diimpor dari server components / route handlers (Node runtime).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const { data: user } = await supabaseAdmin
          .from("User")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (!user) return null;

        const valid = await argon2.verify(user.passwordHash, password);
        return valid ? { id: user.id, email: user.email } : null;
      },
    }),
  ],
});
