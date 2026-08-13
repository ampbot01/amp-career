"use client";

import { useState } from "react";
import { createJob, updateJob } from "@/lib/admin-actions";
import {
  Briefcase,
  Tag,
  MapPin,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Sparkles,
} from "lucide-react";

type JobData = {
  id: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
};

export function JobForm({ job }: { job?: JobData }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = job ? await updateJob(job.id, formData) : await createJob(formData);
    // redirect terjadi di server kalau sukses; kalau sampai sini berarti error
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition focus:border-amp-blue focus:bg-black focus:ring-1 focus:ring-amp-blue/50";
  const labelCls = "mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-neutral-300";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className={labelCls}>
          <Briefcase className="h-3.5 w-3.5 text-amp-blue-light" />
          <span>Judul Posisi Lowongan</span>
          <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          defaultValue={job?.title}
          className={inputCls}
          placeholder="Contoh: Senior AI Engineer / Product Designer"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className={labelCls}>
          <Globe className="h-3.5 w-3.5 text-purple-400" />
          <span>Slug URL</span>
          <span className="text-neutral-500 font-normal">(opsional: auto-generate dari judul)</span>
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={job?.slug}
          className={inputCls}
          placeholder="senior-ai-engineer"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
      </div>

      {/* Category, Location, Type */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="category" className={labelCls}>
            <Tag className="h-3.5 w-3.5 text-amp-blue-light" />
            <span>Kategori</span>
            <span className="text-red-400">*</span>
          </label>
          <input
            id="category"
            name="category"
            required
            defaultValue={job?.category}
            className={inputCls}
            placeholder="Engineering / Design / Operations"
          />
        </div>
        <div>
          <label htmlFor="location" className={labelCls}>
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span>Lokasi Kerja</span>
            <span className="text-red-400">*</span>
          </label>
          <input
            id="location"
            name="location"
            required
            defaultValue={job?.location}
            className={inputCls}
            placeholder="Yogyakarta (Hybrid) / Remote"
          />
        </div>
        <div>
          <label htmlFor="type" className={labelCls}>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Tipe Pekerjaan</span>
            <span className="text-red-400">*</span>
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={job?.type ?? "fulltime"}
            className={`${inputCls} bg-[#0a0a0a]`}
          >
            <option value="fulltime">Full-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
            <option value="internship">Internship</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelCls}>
          <FileText className="h-3.5 w-3.5 text-amp-blue-light" />
          <span>Deskripsi Pekerjaan & Peran</span>
          <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          rows={6}
          defaultValue={job?.description}
          className={inputCls}
          placeholder="Tuliskan gambaran umum posisi dan tanggung jawab utama kandidat..."
        />
      </div>

      {/* Requirements */}
      <div>
        <label htmlFor="requirements" className={labelCls}>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Kualifikasi & Persyaratan (Gunakan enter untuk poin baru)</span>
          <span className="text-red-400">*</span>
        </label>
        <textarea
          id="requirements"
          name="requirements"
          required
          minLength={10}
          rows={6}
          defaultValue={job?.requirements}
          className={inputCls}
          placeholder="• Pengalaman minimal 3 tahun&#10;• Menguasai AI workflow&#10;• Mampu berkomunikasi dengan baik..."
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Menyimpan Lowongan…</span>
          </>
        ) : (
          <span>{job ? "Simpan Perubahan Lowongan" : "Buat Lowongan Sekarang"}</span>
        )}
      </button>
    </form>
  );
}

