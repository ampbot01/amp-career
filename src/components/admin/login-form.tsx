"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, AlertCircle, Loader2, LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Email atau password yang Anda masukkan salah.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition focus:border-amp-blue focus:bg-black focus:ring-1 focus:ring-amp-blue/50";
  const labelCls = "mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-neutral-300";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className={labelCls}>
          <span>Email Admin</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputCls}
            placeholder="admin@ampedmedia.id"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className={labelCls}>
          <span>Password</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputCls}
            placeholder="••••••••••••"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-btn-gradient flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Memverifikasi Akses…</span>
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            <span>Masuk ke Dashboard</span>
          </>
        )}
      </button>
    </form>
  );
}

