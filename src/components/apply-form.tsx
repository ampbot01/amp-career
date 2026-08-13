"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaWidget } from "./recaptcha";
import { TurnstileWidget } from "./turnstile";
import {
  User,
  Mail,
  Phone,
  FileText,
  Globe,
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Sparkles,
  Banknote,
} from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const SOURCES = ["LinkedIn", "Instagram", "Job board", "Teman / referral", "Lainnya"];

const SALARY_RANGES = [
  "< Rp 4.000.000",
  "Rp 4.000.000 - Rp 6.000.000",
  "Rp 6.000.000 - Rp 8.000.000",
  "Rp 8.000.000 - Rp 10.000.000",
  "Rp 10.000.000 - Rp 12.000.000",
  "Rp 12.000.000 - Rp 15.000.000",
  "Rp 15.000.000 - Rp 20.000.000",
  "> Rp 20.000.000",
];

type Props = { jobId: string; jobTitle: string };

export function ApplyForm({ jobId, jobTitle }: Props) {
  const router = useRouter();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const hasRecaptchaKey = Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
  const hasTurnstileKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const needsCaptcha = hasRecaptchaKey || hasTurnstileKey;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf")) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Format file harus PDF.");
      }
    }
  };

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
    if (needsCaptcha && !captchaToken) {
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

      // 2. Upload langsung ke Supabase Storage
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
          recaptchaToken: captchaToken,
          turnstileToken: captchaToken,
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone"),
          currentSalary: form.get("currentSalary") || undefined,
          expectedSalary: form.get("expectedSalary") || undefined,
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
      setCaptchaToken("");
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        try {
          (window as any).grecaptcha.reset();
        } catch (e) {
          // ignore
        }
      }
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition focus:border-amp-blue focus:bg-black focus:ring-1 focus:ring-amp-blue/50";
  const labelCls = "mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-300";

  return (
    <form suppressHydrationWarning onSubmit={onSubmit} className="space-y-6">
      {/* Nama Lengkap */}
      <div>
        <label htmlFor="fullName" className={labelCls}>
          <User className="h-3.5 w-3.5 text-amp-blue-light" />
          <span>Nama Lengkap</span>
          <span className="text-red-400">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          maxLength={100}
          className={inputCls}
          placeholder="Contoh: Alex Wijaya"
        />
      </div>

      {/* Grid Email & Phone */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelCls}>
            <Mail className="h-3.5 w-3.5 text-amp-blue-light" />
            <span>Alamat Email</span>
            <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputCls}
            placeholder="alex@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>
            <Phone className="h-3.5 w-3.5 text-amp-blue-light" />
            <span>No. WhatsApp / HP</span>
            <span className="text-red-400">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            minLength={8}
            maxLength={20}
            className={inputCls}
            placeholder="08123456789"
          />
        </div>
      </div>

      {/* Grid Current & Expected Salary */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="currentSalary" className={labelCls}>
            <Banknote className="h-3.5 w-3.5 text-emerald-400" />
            <span>Gaji Saat Ini</span>
            <span className="text-red-400">*</span>
          </label>
          <select
            id="currentSalary"
            name="currentSalary"
            required
            className={`${inputCls} bg-[#0a0a0a]`}
          >
            <option value="">— Pilih Range Gaji Saat Ini —</option>
            {SALARY_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="expectedSalary" className={labelCls}>
            <Banknote className="h-3.5 w-3.5 text-amp-blue-light" />
            <span>Ekspektasi Gaji</span>
            <span className="text-red-400">*</span>
          </label>
          <select
            id="expectedSalary"
            name="expectedSalary"
            required
            className={`${inputCls} bg-[#0a0a0a]`}
          >
            <option value="">— Pilih Range Ekspektasi Gaji —</option>
            {SALARY_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
      </div>





      {/* Drag & Drop PDF Resume Upload */}
      <div>
        <label htmlFor="resume" className={labelCls}>
          <FileText className="h-3.5 w-3.5 text-purple-400" />
          <span>CV / Resume (Format PDF, Maks 5MB)</span>
          <span className="text-red-400">*</span>
        </label>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition ${
            dragActive
              ? "border-amp-blue bg-amp-blue/10"
              : file
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          }`}
        >
          <input
            id="resume"
            type="file"
            accept=".pdf,application/pdf"
            required={!file}
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) setFile(selected);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          />

          {file ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white truncate max-w-[260px] sm:max-w-[380px]">
                  {file.name}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • File PDF siap diupload
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="z-10 ml-2 rounded-lg border border-white/10 p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-center pointer-events-none">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-amp-blue-light mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-white">
                Tarik & Lepas file PDF di sini, atau <span className="text-amp-blue-light underline">Pilih File</span>
              </p>
              <p className="mt-1 text-[11px] text-neutral-400">Hanya dokumen PDF (maksimal 5MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* Link Portfolio */}
      <div>
        <label htmlFor="portfolioUrl" className={labelCls}>
          <Globe className="h-3.5 w-3.5 text-amp-blue-light" />
          <span>Link Portfolio / GitHub / Website</span>
          <span className="text-neutral-500 font-normal">(opsional)</span>
        </label>
        <input
          id="portfolioUrl"
          name="portfolioUrl"
          type="url"
          className={inputCls}
          placeholder="https://behance.net/username atau https://github.com/username"
        />
      </div>

      {/* Cover Letter */}
      <div>
        <label htmlFor="coverLetter" className={labelCls}>
          <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
          <span>Mengapa Kamu Tertarik Melamar Posisi {jobTitle}?</span>
          <span className="text-neutral-500 font-normal">(opsional)</span>
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          rows={4}
          maxLength={5000}
          className={inputCls}
          placeholder="Ceritakan pengalaman singkat atau keahlian utamamu yang relevan..."
        />
      </div>

      {/* Source Dropdown */}
      <div>
        <label htmlFor="source" className={labelCls}>
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Tahu Informasi Lowongan Ini Dari Mana?</span>
          <span className="text-neutral-500 font-normal">(opsional)</span>
        </label>
        <select id="source" name="source" className={`${inputCls} bg-[#0a0a0a]`}>
          <option value="">— Pilih Sumber —</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {hasRecaptchaKey ? (
        <RecaptchaWidget onVerify={setCaptchaToken} />
      ) : (
        hasTurnstileKey && <TurnstileWidget onVerify={setCaptchaToken} />
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-btn-gradient flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Mengirim Lamaran & Upload CV…</span>
          </>
        ) : (
          <span>Kirim Lamaran Sekarang</span>
        )}
      </button>
    </form>
  );
}

