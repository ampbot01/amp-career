"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TurnstileWidget } from "./turnstile";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const SOURCES = ["LinkedIn", "Instagram", "Job board", "Teman / referral", "Lainnya"];

type Props = { jobId: string; jobTitle: string };

export function ApplyForm({ jobId, jobTitle }: Props) {
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const needsTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    if (!file) {
      setError("Pilih file CV (PDF) dulu.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }
    if (needsTurnstile && !turnstileToken) {
      setError("Selesaikan verifikasi anti-spam dulu.");
      return;
    }

    setLoading(true);
    try {
      // 1. Minta signed upload URL
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });
      if (!urlRes.ok) {
        const d = await urlRes.json().catch(() => ({}));
        throw new Error(d.error ?? "Gagal menyiapkan upload");
      }
      const { path, signedUrl } = await urlRes.json();

      // 2. Upload langsung ke Supabase Storage (tidak lewat server)
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload CV gagal, coba lagi");

      // 3. Submit aplikasi
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          resumePath: path,
          turnstileToken,
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone"),
          portfolioUrl: form.get("portfolioUrl") || undefined,
          coverLetter: form.get("coverLetter") || undefined,
          source: form.get("source") || undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Gagal mengirim lamaran");
      }

      router.push("/apply/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-white/30";
  const labelCls = "mb-1 block text-sm text-muted-foreground";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="fullName" className={labelCls}>
          Nama lengkap <span className="text-red-400">*</span>
        </label>
        <input id="fullName" name="fullName" required minLength={2} maxLength={100} className={inputCls} placeholder="Nama sesuai KTP" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelCls}>
            Email <span className="text-red-400">*</span>
          </label>
          <input id="email" name="email" type="email" required className={inputCls} placeholder="kamu@email.com" />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>
            No. HP / WhatsApp <span className="text-red-400">*</span>
          </label>
          <input id="phone" name="phone" type="tel" required minLength={8} maxLength={20} className={inputCls} placeholder="08xxxxxxxxxx" />
        </div>
      </div>

      <div>
        <label htmlFor="resume" className={labelCls}>
          CV / Resume (PDF, maks 5MB) <span className="text-red-400">*</span>
        </label>
        <input
          id="resume"
          type="file"
          accept=".pdf,application/pdf"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-foreground"
        />
      </div>

      <div>
        <label htmlFor="portfolioUrl" className={labelCls}>
          Link portfolio <span className="text-neutral-500">(opsional)</span>
        </label>
        <input id="portfolioUrl" name="portfolioUrl" type="url" className={inputCls} placeholder="Behance / Dribbble / GitHub / website pribadi" />
      </div>

      <div>
        <label htmlFor="coverLetter" className={labelCls}>
          Kenapa kamu cocok untuk posisi {jobTitle}? <span className="text-neutral-500">(opsional)</span>
        </label>
        <textarea id="coverLetter" name="coverLetter" rows={4} maxLength={5000} className={inputCls} />
      </div>

      <div>
        <label htmlFor="source" className={labelCls}>
          Tahu lowongan ini dari mana? <span className="text-neutral-500">(opsional)</span>
        </label>
        <select id="source" name="source" className={`${inputCls} bg-card`}>
          <option value="">— Pilih —</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {needsTurnstile && <TurnstileWidget onVerify={setTurnstileToken} />}

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-btn-gradient w-full rounded-md px-4 py-3 font-medium text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "Mengirim lamaran…" : "Kirim Lamaran"}
      </button>
    </form>
  );
}
