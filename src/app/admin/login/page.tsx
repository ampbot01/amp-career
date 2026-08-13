import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin Login — AMP Careers" };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#030303] px-4 overflow-hidden">
      {/* Ambient Radial Glow Background */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-amp-blue/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-amp-purple/15 blur-3xl" />

      {/* Grid Pattern */}
      <div className="bg-grid-pattern absolute inset-0 opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a]/90 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
        {/* Brand Icon Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src="https://res.cloudinary.com/dtjq8cgqh/image/upload/v1766389028/AMP_dark_4x_kf9k4p.webp"
            alt="AMP Logo"
            className="h-10 w-auto object-contain mb-4"
          />

          <h1 className="font-heading text-xl font-extrabold text-white">
            Admin Control Panel
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Masuk untuk mengelola lowongan pekerjaan & lamaran kandidat.
          </p>
        </div>

        {/* Login Form */}
        <div className="mt-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer Back Link */}
        <div className="mt-6 border-t border-white/[0.08] pt-4 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-400 transition hover:text-white hover:underline"
          >
            ← Kembali ke Website Utama
          </Link>
        </div>
      </div>
    </main>
  );
}


