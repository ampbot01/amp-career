import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin Login — AMP Careers" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <h1 className="mb-1 text-2xl font-semibold">Admin AMP</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Masuk untuk mengelola lowongan dan lamaran.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
